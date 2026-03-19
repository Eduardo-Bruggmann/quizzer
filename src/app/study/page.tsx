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

export default function StudyPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('')
  const [alternatives, setAlternatives] = useState<Alternative[]>([])

  useEffect(() => {
    async function loadSubjects() {
      const res = await fetch('/api/subjects')
      const data = await res.json()
      setSubjects(data.data ?? [])
    }

    loadSubjects()
  }, [])

  useEffect(() => {
    async function loadQuestions() {
      if (!selectedSubjectId) return

      const res = await fetch(`/api/questions?subjectId=${selectedSubjectId}`)
      const data = await res.json()
      setQuestions(data.data ?? [])
      setSelectedQuestionId('')
      setAlternatives([])
    }

    loadQuestions()
  }, [selectedSubjectId])

  useEffect(() => {
    async function loadAlternatives() {
      if (!selectedQuestionId) return

      const res = await fetch(
        `/api/alternatives?questionId=${selectedQuestionId}`,
      )
      const data = await res.json()
      setAlternatives(data.data ?? [])
    }

    loadAlternatives()
  }, [selectedQuestionId])

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-6">
      <button
        className="self-start text-xs text-gray-600 underline"
        onClick={() => router.push('/dashboard')}
      >
        Voltar para o dashboard
      </button>

      <h1 className="text-2xl font-semibold">Estudos</h1>

      <section className="space-y-3 rounded border p-4 text-sm">
        <div className="space-y-1">
          <label className="block text-xs font-medium">Matéria</label>
          <select
            className="w-full rounded border p-2 text-sm"
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
          >
            <option value="">Selecione uma matéria</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium">Questão</label>
          <select
            className="w-full rounded border p-2 text-sm"
            value={selectedQuestionId}
            onChange={e => setSelectedQuestionId(e.target.value)}
            disabled={!selectedSubjectId || questions.length === 0}
          >
            <option value="">Selecione uma questão</option>
            {questions.map(question => (
              <option key={question.id} value={question.id}>
                {question.statement}
              </option>
            ))}
          </select>
        </div>
      </section>

      {selectedQuestionId ? (
        <section className="space-y-3 rounded border p-4 text-sm">
          <h2 className="text-base font-semibold">Alternativas</h2>
          <ul className="space-y-2">
            {alternatives.map(alt => (
              <li key={alt.id} className="rounded border p-2">
                {alt.content}
              </li>
            ))}
            {alternatives.length === 0 ? (
              <p className="text-xs text-gray-500">
                Nenhuma alternativa cadastrada para esta questão.
              </p>
            ) : null}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
