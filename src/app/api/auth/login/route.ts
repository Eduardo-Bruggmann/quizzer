import { NextResponse } from 'next/server'
import { signIn } from '@/services/authService'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await signIn(body.email, body.password)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'

    return NextResponse.json({ error: message }, { status: 401 })
  }
}
