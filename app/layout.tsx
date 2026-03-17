import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletKitProvider } from '@/contexts/WalletKitContext'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'


const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

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
      <body className="antialiased">
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <WalletKitProvider>
          <AuthProvider>{children}</AuthProvider>
        </WalletKitProvider>
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
