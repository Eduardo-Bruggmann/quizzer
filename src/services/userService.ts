import * as userRepository from '@/repositories/userRepository'
import { User } from '@/types/user'
import { parseUserRole, toSafeUser } from './utils'
import { parseOrThrow } from './utils'
import { emailSchema, strongPasswordSchema } from '@/schemas/authSchemas'
import bcrypt from 'bcrypt'

type RepositoryUser = Pick<User, 'id' | 'fullName' | 'email'> & {
  role: string
}

function sanitizeUser(user: RepositoryUser) {
  return toSafeUser({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: parseUserRole(user.role),
  })
}

export async function getUserById(id: string) {
  const user = await userRepository.findUserById(id)
  if (!user) throw new Error('User not found')
  return sanitizeUser(user)
}

export async function getStudents() {
  const users = await userRepository.listStudents()

  return users.map(sanitizeUser)
}

export async function getTeachers() {
  const users = await userRepository.listTeachers()

  return users.map(sanitizeUser)
}

export async function getAllUsers() {
  const users = await userRepository.listUsers()

  return users.map(sanitizeUser)
}

export async function updateUser(
  id: string,
  userData: Partial<Pick<User, 'fullName' | 'email'>> & { password?: string },
) {
  const user = await userRepository.findUserById(id)
  if (!user) throw new Error('User not found')

  const updatedUser: Partial<User> = {}

  if (typeof userData.fullName === 'string') {
    const fullName = userData.fullName.trim()

    if (fullName.length < 3) {
      throw new Error('Full name must contain at least 3 characters')
    }

    updatedUser.fullName = fullName
  }

  if (typeof userData.email === 'string') {
    const parsedEmail = parseOrThrow(emailSchema, userData.email)

    const existing = await userRepository.findUserByEmail(parsedEmail)
    if (existing && existing.id !== id) {
      throw new Error('Email is already in use')
    }

    updatedUser.email = parsedEmail
  }

  if (typeof userData.password === 'string' && userData.password.length > 0) {
    const parsedPassword = parseOrThrow(strongPasswordSchema, userData.password)
    updatedUser.passwordHash = await bcrypt.hash(parsedPassword, 10)
  }

  if (Object.keys(updatedUser).length === 0) {
    throw new Error('No valid fields to update')
  }

  return userRepository.updateUser(id, updatedUser)
}

export async function updateUserRole(id: string, role: 'student' | 'teacher') {
  const user = await userRepository.findUserById(id)
  if (!user) throw new Error('User not found')

  return userRepository.updateUserRole(id, role)
}

export async function updateUserPassword(id: string, password: string) {
  const user = await userRepository.findUserById(id)

  if (!user) throw new Error('User not found')
  const passwordHash = await bcrypt.hash(password, 10)

  return userRepository.updateUserHashedPassword(id, passwordHash)
}

export async function deleteUser(id: string) {
  const user = await userRepository.findUserById(id)
  if (!user) throw new Error('User not found')

  return userRepository.deleteUser(id)
}
