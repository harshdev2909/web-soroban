"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

type Tone = "brand" | "cosmic" | "warning" | "success"

const TONE: Record<Tone, { text: string; tile: string; ring: string; dot: string }> = {
  brand: { text: "text-brand", tile: "border-brand/40 bg-brand/10", ring: "ring-brand/40", dot: "bg-brand" },
  cosmic: { text: "text-cosmic", tile: "border-cosmic/40 bg-cosmic/10", ring: "ring-cosmic/40", dot: "bg-cosmic" },
  warning: { text: "text-warning", tile: "border-warning/40 bg-warning/10", ring: "ring-warning/40", dot: "bg-warning" },
  success: { text: "text-success", tile: "border-success/40 bg-success/10", ring: "ring-success/40", dot: "bg-success" },
}

const STEPS: Array<{ icon: typeof Code2; label: string; title: string; desc: string; tone: Tone; timestamp: string }> = [
  {
    icon: Code2,
    label: "01",
    title: "Write",
    desc: "Open a Soroban project. Monaco-grade editor with Rust intellisense, ready in your tab.",
    tone: "brand",
    timestamp: "0:00 – 0:08",
  },
  {
    icon: Cpu,
    label: "02",
    title: "Compile",
    desc: "WASM builds run on managed workers. Sub-second feedback, zero local toolchain.",
    tone: "cosmic",
    timestamp: "0:08 – 0:18",
  },
  {
    icon: FlaskConical,
    label: "03",
    title: "Simulate",
    desc: "Mock invocations against a sandboxed VM with realistic gas estimates before you sign.",
    tone: "warning",
    timestamp: "0:18 – 0:32",
  },
  {
    icon: Rocket,
    label: "04",
    title: "Deploy",
    desc: "Push directly to Stellar Testnet. Keys never leave your browser.",
    tone: "success",
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
        <DialogOverlay className="bg-black/70 backdrop-blur-md" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none transition-[max-width] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            isTheater ? "w-[98vw] max-w-[1600px]" : "w-[95vw] max-w-6xl",
          )}
        >
          <DialogPrimitive.Title className="sr-only">How WebSoroban works</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            A walkthrough of writing, compiling, testing, and deploying Soroban smart contracts in the browser.
          </DialogPrimitive.Description>
          <div className="relative max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-popover shadow-lg">
            {/* Ambient brand glow */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/[0.07] blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cosmic/[0.07] blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" aria-hidden />

            {/* Close */}
            <DialogPrimitive.Close
              className="absolute right-4 top-4 z-30 rounded-lg border border-border bg-background/60 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>

            <div className={cn("relative z-10 grid grid-cols-1", !isTheater && "lg:grid-cols-5")}>
              {/* LEFT — Video */}
              <div className={cn(!isTheater && "lg:col-span-3", "p-6 md:p-8")}>
                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1">
                    <Sparkles className="h-3.5 w-3.5 text-brand" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand">How it works</span>
                  </div>
                  <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <span>~45 second walkthrough</span>
                  </div>
                </div>

                <h2 className="mb-2 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  From blank file to <span className="text-gradient-brand">live contract</span>
                </h2>
                <p className="mb-5 text-sm text-muted-foreground">
                  A real recording of WebSoroban — no edits, no fake terminals. What you see is exactly what you get.
                </p>

                {/* Video */}
                <div
                  ref={videoWrapRef}
                  className="group relative overflow-hidden rounded-xl border border-border bg-black shadow-md"
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

                  {/* Top badges (over video — keep dark scrim) */}
                  <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-3">
                    <div className="flex items-center gap-2 rounded-md border border-brand/30 bg-black/70 px-2.5 py-1 font-mono text-[10px] text-brand backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                      LIVE · 2× SPEED
                    </div>
                    <div className="rounded-md border border-white/10 bg-black/70 px-2.5 py-1 font-mono text-[10px] text-white/70 backdrop-blur-sm">
                      websoroban.in/ide
                    </div>
                  </div>

                  {/* Always-visible top-right action buttons */}
                  <div className="absolute right-3 top-12 z-10 flex flex-col gap-1.5">
                    <button
                      onClick={toggleFullscreen}
                      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                      className="rounded-md border border-white/10 bg-black/70 p-2 text-white backdrop-blur-sm transition-colors hover:border-brand/60 hover:text-brand"
                      aria-label="Toggle fullscreen"
                    >
                      {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={toggleTheater}
                      title={isTheater ? "Exit theater mode" : "Theater mode"}
                      className={cn(
                        "rounded-md border bg-black/70 p-2 backdrop-blur-sm transition-colors",
                        isTheater ? "border-cosmic/60 text-cosmic" : "border-white/10 text-white hover:border-cosmic/60 hover:text-cosmic",
                      )}
                      aria-label="Toggle theater mode"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <rect x="3" y="6" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                    <a
                      href="/howitworks.mp4"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open video in new tab"
                      className="rounded-md border border-white/10 bg-black/70 p-2 text-white backdrop-blur-sm transition-colors hover:border-warning/60 hover:text-warning"
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
                        className="h-full rounded-full bg-brand-gradient transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlay}
                          className="rounded-md border border-white/10 bg-black/60 p-1.5 text-white transition-colors hover:border-brand/50 hover:text-brand"
                          aria-label={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="rounded-md border border-white/10 bg-black/60 p-1.5 text-white transition-colors hover:border-cosmic/50 hover:text-cosmic"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        </button>
                        <span className="ml-1 hidden font-mono text-[9px] uppercase tracking-wider text-white/50 sm:inline">
                          2× · double-click to maximize
                        </span>
                      </div>
                      <span className="font-mono-tnum text-[10px] text-white/70">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>

                {/* Step chapter chips — clickable to seek */}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STEPS.map((s, i) => {
                    const tone = TONE[s.tone]
                    const isActive = activeStep === i
                    return (
                      <button
                        key={s.label}
                        onClick={() => seekToStep(i)}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                          isActive ? cn(tone.tile) : "border-border bg-card/40 hover:bg-accent",
                        )}
                      >
                        <span className={cn("font-mono text-[10px] font-bold", tone.text)}>{s.label}</span>
                        <span className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                          {s.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* RIGHT — Details */}
              <div className="border-t border-border bg-card/30 p-6 md:p-8 lg:col-span-2 lg:border-l lg:border-t-0">
                {/* Stats row */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-card/40 p-3">
                    <div className="font-mono-tnum text-lg font-bold text-brand">&lt;90s</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">First deploy</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card/40 p-3">
                    <div className="font-mono-tnum text-lg font-bold text-cosmic">0</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Local installs</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card/40 p-3">
                    <div className="font-mono-tnum text-lg font-bold text-success">100%</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">In-browser</div>
                  </div>
                </div>

                {/* Steps list */}
                <div className="space-y-2.5">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon
                    const tone = TONE[s.tone]
                    const isActive = activeStep === i
                    return (
                      <button
                        key={s.label}
                        onClick={() => seekToStep(i)}
                        className={cn(
                          "group flex w-full gap-3 rounded-xl border p-3 text-left transition-colors",
                          isActive
                            ? cn("border-border bg-card ring-1 ring-inset", tone.ring)
                            : "border-border/60 bg-card/30 hover:bg-card/60",
                        )}
                      >
                        <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105", tone.tile)}>
                          <Icon className={cn("h-4 w-4", tone.text)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                            <span className="font-mono text-[9px] text-muted-foreground">{s.timestamp}</span>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 flex-shrink-0 self-center transition-all",
                            isActive ? "translate-x-0.5 text-foreground" : "text-muted-foreground/50",
                          )}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* Pro shortcuts */}
                <div className="mt-6 rounded-xl border border-border bg-card/40 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Keyboard className="h-3.5 w-3.5 text-brand" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pro shortcuts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {SHORTCUTS.map((sc) => (
                      <div key={sc.label} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{sc.label}</span>
                        <div className="flex items-center gap-1">
                          {sc.keys.map((k) => (
                            <kbd key={k} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Button onClick={() => onOpenChange(false)} className="group mt-6 w-full gap-2">
                  <Zap className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Got it — let me code
                </Button>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Press <kbd className="rounded border border-border bg-muted px-1 font-mono">esc</kbd> any time to close
                </p>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
