import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
// Briefs from the first version of the Idea Bank. Their links still circulate.
const retiredIdeaSlugs = [
  'rwa-credit-line',
  'payfi-invoice-market',
  'private-payroll',
  'agent-wallet',
  'api-marketplace',
  'freelancer-escrow',
  'merchant-treasury',
  'rwa-portfolio',
  'compliance-passport',
  'treasury-agent',
]

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow .md/.mdx page extensions for the fumadocs docs source. Existing app
  // routes (.ts/.tsx) are unaffected.
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // The contract wizard's generator (@openzeppelin/wizard-stellar) and its deps
  // ship as CommonJS; transpile them so they bundle for the client generator.
  transpilePackages: ['@openzeppelin/wizard-stellar', '@openzeppelin/wizard-common'],
  async redirects() {
    return [
      { source: '/hackmeridian', destination: '/ideas', permanent: false },
      { source: '/hackmeridian/:slug', destination: '/ideas', permanent: false },
      ...retiredIdeaSlugs.map((slug) => ({ source: `/ideas/${slug}`, destination: '/ideas', permanent: false })),
    ]
  },
}

const withMDX = createMDX()

export default withMDX(nextConfig)
