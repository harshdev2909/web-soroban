import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Truncate a Stellar address: GABC…WXYZ */
export function truncateAddress(address?: string | null, lead = 5, tail = 5): string {
  if (!address) return ""
  if (address.length <= lead + tail + 1) return address
  return `${address.slice(0, lead)}…${address.slice(-tail)}`
}

/** Format an XLM balance with thousands separators and trimmed decimals. */
export function formatXlm(balance: number): string {
  if (!Number.isFinite(balance)) return "0"
  return balance.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: balance < 1 ? 4 : 2,
  })
}

/** Copy text to the clipboard, resolving false on failure. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
