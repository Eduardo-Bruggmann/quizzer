import { Alternative } from '@/types/alternative'
import { alternatives } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@/db'

export async function createAlternative(alternative: Alternative) {
  const [createdAlternative] = await db
    .insert(alternatives)
    .values(alternative)
    .returning()

  return createdAlternative
}

export async function listAlternativesByQuestionId(questionId: string) {
  return await db
    .select()
    .from(alternatives)
    .where(eq(alternatives.questionId, questionId))
}

export async function updateAlternative(
  id: string,
  alternative: Partial<Alternative>,
) {
  await db.update(alternatives).set(alternative).where(eq(alternatives.id, id))
}

export async function deleteAlternative(id: string) {
  await db.delete(alternatives).where(eq(alternatives.id, id))
}
