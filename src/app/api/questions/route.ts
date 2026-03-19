import { NextResponse } from 'next/server'
import * as questionService from '@/services/questionService'
import { v4 as uuid } from 'uuid'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get('subjectId')

    if (!subjectId) {
      return NextResponse.json(
        { error: 'subjectId is required' },
        { status: 400 },
      )
    }

    const questions = await questionService.getQuestionsBySubject(subjectId)

    return NextResponse.json({ data: questions })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to list questions',
    )

    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, { roles: ['teacher'] })
    const body = await req.json()

    const question = await questionService.createQuestion({
      id: uuid(),
      subjectId: body.subjectId,
      statement: body.statement,
      createdBy: auth.sub,
    })

    return NextResponse.json({ data: question }, { status: 201 })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to create question',
    )

    return NextResponse.json({ error: message }, { status })
  }
}
