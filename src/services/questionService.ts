import * as questionRepository from '@/repositories/questionRepository'
import { Question } from '@/types/question'

export async function createQuestion(question: Question) {
  return await questionRepository.createQuestion(question)
}

export async function getQuestionsBySubject(subjectId: string) {
  return await questionRepository.listQuestionsBySubject(subjectId)
}

export async function updateQuestion(
  id: string,
  updatedFields: Partial<Question>,
) {
  return await questionRepository.updateQuestion(id, updatedFields)
}

export async function deleteQuestion(id: string) {
  return await questionRepository.deleteQuestion(id)
}
