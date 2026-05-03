"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Code2,
  Cpu,
  FlaskConical,
  Rocket,
  Keyboard,
  Zap,
  ChevronRight,
  Maximize2,
  Minimize2,
  ExternalLink,
} from "lucide-react"

interface HowItWorksModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS = [
  {
    icon: Code2,
    label: "01",
    title: "Write",
    desc: "Open a Soroban project. Monaco-grade editor with Rust intellisense, ready in your tab.",
    color: "#A3FF12",
    timestamp: "0:00 – 0:08",
  },
  {
    icon: Cpu,
    label: "02",
    title: "Compile",
    desc: "WASM builds run client-side. Sub-second feedback, zero local toolchain.",
    color: "#FF4CF0",
    timestamp: "0:08 – 0:18",
  },
  {
    icon: FlaskConical,
    label: "03",
    title: "Simulate",
    desc: "Mock invocations against a sandboxed VM with realistic gas estimates before you sign.",
    color: "#F9F871",
    timestamp: "0:18 – 0:32",
  },
  {
    icon: Rocket,
    label: "04",
    title: "Deploy",
    desc: "Push directly to Stellar Testnet or Mainnet. Keys never leave your browser.",
    color: "#A3FF12",
    timestamp: "0:32 – end",
  },
]

const SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ["⌘", "S"], label: "Save project" },
  { keys: ["⌘", "B"], label: "Compile contract" },
  { keys: ["⌘", "↵"], label: "Deploy to Testnet" },
  { keys: ["⌘", "K"], label: "Command palette" },
]

