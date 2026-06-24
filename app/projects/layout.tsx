import { ThemeProvider } from '@/components/theme-provider'

// The catalog gets its own next-themes provider so the top-bar theme toggle
// works here. The IDE stays dark-only (it force-sets `dark` on mount), matching
// the docs subtree precedent. Dark-first; the light tokens already exist.
export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
