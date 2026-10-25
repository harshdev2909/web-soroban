'use client'

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * One motion policy for the whole app: when the visitor prefers reduced
 * motion, framer-motion drops transform and layout animations and jumps to the
 * final state, while the server-rendered markup stays identical to the
 * full-motion version (so hydration never has to branch on the preference).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
