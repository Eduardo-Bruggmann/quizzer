import { users } from '@/db/schema'
import { User } from '@/types/user'
import { eq } from 'drizzle-orm'
import { db } from '@/db'

export async function createUser(data: User) {
  const [createdUser] = await db.insert(users).values(data).returning()

  return createdUser
}

export async function findUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id))

  return user ?? null
}

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email))

  return user ?? null
}

export async function listStudents() {
  return await db.select().from(users).where(eq(users.role, 'student'))
}

export async function listTeachers() {
  return await db.select().from(users).where(eq(users.role, 'teacher'))
}

export async function listUsers() {
  return await db.select().from(users)
}

export async function updateUser(userId: string, data: Partial<User>) {
  await db.update(users).set(data).where(eq(users.id, userId))
}

export async function updateUserRole(
  userId: string,
  role: 'student' | 'teacher',
) {
  await db.update(users).set({ role }).where(eq(users.id, userId))
}

export async function updateUserHashedPassword(
  userId: string,
  passwordHash: string,
) {
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId))
}

export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId))
}
