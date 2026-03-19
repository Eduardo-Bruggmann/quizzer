import { NextRequest, NextResponse } from 'next/server'
import * as alternativeService from '@/services/alternativeService'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth(req, { roles: ['teacher'] })

    const { id } = await params

    const body = await req.json()

    await alternativeService.updateAlternative(id, {
      content: body.content,
      isCorrect: body.isCorrect,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to update alternative',
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

    await alternativeService.deleteAlternative(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to delete alternative',
    )

    return NextResponse.json({ error: message }, { status })
  }
}
