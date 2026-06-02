import { Construction, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function UnderMaintenance() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      {/* Grid + aurora background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(163, 255, 18, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163, 255, 18, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-[#A3FF12]/20 blur-[120px] animate-pulse-slow" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-[380px] w-[380px] rounded-full bg-[#FF4CF0]/25 blur-[110px] animate-pulse-slow animation-delay-1000" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[320px] w-[320px] rounded-full bg-[#F9F871]/15 blur-[100px] animate-pulse-slow animation-delay-2000" />

      {/* Floating accents */}
      <div className="pointer-events-none absolute top-[18%] left-[12%] h-2 w-2 rounded-full bg-[#A3FF12] animate-float opacity-70" />
      <div className="pointer-events-none absolute top-[28%] right-[18%] h-3 w-3 rounded-full bg-[#FF4CF0] animate-float animation-delay-1000 opacity-50" />
      <div className="pointer-events-none absolute bottom-[22%] left-[20%] h-1.5 w-1.5 rounded-full bg-[#F9F871] animate-float animation-delay-1500 opacity-60" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <Link
          href="/"
          className="animate-fade-in mb-12 flex items-center gap-3 transition-transform duration-300 hover:scale-105"
        >
          <img
            src="/websoroban_logo.png"
            alt="Web Soroban"
            className="h-9 w-auto"
          />
          <span className="text-lg font-semibold tracking-tight text-white/90">
            Web Soroban
          </span>
        </Link>

        {/* Main card */}
        <div className="animate-fade-in-up w-full max-w-lg opacity-0 [animation-fill-mode:forwards]">
          <div className="relative rounded-3xl p-[1px] shadow-[0_0_80px_rgba(160,32,240,0.35)]">
            <div
              className="absolute inset-0 rounded-3xl opacity-80 animate-gradient-x"
              style={{
                background:
                  'linear-gradient(135deg, #A3FF12, #FF4CF0, #F9F871, #A3FF12)',
              }}
            />
            <div className="relative rounded-[23px] border border-white/10 bg-[#0c0d12]/90 px-8 py-12 backdrop-blur-2xl md:px-12 md:py-14">
              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#A3FF12]/30 bg-[#A3FF12]/10 shadow-[0_0_32px_rgba(163,255,18,0.25)]">
                <Construction className="h-8 w-8 text-[#A3FF12]" strokeWidth={1.5} />
              </div>

              <p className="mb-3 text-center font-mono text-xs uppercase tracking-[0.35em] text-[#A3FF12]">
                Temporarily offline
              </p>

              <h1 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                <span className="bg-gradient-to-r from-[#F9F871] via-white to-[#FF4CF0] bg-clip-text text-transparent">
                  Under Maintenance
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-sm text-center text-[15px] leading-relaxed text-gray-400">
                We&apos;re upgrading the Soroban playground — sharper builds, smoother deploys, and a better IDE experience. Back online soon.
              </p>

              {/* Indeterminate progress */}
              <div className="mt-10 overflow-hidden rounded-full border border-white/10 bg-white/5 p-1">
                <div className="maintenance-shimmer h-1.5 w-full rounded-full bg-gradient-to-r from-transparent via-[#A3FF12] to-transparent" />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A3FF12] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#A3FF12]" />
                  </span>
                  Systems updating
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF4CF0]/20 bg-[#FF4CF0]/10 px-4 py-2 text-xs text-[#FF4CF0]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Something great is brewing
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="animate-fade-in animation-delay-400 mt-14 text-center text-sm text-gray-500">
          Questions? Reach us on{' '}
          <a
            href="https://x.com/WebSoroban"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A3FF12] underline-offset-4 transition-colors hover:text-[#8FE600] hover:underline"
          >
            Twitter
          </a>
        </p>
      </div>
    </main>
  )
}
