'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(() => getStoredUser())
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    setFullName(user.fullName)
    setEmail(user.email)
  }, [router, user])

  if (!user) return null

  const token = localStorage.getItem('accessToken')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return

    setError(null)
    setSuccess(null)

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          fullName,
          email,
          password: password || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not update profile')

      const updatedUser = data.data as CurrentUser
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setPassword('')
      setConfirmPassword('')
      setSuccess('Profile updated successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not update profile'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    if (!user) return
    if (!confirm('Are you sure you want to delete your account?')) return

    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not delete account')

      localStorage.removeItem('accessToken')
      localStorage.removeItem('currentUser')
      router.replace('/register')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not delete account'
      setError(message)
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5 py-6">
      <header className="surface p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E97635]">
          My Profile
        </p>
        <h1 className="card-title mt-1 text-3xl">Update account details</h1>
        <p className="mt-1 text-sm muted">
          Update your name, email, and password.
        </p>
      </header>

      <section className="surface p-5 md:p-6">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="field-label">Full name</label>
            <input
              className="field"
              value={fullName}
              onChange={event => setFullName(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              className="field"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">New password (optional)</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Fill only if you want to change it"
            />
          </div>
          <div>
            <label className="field-label">Confirm new password</label>
            <input
              className="field"
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              placeholder="Repeat the new password"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="status-ok text-sm">{success}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => router.push('/dashboard')}
            >
              Back
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleDeleteAccount}
            >
              Delete my account
            </button>
          </div>
        </form>
      </section>
    </section>
  )
}
