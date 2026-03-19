export type UserRole = 'student' | 'teacher'

export interface User {
  id: string
  fullName: string
  email: string
  passwordHash: string
  role: UserRole
}
