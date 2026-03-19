import * as alternativeRepository from '@/repositories/alternativeRepository'
import { Alternative } from '@/types/alternative'

export async function createAlternative(alternative: Alternative) {
  return await alternativeRepository.createAlternative(alternative)
}

export async function getAlternativesByQuestion(questionId: string) {
  return await alternativeRepository.listAlternativesByQuestionId(questionId)
}

export async function updateAlternative(
  id: string,
  alternative: Partial<Alternative>,
) {
  return await alternativeRepository.updateAlternative(id, alternative)
}

export async function deleteAlternative(id: string) {
  return await alternativeRepository.deleteAlternative(id)
}
