import Link from 'next/link'

export default function Home() {
  return (
    <section className="grid gap-6 py-8 md:grid-cols-[1.15fr_0.85fr] md:items-stretch">
      <article className="surface flex flex-col justify-between gap-7 p-6 md:p-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E97635]">
            Interactive Learning Platform
          </p>
          <h1 className="card-title text-4xl leading-tight md:text-5xl">
            Build confidence one quiz at a time.
          </h1>
          <p className="max-w-xl text-sm leading-6 muted md:text-base">
            QUIZZER helps students train consistently and gives teachers a clear
            way to publish subjects, questions, and answer options. Start a
            session in seconds and keep progress moving.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-[#6E5950] md:grid-cols-3">
          <div className="rounded-xl border border-[#F0D7C8] bg-[#FFFAF6] p-3">
            <strong className="block text-base text-[#2F2925]">
              Fast Setup
            </strong>
            Student and teacher flows are ready after registration.
          </div>
          <div className="rounded-xl border border-[#F0D7C8] bg-[#FFFAF6] p-3">
            <strong className="block text-base text-[#2F2925]">
              Structured Study
            </strong>
            Pick a subject, answer questions, and track completion.
          </div>
          <div className="rounded-xl border border-[#F0D7C8] bg-[#FFFAF6] p-3">
            <strong className="block text-base text-[#2F2925]">
              Teacher Control
            </strong>
            Create complete question sets with alternatives.
          </div>
        </div>
      </article>

      <aside className="surface flex flex-col justify-between gap-5 p-6 md:p-8">
        <div>
          <h2 className="card-title text-2xl">Get Started</h2>
          <p className="mt-2 text-sm muted">
            Choose your next step and enter the platform.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/register"
            className="btn btn-primary block w-full text-center"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="btn btn-ghost block w-full text-center"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="btn btn-ghost block w-full text-center"
          >
            Go to dashboard
          </Link>
        </div>

        <p className="text-xs muted">
          Tip: Teachers can open the teacher panel from the dashboard after
          signing in.
        </p>
      </aside>
    </section>
  )
}