export function HowItWorksModal({ open, onOpenChange }: HowItWorksModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [isTheater, setIsTheater] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Track native fullscreen state changes
  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      if (fs && videoRef.current) {
        videoRef.current.playbackRate = 2.0
      }
    }
    document.addEventListener("fullscreenchange", onFsChange)
    return () => document.removeEventListener("fullscreenchange", onFsChange)
  }, [])

  // 2x playback rate, kept stable across loads
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const apply = () => {
      v.playbackRate = 2.0
    }
    apply()
    v.addEventListener("loadedmetadata", apply)
    v.addEventListener("play", apply)
    return () => {
      v.removeEventListener("loadedmetadata", apply)
      v.removeEventListener("play", apply)
    }
  }, [open])

  // Pause when modal closes; restart from 0 when re-opened
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (open) {
      v.currentTime = 0
      v.play().catch(() => {})
      setIsPlaying(true)
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }, [open])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setIsPlaying(true)
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setIsMuted(v.muted)
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const pct = (v.currentTime / v.duration) * 100
    setProgress(pct)
    // Map progress to active step (4 segments)
    const seg = Math.min(3, Math.floor(pct / 25))
    setActiveStep(seg)
  }

  const seekToStep = (i: number) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    v.currentTime = (v.duration * i) / 4
    if (v.paused) {
      v.play()
      setIsPlaying(true)
    }
  }

  const toggleFullscreen = async () => {
    const wrap = videoWrapRef.current
    const v = videoRef.current
    if (!wrap || !v) return
    try {
      if (!document.fullscreenElement) {
        // Prefer wrapper so our overlay controls remain visible
        if (wrap.requestFullscreen) {
          await wrap.requestFullscreen()
        } else if ((v as any).webkitEnterFullscreen) {
          // iOS Safari fallback
          ;(v as any).webkitEnterFullscreen()
        }
      } else {
        await document.exitFullscreen()
      }
    } catch {
      /* user gesture missing or unsupported — silent */
    }
  }

  const toggleTheater = () => setIsTheater((t) => !t)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 backdrop-blur-md" />
        <DialogPrimitive.Content
          className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none transition-[max-width] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${
            isTheater ? "w-[98vw] max-w-[1600px]" : "w-[95vw] max-w-6xl"
          }`}
        >
          <div className="relative max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0b14] via-[#0a0a0f] to-[#0b0b14] shadow-[0_0_80px_rgba(160,32,240,0.35)]">
            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#A3FF12]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#FF4CF0]/15 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F9F871]/5 blur-3xl" />

            {/* Close */}
            <DialogPrimitive.Close
              className="absolute right-4 top-4 z-30 rounded-lg border border-white/10 bg-black/40 p-2 text-gray-400 backdrop-blur-sm transition-all hover:border-[#FF4CF0]/40 hover:bg-black/60 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>

            <div
              className={`relative z-10 grid grid-cols-1 ${
                isTheater ? "" : "lg:grid-cols-5"
              }`}
            >
              {/* LEFT — Video */}
              <div className={`${isTheater ? "" : "lg:col-span-3"} p-6 md:p-8`}>
                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-[#A3FF12]/30 bg-[#A3FF12]/10 px-3 py-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#A3FF12]" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#A3FF12]">
                      How It Works
                    </span>
                  </div>
                  <div className="hidden items-center gap-1.5 text-xs text-gray-500 sm:flex">
                    <span className="h-1 w-1 rounded-full bg-gray-600" />
                    <span>~45 second walkthrough</span>
                  </div>
                </div>

                <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                  From blank file to{" "}
                  <span className="bg-gradient-to-r from-[#A3FF12] via-[#FF4CF0] to-[#F9F871] bg-clip-text text-transparent">
                    live contract
                  </span>
                </h2>
                <p className="mb-5 text-sm text-gray-400">
                  A real recording of WebSoroban — no edits, no fake terminals. What you see is
                  exactly what you get.
                </p>

                {/* Video */}
                <div
                  ref={videoWrapRef}
                  className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-black shadow-[0_0_30px_rgba(160,32,240,0.3)]"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlay}
                    onDoubleClick={toggleFullscreen}
                    className="block w-full cursor-pointer bg-black"
                    style={{
                      imageRendering: "auto",
                      maxHeight: isFullscreen ? "100vh" : isTheater ? "78vh" : "62vh",
                      objectFit: "contain",
                    }}
                  >
                    <source src="/howitworks.mp4" type="video/mp4" />
                    <source src="/howitworks.mov" type="video/quicktime" />
                  </video>

                  {/* Top badges */}
                  <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-3">
                    <div className="flex items-center gap-2 rounded-md border border-[#A3FF12]/30 bg-black/70 px-2.5 py-1 font-mono text-[10px] text-[#A3FF12] backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#A3FF12]" />
                      LIVE · 2× SPEED
                    </div>
                    <div className="rounded-md border border-white/10 bg-black/70 px-2.5 py-1 font-mono text-[10px] text-gray-300 backdrop-blur-sm">
                      websoroban.in/ide
                    </div>
                  </div>

                  {/* Always-visible top-right action buttons */}
                  <div className="absolute right-3 top-12 z-10 flex flex-col gap-1.5">
                    <button
                      onClick={toggleFullscreen}
                      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                      className="rounded-md border border-white/10 bg-black/70 p-2 text-white backdrop-blur-sm transition-all hover:border-[#A3FF12]/60 hover:text-[#A3FF12] hover:scale-110"
                      aria-label="Toggle fullscreen"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={toggleTheater}
                      title={isTheater ? "Exit theater mode" : "Theater mode"}
                      className={`rounded-md border bg-black/70 p-2 backdrop-blur-sm transition-all hover:scale-110 ${
                        isTheater
                          ? "border-[#FF4CF0]/60 text-[#FF4CF0]"
                          : "border-white/10 text-white hover:border-[#FF4CF0]/60 hover:text-[#FF4CF0]"
                      }`}
                      aria-label="Toggle theater mode"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <rect
                          x="3"
                          y="6"
                          width="18"
                          height="12"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <a
                      href="/howitworks.mp4"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open video in new tab"
                      className="rounded-md border border-white/10 bg-black/70 p-2 text-white backdrop-blur-sm transition-all hover:border-[#F9F871]/60 hover:text-[#F9F871] hover:scale-110"
                      aria-label="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Bottom controls — always visible */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 transition-opacity duration-300">
                    {/* Progress bar — clickable */}
                    <div
                      className="group/bar mb-2 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/10 transition-all hover:h-2"
                      onClick={(e) => {
                        const v = videoRef.current
                        if (!v || !v.duration) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        const ratio = (e.clientX - rect.left) / rect.width
                        v.currentTime = v.duration * Math.min(1, Math.max(0, ratio))
                      }}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#A3FF12] via-[#FF4CF0] to-[#F9F871] transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlay}
                          className="rounded-md border border-white/10 bg-black/60 p-1.5 text-white transition-all hover:border-[#A3FF12]/50 hover:text-[#A3FF12]"
                          aria-label={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="rounded-md border border-white/10 bg-black/60 p-1.5 text-white transition-all hover:border-[#FF4CF0]/50 hover:text-[#FF4CF0]"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? (
                            <VolumeX className="h-3.5 w-3.5" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <span className="ml-1 font-mono text-[9px] uppercase tracking-wider text-gray-500">
                          1916×1038 · 2× · double-click to maximize
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step chapter chips — clickable to seek */}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STEPS.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => seekToStep(i)}
                      className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
                        activeStep === i
                          ? "border-white/20 bg-white/5"
                          : "border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                      style={
                        activeStep === i
                          ? { boxShadow: `inset 0 0 0 1px ${s.color}33, 0 0 12px ${s.color}22` }
                          : undefined
                      }
                    >
                      <span
                        className="font-mono text-[10px] font-bold"
                        style={{ color: s.color }}
                      >
                        {s.label}
                      </span>
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                        {s.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT — Details */}
              <div className="lg:col-span-2 border-t border-white/10 bg-black/30 p-6 md:p-8 lg:border-l lg:border-t-0">
                {/* Stats row */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="font-mono text-lg font-bold text-[#A3FF12]">&lt;90s</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-500">
                      First deploy
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="font-mono text-lg font-bold text-[#FF4CF0]">0</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-500">
                      Local installs
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="font-mono text-lg font-bold text-[#F9F871]">100%</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-500">
                      In-browser
                    </div>
                  </div>
                </div>

                {/* Steps list */}
                <div className="space-y-3">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon
                    const isActive = activeStep === i
                    return (
                      <button
                        key={s.label}
                        onClick={() => seekToStep(i)}
                        className={`group flex w-full gap-3 rounded-xl border p-3 text-left transition-all duration-300 ${
                          isActive
                            ? "border-white/20 bg-white/[0.04]"
                            : "border-white/5 hover:border-white/15 hover:bg-white/[0.02]"
                        }`}
                        style={
                          isActive
                            ? { boxShadow: `0 0 0 1px ${s.color}33, 0 0 20px ${s.color}22` }
                            : undefined
                        }
                      >
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-110"
                          style={{
                            borderColor: `${s.color}55`,
                            backgroundColor: `${s.color}15`,
                            boxShadow: isActive ? `0 0 16px ${s.color}55` : "none",
                          }}
                        >
                          <Icon className="h-4 w-4" style={{ color: s.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white">{s.title}</h4>
                            <span className="font-mono text-[9px] text-gray-500">{s.timestamp}</span>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{s.desc}</p>
                        </div>
                        <ChevronRight
                          className={`h-3.5 w-3.5 flex-shrink-0 self-center transition-all ${
                            isActive ? "translate-x-0.5 text-white" : "text-gray-600"
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* Pro shortcuts */}
                <div className="mt-6 rounded-xl border border-white/10 bg-gradient-to-br from-[#A3FF12]/[0.04] to-[#FF4CF0]/[0.04] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Keyboard className="h-3.5 w-3.5 text-[#A3FF12]" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                      Pro shortcuts
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {SHORTCUTS.map((sc) => (
                      <div key={sc.label} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-400">{sc.label}</span>
                        <div className="flex items-center gap-1">
                          {sc.keys.map((k) => (
                            <kbd
                              key={k}
                              className="rounded border border-white/10 bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-gray-300"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => onOpenChange(false)}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A3FF12] to-[#8FE600] px-5 py-3 font-bold text-black shadow-[0_0_24px_rgba(163,255,18,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(163,255,18,0.6)] active:scale-[0.99]"
                >
                  <Zap className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Got it — let me code
                </button>
                <p className="mt-2 text-center text-[10px] text-gray-500">
                  Press{" "}
                  <kbd className="rounded border border-white/10 bg-white/5 px-1 font-mono">esc</kbd>{" "}
                  any time to close
                </p>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
