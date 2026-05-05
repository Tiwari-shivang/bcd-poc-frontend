import {
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Link2,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useMemo, useRef } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const moduleCards = [
  {
    title: 'Resource Management',
    description:
      'All employee related information and reporting for availability, capacity, and scheduling.',
    icon: Users,
    imageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=60',
  },
  {
    title: 'Customer Workspace',
    description:
      'Workspace for dynamic management of customer data and configurations via collaboration and automation.',
    icon: BarChart3,
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=60',
  },
  {
    title: 'Main Data',
    description:
      'Maintenance screens to enable configuration, automation, and data feeding to other OIP sections.',
    icon: Link2,
    imageUrl:
      'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1600&q=60',
  },
  {
    title: 'Data Provisioning',
    description:
      'Data setup and audit, booked and transactional data feed provisioning, schedules, and postings.',
    icon: ArrowUpRight,
    imageUrl:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=60',
  },
  {
    title: 'Governance',
    description:
      'Ensure policy compliance, data quality controls, and audit-ready reporting across modules.',
    icon: ShieldCheck,
    imageUrl:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=60',
  },
]

function MetricShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-[var(--oip-card-border)] bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-3">
        <CardTitle className="text-[12px] font-semibold uppercase tracking-wide text-[#374151]">
          {title}
        </CardTitle>
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#F59E0B]">
          Today
        </span>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  )
}

function RadialActiveUsersCard() {
  const percent = 47
  const activeUsers = 573

  return (
    <MetricShell title="Unique active users">
      <div className="flex items-center justify-center">
        <div className="relative h-[110px] w-full max-w-[260px]">
          <svg
            viewBox="0 0 200 110"
            className="h-full w-full"
            aria-label="Unique active users radial gauge"
          >
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#22C55E"
              strokeWidth="10"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${percent} 100`}
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-1">
            <div className="text-[22px] font-bold leading-none text-[#22C55E]">
              {percent}%
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Active users
            </div>
            <div className="mt-1 text-[22px] font-bold leading-none text-[#F59E0B]">
              {activeUsers}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Users online
            </div>
          </div>
        </div>
      </div>
    </MetricShell>
  )
}

function UsersBySectionCard() {
  const items = [
    { label: 'Resource Management', value: 2, color: '#7F1D1D' },
    { label: 'Customer Workspace', value: 5, color: '#C2410C' },
    { label: 'Processing', value: 7, color: '#A16207' },
    { label: 'Governance', value: 13, color: '#16A34A' },
    { label: 'Main Data', value: 24, color: '#0EA5E9' },
  ]

  return (
    <MetricShell title="Unique users by section">
      <div className="grid grid-cols-5 gap-3">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div className="text-[22px] font-bold leading-tight text-[#111827]">
              {it.value}
            </div>
            <div
              className="mx-auto mt-1 h-1 w-10 rounded-full"
              style={{ backgroundColor: it.color }}
              aria-hidden
            />
            <div className="mt-1 text-[11px] font-medium leading-snug text-[#6B7280]">
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </MetricShell>
  )
}

function DirectLinksCard() {
  const left = [
    'OneTouch Servicing',
    'OneTouch Reporting',
    'DecisionSource',
    'Salesforce',
  ]
  const right = ['Smartsheet', 'SuccessFactors', 'UltiPro']

  return (
    <MetricShell title="Direct links">
      <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px] font-semibold text-[#1F2A44]">
        <div className="space-y-2">
          {left.map((t) => (
            <a
              key={t}
              href="#"
              className="block rounded-sm text-[#1F2A44] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--oip-accent)_35%,white)]"
            >
              {t}
            </a>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((t) => (
            <a
              key={t}
              href="#"
              className="block rounded-sm text-[#1F2A44] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--oip-accent)_35%,white)]"
            >
              {t}
            </a>
          ))}
        </div>
      </div>
    </MetricShell>
  )
}

function ModuleCard({
  title,
  description,
  icon,
  imageUrl,
}: (typeof moduleCards)[number]) {
  const Icon = icon
  return (
    <Card className="group overflow-hidden rounded-lg border-[var(--oip-card-border)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--oip-accent)_35%,white)]">
      <div className="relative h-[156px] w-full overflow-hidden bg-[#EEF2FF]">
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0"
          aria-hidden
        />
      </div>
      <div className="h-px w-full bg-[#E5E7EB]" aria-hidden />
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex size-10 items-center justify-center rounded-lg',
              'bg-[color-mix(in_srgb,var(--oip-accent)_14%,white)] text-[var(--oip-accent)]'
            )}
            aria-hidden
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-[17px] font-semibold leading-snug text-[#111827]">
              {title}
            </CardTitle>
            <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full w-2/5 rounded-full bg-[var(--oip-accent)]"
            aria-hidden
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default function OipHome() {
  const railRef = useRef<HTMLDivElement | null>(null)
  const moduleItems = useMemo(() => moduleCards, [])

  const scrollRailBy = (dx: number) => {
    railRef.current?.scrollBy({ left: dx, behavior: 'smooth' })
  }

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto [-webkit-overflow-scrolling:touch]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-[24px] font-bold leading-tight tracking-tight text-[#111827]">
            Operational Intelligence Platform
          </h1>
          <p className="mt-1 text-[14px] leading-relaxed text-[#6B7280]">
            Modules and quick metrics for demos.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[12px] font-medium text-[#6B7280]">
          <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden />
          All systems operational
        </div>
      </div>

      <section
        aria-label="Modules"
        className="relative"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">
            Modules
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRailBy(-520)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--oip-card-border)] bg-white text-[#1F2937] shadow-sm transition-colors hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--oip-accent)_35%,white)]"
              aria-label="Scroll modules left"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollRailBy(520)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--oip-card-border)] bg-white text-[#1F2937] shadow-sm transition-colors hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--oip-accent)_35%,white)]"
              aria-label="Scroll modules right"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className={cn(
            'oip-carousel flex gap-5 overflow-x-auto pb-1 pr-1',
            'snap-x snap-mandatory [-webkit-overflow-scrolling:touch]',
            '[scrollbar-width:none] [-ms-overflow-style:none]'
          )}
        >
          {moduleItems.map((m) => (
            <div
              key={m.title}
              className="w-[min(520px,92vw)] shrink-0 snap-start md:w-[520px]"
            >
              <ModuleCard {...m} />
            </div>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-[#E5E7EB]" aria-hidden />

      <section
        aria-label="Dashboard metrics"
        className="grid gap-5 lg:grid-cols-3"
      >
        <RadialActiveUsersCard />
        <UsersBySectionCard />
        <DirectLinksCard />
      </section>
    </div>
  )
}

