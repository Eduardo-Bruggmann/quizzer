import { NextResponse } from 'next/server'
import * as alternativeService from '@/services/alternativeService'
import { v4 as uuid } from 'uuid'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId is required' },
        { status: 400 },
      )
    }

    const alternatives =
      await alternativeService.getAlternativesByQuestion(questionId)

    return NextResponse.json({ data: alternatives })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to list alternatives',
    )

    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth(req, { roles: ['teacher'] })

    const body = await req.json()

    const alternative = await alternativeService.createAlternative({
      id: uuid(),
      questionId: body.questionId,
      content: body.content,
      isCorrect: body.isCorrect,
    })

    return NextResponse.json({ data: alternative }, { status: 201 })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to create alternative',
    )

    return NextResponse.json({ error: message }, { status })
  }
}
