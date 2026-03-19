import { NextResponse } from 'next/server'
import * as userService from '@/services/userService'
import { requireAuth, handleHttpError } from '@/lib/authRequest'

export async function GET(req: Request) {
  try {
    await requireAuth(req, { roles: ['teacher'] })

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')

    let users

    if (role === 'student') {
      users = await userService.getStudents()
    } else if (role === 'teacher') {
      users = await userService.getTeachers()
    } else {
      users = await userService.getAllUsers()
    }

    return NextResponse.json({ data: users })
  } catch (error) {
    const { status, message } = handleHttpError(error, 'Failed to list users')

    return NextResponse.json({ error: message }, { status })
  }
}
