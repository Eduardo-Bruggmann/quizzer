import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import AuroraFrame from '@/components/AuroraFrame'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'QUIZZER',
  description: 'A focused quiz platform for students and teachers',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        <AuroraFrame>{children}</AuroraFrame>
      </body>
    </html>
  )
}
