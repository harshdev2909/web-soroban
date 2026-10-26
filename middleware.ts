import { NextResponse, type NextRequest } from 'next/server'

/**
 * Product subdomains (see lib/hosts.ts):
 *
 *   pay.websoroban.in/            ⇢ /pay           (rewrite)
 *   pay.websoroban.in/checkout    ⇢ /pay/checkout  (rewrite)
 *   payloop.websoroban.in/        ⇢ /payloop       (rewrite)
 *   websoroban.in/pay…, /payloop… → the subdomain  (permanent redirect)
 *
 * Any other page requested on a product subdomain redirects to the main site.
 * Other hosts (localhost, Vercel previews) are untouched.
 */
const MAIN_HOSTS = new Set(['websoroban.in', 'www.websoroban.in'])
const MAIN_ORIGIN = 'https://websoroban.in'
const PRODUCTS = [
  { prefix: '/payloop', host: 'payloop.websoroban.in' },
  { prefix: '/pay', host: 'pay.websoroban.in' },
] as const

function under(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase()
  const { pathname, search } = request.nextUrl

  const product = PRODUCTS.find((item) => item.host === host)
  if (product) {
    // An old /pay… or /payloop… link on its own subdomain: drop the prefix.
    if (under(pathname, product.prefix)) {
      return NextResponse.redirect(`https://${host}${pathname.slice(product.prefix.length) || '/'}${search}`, 308)
    }
    // The other product lives on its own subdomain.
    const other = PRODUCTS.find((item) => item !== product && under(pathname, item.prefix))
    if (other) {
      return NextResponse.redirect(`https://${other.host}${pathname.slice(other.prefix.length) || '/'}${search}`, 308)
    }
    const url = request.nextUrl.clone()
    if (pathname === '/') {
      url.pathname = product.prefix
      return NextResponse.rewrite(url)
    }
    if (product.prefix === '/pay' && under(pathname, '/checkout')) {
      url.pathname = `/pay${pathname}`
      return NextResponse.rewrite(url)
    }
    if (pathname.startsWith('/api/')) return NextResponse.next()
    return NextResponse.redirect(`${MAIN_ORIGIN}${pathname}${search}`, 308)
  }

  if (MAIN_HOSTS.has(host)) {
    const target = PRODUCTS.find((item) => under(pathname, item.prefix))
    if (target) {
      return NextResponse.redirect(`https://${target.host}${pathname.slice(target.prefix.length) || '/'}${search}`, 308)
    }
  }

  return NextResponse.next()
}

export const config = {
  // Pages only: skip Next internals and files with an extension.
  matcher: ['/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)'],
}
