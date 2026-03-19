'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Login failed')
      }

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('currentUser', JSON.stringify(data.user))

      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md py-8">
      <div className="surface space-y-5 p-6 md:p-8">
        <div>
          <h1 className="card-title text-3xl">Welcome Back</h1>
          <p className="mt-1 text-sm muted">
            Sign in to continue your quiz journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="field-label">Email</label>
            <input
              className="field"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Password</label>
            <input
              className="field"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            className="btn btn-primary w-full disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs muted">
          New here?{' '}
          <Link href="/register" className="font-semibold text-[#E97635]">
            Create account
          </Link>
        </p>
      </div>
    </section>
  )
}
