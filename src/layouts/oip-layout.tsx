import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { OipHeader } from '@/components/oip/oip-header'
import { OipSidebar } from '@/components/oip/oip-sidebar'
import { Button } from '@/components/ui/button'
import { AgentInsightBanner } from '@/features/contract-agent/components/agent-insight-banner'

function breadcrumbForPath(pathname: string) {
  if (pathname.startsWith('/contract-agent')) {
    return 'OIP > Contract Agent'
  }
  if (pathname === '/') {
    return 'OIP > Home'
  }
  if (pathname.startsWith('/recently')) {
    return 'OIP > Recently'
  }
  if (pathname.startsWith('/bookmarks')) {
    return 'OIP > Bookmarks'
  }
  if (pathname.startsWith('/news-library')) {
    return 'OIP > News and library'
  }
  if (pathname.startsWith('/contact-us')) {
    return 'OIP > Contact us'
  }
  return 'OIP'
}

export default function OipLayout() {
  const location = useLocation()
  const breadcrumb = useMemo(
    () => breadcrumbForPath(location.pathname),
    [location.pathname]
  )
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--oip-content-bg)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-[#111827] focus:shadow"
      >
        Skip to content
      </a>

      <OipHeader
        breadcrumb={breadcrumb}
        onToggleMobileNav={() => setMobileNavOpen(true)}
      />

      <div className="flex min-h-0 flex-1 pt-14">
        <div className="hidden md:block">
          <OipSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
          />
        </div>

        {mobileNavOpen ? (
          <div
            className="fixed inset-0 z-40 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden
            />
            <div className="absolute left-0 top-0 h-full w-[18rem] max-w-[88vw] shadow-2xl">
              <div className="flex items-center justify-end bg-[var(--oip-sidebar-bg)] px-3 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/30"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="size-4.5" aria-hidden />
                </Button>
              </div>
              <OipSidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        ) : null}

        <main
          id="main-content"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-5 md:py-5"
        >
          <div className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col">
            <AgentInsightBanner />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

