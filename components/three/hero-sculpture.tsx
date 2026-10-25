'use client'

/**
 * Mounts the three.js sculpture without touching the first paint: the hero
 * copy is server-rendered and is the LCP element, so the scene loads after
 * the page is idle and only once the hero is on screen. Until then, and on
 * devices without WebGL, a static SVG of the same armature stands in.
 */
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

import type { SculptureLayout } from './orbit-sculpture'

const OrbitSculpture = dynamic(() => import('./orbit-sculpture'), { ssr: false })

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function HeroSculpture({ className }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const reduced = useReducedMotion() ?? false
  const [ready, setReady] = useState(false)
  const [live, setLive] = useState(false)
  const [quality, setQuality] = useState<'low' | 'high'>('high')
  const [layout, setLayout] = useState<SculptureLayout>('wide')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!hasWebGL()) {
      setFailed(true)
      return
    }
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const small = window.innerWidth < 900
    const slow = (navigator.hardwareConcurrency || 8) <= 4
    setQuality(coarse || small || slow ? 'low' : 'high')
    const wide = window.matchMedia('(min-width: 1024px)')
    const applyLayout = () => setLayout(wide.matches ? 'wide' : 'narrow')
    applyLayout()
    wide.addEventListener('change', applyLayout)

    let cancelled = false
    let observer: IntersectionObserver | null = null
    let fallback = 0
    const start = () => {
      if (cancelled) return
      const node = container.current
      if (!node) return
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setReady(true)
            observer?.disconnect()
          }
        },
        { rootMargin: '200px' },
      )
      observer.observe(node)
      // An occluded window delivers no intersection callbacks until it is
      // shown again; the hero is at the top of the page, so mount regardless
      // after a short grace period.
      fallback = window.setTimeout(() => {
        if (!cancelled && node.getBoundingClientRect().top < window.innerHeight * 1.5) setReady(true)
      }, 2500)
    }
    // Wait for the page to settle before paying for the renderer.
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 600)
    return () => {
      cancelled = true
      wide.removeEventListener('change', applyLayout)
      observer?.disconnect()
      window.clearTimeout(fallback)
      if (hasIdle) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const node = container.current
    if (!node) return
    const onScroll = () => {
      const height = node.offsetHeight || 1
      progress.current = Math.min(1, Math.max(0, window.scrollY / height))
    }
    const onPointer = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const fine = window.matchMedia('(pointer: fine)').matches
    if (fine) window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [ready])

  return (
    <div ref={container} className={cn('relative', className)} aria-hidden="true">
      {/* The still sits where the live core will be: beside the copy, or above it on narrow screens. */}
      <OrbitStatic
        className={cn(
          'absolute left-1/2 top-[-6rem] h-[30rem] w-[30rem] -translate-x-1/2 transition-opacity duration-700 lg:left-auto lg:right-[2%] lg:top-1/2 lg:h-[44rem] lg:w-[44rem] lg:-translate-y-1/2 lg:translate-x-0',
          live ? 'opacity-0' : 'opacity-100',
        )}
      />
      {ready && !failed && (
        <div className={cn('absolute inset-0 transition-opacity duration-1000', live ? 'opacity-100' : 'opacity-0')}>
          <OrbitSculpture
            progress={progress}
            pointer={pointer}
            quality={quality}
            reduced={reduced}
            layout={layout}
            onFirstFrame={() => setLive(true)}
          />
        </div>
      )}
    </div>
  )
}

/** The same armature as a still: concentric tilted rings around a faceted core. */
export function OrbitStatic({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 800" fill="none" aria-hidden="true">
      <g stroke="hsl(var(--foreground))" strokeOpacity="0.16">
        <ellipse cx="400" cy="400" rx="150" ry="58" transform="rotate(-24 400 400)" />
        <ellipse cx="400" cy="400" rx="190" ry="120" transform="rotate(38 400 400)" />
        <ellipse cx="400" cy="400" rx="236" ry="74" transform="rotate(-62 400 400)" />
        <ellipse cx="400" cy="400" rx="276" ry="166" transform="rotate(12 400 400)" />
        <ellipse cx="400" cy="400" rx="318" ry="96" transform="rotate(-40 400 400)" />
      </g>
      <g stroke="hsl(var(--foreground))" strokeOpacity="0.28" strokeWidth="1">
        <path d="M400 318 L470 360 L470 440 L400 482 L330 440 L330 360 Z" />
        <path d="M400 318 L400 400 L470 440 M400 400 L330 440 M400 400 L470 360 M400 400 L330 360" />
      </g>
      <g fill="hsl(var(--brand))">
        <circle cx="536" cy="340" r="4" />
        <circle cx="248" cy="458" r="3.5" />
        <circle cx="612" cy="482" r="3" />
        <circle cx="330" cy="236" r="2.5" />
      </g>
    </svg>
  )
}
