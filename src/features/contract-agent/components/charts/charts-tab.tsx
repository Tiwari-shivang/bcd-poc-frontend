import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useContractsData } from '@/features/contract-agent/hooks/use-contracts-data'
import {
  getClientConcentrationChartData,
  getExpiryHeatMapData,
  getMetricsCards,
  getOwnerWorkloadChartData,
  getRenewalTimelineData,
  getStatusDistribution,
} from '@/features/contract-agent/utils/data-calculations'
import { ClientConcentrationChart } from './client-concentration-chart'
import { ExpiryHeatmapChart } from './expiry-heatmap-chart'
import { MetricsCardsChart } from './metrics-cards-chart'
import { OwnerWorkloadChart } from './owner-workload-chart'
import { RenewalTimelineChart } from './renewal-timeline-chart'
import { StatusDistributionChart } from './status-distribution-chart'

export function ChartsTab() {
  const { data: rows, isLoading, error } = useContractsData()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[#E5E7EB] bg-white p-5">
            <Skeleton className="mb-4 h-5 w-1/2" />
            <Skeleton className="h-[260px] w-full" />
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

  const timelineData = getRenewalTimelineData(rows, utcToday)
  const statusData = getStatusDistribution(rows)
  const ownerData = getOwnerWorkloadChartData(rows)
  const companyData = getClientConcentrationChartData(rows)
  const heatmapData = getExpiryHeatMapData(rows, utcToday)
  const metricsData = getMetricsCards(rows, utcToday)

  return (
    <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
      <RenewalTimelineChart data={timelineData} />
      <StatusDistributionChart data={statusData} />
      <OwnerWorkloadChart data={ownerData} />
      <ClientConcentrationChart data={companyData} />
      <ExpiryHeatmapChart data={heatmapData} />
      <MetricsCardsChart data={metricsData} />
    </div>
  )
}
