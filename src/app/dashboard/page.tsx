'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CurrentUser {
  id: string
  fullName: string
  email: string
  role: 'student' | 'teacher'
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (!stored) {
      router.replace('/login')
      return
    }

    try {
      const parsed = JSON.parse(stored) as CurrentUser
      setUser(parsed)
    } catch {
      router.replace('/login')
    }
  }, [router])

  if (!user) {
    return null
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Olá, {user.fullName} ({user.role}).
          </p>
        </div>
        <button
          className="rounded border px-3 py-1 text-xs"
          onClick={() => {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('currentUser')
            router.push('/login')
          }}
        >
          Sair
        </button>
      </header>

      <section className="space-y-2 rounded border p-4 text-sm">
        <p>Escolha o que deseja fazer:</p>
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded bg-black px-3 py-1 text-xs font-medium text-white"
            onClick={() => router.push('/study')}
          >
            Estudar
          </button>
          {user.role === 'teacher' ? (
            <button
              className="rounded border px-3 py-1 text-xs font-medium"
              onClick={() => router.push('/teacher')}
            >
              Gerenciar matérias e questões
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}
