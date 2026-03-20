'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface CurrentUser {
  id: string
  fullName: string
  email: string
  role: 'student' | 'teacher'
}

interface AuroraFrameProps {
  children: ReactNode
}

const PUBLIC_PATHS = new Set(['/', '/login', '/register'])

export default function AuroraFrame({ children }: AuroraFrameProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('currentUser')

    if (!stored) {
      setUser(null)
      return
    }

    try {
      setUser(JSON.parse(stored) as CurrentUser)
    } catch {
      setUser(null)
    }
  }, [pathname])

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('currentUser')
    setUser(null)
    router.push('/login')
  }

  const isPublic = PUBLIC_PATHS.has(pathname)

  return (
    <div className="app-shell">
      <div className="ambient ambient-top" />
      <div className="ambient ambient-bottom" />

      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="brand-mark" aria-label="Go to homepage">
            QUIZZER
          </Link>

          <nav className="site-nav" aria-label="Primary">
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/study">Study</Link>
            <Link href="/teacher">Teacher</Link>
          </nav>

          <div className="site-actions">
            {user ? (
              <>
                <div className="user-chip">
                  <button
                    type="button"
                    className="user-chip-name"
                    onClick={() => router.push('/profile')}
                  >
                    {user.fullName}
                  </button>
                  <span className="user-chip-role">{user.role}</span>
                </div>
                <button className="btn btn-ghost" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                {!isPublic ? (
                  <button
                    className="btn btn-ghost"
                    onClick={() => router.push('/login')}
                  >
                    Sign in
                  </button>
                ) : null}
                <button
                  className="btn btn-primary"
                  onClick={() => router.push('/register')}
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="page-shell">{children}</main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>QUIZZER</span>
          <span>Focused practice for students and teachers.</span>
        </div>
      </footer>
    </div>
  )
}
