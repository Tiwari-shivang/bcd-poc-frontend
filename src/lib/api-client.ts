import type {
  AgentResponse,
  ContractRow,
  DemoQueriesMap,
  QueryRequest,
  SchemaMetadata,
} from '@/types/agent-api'

export type InsightExecutionStatus = 'ok' | 'error' | string

export type InsightRow = Record<string, unknown>

export type InsightItem = {
  insight_title: string
  insight_description: string
  sql: string
  execution_status: InsightExecutionStatus
  row_count: number
  rows: InsightRow[]
  error: string | null
}

export type InsightsResponse = {
  ok: boolean
  insights: InsightItem[]
}

export type InsightChartType = 'pie' | 'bar' | 'line'

export type InsightChartDataPoint = Record<string, unknown>

export type InsightChartConfig = {
  name_key?: string
  value_key?: string
  x_key?: string
  y_key?: string
}

export type InsightChartItem = {
  chart_title: string
  chart_description: string
  chart_type: InsightChartType
  chart_config: InsightChartConfig
  sql: string
  execution_status: InsightExecutionStatus
  row_count: number
  data: InsightChartDataPoint[]
  error: string | null
}

export type InsightChartsResponse = {
  ok: boolean
  charts: InsightChartItem[]
}

function getApiBase(): string {
  const env = import.meta.env.VITE_API_BASE_URL
  if (env !== undefined && env !== '') {
    return env.replace(/\/$/, '')
  }
  return '/api'
}

function getInsightsBase(): string {
  return 'http://localhost:8080'
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) {
    return undefined as T
  }
  if (text.trimStart().startsWith('<!doctype') || text.trimStart().startsWith('<html')) {
    throw new Error('Expected JSON but received HTML. Check the API route or proxy configuration.')
  }
  return JSON.parse(text) as T
}

export async function fetchDemoQueries(): Promise<DemoQueriesMap> {
  const res = await fetch(`${getApiBase()}/demo-queries`)
  if (!res.ok) {
    throw new Error(`Failed to load demo queries (${res.status})`)
  }
  return parseJson<DemoQueriesMap>(res)
}

export async function fetchSchema(): Promise<SchemaMetadata> {
  const res = await fetch(`${getApiBase()}/schema`)
  if (!res.ok) {
    throw new Error(`Failed to load schema (${res.status})`)
  }
  return parseJson<SchemaMetadata>(res)
}

export async function fetchContractsData(): Promise<ContractRow[]> {
  const res = await fetch(`${getApiBase()}/contracts-data`)
  if (!res.ok) {
    throw new Error(`Failed to load contracts data (${res.status})`)
  }
  return parseJson<ContractRow[]>(res)
}

async function fetchInsights(path: string): Promise<InsightsResponse> {
  const res = await fetch(`${getInsightsBase()}${path}`)
  if (!res.ok) {
    throw new Error(`Failed to load insights (${res.status})`)
  }
  return parseJson<InsightsResponse>(res)
}

async function fetchInsightCharts(path: string): Promise<InsightChartsResponse> {
  const res = await fetch(`${getInsightsBase()}${path}`)
  if (!res.ok) {
    throw new Error(`Failed to load charts (${res.status})`)
  }
  return parseJson<InsightChartsResponse>(res)
}

export async function fetchSalesForceInsights(): Promise<InsightsResponse> {
  return fetchInsights('/insights/sales-force')
}

export async function fetchOipInsights(): Promise<InsightsResponse> {
  return fetchInsights('/insights/oip')
}

export async function fetchSalesForceCharts(): Promise<InsightChartsResponse> {
  return fetchInsightCharts('/insights/sales-force/charts')
}

export async function fetchOipCharts(): Promise<InsightChartsResponse> {
  return fetchInsightCharts('/insights/oip/charts')
}

export async function postQuery(body: QueryRequest): Promise<AgentResponse> {
  const res = await fetch(`${getApiBase()}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await parseJson<{ detail?: string } & Partial<AgentResponse>>(res)
  if (!res.ok) {
    const msg =
      typeof data?.detail === 'string'
        ? data.detail
        : `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data as AgentResponse
}

function isHtmlString(s: string): boolean {
  const t = s.trimStart().toLowerCase()
  return t.startsWith('<!') || t.startsWith('<html') || t.startsWith('<table')
}

export async function postChatMessage(
  message: string,
): Promise<{ response: string; isHtml: boolean }> {
  const res = await fetch('/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`)
  }
  const contentType = res.headers.get('content-type') ?? ''
  const text = await res.text()

  // Raw HTML response
  if (contentType.includes('text/html') || isHtmlString(text)) {
    return { response: text, isHtml: true }
  }

  // JSON-wrapped response — also check if the value itself is HTML
  try {
    const json = JSON.parse(text) as { response: string }
    const responseText = json.response ?? text
    return { response: responseText, isHtml: isHtmlString(responseText) }
  } catch {
    return { response: text, isHtml: false }
  }
}
