import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  BadgeAlert,
  Database,
  LineChart as LineChartIcon,
  Sparkles,
} from 'lucide-react'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  fetchOipCharts,
  fetchOipInsights,
  fetchSalesForceCharts,
  fetchSalesForceInsights,
  postChatMessage,
  type InsightChartItem,
  type InsightChartType,
  type InsightItem,
  type InsightRow,
} from '@/lib/api-client'

type ActiveTab = 'chat' | 'insights' | 'charts'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  isHtml?: boolean
  at: number
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'insights', label: 'Insights' },
  { id: 'charts', label: 'Charts' },
]

const LOADING_PHRASES = [
  'Analysing the request…',
  'Searching database…',
  'Working on it…',
  'Gathering insights…',
  'Almost there…',
]

const STARTER_PROMPTS = [
  'Show implemented markets with account name in APAC',
  'List all agreements which are expiring this year ?',
  'Show accounts with min opportunities',
]

type InsightSourceId = 'sales-force' | 'oip'

type InsightSourceConfig = {
  id: InsightSourceId
  label: string
  eyebrow: string
  accent: string
  accentSoft: string
  icon: typeof Database
}

type DisplayInsight = InsightItem & {
  keys: string[]
}

type ChartPoint = Record<string, string | number>

type DisplayChart = InsightChartItem & {
  primaryKey: string
  secondaryKey: string
  normalizedData: ChartPoint[]
}

const CHART_COLORS = [
  '#0F766E',
  '#0891B2',
  '#F97316',
  '#F59E0B',
  '#2563EB',
  '#7C3AED',
  '#DC2626',
]

const INSIGHT_SOURCES: InsightSourceConfig[] = [
  {
    id: 'sales-force',
    label: 'Sales Force',
    eyebrow: 'Commercial contract signals',
    accent: 'from-[#0F766E] via-[#0E7490] to-[#155E75]',
    accentSoft: 'from-[#CCFBF1] via-[#ECFEFF] to-white',
    icon: Database,
  },
  {
    id: 'oip',
    label: 'Data Assessment',
    eyebrow: 'Opportunity intelligence',
    accent: 'from-[#9A3412] via-[#C2410C] to-[#EA580C]',
    accentSoft: 'from-[#FFEDD5] via-[#FFF7ED] to-white',
    icon: LineChartIcon,
  },
]

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function titleFromKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat().format(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  const text = String(value)
  const asDate = Date.parse(text)
  if (!Number.isNaN(asDate) && /^\d{4}-\d{2}-\d{2}/.test(text)) {
    return new Date(asDate).toLocaleDateString()
  }

  return text
}

function normalizeChartValue(value: unknown): string | number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
      return Number(trimmed)
    }
    return trimmed
  }
  if (value === null || value === undefined) return ''
  return String(value)
}

function formatAxisValue(value: string | number): string {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value)
  }

  const asDate = Date.parse(value)
  if (!Number.isNaN(asDate) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(asDate)
    const hasTime = value.includes(':')
    return date.toLocaleDateString([], {
      month: 'short',
      year: 'numeric',
      ...(hasTime ? {} : { day: 'numeric' }),
    })
  }

  return value
}

function getChartKeys(
  chartType: InsightChartType,
  chartConfig: InsightChartItem['chart_config']
): { primaryKey: string; secondaryKey: string } | null {
  if (chartType === 'pie') {
    if (chartConfig.name_key && chartConfig.value_key) {
      return {
        primaryKey: chartConfig.name_key,
        secondaryKey: chartConfig.value_key,
      }
    }
    return null
  }

  if (chartConfig.x_key && chartConfig.y_key) {
    return {
      primaryKey: chartConfig.x_key,
      secondaryKey: chartConfig.y_key,
    }
  }

  return null
}

function getRenderableCharts(charts: InsightChartItem[]): DisplayChart[] {
  return charts
    .map((chart) => {
      const keys = getChartKeys(chart.chart_type, chart.chart_config)
      if (!keys) return null

      const normalizedData = chart.data
        .map((point) => {
          const primaryValue = normalizeChartValue(point[keys.primaryKey])
          const secondaryValue = normalizeChartValue(point[keys.secondaryKey])

          if (primaryValue === '' || secondaryValue === '') {
            return null
          }

          return {
            ...Object.fromEntries(
              Object.entries(point).map(([key, value]) => [
                key,
                normalizeChartValue(value),
              ])
            ),
            [keys.primaryKey]: primaryValue,
            [keys.secondaryKey]: secondaryValue,
          } as ChartPoint
        })
        .filter((point): point is ChartPoint => point !== null)

      if (
        chart.execution_status !== 'ok' ||
        normalizedData.length === 0 ||
        typeof normalizedData[0][keys.secondaryKey] !== 'number'
      ) {
        return null
      }

      return {
        ...chart,
        primaryKey: keys.primaryKey,
        secondaryKey: keys.secondaryKey,
        normalizedData,
      }
    })
    .filter((chart): chart is DisplayChart => chart !== null)
}

