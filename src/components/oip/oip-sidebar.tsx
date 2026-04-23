import type { ReactNode } from 'react'

import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Clock,
  FileText,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'

export interface OipSidebarProps {
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

/** Fixed icon column + label column — same for links and buttons (no flex-1 “stretch” gap). */
const railLayoutExpanded =
  'grid w-full min-w-0 grid-cols-[1rem_1fr] items-center gap-x-3 text-left'
const railLayoutCollapsed = 'flex w-full justify-center'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 relative',
    isActive
      ? 'text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-[#06B6D4]'
      : 'text-white/75 hover:bg-white/10 hover:text-white'
  )

const iconClass = (isActive: boolean) =>
  cn(
    'size-4 shrink-0 transition-colors',
    isActive ? 'text-[var(--oip-accent)]' : 'text-white/80 group-hover:text-white'
  )

function RailAction({
  label,
  icon,
  onClick,
  showLabel,
}: {
  label: string
  icon: () => ReactNode
  onClick: () => void
  showLabel: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-lg px-3 py-2 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25',
        showLabel ? railLayoutExpanded : railLayoutCollapsed
      )}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">{icon()}</span>
      {showLabel ? <span className="min-w-0 truncate">{label}</span> : null}
    </button>
  )
}

function RailLink({
  to,
  label,
  icon,
  onNavigate,
  showLabel,
}: {
  to: string
  label: string
  icon: (active: boolean) => ReactNode
  onNavigate?: () => void
  showLabel: boolean
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(navItemClass({ isActive }), showLabel ? railLayoutExpanded : railLayoutCollapsed)
      }
      onClick={onNavigate}
      aria-label={label}
      title={label}
      end={to === '/'}
    >
      {({ isActive }) => (
        <>
          <span className="flex size-4 shrink-0 items-center justify-center">
            {icon(isActive)}
          </span>
          {showLabel ? <span className="min-w-0 truncate">{label}</span> : null}
        </>
      )}
    </NavLink>
  )
}

export function OipSidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: OipSidebarProps) {
  const navigate = useNavigate()
  const showLabel = !collapsed

  return (
    <aside className="h-full overflow-y-auto border-r border-white/10 bg-[var(--oip-sidebar-bg)] text-white">
      <div
        className={cn(
          'flex h-full flex-col gap-2 py-3',
          collapsed ? 'w-16 px-2' : 'w-64 px-3'
        )}
      >
        <div className={cn('px-1 pb-1', showLabel ? 'flex items-center gap-2' : 'flex items-center justify-center')}>
          {showLabel ? (
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
              Navigation
            </div>
          ) : null}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              'rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25',
              showLabel ? 'ml-auto' : ''
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden />
            )}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
          <RailLink
            to="/"
            label="Home"
            onNavigate={onNavigate}
            showLabel={showLabel}
            icon={(active) => <Home className={iconClass(active)} aria-hidden />}
          />

          <RailAction
            label="Go back one screen"
            onClick={() => {
              navigate(-1)
              onNavigate?.()
            }}
            showLabel={showLabel}
            icon={() => <ArrowLeft className={iconClass(false)} aria-hidden />}
          />

          <RailLink
            to="/recently"
            label="Recently"
            onNavigate={onNavigate}
            showLabel={showLabel}
            icon={(active) => <Clock className={iconClass(active)} aria-hidden />}
          />
          <RailLink
            to="/bookmarks"
            label="Bookmarks"
            onNavigate={onNavigate}
            showLabel={showLabel}
            icon={(active) => (
              <Bookmark className={iconClass(active)} aria-hidden />
            )}
          />

          <RailLink
            to="/news-library"
            label="News and library"
            onNavigate={onNavigate}
            showLabel={showLabel}
            icon={(active) => (
              <BookOpen className={iconClass(active)} aria-hidden />
            )}
          />

          <RailLink
            to="/contact-us"
            label="Contact us"
            onNavigate={onNavigate}
            showLabel={showLabel}
            icon={(active) => <Phone className={iconClass(active)} aria-hidden />}
          />

          <div className="my-2 border-t border-white/10" />

          <RailLink
            to="/contract-agent"
            label="Contract Intelligence"
            onNavigate={onNavigate}
            showLabel={showLabel}
            icon={(active) => (
              <FileText className={iconClass(active)} aria-hidden />
            )}
          />

          <div className="mt-auto" />
        </nav>
      </div>
    </aside>
  )
}

