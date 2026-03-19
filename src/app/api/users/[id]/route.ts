import { NextRequest, NextResponse } from 'next/server'
import * as userService from '@/services/userService'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)

    if (auth.role !== 'teacher' && auth.sub !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await userService.getUserById(id)

    return NextResponse.json({ data: user })
  } catch (error) {
    const { status, message } = handleHttpError(error, 'Failed to fetch user')

    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)

    if (auth.role !== 'teacher' && auth.sub !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    await userService.updateUser(id, {
      fullName: body.fullName,
      email: body.email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(error, 'Failed to update user')

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

    await userService.deleteUser(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handleHttpError(error, 'Failed to delete user')

    return NextResponse.json({ error: message }, { status })
  }
}
