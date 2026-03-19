import { Subject } from '@/types/subject'
import { subjects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@/db'

export async function createSubject(subject: Subject) {
  const [createdSubject] = await db.insert(subjects).values(subject).returning()

  return createdSubject
}

export async function listSubjects() {
  return await db.select().from(subjects)
}

export async function updateSubject(id: string, subject: Partial<Subject>) {
  await db.update(subjects).set(subject).where(eq(subjects.id, id))
}

export async function deleteSubject(id: string) {
  await db.delete(subjects).where(eq(subjects.id, id))
}
