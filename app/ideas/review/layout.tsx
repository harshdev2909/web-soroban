import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Review ideas · Idea Bank',
  robots: { index: false, follow: false },
}

export default function ReviewLayout({ children }: { children: ReactNode }) {
  return children
}
