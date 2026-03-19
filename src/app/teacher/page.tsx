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
}

export default function TeacherPage() {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectName, setSubjectName] = useState('')
  const [subjectDescription, setSubjectDescription] = useState('')
  const [questionStatement, setQuestionStatement] = useState('')
  const [questionSubjectId, setQuestionSubjectId] = useState('')
  const [altContent, setAltContent] = useState('')
  const [altIsCorrect, setAltIsCorrect] = useState(false)
  const [altQuestionId, setAltQuestionId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (!stored) {
      router.replace('/login')
      return
    }

    try {
      const parsed = JSON.parse(stored) as CurrentUser
      if (parsed.role !== 'teacher') {
        router.replace('/dashboard')
        return
      }
      setUser(parsed)
    } catch {
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    async function loadSubjects() {
      const res = await fetch('/api/subjects')
      const data = await res.json()
      setSubjects(data.data ?? [])
    }

    loadSubjects()
  }, [])

  if (!user) {
    return null
  }

  const token = localStorage.getItem('accessToken')

  async function createSubject(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name: subjectName,
          description: subjectDescription,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create subject')

      setSubjects(prev => [...prev, data.data])
      setSubjectName('')
      setSubjectDescription('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create subject'
      setError(message)
    }
  }

  async function createQuestion(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          subjectId: questionSubjectId,
          statement: questionStatement,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create question')

      setQuestionStatement('')
      setQuestionSubjectId('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create question'
      setError(message)
    }
  }

  async function createAlternative(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      const res = await fetch('/api/alternatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          questionId: altQuestionId,
          content: altContent,
          isCorrect: altIsCorrect,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create alternative')

      setAltContent('')
      setAltIsCorrect(false)
      setAltQuestionId('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create alternative'
      setError(message)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <button
        className="self-start text-xs text-gray-600 underline"
        onClick={() => router.push('/dashboard')}
      >
        Voltar para o dashboard
      </button>

      <h1 className="text-2xl font-semibold">Painel do professor</h1>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="space-y-3 rounded border p-4 text-sm">
        <h2 className="text-base font-semibold">Criar matéria</h2>
        <form onSubmit={createSubject} className="space-y-2">
          <input
            className="w-full rounded border p-2 text-sm"
            placeholder="Nome da matéria"
            value={subjectName}
            onChange={e => setSubjectName(e.target.value)}
            required
          />
          <textarea
            className="w-full rounded border p-2 text-sm"
            placeholder="Descrição (opcional)"
            value={subjectDescription}
            onChange={e => setSubjectDescription(e.target.value)}
          />
          <button
            className="rounded bg-black px-3 py-1 text-xs font-medium text-white"
            type="submit"
          >
            Criar matéria
          </button>
        </form>
      </section>

      <section className="space-y-3 rounded border p-4 text-sm">
        <h2 className="text-base font-semibold">Criar questão</h2>
        <form onSubmit={createQuestion} className="space-y-2">
          <select
            className="w-full rounded border p-2 text-sm"
            value={questionSubjectId}
            onChange={e => setQuestionSubjectId(e.target.value)}
            required
          >
            <option value="">Selecione uma matéria</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <textarea
            className="w-full rounded border p-2 text-sm"
            placeholder="Enunciado da questão"
            value={questionStatement}
            onChange={e => setQuestionStatement(e.target.value)}
            required
          />
          <button
            className="rounded bg-black px-3 py-1 text-xs font-medium text-white"
            type="submit"
          >
            Criar questão
          </button>
        </form>
      </section>

      <section className="space-y-3 rounded border p-4 text-sm">
        <h2 className="text-base font-semibold">Criar alternativa</h2>
        <form onSubmit={createAlternative} className="space-y-2">
          <input
            className="w-full rounded border p-2 text-sm"
            placeholder="ID da questão"
            value={altQuestionId}
            onChange={e => setAltQuestionId(e.target.value)}
            required
          />
          <input
            className="w-full rounded border p-2 text-sm"
            placeholder="Texto da alternativa"
            value={altContent}
            onChange={e => setAltContent(e.target.value)}
            required
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={altIsCorrect}
              onChange={e => setAltIsCorrect(e.target.checked)}
            />
            Correta
          </label>
          <button
            className="rounded bg-black px-3 py-1 text-xs font-medium text-white"
            type="submit"
          >
            Criar alternativa
          </button>
        </form>
      </section>
    </main>
  )
}
