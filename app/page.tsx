// Previous landing page — uncomment to restore:
// import LandingPage from '@/components/landing-page'
// export default function HomePage() {
//   return <LandingPage />
// }

import type { Metadata } from 'next'
import UnderMaintenance from '@/components/under-maintenance'

export const metadata: Metadata = {
  title: 'Web Soroban — Under Maintenance',
  description: 'We are upgrading the Soroban playground. Back online soon.',
}

export default function HomePage() {
  return <UnderMaintenance />
}
