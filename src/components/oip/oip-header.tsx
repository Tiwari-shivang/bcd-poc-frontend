import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface OipHeaderProps {
  breadcrumb: string
  onToggleMobileNav?: () => void
}

export function OipHeader({
  breadcrumb,
  onToggleMobileNav,
}: OipHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-[var(--oip-header-bg)] text-white">
      <div className="flex h-14 items-center gap-3 px-4 md:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/30 md:hidden"
          onClick={onToggleMobileNav}
          aria-label="Open navigation"
        >
          <Menu aria-hidden className="size-4.5" />
        </Button>

        <div className="flex min-w-0 items-center gap-3">
          {/* BCD logomark */}
          <div
            className="flex h-9 min-w-[56px] items-center justify-center rounded-lg px-2"
            style={{ backgroundColor: '#1B2A47', border: '1px solid rgba(255,255,255,0.15)' }}
            aria-label="BCD Travel"
          >
            <span className="text-[15px] font-black tracking-widest text-white select-none">
              BCD
            </span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold leading-tight text-white/90">
              Operational Intelligence Platform
            </div>
            <div className="truncate text-[12px] text-white/70">
              {breadcrumb}
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-[12px] font-semibold leading-tight text-white/90">
              Welcome,
            </div>
            <div className="text-[13px] font-semibold leading-tight">Shivang</div>
          </div>
          <div
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold"
            aria-label="User profile"
            title="Shivang"
          >
            SH
          </div>
        </div>
      </div>
    </header>
  )
}

