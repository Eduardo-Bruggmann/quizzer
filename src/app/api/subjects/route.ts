import { NextResponse } from 'next/server'
import * as subjectService from '@/services/subjectService'
import { v4 as uuid } from 'uuid'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function GET() {
  try {
    const subjects = await subjectService.getAllSubjects()

    return NextResponse.json({ data: subjects })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to list subjects',
    )

    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, { roles: ['teacher'] })
    const body = await req.json()

    const subject = await subjectService.createSubject({
      id: uuid(),
      name: body.name,
      description: body.description,
      createdBy: auth.sub,
    })

    return NextResponse.json({ data: subject }, { status: 201 })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to create subject',
    )

    return NextResponse.json({ error: message }, { status })
  }
}
