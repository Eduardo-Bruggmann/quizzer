import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QUIZZER',
  description: 'A web quiz app built with Next.js and TypeScript',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={``}>{children}</body>
    </html>
  )
}
