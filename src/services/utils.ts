import { userRoleSchema } from '@/schemas/authSchemas'
import { UserRole } from '@/types/user'
import { z } from 'zod'

export const parseOrThrow = <T>(schema: z.ZodType<T>, value: unknown): T => {
  const parsed = schema.safeParse(value)

  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')

  return parsed.data
}

export const parseUserRole = (role: string): UserRole =>
  parseOrThrow(userRoleSchema, role)

export const toSafeUser = (user: {
  id: string
  fullName: string
  email: string
  role: UserRole
}) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
})
