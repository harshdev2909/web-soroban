import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletKitProvider } from '@/contexts/WalletKitContext'
import { NetworkProvider } from '@/contexts/NetworkContext'
import { MotionProvider } from '@/components/motion-provider'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

export const metadata: Metadata = {
  title: 'WebSoroban · Build Stellar apps at the speed of thought',
  description:
    'The AI product builder and web IDE for Stellar applications, Soroban contracts, agentic payments, data, privacy, and zero-knowledge tooling.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style>{`
:root {
  --font-sans: ${GeistSans.style.fontFamily};
  --font-mono: ${GeistMono.style.fontFamily};
  --font-display: ${GeistSans.style.fontFamily};
}
        `}</style>
      </head>
      <body>
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            {/* The tiny queue + config runs before hydration so no early event is lost;
                the gtag.js library itself loads when the page is idle and drains the queue. */}
            <Script id="google-analytics" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <MotionProvider>
          <WalletKitProvider>
            <NetworkProvider>
              <AuthProvider>{children}</AuthProvider>
            </NetworkProvider>
          </WalletKitProvider>
        </MotionProvider>
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
