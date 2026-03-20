import * as subjectRepository from '@/repositories/subjectRepository'
import * as questionRepository from '@/repositories/questionRepository'
import { Subject } from '@/types/subject'

export function createSubject(subjectData: Subject) {
  return subjectRepository.createSubject(subjectData)
}

export function getAllSubjects() {
  return subjectRepository.listSubjects()
}

export function updateSubject(id: string, subjectData: Partial<Subject>) {
  return subjectRepository.updateSubject(id, subjectData)
}

export async function deleteSubject(id: string) {
  const questions = await questionRepository.listQuestionsBySubject(id)

  for (const question of questions) {
    await questionRepository.deleteQuestion(question.id)
  }

  return subjectRepository.deleteSubject(id)
}
