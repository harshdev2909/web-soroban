import Image from 'next/image'
import { cn } from '@/lib/utils'

/** The WebSoroban mark on a hairline tile. Sized by the caller via `className`. */
export function NovaMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-card',
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src="/websoroban_logo.png"
        alt=""
        width={220}
        height={220}
        className="h-full w-full object-contain p-[3px]"
        aria-hidden="true"
      />
    </span>
  )
}
