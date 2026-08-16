import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Platform analytics",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children
}
