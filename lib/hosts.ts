'use client'

import { useEffect, useState } from 'react'

/**
 * Pay and PayLoop live on their own subdomains in production:
 *
 *   pay.websoroban.in            → /pay            (studio)
 *   pay.websoroban.in/checkout   → /pay/checkout
 *   payloop.websoroban.in        → /payloop
 *
 * `middleware.ts` does the rewriting and redirecting; this module builds links
 * that land on the right host without a redirect hop. Everywhere else
 * (localhost, Vercel previews) every path stays on the current host.
 */
export const MAIN_ORIGIN = 'https://websoroban.in'
export const PRODUCT_HOSTS = { pay: 'pay.websoroban.in', payloop: 'payloop.websoroban.in' } as const

const ENABLED = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

type Product = keyof typeof PRODUCT_HOSTS

/** Which product a path belongs to, and the path on that product's host. */
export function productPath(path: string): { product: Product; path: string } | null {
  const [pathname, rest = ''] = splitPath(path)
  for (const product of ['payloop', 'pay'] as const) {
    const prefix = `/${product}`
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { product, path: (pathname.slice(prefix.length) || '/') + rest }
    }
  }
  return null
}

function splitPath(path: string): [string, string] {
  const index = path.search(/[?#]/)
  return index === -1 ? [path, ''] : [path.slice(0, index), path.slice(index)]
}

function currentProduct(host: string | null): Product | null {
  if (!host) return null
  return (Object.keys(PRODUCT_HOSTS) as Product[]).find((product) => PRODUCT_HOSTS[product] === host) ?? null
}

/** The href for an app path, given the host the page is served from. */
export function siteHref(path: string, host: string | null = null): string {
  if (!ENABLED) return path
  const here = currentProduct(host)
  const target = productPath(path)
  if (target) {
    return here === target.product ? target.path : `https://${PRODUCT_HOSTS[target.product]}${target.path}`
  }
  // A main-site path from a product subdomain goes back to the main site.
  return here ? `${MAIN_ORIGIN}${path}` : path
}

/**
 * `siteHref` bound to the current host. The first render uses no host, so
 * server and client markup match; links on a product subdomain update after
 * mount.
 */
export function useSiteHref(): (path: string) => string {
  const [host, setHost] = useState<string | null>(null)
  useEffect(() => setHost(window.location.host), [])
  return (path: string) => siteHref(path, host)
}
