import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Web Soroban - Professional IDE for Stellar Smart Contracts'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily}, 'Inter', sans-serif;
  --font-sans: ${GeistSans.variable}, 'Inter', sans-serif;
  --font-mono: ${GeistMono.variable}, 'JetBrains Mono', monospace;
}

.font-display {
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  letter-spacing: -0.025em;
}

.font-heading {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.font-body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

.font-mono-code {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}
        `}</style>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
