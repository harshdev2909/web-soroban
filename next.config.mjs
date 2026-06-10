import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
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
}

const withMDX = createMDX()

export default withMDX(nextConfig)
