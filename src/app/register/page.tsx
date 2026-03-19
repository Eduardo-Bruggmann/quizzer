'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Registration failed')
      }

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('currentUser', JSON.stringify(data.user))

      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <section className="w-full max-w-sm space-y-4 rounded border p-6">
        <h1 className="text-xl font-semibold">Criar conta</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-sm">Nome completo</label>
            <input
              className="w-full rounded border p-2 text-sm"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm">Email</label>
            <input
              className="w-full rounded border p-2 text-sm"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm">Senha</label>
            <input
              className="w-full rounded border p-2 text-sm"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm">Confirmar senha</label>
            <input
              className="w-full rounded border p-2 text-sm"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        <p className="text-xs text-gray-600">
          Já tem conta?{' '}
          <a href="/login" className="underline">
            Entrar
          </a>
        </p>
      </section>
    </main>
  )
}
