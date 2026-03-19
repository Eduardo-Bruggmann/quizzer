import { NextRequest, NextResponse } from 'next/server'
import * as subjectService from '@/services/subjectService'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth(req, { roles: ['teacher'] })

    const { id } = await params

    const body = await req.json()

    await subjectService.updateSubject(id, {
      name: body.name,
      description: body.description,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to update subject',
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

    await subjectService.deleteSubject(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to delete subject',
    )

    return NextResponse.json({ error: message }, { status })
  }
}
