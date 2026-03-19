import { z } from 'zod'

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const emailSchema = z
  .email('Invalid email format')
  .transform(normalizeEmail)

export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter and one number')
  .regex(/\d/, 'Password must contain at least one letter and one number')

export const registerInputSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, 'Full name must contain at least 3 characters')
      .max(120, 'Full name is too long'),
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const signInInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordInputSchema = z.object({
  email: emailSchema,
  newPassword: strongPasswordSchema,
})

export const userRoleSchema = z.enum(['student', 'teacher'])