function getSharedRowKeys(rows: InsightRow[]): string[] {
  if (rows.length === 0) return []

  const baseline = Object.keys(rows[0])
  if (baseline.length === 0) return []

  const baselineSorted = [...baseline].sort().join('|')
  const hasSameShape = rows.every(
    (row) => Object.keys(row).sort().join('|') === baselineSorted
  )

  return hasSameShape ? baseline : []
}

function getRenderableInsights(insights: InsightItem[]): DisplayInsight[] {
  return insights
    .map((insight) => ({
      ...insight,
      keys: getSharedRowKeys(insight.rows),
    }))
    .filter(
      (insight) =>
        insight.execution_status === 'ok' &&
        insight.rows.length > 0 &&
        insight.keys.length > 0
    )
}

function InsightsExperience() {
  const salesForceQuery = useQuery({
    queryKey: ['insights', 'sales-force'],
    queryFn: fetchSalesForceInsights,
    staleTime: 5 * 60 * 1000,
  })

  const oipQuery = useQuery({
    queryKey: ['insights', 'oip'],
    queryFn: fetchOipInsights,
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = salesForceQuery.isLoading || oipQuery.isLoading
  const hasError = salesForceQuery.error || oipQuery.error

  const sourceData = INSIGHT_SOURCES.map((source) => {
    const query = source.id === 'sales-force' ? salesForceQuery : oipQuery
    const insights = query.data?.insights ?? []
    const renderable = getRenderableInsights(insights)

    return {
      source,
      renderable,
      total: insights.length,
    }
  })

  const totalVisibleCards = sourceData.reduce(
    (count, item) => count + item.renderable.length,
    0
  )

  if (isLoading) {
    return <InsightsLoadingState />
  }

  if (hasError && totalVisibleCards === 0) {
    return (
      <Alert variant="destructive" className="mx-4 mt-4 border-red-200 bg-red-50">
        <AlertDescription>
          {salesForceQuery.error instanceof Error
            ? salesForceQuery.error.message
            : oipQuery.error instanceof Error
              ? oipQuery.error.message
              : 'Failed to load insights. Please try again.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="relative overflow-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.16),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(234,88,12,0.14),_transparent_38%)]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 pb-4">
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,252,252,0.92))] shadow-[0_22px_60px_-28px_rgba(15,23,42,0.28)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#BEE3F8] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0E7490]">
                <Sparkles className="h-3.5 w-3.5" />
                Insight command center
              </div>
              <div className="space-y-2">
                <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#0F172A] sm:text-[2.2rem]">
                  Cross-source insight panels with structured evidence.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-[#475569] sm:text-[15px]">
                  AI-generated insights based on your real-time Salesforce and Assessment data
                </p>
              </div>
            </div>
          </div>
        </section>

        {hasError ? (
          <Alert className="border-amber-200 bg-amber-50/90 text-amber-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some insight feeds returned issues. Healthy sections are still
              rendered below.
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-2">
          {sourceData.map(({ source, renderable }) => (
            <SourceInsightsColumn
              key={source.id}
              source={source}
              renderable={renderable}
            />
          ))}
        </section>
      </div>
    </div>
  )
}

function InsightsLoadingState() {
  return (
    <div className="px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white/90 p-6 shadow-sm lg:p-8">
          <Skeleton className="mb-4 h-6 w-44" />
          <Skeleton className="mb-3 h-10 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-3xl" />
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, columnIndex) => (
            <div
              key={columnIndex}
              className="rounded-[28px] border border-[#E2E8F0] bg-white/90 p-5 shadow-sm"
            >
              <Skeleton className="mb-3 h-7 w-48" />
              <Skeleton className="mb-5 h-5 w-64" />
              <div className="grid gap-4">
                {Array.from({ length: 2 }).map((__, cardIndex) => (
                  <Skeleton
                    key={cardIndex}
                    className="h-72 rounded-[24px]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChartsExperience() {
  const salesForceChartsQuery = useQuery({
    queryKey: ['insights', 'sales-force', 'charts'],
    queryFn: fetchSalesForceCharts,
    staleTime: 5 * 60 * 1000,
  })

  const oipChartsQuery = useQuery({
    queryKey: ['insights', 'oip', 'charts'],
    queryFn: fetchOipCharts,
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = salesForceChartsQuery.isLoading || oipChartsQuery.isLoading
  const hasError = salesForceChartsQuery.error || oipChartsQuery.error

  const sourceData = INSIGHT_SOURCES.map((source) => {
    const query =
      source.id === 'sales-force' ? salesForceChartsQuery : oipChartsQuery
    const charts = query.data?.charts ?? []

    return {
      source,
      charts: getRenderableCharts(charts),
      total: charts.length,
    }
  })

  const totalCharts = sourceData.reduce(
    (count, item) => count + item.charts.length,
    0
  )

  if (isLoading) {
    return <ChartsLoadingState />
  }

  if (hasError && totalCharts === 0) {
    return (
      <Alert variant="destructive" className="mx-4 mt-4 border-red-200 bg-red-50">
        <AlertDescription>
          {salesForceChartsQuery.error instanceof Error
            ? salesForceChartsQuery.error.message
            : oipChartsQuery.error instanceof Error
              ? oipChartsQuery.error.message
              : 'Failed to load charts. Please try again.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="relative overflow-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_36%)]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 pb-4">
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,250,252,0.94))] shadow-[0_22px_60px_-28px_rgba(15,23,42,0.28)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.45fr_0.95fr] lg:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D9F99D] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3F6212]">
                <Sparkles className="h-3.5 w-3.5" />
                Visual decision board
              </div>
              <div className="space-y-2">
                <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#0F172A] sm:text-[2.2rem]">
                  Travel demand, opportunity mix, and contract momentum in chart form.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-[#475569] sm:text-[15px]">
                  Auto-generated visuals from real-time data
                </p>
              </div>
            </div>
          </div>
        </section>

        {hasError ? (
          <Alert className="border-amber-200 bg-amber-50/90 text-amber-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some chart feeds returned issues. Available visuals are still
              rendered below.
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-2">
          {sourceData.map(({ source, charts }) => (
            <SourceChartsColumn
              key={`charts-${source.id}`}
              source={source}
              charts={charts}
            />
          ))}
        </section>
      </div>
    </div>
  )
}

function ChartsLoadingState() {
  return (
    <div className="px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white/90 p-6 shadow-sm lg:p-8">
          <Skeleton className="mb-4 h-6 w-44" />
          <Skeleton className="mb-3 h-10 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-3xl" />
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, columnIndex) => (
            <div
              key={columnIndex}
              className="rounded-[28px] border border-[#E2E8F0] bg-white/90 p-5 shadow-sm"
            >
              <Skeleton className="mb-3 h-7 w-48" />
              <Skeleton className="mb-5 h-5 w-64" />
              <div className="grid gap-4">
                {Array.from({ length: 2 }).map((__, cardIndex) => (
                  <Skeleton key={cardIndex} className="h-80 rounded-[24px]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SourceChartsColumn({
  source,
  charts,
}: {
  source: InsightSourceConfig
  charts: DisplayChart[]
}) {
  const Icon = source.icon

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white/92 shadow-[0_14px_45px_-28px_rgba(15,23,42,0.28)]">
      <div className={`bg-gradient-to-br ${source.accentSoft} p-5 lg:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#334155]">
              <Icon className="h-3.5 w-3.5" />
              {source.eyebrow}
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#0F172A]">
                {source.label}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 lg:p-5">
        {charts.length > 0 ? (
          charts.map((chart) => (
            <ChartCard key={`${source.id}-${chart.chart_title}`} chart={chart} />
          ))
        ) : (
          <Card className="rounded-[24px] border-dashed border-[#CBD5E1] bg-[#F8FAFC] shadow-none">
            <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center">
              <BadgeAlert className="h-6 w-6 text-[#94A3B8]" />
              <div>
                <p className="text-sm font-semibold text-[#334155]">
                  No chart-ready sections available
                </p>
                <p className="mt-1 max-w-md text-sm leading-6 text-[#64748B]">
                  This source currently returned empty datasets or incomplete chart
                  configuration, so nothing visual is rendered.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

function ChartCard({ chart }: { chart: DisplayChart }) {
  const typeLabel =
    chart.chart_type === 'pie'
      ? 'Composition'
      : chart.chart_type === 'bar'
        ? 'Comparison'
        : 'Trend'

  return (
    <Card className="overflow-hidden rounded-[24px] border-[#E2E8F0] bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.32)]">
      <CardHeader className="gap-3 border-b border-[#EEF2F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-[1.05rem] leading-6 text-[#0F172A]">
              {chart.chart_title}
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-6 text-[#475569]">
              {chart.chart_description}
            </CardDescription>
          </div>
          <span className="rounded-full border border-[#D9EAF3] bg-[#F8FCFF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
            {typeLabel}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <div className="h-[320px] rounded-[20px] border border-[#E2E8F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-3 sm:p-4">
          <ChartRenderer chart={chart} />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]">
            {titleFromKey(chart.primaryKey)}
          </span>
          <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]">
            {titleFromKey(chart.secondaryKey)}
          </span>
          <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]">
            {chart.normalizedData.length} data points
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartRenderer({ chart }: { chart: DisplayChart }) {
  if (chart.chart_type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chart.normalizedData}
            dataKey={chart.secondaryKey}
            nameKey={chart.primaryKey}
            innerRadius={62}
            outerRadius={100}
            paddingAngle={2}
          >
            {chart.normalizedData.map((_, index) => (
              <Cell
                key={`${chart.chart_title}-slice-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatAxisValue(normalizeChartValue(value))}
            labelFormatter={(label) => formatAxisValue(normalizeChartValue(label))}
            contentStyle={{
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 16px 32px -22px rgba(15, 23, 42, 0.35)',
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    )
  }

  if (chart.chart_type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chart.normalizedData}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={chart.primaryKey}
            tickLine={false}
            axisLine={false}
            minTickGap={18}
            tickFormatter={(value) => formatAxisValue(normalizeChartValue(value))}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(value) => formatAxisValue(normalizeChartValue(value))}
          />
          <Tooltip
            formatter={(value) => formatAxisValue(normalizeChartValue(value))}
            labelFormatter={(label) => formatAxisValue(normalizeChartValue(label))}
            contentStyle={{
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 16px 32px -22px rgba(15, 23, 42, 0.35)',
            }}
          />
          <Bar
            dataKey={chart.secondaryKey}
            radius={[10, 10, 4, 4]}
            fill="#0F766E"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={chart.normalizedData}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={chart.primaryKey}
          tickLine={false}
          axisLine={false}
          minTickGap={18}
          tickFormatter={(value) => formatAxisValue(normalizeChartValue(value))}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(value) => formatAxisValue(normalizeChartValue(value))}
        />
        <Tooltip
          formatter={(value) => formatAxisValue(normalizeChartValue(value))}
          labelFormatter={(label) => formatAxisValue(normalizeChartValue(label))}
          contentStyle={{
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 16px 32px -22px rgba(15, 23, 42, 0.35)',
          }}
        />
        <Line
          type="monotone"
          dataKey={chart.secondaryKey}
          stroke="#EA580C"
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 0, fill: '#EA580C' }}
          activeDot={{ r: 6, strokeWidth: 0, fill: '#C2410C' }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

function SourceInsightsColumn({
  source,
  renderable,
}: {
  source: InsightSourceConfig
  renderable: DisplayInsight[]
}) {
  const Icon = source.icon

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white/92 shadow-[0_14px_45px_-28px_rgba(15,23,42,0.28)]">
      <div className={`bg-gradient-to-br ${source.accentSoft} p-5 lg:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#334155]">
              <Icon className="h-3.5 w-3.5" />
              {source.eyebrow}
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#0F172A]">
                {source.label}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 lg:p-5">
        {renderable.length > 0 ? (
          renderable.map((insight) => (
            <InsightCard key={`${source.id}-${insight.insight_title}`} insight={insight} />
          ))
        ) : (
          <Card className="rounded-[24px] border-dashed border-[#CBD5E1] bg-[#F8FAFC] shadow-none">
            <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center">
              <BadgeAlert className="h-6 w-6 text-[#94A3B8]" />
              <div>
                <p className="text-sm font-semibold text-[#334155]">
                  No renderable sections available
                </p>
                <p className="mt-1 max-w-md text-sm leading-6 text-[#64748B]">
                  This source currently has empty result sets or inconsistent row
                  keys, so the UI intentionally hides those sections.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

function InsightCard({ insight }: { insight: DisplayInsight }) {
  return (
    <Card className="overflow-hidden rounded-[24px] border-[#E2E8F0] bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.32)]">
      <CardHeader className="gap-3 border-b border-[#EEF2F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-5">
        <CardTitle className="text-[1.05rem] leading-6 text-[#0F172A]">
          {insight.insight_title}
        </CardTitle>
        <CardDescription className="max-w-3xl text-sm leading-6 text-[#475569]">
          {insight.insight_description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow className="hover:bg-[#F8FAFC]">
                {insight.keys.map((key) => (
                  <TableHead
                    key={key}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span>{titleFromKey(key)}</span>
                      <span className="text-[10px] normal-case tracking-normal text-[#94A3B8]">
                        {key}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {insight.rows.map((row, index) => (
                <TableRow key={`${insight.insight_title}-${index}`}>
                  {insight.keys.map((key) => (
                    <TableCell
                      key={`${key}-${index}`}
                      className="px-4 py-3 text-sm text-[#1E293B]"
                    >
                      {formatCellValue(row[key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ContractAgentPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (!isLoading) {
      setLoadingPhraseIndex(0)
      return
    }
    const timer = window.setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length)
    }, 2200)
    return () => window.clearInterval(timer)
  }, [isLoading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text, at: Date.now() },
    ])
    setInput('')
    setIsLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const data = await postChatMessage(text)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: data.response,
          isHtml: data.isHtml,
          at: Date.now(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text:
            err instanceof Error
              ? err.message
              : 'Something went wrong. Please try again.',
          at: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  const applyStarterPrompt = (prompt: string) => {
    setInput(prompt)
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          120
        )}px`
      }
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tab navigation */}
      <div
        className="flex shrink-0 border-b border-[#E5E7EB] bg-[var(--oip-content-bg)]"
        role="tablist"
        aria-label="Contract Agent tabs"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-6 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] focus-visible:ring-offset-1',
                isActive
                  ? 'border-b-2 border-[#06B6D4] text-[#1F2937]'
                  : 'border-b-2 border-transparent text-[#6B7280] hover:text-[#374151]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Chat tab */}
      {activeTab === 'chat' && (
        <div
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,#F5FBFC_0%,#FCFEFE_42%,#F8FAFC_100%)]"
          role="tabpanel"
          aria-label="Chat"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.16),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(15,118,110,0.10),_transparent_28%)]" />
          {/* Scrollable message history */}
          <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [-ms-overflow-style:none] sm:px-5 lg:px-6">
            <div className="mx-auto w-full max-w-6xl">
              {messages.length === 0 && !isLoading ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-6 rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(244,251,252,0.92))] px-6 py-10 text-center shadow-[0_24px_60px_-32px_rgba(15,23,42,0.26)]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#0F766E] via-[#0891B2] to-[#155E75] text-white shadow-lg shadow-cyan-200/40">
                    <BotIcon size={26} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold tracking-[-0.03em] text-[#0F172A]">
                      Ask the contract agent like a strategist
                    </p>
                    <p className="mx-auto max-w-[620px] text-sm leading-7 text-[#64748B] sm:text-[15px]">
                      Explore travel contracts, renewal risk, implemented
                      markets, ownership coverage, solution footprint, and spend
                      signals from one conversational workspace.
                    </p>
                  </div>
                  <div className="mt-2 flex w-full max-w-3xl flex-wrap items-center justify-center gap-2.5">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => applyStarterPrompt(prompt)}
                        className="rounded-full border border-[#D8E4EA] bg-white/90 px-4 py-2 text-xs font-medium text-[#334155] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0891B2] hover:text-[#0E7490] hover:shadow-md"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-center">
                    <span className="rounded-full border border-[#D8E4EA] bg-white/90 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#94A3B8] shadow-sm">
                      Today
                    </span>
                  </div>

                  {messages.map((msg) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div
                        key={msg.id}
                        className={[
                          'flex w-full',
                          isUser ? 'justify-end' : 'justify-start',
                        ].join(' ')}
                      >
                        <div
                          className={[
                            'flex w-full items-start gap-3',
                            isUser
                              ? 'max-w-[78%] flex-row-reverse lg:max-w-[64%]'
                              : 'max-w-[90%] flex-row',
                          ].join(' ')}
                        >
                          {!isUser && (
                            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-[linear-gradient(135deg,rgba(15,118,110,0.10),rgba(8,145,178,0.14))] text-[#0F766E]">
                              <BotIcon size={15} />
                            </div>
                          )}

                          <div
                            className={[
                              'flex min-w-0 flex-1 flex-col gap-2',
                              isUser ? 'items-end' : 'items-start',
                            ].join(' ')}
                          >
                            {!isUser && (
                              <span className="pl-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
                                Contract agent
                              </span>
                            )}
                            {msg.isHtml ? (
                              <HtmlMessage html={msg.text} isUser={isUser} />
                            ) : (
                              <div
                                className={[
                                  'w-fit max-w-full text-sm leading-7',
                                  isUser
                                    ? 'rounded-[24px] rounded-tr-md border border-[#CDECF3] bg-white px-5 py-4 text-[#0F172A] shadow-[0_18px_38px_-24px_rgba(14,116,144,0.32)]'
                                    : 'px-1 py-0.5 text-[#334155]',
                                ].join(' ')}
                              >
                                {msg.text}
                              </div>
                            )}
                            <span
                              className={[
                                'text-[11px] text-[#94A3B8]',
                                isUser ? 'pr-2' : 'pl-1',
                              ].join(' ')}
                            >
                              {formatTime(msg.at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {isLoading && (
                    <TypingIndicator
                      phrase={LOADING_PHRASES[loadingPhraseIndex]}
                    />
                  )}
                </div>
              )}
            </div>
            <div ref={bottomRef} className="h-px w-full shrink-0" aria-hidden />
          </div>

          {/* Composer */}
          <div className="relative shrink-0 border-t border-[#E2E8F0] bg-white/88 px-3 pb-4 pt-3 backdrop-blur-md sm:px-5 lg:px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="rounded-[26px] border border-[#D8E4EA] bg-white/96 p-2.5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.24)] transition-all duration-150 focus-within:border-[#0891B2] focus-within:ring-1 focus-within:ring-[#0891B2]/30">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about agreements, ownership, implemented markets, solutions, or travel volume…"
                    rows={1}
                    disabled={isLoading}
                    className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none disabled:opacity-60"
                    style={{ maxHeight: '120px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    aria-label="Send message"
                    className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F766E] via-[#0891B2] to-[#155E75] px-3 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#BAE6FD]"
                  >
                    {isLoading ? (
                      <span className="text-xs font-medium">...</span>
                    ) : (
                      <SendIcon />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-center text-[11px] text-[#9CA3AF]">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div
          className="oip-chat-scroll min-h-0 flex-1 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none]"
          role="tabpanel"
          aria-label="Insights"
        >
          <InsightsExperience />
        </div>
      )}

      {activeTab === 'charts' && (
        <div
          className="oip-chat-scroll min-h-0 flex-1 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none]"
          role="tabpanel"
          aria-label="Charts"
        >
          <ChartsExperience />
        </div>
      )}
    </div>
  )
}

/* ── Typing indicator with rotating status phrase ── */
function TypingIndicator({ phrase }: { phrase: string }) {
  return (
    <div className="flex w-full justify-start">
      <div className="flex w-full max-w-[90%] items-start gap-3">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-[linear-gradient(135deg,rgba(15,118,110,0.10),rgba(8,145,178,0.14))] text-[#0F766E]">
          <BotIcon size={15} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 items-start">
          <span className="pl-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
            Contract agent
          </span>
          <div className="flex w-fit items-center gap-2 px-1 py-0.5">
            <span className="text-sm text-[#64748B]">{phrase}</span>
            <span className="flex shrink-0 items-center gap-[3px]">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:300ms]" />
            </span>
          </div>
          <span className="pl-1 text-[11px] text-[#9CA3AF]">
            {formatTime(Date.now())}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Bot icon ── */
function BotIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

/* ── Send icon ── */
function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

/* ── HTML response renderer via Shadow DOM ── */
function HtmlMessage({
  html,
  isUser = false,
}: {
  html: string
  isUser?: boolean
}) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || !html) return

    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
      .map((m) => `<style>${m[1]}</style>`)
      .join('\n')

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    const bodyContent = bodyMatch ? bodyMatch[1] : html

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `${styleBlocks}\n${bodyContent}`
  }, [html])

  return (
    <div
      ref={hostRef}
      className={[
        'w-full overflow-auto',
        isUser
          ? 'rounded-[24px] border border-[#CDECF3] bg-white shadow-[0_18px_38px_-24px_rgba(14,116,144,0.32)]'
          : 'bg-transparent',
      ].join(' ')}
      style={{ maxHeight: '480px' }}
    />
  )
}
