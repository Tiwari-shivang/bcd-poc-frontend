import type { RenewalPipeline } from '@/features/contract-agent/utils/data-calculations'
import { InsightCard } from './insight-card'

interface Props {
  data: RenewalPipeline
  /** Name of the soonest-expiring at-risk contract, used in the CTA */
  topAtRisk?: string
}

const ACTION_COLOR: Record<RenewalPipeline['actionStatus'], string> = {
  URGENT: '#EF4444',
  'NEEDS PLANNING': '#F59E0B',
  MONITOR: '#10B981',
}

const ACTION_BG: Record<RenewalPipeline['actionStatus'], string> = {
  URGENT: 'bg-red-50 text-red-700',
  'NEEDS PLANNING': 'bg-amber-50 text-amber-700',
  MONITOR: 'bg-emerald-50 text-emerald-700',
}

function buildCtaText(data: RenewalPipeline, topAtRisk?: string): string {
  const count = data.next90
  const company = topAtRisk ? ` — start with ${topAtRisk}` : ''
  if (data.actionStatus === 'URGENT') {
    return `${data.next30} contract${data.next30 !== 1 ? 's' : ''} expiring this month${company}`
  }
  if (data.actionStatus === 'NEEDS PLANNING') {
    return `${count} contract${count !== 1 ? 's' : ''} need action in the next 90 days${company}`
  }
  return `${count} contract${count !== 1 ? 's' : ''} renewing — on track`
}

export function RenewalPipelineCard({ data, topAtRisk }: Props) {
  const color = ACTION_COLOR[data.actionStatus]
  const ctaText = buildCtaText(data, topAtRisk)
  const showCta = data.actionStatus !== 'MONITOR' && data.next90 > 0

  return (
    <InsightCard title="Renewal Pipeline — Next 90 Days">
      <div className="flex items-end gap-3 mb-3">
        <span className="text-[48px] font-bold leading-none" style={{ color }}>
          {data.next90}
        </span>
        <span className="mb-1 text-[18px] font-medium text-[#64748B]">/{data.total}</span>
        <span
          className={`mb-1 ml-auto rounded-full px-3 py-1 text-xs font-semibold ${ACTION_BG[data.actionStatus]}`}
        >
          {data.actionStatus}
        </span>
      </div>

      {/* Intelligent CTA */}
      {showCta && (
        <div className="mb-4 rounded-lg bg-[#FFF8EB] border border-[#FDE68A] p-3">
          <p className="text-[12px] text-[#92400E] leading-relaxed mb-2">{ctaText}</p>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-[#B45309] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#92400E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-1"
          >
            Review renewals →
          </button>
        </div>
      )}

      <div className="space-y-2">
        <PipelineRow label="Expiring in next 30 days" count={data.next30} urgency="high" />
        <PipelineRow label="Expiring in next 60 days" count={data.next60} urgency="med" />
        <PipelineRow label="Expiring in next 90 days" count={data.next90} urgency="low" />
      </div>
    </InsightCard>
  )
}

function PipelineRow({ label, count, urgency }: { label: string; count: number; urgency: 'high' | 'med' | 'low' }) {
  const dotColor =
    urgency === 'high' ? 'bg-[#EF4444]' : urgency === 'med' ? 'bg-[#F59E0B]' : 'bg-[#64748B]'
  return (
    <div className="flex items-center justify-between text-[13px]">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
        <span className="text-[#475569]">{label}</span>
      </div>
      <span className="font-semibold text-[#1F2937]">{count}</span>
    </div>
  )
}
