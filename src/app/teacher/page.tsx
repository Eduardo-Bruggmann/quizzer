'use client'

import { useCallback, useEffect, useState } from 'react'
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

interface Question {
  id: string
  subjectId: string
  statement: string
}

interface NewAlternative {
  label: string
  content: string
}

interface ManagedUser {
  id: string
  fullName: string
  email: string
  role: 'student' | 'teacher'
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
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [manageSubjectId, setManageSubjectId] = useState('')
  const [subjectDrafts, setSubjectDrafts] = useState<
    Record<string, { name: string; description: string }>
  >({})
  const [questionDrafts, setQuestionDrafts] = useState<Record<string, string>>(
    {},
  )
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

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('accessToken')
    return {
      Authorization: token ? `Bearer ${token}` : '',
    }
  }, [])

  function resetMessages() {
    setError(null)
    setSuccessMessage(null)
  }

  const loadSubjects = useCallback(async () => {
    const res = await fetch('/api/subjects')
    const data = await res.json()
    const loadedSubjects = (data.data ?? []) as Subject[]
    setSubjects(loadedSubjects)

    if (!manageSubjectId && loadedSubjects.length > 0) {
      setManageSubjectId(loadedSubjects[0].id)
    }
  }, [manageSubjectId])

  const loadUsers = useCallback(async () => {
    const res = await fetch('/api/users', {
      headers: {
        ...getAuthHeader(),
      },
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error ?? 'Failed to load users')
    }

    setUsers(data.data ?? [])
  }, [getAuthHeader])

  const loadQuestions = useCallback(async (subjectId: string) => {
    if (!subjectId) {
      setQuestions([])
      return
    }

    const res = await fetch(`/api/questions?subjectId=${subjectId}`)
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error ?? 'Failed to load questions')
    }

    setQuestions(data.data ?? [])
  }, [])

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
    if (!user || user.role !== 'teacher') return

    let cancelled = false

    async function boot() {
      try {
        await Promise.all([loadSubjects(), loadUsers()])
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load panel'
          setError(message)
        }
      }
    }

    boot()

    return () => {
      cancelled = true
    }
  }, [loadSubjects, loadUsers, user])

  useEffect(() => {
    if (!manageSubjectId) {
      setQuestions([])
      return
    }

    loadQuestions(manageSubjectId).catch(err => {
      const message =
        err instanceof Error ? err.message : 'Failed to load questions'
      setError(message)
    })
  }, [loadQuestions, manageSubjectId])

  if (!user) {
    return null
  }

  async function createSubject(event: React.FormEvent) {
    event.preventDefault()
    resetMessages()

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: subjectName,
          description: subjectDescription,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create subject')

      await loadSubjects()
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
    resetMessages()

    const validAlternatives = alternatives.filter(item => item.content.trim())

    if (validAlternatives.length < 2) {
      setError('Add at least two alternatives.')
      return
    }

    try {
      const questionRes = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
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
              ...getAuthHeader(),
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

      await loadQuestions(questionSubjectId)
      setManageSubjectId(questionSubjectId)

      setSuccessMessage('Question created successfully.')
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

  async function updateUserRole(target: ManagedUser) {
    resetMessages()

    const nextRole = target.role === 'teacher' ? 'student' : 'teacher'

    try {
      const res = await fetch(`/api/users/${target.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ role: nextRole }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update role')

      setUsers(previous =>
        previous.map(item =>
          item.id === target.id ? { ...item, role: nextRole } : item,
        ),
      )
      setSuccessMessage('Access role updated successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update role'
      setError(message)
    }
  }

  async function deleteUser(target: ManagedUser) {
    if (!confirm(`Remove user ${target.fullName}?`)) return

    resetMessages()

    try {
      const res = await fetch(`/api/users/${target.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to remove user')

      setUsers(previous => previous.filter(item => item.id !== target.id))
      setSuccessMessage('User removed successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove user'
      setError(message)
    }
  }

  function getSubjectDraft(subject: Subject) {
    return (
      subjectDrafts[subject.id] ?? {
        name: subject.name,
        description: subject.description ?? '',
      }
    )
  }

  function changeSubjectDraft(
    subjectId: string,
    field: 'name' | 'description',
    value: string,
  ) {
    const subject = subjects.find(item => item.id === subjectId)
    if (!subject) return

    const current = getSubjectDraft(subject)

    setSubjectDrafts(previous => ({
      ...previous,
      [subjectId]: {
        ...current,
        [field]: value,
      },
    }))
  }

  async function updateSubject(subject: Subject) {
    resetMessages()

    const draft = getSubjectDraft(subject)

    try {
      const res = await fetch(`/api/subjects/${subject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update subject')

      await loadSubjects()
      setSuccessMessage('Subject updated successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update subject'
      setError(message)
    }
  }

  async function removeSubject(subject: Subject) {
    if (!confirm(`Delete subject ${subject.name}?`)) return

    resetMessages()

    try {
      const res = await fetch(`/api/subjects/${subject.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete subject')

      await loadSubjects()

      if (manageSubjectId === subject.id) {
        const next = subjects.filter(item => item.id !== subject.id)
        setManageSubjectId(next[0]?.id ?? '')
      }

      setSuccessMessage('Subject deleted successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete subject'
      setError(message)
    }
  }

  function getQuestionDraft(question: Question) {
    return questionDrafts[question.id] ?? question.statement
  }

  function changeQuestionDraft(questionId: string, statement: string) {
    setQuestionDrafts(previous => ({
      ...previous,
      [questionId]: statement,
    }))
  }

  async function updateQuestion(question: Question) {
    resetMessages()

    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          statement: getQuestionDraft(question),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update question')

      await loadQuestions(manageSubjectId)
      setSuccessMessage('Question updated successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update question'
      setError(message)
    }
  }

  async function removeQuestion(question: Question) {
    if (!confirm('Delete this question?')) return

    resetMessages()

    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete question')

      await loadQuestions(manageSubjectId)
      setSuccessMessage('Question deleted successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete question'
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
          Teacher Panel
        </p>
        <h1 className="card-title mt-1 text-3xl">Management</h1>
        <p className="mt-1 text-sm muted">Welcome, {user.fullName}.</p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {successMessage ? (
        <p className="status-ok text-sm">{successMessage}</p>
      ) : null}

      <section className="surface p-5 md:p-6">
        <h2 className="card-title text-2xl">Users</h2>
        <p className="mt-1 text-sm muted">
          Promote students to teachers and remove users when needed.
        </p>

        <div className="mt-4 grid gap-2">
          {users.map(item => (
            <article
              key={item.id}
              className="rounded-xl border border-[#F4DFD2] bg-[#FFFCFA] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#2F2925]">
                    {item.fullName}
                  </p>
                  <p className="text-xs muted">{item.email}</p>
                  <p className="text-xs font-semibold text-[#C67A52] capitalize">
                    {item.role}
                  </p>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <button
                    className="btn btn-ghost w-full sm:w-auto"
                    type="button"
                    onClick={() => updateUserRole(item)}
                  >
                    {item.role === 'teacher' ? 'Demote' : 'Promote'}
                  </button>
                  <button
                    className="btn btn-ghost w-full sm:w-auto"
                    type="button"
                    onClick={() => deleteUser(item)}
                    disabled={item.id === user.id}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="surface p-5 md:p-6">
          <h2 className="card-title text-2xl">Subjects</h2>
          <form onSubmit={createSubject} className="mt-4 space-y-3">
            <div>
              <label className="field-label">Subject name</label>
              <input
                className="field"
                placeholder="Example: Geography"
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea
                className="textarea"
                placeholder="Short description"
                value={subjectDescription}
                onChange={e => setSubjectDescription(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Create subject
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#2F2925]">Edit</h3>
            {subjects.length === 0 ? (
              <p className="text-xs muted">No subjects available yet.</p>
            ) : (
              <ul className="space-y-2">
                {subjects.map(subject => (
                  <li
                    key={subject.id}
                    className="rounded-xl border border-[#F4DFD2] bg-[#FFFCFA] p-3 text-sm"
                  >
                    <div className="space-y-2">
                      <input
                        className="field"
                        value={getSubjectDraft(subject).name}
                        onChange={e =>
                          changeSubjectDraft(subject.id, 'name', e.target.value)
                        }
                      />
                      <textarea
                        className="textarea"
                        value={getSubjectDraft(subject).description}
                        onChange={e =>
                          changeSubjectDraft(
                            subject.id,
                            'description',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => updateSubject(subject)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => removeSubject(subject)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="surface p-5 md:p-6">
          <h2 className="card-title text-2xl">Questions</h2>
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
                <option value="">Select</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Statement</label>
              <textarea
                className="textarea"
                placeholder="Type the full question statement"
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

          <div className="mt-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#2F2925]">
              Edit and delete
            </h3>

            <select
              className="select"
              value={manageSubjectId}
              onChange={e => setManageSubjectId(e.target.value)}
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            {questions.length === 0 ? (
              <p className="text-xs muted">
                No questions for this subject yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {questions.map(question => (
                  <li
                    key={question.id}
                    className="rounded-xl border border-[#F4DFD2] bg-[#FFFCFA] p-3"
                  >
                    <textarea
                      className="textarea"
                      value={getQuestionDraft(question)}
                      onChange={e =>
                        changeQuestionDraft(question.id, e.target.value)
                      }
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => updateQuestion(question)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => removeQuestion(question)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
