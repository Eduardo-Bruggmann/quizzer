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
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
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

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return

    setError(null)
    setSuccess(null)

    setLoadingProfile(true)

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
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not update profile')

      const updatedUser = data.data as CurrentUser
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not update profile'
      setError(message)
    } finally {
      setLoadingProfile(false)
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return

    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoadingPassword(true)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not update password')

      setPassword('')
      setConfirmPassword('')
      setSuccess('Password updated successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not update password'
      setError(message)
    } finally {
      setLoadingPassword(false)
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
        <h2 className="card-title text-2xl">Profile Information</h2>
        <p className="mt-1 text-sm muted">Update your name and email here.</p>

        <form className="mt-4 space-y-3" onSubmit={handleProfileSubmit}>
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

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="status-ok text-sm">{success}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary disabled:opacity-60"
              type="submit"
              disabled={loadingProfile}
            >
              {loadingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>

      <section className="surface p-5 md:p-6">
        <h2 className="card-title text-2xl">Change Password</h2>
        <p className="mt-1 text-sm muted">
          Use this separate form to update your password.
        </p>

        <form className="mt-4 space-y-3" onSubmit={handlePasswordSubmit}>
          <div>
            <label className="field-label">New password</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter a strong password"
              required
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
              required
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary disabled:opacity-60"
              type="submit"
              disabled={loadingPassword}
            >
              {loadingPassword ? 'Updating...' : 'Update password'}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => router.push('/dashboard')}
            >
              Back to dashboard
            </button>
          </div>
        </form>

        <div className="mt-4 border-t border-[#F4DFD2] pt-4">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={handleDeleteAccount}
          >
            Delete my account
          </button>
        </div>
      </section>
    </section>
  )
}
