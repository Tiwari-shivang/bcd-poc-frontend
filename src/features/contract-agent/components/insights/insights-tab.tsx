import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useContractsData } from '@/features/contract-agent/hooks/use-contracts-data'
import {
  buildAgentSummary,
  getAtRiskContracts,
  getClientConcentration,
  getOwnerWorkload,
  getPortfolioHealth,
  getRenewalCalendar,
  getRenewalPipeline,
} from '@/features/contract-agent/utils/data-calculations'
import { AgentSummaryCard } from './agent-summary-card'
import { AtRiskContractsCard } from './at-risk-contracts-card'
import { ClientConcentrationCard } from './client-concentration-card'
import { OwnerWorkloadCard } from './owner-workload-card'
import { PortfolioHealthCard } from './portfolio-health-card'
import { RenewalCalendarCard } from './renewal-calendar-card'
import { RenewalPipelineCard } from './renewal-pipeline-card'

export function InsightsTab() {
  const { data: rows, isLoading, error } = useContractsData()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[#E5E7EB] bg-white p-5">
            <Skeleton className="mb-4 h-5 w-1/2" />
            <Skeleton className="mb-2 h-12 w-1/3" />
            <Skeleton className="mb-2 h-2 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !rows) {
    return (
      <Alert variant="destructive" className="max-w-lg">
        <AlertDescription>
          Failed to load contract data.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </AlertDescription>
      </Alert>
    )
  }

  const today = new Date()
  const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))

  const health = getPortfolioHealth(rows, utcToday)
  const pipeline = getRenewalPipeline(rows, utcToday)
  const atRisk = getAtRiskContracts(rows, utcToday)
  const concentration = getClientConcentration(rows, utcToday)
  const workload = getOwnerWorkload(rows, utcToday)
  const calendar = getRenewalCalendar(rows, utcToday)

  const expiredCompanies = concentration.top
    .filter((c) => c.hasExpiredAgreement)
    .map((c) => c.company)
  const summary = buildAgentSummary(health, pipeline, atRisk, expiredCompanies, workload)

  return (
    <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
      <AgentSummaryCard summary={summary} />
      <PortfolioHealthCard data={health} />
      <RenewalPipelineCard data={pipeline} topAtRisk={atRisk[0]?.name} />
      <AtRiskContractsCard data={atRisk} />
      <ClientConcentrationCard
        top={concentration.top}
        others={concentration.others}
        diversification={concentration.diversification}
      />
      <OwnerWorkloadCard
        items={workload.items}
        balance={workload.balance}
        total={rows.length}
      />
      <RenewalCalendarCard quarters={calendar.quarters} peakQuarter={calendar.peakQuarter} />
    </div>
  )
}
