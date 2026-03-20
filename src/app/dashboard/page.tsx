'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CurrentUser {
  id: string
  fullName: string
  email: string
  role: 'student' | 'teacher'
}

interface Subject {
  id: string
  name: string
  description?: string | null
}

interface SubjectWithCount extends Subject {
  questionCount: number
}

function getStoredUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('currentUser')
  if (!stored) return null

  try {
    return JSON.parse(stored) as CurrentUser
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(() => getStoredUser())
  const [subjects, setSubjects] = useState<SubjectWithCount[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [profileFullName, setProfileFullName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePassword, setProfilePassword] = useState('')
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    setProfileFullName(user.fullName)
    setProfileEmail(user.email)
  }, [router, user])

  useEffect(() => {
    if (!user) {
      return
    }

    let cancelled = false

    async function loadSubjectsWithCounts() {
      setLoadingSubjects(true)

      try {
        const subjectRes = await fetch('/api/subjects')
        const subjectData = await subjectRes.json()
        const baseSubjects = (subjectData.data ?? []) as Subject[]

        const counts = await Promise.all(
          baseSubjects.map(async subject => {
            try {
              const questionRes = await fetch(
                `/api/questions?subjectId=${subject.id}`,
              )
              const questionData = await questionRes.json()

              return {
                ...subject,
                questionCount: (questionData.data ?? []).length,
              }
            } catch {
              return {
                ...subject,
                questionCount: 0,
              }
            }
          }),
        )

        if (!cancelled) {
          setSubjects(counts)
        }
      } finally {
        if (!cancelled) {
          setLoadingSubjects(false)
        }
      }
    }

    loadSubjectsWithCounts()

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return null
  }

  const token = localStorage.getItem('accessToken')

  async function handleProfileUpdate(event: React.FormEvent) {
    event.preventDefault()

    if (!user) return

    setProfileError(null)
    setProfileSuccess(null)

    if (profilePassword && profilePassword !== profileConfirmPassword) {
      setProfileError('As senhas não coincidem.')
      return
    }

    setProfileLoading(true)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          fullName: profileFullName,
          email: profileEmail,
          password: profilePassword || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Não foi possível atualizar o perfil')
      }

      const updatedUser = data.data as CurrentUser
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setProfilePassword('')
      setProfileConfirmPassword('')
      setProfileSuccess('Dados atualizados com sucesso.')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar o perfil'
      setProfileError(message)
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleDeleteOwnAccount() {
    if (!user) return

    if (!confirm('Tem certeza que deseja excluir sua conta?')) return

    setProfileError(null)
    setProfileSuccess(null)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Não foi possível excluir a conta')
      }

      localStorage.removeItem('accessToken')
      localStorage.removeItem('currentUser')
      router.replace('/register')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível excluir a conta'
      setProfileError(message)
    }
  }

  return (
    <section className="space-y-6 py-6">
      <header className="surface flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E97635]">
            Dashboard
          </p>
          <h1 className="card-title mt-1 text-3xl">Hello, {user.fullName}</h1>
          <p className="mt-1 text-sm muted">
            Role: <span className="status-ok capitalize">{user.role}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-primary"
            onClick={() => router.push('/study')}
          >
            Start studying
          </button>
          {user.role === 'teacher' ? (
            <button
              className="btn btn-ghost"
              onClick={() => router.push('/teacher')}
            >
              Open teacher panel
            </button>
          ) : null}
        </div>
      </header>

      <section className="surface p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="card-title text-2xl">Available Subjects</h2>
          <span className="rounded-full border border-[#F4DFD2] bg-[#FFF8F3] px-3 py-1 text-xs font-semibold text-[#B66D46]">
            {subjects.length} total
          </span>
        </div>

        {loadingSubjects ? (
          <p className="text-sm muted">Loading subjects...</p>
        ) : null}

        {!loadingSubjects && subjects.length === 0 ? (
          <p className="text-sm muted">
            No subjects are available yet. Ask a teacher to add the first one.
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map(subject => (
            <article
              key={subject.id}
              className="rounded-xl border border-[#F4DFD2] bg-[#FFFCFA] p-4"
            >
              <h3 className="text-base font-bold text-[#2F2925]">
                {subject.name}
              </h3>
              <p className="mt-1 text-xs muted">
                {subject.description || 'No description yet.'}
              </p>
              <p className="mt-3 text-xs font-semibold text-[#C67A52]">
                {subject.questionCount} questions
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface p-5 md:p-6">
        <h2 className="card-title text-2xl">Meu perfil</h2>
        <p className="mt-1 text-sm muted">Atualize seu nome, email e senha.</p>

        <form className="mt-4 space-y-3" onSubmit={handleProfileUpdate}>
          <div>
            <label className="field-label">Nome completo</label>
            <input
              className="field"
              value={profileFullName}
              onChange={event => setProfileFullName(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              className="field"
              type="email"
              value={profileEmail}
              onChange={event => setProfileEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Nova senha (opcional)</label>
            <input
              className="field"
              type="password"
              value={profilePassword}
              onChange={event => setProfilePassword(event.target.value)}
              placeholder="Digite somente se quiser alterar"
            />
          </div>
          <div>
            <label className="field-label">Confirmar nova senha</label>
            <input
              className="field"
              type="password"
              value={profileConfirmPassword}
              onChange={event => setProfileConfirmPassword(event.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>

          {profileError ? (
            <p className="text-sm text-red-600">{profileError}</p>
          ) : null}
          {profileSuccess ? (
            <p className="status-ok text-sm">{profileSuccess}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary disabled:opacity-60"
              type="submit"
              disabled={profileLoading}
            >
              {profileLoading ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleDeleteOwnAccount}
            >
              Excluir minha conta
            </button>
          </div>
        </form>
      </section>
    </section>
  )
}
