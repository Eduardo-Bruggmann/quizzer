import * as userRepository from '@/repositories/userRepository'
import { User } from '@/types/user'
import { parseUserRole, toSafeUser } from './utils'
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
  userData: Partial<Pick<User, 'fullName' | 'email'>>,
) {
  const user = await userRepository.findUserById(id)
  if (!user) throw new Error('User not found')

  const updatedUser: Partial<Pick<User, 'fullName' | 'email'>> = userData

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
