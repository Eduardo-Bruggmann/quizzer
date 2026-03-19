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

interface NewAlternative {
  label: string
  content: string
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

export default function TeacherPage() {
  const router = useRouter()
  const [user] = useState<CurrentUser | null>(() => getStoredUser())
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectName, setSubjectName] = useState('')
  const [subjectDescription, setSubjectDescription] = useState('')
  const [questionStatement, setQuestionStatement] = useState('')
  const [questionSubjectId, setQuestionSubjectId] = useState('')
  const [alternatives, setAlternatives] = useState<NewAlternative[]>([
    { label: 'A', content: '' },
    { label: 'B', content: '' },
    { label: 'C', content: '' },
    { label: 'D', content: '' },
    { label: 'E', content: '' },
  ])
  const [correctLabel, setCorrectLabel] = useState('A')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    if (user.role !== 'teacher') {
      router.replace('/dashboard')
    }
  }, [router, user])

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
    setSuccessMessage(null)

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
      setSuccessMessage('Subject created successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create subject'
      setError(message)
    }
  }

  async function createQuestionWithAlternatives(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const validAlternatives = alternatives.filter(item => item.content.trim())

    if (validAlternatives.length < 2) {
      setError('Add at least two alternatives before publishing the question.')
      return
    }

    try {
      const questionRes = await fetch('/api/questions', {
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

      const questionData = await questionRes.json()
      if (!questionRes.ok)
        throw new Error(questionData.error ?? 'Failed to create question')

      const questionId = questionData.data.id as string

      await Promise.all(
        validAlternatives.map(item =>
          fetch('/api/alternatives', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({
              questionId,
              content: item.content,
              isCorrect: item.label === correctLabel,
            }),
          }).then(async response => {
            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error ?? 'Failed to create alternatives')
            }
          }),
        ),
      )

      setSuccessMessage('Question and alternatives created successfully.')
      setQuestionStatement('')
      setQuestionSubjectId('')
      setAlternatives([
        { label: 'A', content: '' },
        { label: 'B', content: '' },
        { label: 'C', content: '' },
        { label: 'D', content: '' },
        { label: 'E', content: '' },
      ])
      setCorrectLabel('A')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create question'
      setError(message)
    }
  }

  function updateAlternative(label: string, value: string) {
    setAlternatives(previous =>
      previous.map(item =>
        item.label === label ? { ...item, content: value } : item,
      ),
    )
  }

  return (
    <section className="space-y-6 py-6">
      <header className="surface p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E97635]">
          Teacher Workspace
        </p>
        <h1 className="card-title mt-1 text-3xl">Build New Quiz Content</h1>
        <p className="mt-1 text-sm muted">
          Welcome, {user.fullName}. Create subjects and complete question sets.
        </p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {successMessage ? (
        <p className="status-ok text-sm">{successMessage}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="surface p-5 md:p-6">
          <h2 className="card-title text-2xl">Create Subject</h2>
          <form onSubmit={createSubject} className="mt-4 space-y-3">
            <div>
              <label className="field-label">Subject name</label>
              <input
                className="field"
                placeholder="e.g. Algebra"
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea
                className="textarea"
                placeholder="Briefly describe this subject"
                value={subjectDescription}
                onChange={e => setSubjectDescription(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Save subject
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#2F2925]">
              Current subjects
            </h3>
            {subjects.length === 0 ? (
              <p className="text-xs muted">No subjects yet.</p>
            ) : (
              <ul className="space-y-2">
                {subjects.map(subject => (
                  <li
                    key={subject.id}
                    className="rounded-xl border border-[#F4DFD2] bg-[#FFFCFA] px-3 py-2 text-sm"
                  >
                    <strong>{subject.name}</strong>
                    <p className="text-xs muted">
                      {subject.description || 'No description provided.'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="surface p-5 md:p-6">
          <h2 className="card-title text-2xl">Create Question</h2>
          <form
            onSubmit={createQuestionWithAlternatives}
            className="mt-4 space-y-3.5"
          >
            <div>
              <label className="field-label">Subject</label>
              <select
                className="select"
                value={questionSubjectId}
                onChange={e => setQuestionSubjectId(e.target.value)}
                required
              >
                <option value="">Choose a subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Question statement</label>
              <textarea
                className="textarea"
                placeholder="Type the full question"
                value={questionStatement}
                onChange={e => setQuestionStatement(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="field-label">Alternatives</label>
              {alternatives.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-6 rounded-md bg-[#FFF0E6] py-1 text-center text-xs font-bold text-[#C67A52]">
                    {item.label}
                  </span>
                  <input
                    className="field"
                    placeholder={`Alternative ${item.label}`}
                    value={item.content}
                    onChange={e =>
                      updateAlternative(item.label, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="field-label">Correct alternative</label>
              <select
                className="select"
                value={correctLabel}
                onChange={e => setCorrectLabel(e.target.value)}
              >
                {alternatives.map(item => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" type="submit">
              Publish question
            </button>
          </form>
        </section>
      </div>
    </section>
  )
}
