import { parseOrThrow, parseUserRole, toSafeUser } from './utils'
import * as userRepository from '@/repositories/userRepository'
import * as authSchemas from '@/schemas/authSchemas'
import { createAccessToken } from '@/lib/jwt'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcrypt'

const { forgotPasswordInputSchema, registerInputSchema, signInInputSchema } =
  authSchemas

const BCRYPT_SALT_ROUNDS = 10

interface RegisterData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export async function registerUser(data: RegisterData) {
  const parsedRegisterInput = parseOrThrow(registerInputSchema, {
    fullName: data.fullName,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
  })

  const existing = await userRepository.findUserByEmail(
    parsedRegisterInput.email,
  )
  if (existing) throw new Error('User already exists')

  const passwordHash = await bcrypt.hash(
    parsedRegisterInput.password,
    BCRYPT_SALT_ROUNDS,
  )

  const user = await userRepository.createUser({
    id: uuid(),
    fullName: parsedRegisterInput.fullName,
    email: parsedRegisterInput.email,
    passwordHash,
    role: 'student',
  })

  if (!user) throw new Error('Failed to create user')

  const accessToken = await createAccessToken({
    sub: user.id,
    email: user.email,
    role: parseUserRole(user.role),
  })

  return {
    user: toSafeUser({ ...user, role: parseUserRole(user.role) }),
    accessToken,
  }
}

// Alias kept for optional signUp naming across modules
export const signUp = registerUser

export async function forgotPassword(email: string, newPassword: string) {
  const parsedForgotPasswordInput = parseOrThrow(forgotPasswordInputSchema, {
    email,
    newPassword,
  })

  const user = await userRepository.findUserByEmail(
    parsedForgotPasswordInput.email,
  )
  if (!user) throw new Error('User not found')

  const passwordWasReused = await bcrypt.compare(
    parsedForgotPasswordInput.newPassword,
    user.passwordHash,
  )

  if (passwordWasReused)
    throw new Error('New password must be different from current password')

  const passwordHash = await bcrypt.hash(
    parsedForgotPasswordInput.newPassword,
    BCRYPT_SALT_ROUNDS,
  )
  return userRepository.updateUserHashedPassword(user.id, passwordHash)
}

export async function signIn(email: string, password: string) {
  const parsedSignInInput = parseOrThrow(signInInputSchema, { email, password })

  const user = await userRepository.findUserByEmail(parsedSignInInput.email)
  if (!user) throw new Error('User not found')

  const isMatch = await bcrypt.compare(
    parsedSignInInput.password,
    user.passwordHash,
  )
  if (!isMatch) throw new Error('Invalid credentials')

  const accessToken = await createAccessToken({
    sub: user.id,
    email: user.email,
    role: parseUserRole(user.role),
  })

  return {
    user: toSafeUser({ ...user, role: parseUserRole(user.role) }),
    accessToken,
  }
}
