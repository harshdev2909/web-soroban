'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const variants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

/**
 * Scroll-triggered fade-up. The app-wide `MotionProvider` turns the slide off
 * for visitors who prefer reduced motion, so the markup never branches on the
 * preference and hydration stays exact.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const MotionTag = motion[as] as typeof motion.div

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-48px 0px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.8, delay }}
    >
      {children}
    </MotionTag>
  )
}
