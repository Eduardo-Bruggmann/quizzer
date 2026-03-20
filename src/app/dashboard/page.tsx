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

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }
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

        <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => router.push('/study')}
          >
            Start studying
          </button>
          {user.role === 'teacher' ? (
            <button
              className="btn btn-ghost w-full sm:w-auto"
              onClick={() => router.push('/teacher')}
            >
              Open teacher panel
            </button>
          ) : null}
          <button
            className="btn btn-ghost w-full sm:w-auto"
            onClick={() => router.push('/profile')}
          >
            Edit profile and password
          </button>
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
        <h2 className="card-title text-2xl">Account Settings</h2>
        <p className="mt-1 text-sm muted">
          Personal data has moved to a dedicated profile page. Password updates
          are in a separate section there.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => router.push('/profile')}
          >
            Open profile settings
          </button>
        </div>
      </section>
    </section>
  )
}
