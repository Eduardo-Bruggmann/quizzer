import * as subjectRepository from '@/repositories/subjectRepository'
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

export function deleteSubject(id: string) {
  return subjectRepository.deleteSubject(id)
}
