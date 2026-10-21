import { track as vercelTrack } from '@vercel/analytics'

/**
 * Landing → build funnel (OKR: visit → CTA click → IDE open → first build).
 *
 * Every event goes to Google Analytics 4 (when NEXT_PUBLIC_GA_MEASUREMENT_ID is
 * set) and to Vercel Analytics. `from_landing` marks sessions that entered on
 * the homepage, so the funnel can be read end to end in either tool.
 */
export type FunnelEvent = 'landing_view' | 'cta_click' | 'ide_open' | 'build_success' | 'first_build'
type Props = Record<string, string | number | boolean>

const LANDING_KEY = 'ws_landing_session'
const FIRST_BUILD_KEY = 'ws_first_build_at'

declare global {
  interface Window {
    gtag?: (command: 'event', name: string, params?: Props) => void
  }
}

function fromLanding(): boolean {
  try {
    return window.sessionStorage.getItem(LANDING_KEY) === '1'
  } catch {
    return false
  }
}

export function track(event: FunnelEvent, props: Props = {}) {
  if (typeof window === 'undefined') return
  const payload: Props = { ...props, from_landing: fromLanding() }
  try { vercelTrack(event, payload) } catch { /* analytics must never break the page */ }
  try { window.gtag?.('event', event, payload) } catch { /* ditto */ }
}

export function trackLandingView() {
  try { window.sessionStorage.setItem(LANDING_KEY, '1') } catch { /* private mode */ }
  track('landing_view')
}

/** `cta` names the button, e.g. "hero_ide"; `destination` is where it leads. */
export function trackCta(cta: string, destination: string) {
  track('cta_click', { cta, destination })
}

/** Call on every successful build; `first_build` fires once per browser. */
export function trackBuild(source: 'compile' | 'deploy') {
  track('build_success', { source })
  try {
    if (window.localStorage.getItem(FIRST_BUILD_KEY)) return
    window.localStorage.setItem(FIRST_BUILD_KEY, new Date().toISOString())
  } catch {
    return
  }
  track('first_build', { source })
}
