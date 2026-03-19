import { NextRequest, NextResponse } from 'next/server'
import * as questionService from '@/services/questionService'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth(req, { roles: ['teacher'] })

    const { id } = await params

    const body = await req.json()

    await questionService.updateQuestion(id, {
      statement: body.statement,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to update question',
    )

    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth(req, { roles: ['teacher'] })

    const { id } = await params

    await questionService.deleteQuestion(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to delete question',
    )

    return NextResponse.json({ error: message }, { status })
  }
}
