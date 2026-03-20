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
      password: body.password,
    })

    const updatedUser = await userService.getUserById(id)

    return NextResponse.json({ success: true, data: updatedUser })
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
    const auth = await requireAuth(req)

    const { id } = await params

    if (auth.role !== 'teacher' && auth.sub !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await userService.deleteUser(id)

    return NextResponse.json({ success: true, signedOut: auth.sub === id })
  } catch (error) {
    const { status, message } = handleHttpError(error, 'Failed to delete user')

    return NextResponse.json({ error: message }, { status })
  }
}
