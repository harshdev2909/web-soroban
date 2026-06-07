import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Space_Grotesk } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletKitProvider } from '@/contexts/WalletKitContext'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Geometric grotesk display face for headings
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

export const metadata: Metadata = {
  title: 'WebSoroban · Write, compile and deploy Soroban contracts in the browser',
  description:
    'A browser IDE for Stellar and Soroban smart contracts. Write Rust, compile to WASM, and deploy to testnet from your own auto provisioned wallet with zero local setup.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style>{`
:root {
  --font-sans: ${GeistSans.style.fontFamily};
  --font-mono: ${GeistMono.style.fontFamily};
}
        `}</style>
      </head>
      <body>
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
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            classNames: {
              toast:
                'group border-border bg-popover text-popover-foreground shadow-lg rounded-lg',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
