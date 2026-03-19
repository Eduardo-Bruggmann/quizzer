import { NextRequest, NextResponse } from 'next/server'
import * as userService from '@/services/userService'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth(req, { roles: ['teacher'] })

    const { id } = await params

    const body = await req.json()
    const role = body.role as 'student' | 'teacher'

    if (role !== 'student' && role !== 'teacher') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await userService.updateUserRole(id, role)

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(
      error,
      'Failed to update user role',
    )

    return NextResponse.json({ error: message }, { status })
  }
}
