import type { AgentSummary } from '@/features/contract-agent/utils/data-calculations'

interface Props {
  summary: AgentSummary
}

export function AgentSummaryCard({ summary }: Props) {
  return (
    <div className="col-span-1 md:col-span-2 rounded-xl bg-[var(--oip-header-bg)] p-5 shadow-md ring-1 ring-inset ring-white/10">
      <div className="flex items-start gap-4">
        {/* Agent identity pip */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#06B6D4]/15 text-[#06B6D4] text-[18px] select-none">
          ◎
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#06B6D4]">
            Agent Analysis
          </p>

          <p className="text-[13.5px] leading-relaxed text-white/90">
            {summary.main}

            {summary.risk && (
              <>
                {' '}
                {summary.risk}
              </>
            )}

            {summary.anomaly && (
              <>
                {' '}
                <span className="text-amber-300">{summary.anomaly}</span>
              </>
            )}

            {summary.team && (
              <>
                {' '}
                {summary.team}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
