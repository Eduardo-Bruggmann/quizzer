import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // student | teacher
})

export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by').notNull(),
})

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').notNull(),
  statement: text('statement').notNull(),
  createdBy: text('created_by').notNull(),
})

export const alternatives = sqliteTable('alternatives', {
  id: text('id').primaryKey(),
  questionId: text('question_id').notNull(),
  content: text('content').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
})
