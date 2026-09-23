import { cn } from '@/lib/utils'

/** Official HackMeridian and Stellar marks. Both are dark artwork, so they sit on the event cream. */
export function PartnerMarks({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="inline-flex h-10 items-center rounded-md bg-hm-cream px-3">
        <img
          src="/hackmeridian-logo.png"
          alt="HackMeridian"
          className="h-5 w-auto"
        />
      </span>
      <span className="inline-flex h-10 items-center rounded-md bg-hm-cream px-3">
        <img src="/stellar-logo.svg" alt="Stellar" className="h-4 w-auto" />
      </span>
    </div>
  )
}
