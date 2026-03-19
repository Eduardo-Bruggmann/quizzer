import { Question } from '@/types/question'
import { questions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@/db'

export async function createQuestion(question: Question) {
  const [createdQuestion] = await db
    .insert(questions)
    .values(question)
    .returning()

  return createdQuestion
}

export async function listQuestionsBySubject(subjectId: string) {
  return await db
    .select()
    .from(questions)
    .where(eq(questions.subjectId, subjectId))
}

export async function updateQuestion(
  id: string,
  updatedFields: Partial<Question>,
) {
  await db.update(questions).set(updatedFields).where(eq(questions.id, id))
}

export async function deleteQuestion(id: string) {
  await db.delete(questions).where(eq(questions.id, id))
}
