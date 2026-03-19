import { NextResponse } from 'next/server'
import { registerUser } from '@/services/authService'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await registerUser({
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      confirmPassword: body.confirmPassword,
    })

    return NextResponse.json({ success: true, ...result }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Registration failed'

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
