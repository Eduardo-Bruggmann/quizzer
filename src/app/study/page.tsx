'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Subject {
  id: string
  name: string
}

interface Question {
  id: string
  statement: string
}

interface Alternative {
  id: string
  content: string
  isCorrect: boolean
}

interface CurrentUser {
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

export default function StudyPage() {
  const router = useRouter()
  const [user] = useState<CurrentUser | null>(() => getStoredUser())
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string>('')
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!user) {
      router.replace('/login')
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

  useEffect(() => {
    if (!selectedSubjectId) {
      setQuestions([])
      setAlternatives([])
      setActiveQuestionIndex(0)
      setSelectedAlternativeId('')
      setCorrectAnswers(0)
      setFinished(false)
      return
    }

    let cancelled = false

    async function loadQuiz() {
      setLoadingQuiz(true)
      setFinished(false)
      setCorrectAnswers(0)
      setSelectedAlternativeId('')
      setActiveQuestionIndex(0)

      try {
        const questionsRes = await fetch(
          `/api/questions?subjectId=${selectedSubjectId}`,
        )
        const questionsData = await questionsRes.json()
        const loadedQuestions = (questionsData.data ?? []) as Question[]

        if (cancelled) return
        setQuestions(loadedQuestions)

        if (loadedQuestions.length > 0) {
          const firstQuestionId = loadedQuestions[0].id
          const alternativesRes = await fetch(
            `/api/alternatives?questionId=${firstQuestionId}`,
          )
          const alternativesData = await alternativesRes.json()

          if (!cancelled) {
            setAlternatives(alternativesData.data ?? [])
          }
        } else {
          setAlternatives([])
        }
      } finally {
        if (!cancelled) {
          setLoadingQuiz(false)
        }
      }
    }

    loadQuiz()

    return () => {
      cancelled = true
    }
  }, [selectedSubjectId])

  const activeQuestion = questions[activeQuestionIndex]

  async function goNext() {
    if (!activeQuestion) return

    const selected = alternatives.find(
      item => item.id === selectedAlternativeId,
    )
    if (selected?.isCorrect) {
      setCorrectAnswers(value => value + 1)
    }

    const nextIndex = activeQuestionIndex + 1
    if (nextIndex >= questions.length) {
      setFinished(true)
      setAlternatives([])
      return
    }

    setActiveQuestionIndex(nextIndex)
    setSelectedAlternativeId('')

    const nextQuestion = questions[nextIndex]
    const alternativesRes = await fetch(
      `/api/alternatives?questionId=${nextQuestion.id}`,
    )
    const alternativesData = await alternativesRes.json()
    setAlternatives(alternativesData.data ?? [])
  }

  async function restartCurrentSubject() {
    if (!selectedSubjectId) return

    setFinished(false)
    setCorrectAnswers(0)
    setActiveQuestionIndex(0)
    setSelectedAlternativeId('')

    if (!questions.length) return

    const alternativesRes = await fetch(
      `/api/alternatives?questionId=${questions[0].id}`,
    )
    const alternativesData = await alternativesRes.json()
    setAlternatives(alternativesData.data ?? [])
  }

  if (!user) return null

  const progress = questions.length
    ? Math.round((activeQuestionIndex / questions.length) * 100)
    : 0
  const accuracy = questions.length ? correctAnswers / questions.length : 0

  const completionMessage =
    accuracy >= 0.8
      ? 'Excellent work. You are consistently making strong decisions under pressure.'
      : accuracy >= 0.5
        ? 'Solid effort. Keep practicing and your score will climb quickly.'
        : 'Bold strategy. At least now the wrong answers know your name.'

  return (
    <section className="space-y-6 py-6">
      <header className="surface space-y-3 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E97635]">
          Study Session
        </p>
        <h1 className="card-title text-3xl">Practice and Improve</h1>
        <p className="text-sm muted">
          Select a subject, answer each question, and keep your accuracy high.
        </p>
      </header>

      <section className="surface p-5 md:p-6">
        <label className="field-label">Subject</label>
        <select
          className="select"
          value={selectedSubjectId}
          onChange={event => setSelectedSubjectId(event.target.value)}
        >
          <option value="">Choose a subject</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </section>

      {loadingQuiz ? <p className="text-sm muted">Loading quiz...</p> : null}

      {!loadingQuiz && selectedSubjectId && questions.length === 0 ? (
        <section className="surface p-5 text-sm muted">
          This subject has no questions yet.
        </section>
      ) : null}

      {!loadingQuiz && activeQuestion && !finished ? (
        <section className="surface space-y-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[#E97635]">
              Question {activeQuestionIndex + 1} of {questions.length}
            </p>
            <p className="text-xs muted">Progress: {progress}%</p>
          </div>

          <h2 className="text-lg font-semibold text-[#2F2925]">
            {activeQuestion.statement}
          </h2>

          <ul className="space-y-2">
            {alternatives.map((alternative, index) => {
              const label = String.fromCharCode(65 + index)

              return (
                <li key={alternative.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedAlternativeId(alternative.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      selectedAlternativeId === alternative.id
                        ? 'border-[#DE7C4A] bg-[#FFF3EB]'
                        : 'border-[#F4DFD2] bg-[#FFFCFA]'
                    }`}
                  >
                    <span className="mr-2 font-bold text-[#C67A52]">
                      {label}.
                    </span>
                    {alternative.content}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto disabled:opacity-60"
              onClick={goNext}
              disabled={!selectedAlternativeId}
            >
              Next question
            </button>
          </div>
        </section>
      ) : null}

      {finished ? (
        <section className="surface space-y-3 p-6 text-center">
          <h2 className="card-title text-2xl">Session Complete</h2>
          <p className="text-sm muted">
            You answered {correctAnswers} out of {questions.length} correctly.
          </p>
          <p className="text-sm font-semibold text-[#2F2925]">
            {completionMessage}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              className="btn btn-primary w-full sm:w-auto"
              onClick={restartCurrentSubject}
            >
              Retry subject
            </button>
            <button
              className="btn btn-ghost w-full sm:w-auto"
              onClick={() => router.push('/dashboard')}
            >
              Back to dashboard
            </button>
          </div>
        </section>
      ) : null}
    </section>
  )
}
