import type { ContractRow } from '@/types/agent-api'

function parseDate(val: string | null): Date | null {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function todayUtc(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
}

// ── Portfolio Health ──────────────────────────────────────────────────────────

export interface PortfolioHealth {
  score: number
  active: number
  atRisk: number
  lost: number
  total: number
  status: 'HEALTHY' | 'GOOD' | 'AT RISK'
}

export function getPortfolioHealth(rows: ContractRow[], today = todayUtc()): PortfolioHealth {
  const total = rows.length
  const t90 = addDays(today, 90)
  let active = 0
  let atRisk = 0
  let lost = 0

  for (const row of rows) {
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    const status = row.Agreement_Status__c ?? ''
    if (['Lost', 'Closed Lost'].includes(status)) {
      lost++
    } else if (endDate && endDate > today) {
      active++
      if (endDate <= t90) atRisk++
    }
  }

  const score = total > 0 ? Math.round((active / total) * 100) : 0
  const status: PortfolioHealth['status'] =
    score >= 70 ? 'HEALTHY' : score >= 50 ? 'GOOD' : 'AT RISK'

  return { score, active, atRisk, lost, total, status }
}

// ── Renewal Pipeline ──────────────────────────────────────────────────────────

export interface RenewalPipeline {
  next30: number
  next60: number
  next90: number
  total: number
  actionStatus: 'URGENT' | 'NEEDS PLANNING' | 'MONITOR'
}

export function getRenewalPipeline(rows: ContractRow[], today = todayUtc()): RenewalPipeline {
  const t30 = addDays(today, 30)
  const t60 = addDays(today, 60)
  const t90 = addDays(today, 90)
  let next30 = 0
  let next60 = 0
  let next90 = 0

  for (const row of rows) {
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    if (!endDate || endDate <= today) continue
    if (endDate <= t30) next30++
    if (endDate <= t60) next60++
    if (endDate <= t90) next90++
  }

  const actionStatus: RenewalPipeline['actionStatus'] =
    next30 > 0 ? 'URGENT' : next60 > 0 ? 'NEEDS PLANNING' : 'MONITOR'

  return { next30, next60, next90, total: rows.length, actionStatus }
}

// ── At-Risk Contracts ─────────────────────────────────────────────────────────

export interface AtRiskContract {
  name: string
  date: string
  days: number
  owner: string
}

export function getAtRiskContracts(rows: ContractRow[], today = todayUtc()): AtRiskContract[] {
  const t90 = addDays(today, 90)
  const results: AtRiskContract[] = []

  for (const row of rows) {
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    if (!endDate || endDate <= today || endDate > t90) continue
    results.push({
      name: row.Company_Name__c ?? row.Name ?? 'Unknown',
      date: formatDate(endDate),
      days: diffDays(today, endDate),
      owner: (row.Owner_Email__c ?? '').split('@')[0],
    })
  }

  return results.sort((a, b) => a.days - b.days)
}

// ── Client Concentration ──────────────────────────────────────────────────────

export interface ClientConcentrationItem {
  company: string
  count: number
  pct: number
  /** True when the company has at least one non-lost contract with a past end date */
  hasExpiredAgreement?: boolean
}

export function getClientConcentration(
  rows: ContractRow[],
  today = todayUtc()
): {
  top: ClientConcentrationItem[]
  others: ClientConcentrationItem
  diversification: 'GOOD' | 'AT RISK'
} {
  const total = rows.length
  const counts: Record<string, number> = {}
  const expiredSet = new Set<string>()

  for (const row of rows) {
    const company = row.Company_Name__c ?? 'Unknown'
    counts[company] = (counts[company] ?? 0) + 1

    const status = row.Agreement_Status__c ?? ''
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    const isLost = ['Lost', 'Closed Lost'].includes(status)
    if (!isLost && endDate && endDate < today) {
      expiredSet.add(company)
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, 2).map(([company, count]) => ({
    company,
    count,
    pct: Math.round((count / total) * 100),
    hasExpiredAgreement: expiredSet.has(company),
  }))

  const othersCount = sorted.slice(2).reduce((sum, [, c]) => sum + c, 0)
  const others: ClientConcentrationItem = {
    company: 'Others',
    count: othersCount,
    pct: Math.round((othersCount / total) * 100),
  }

  const topPct = top[0]?.pct ?? 0
  const diversification: 'GOOD' | 'AT RISK' = topPct < 50 ? 'GOOD' : 'AT RISK'

  return { top, others, diversification }
}

// ── Owner Workload ────────────────────────────────────────────────────────────

export interface OwnerWorkloadItem {
  owner: string
  contracts: number
  renewalsDue: number
}

export function getOwnerWorkload(rows: ContractRow[], today = todayUtc()): {
  items: OwnerWorkloadItem[]
  balance: 'BALANCED' | 'UNEVEN' | 'CRITICAL'
} {
  const t90 = addDays(today, 90)
  const contractMap: Record<string, number> = {}
  const renewalsMap: Record<string, number> = {}

  for (const row of rows) {
    const owner = (row.Owner_Email__c ?? 'unknown').split('@')[0]
    contractMap[owner] = (contractMap[owner] ?? 0) + 1
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    if (endDate && endDate > today && endDate <= t90) {
      renewalsMap[owner] = (renewalsMap[owner] ?? 0) + 1
    }
  }

  const items: OwnerWorkloadItem[] = Object.entries(contractMap)
    .sort((a, b) => b[1] - a[1])
    .map(([owner, contracts]) => ({
      owner,
      contracts,
      renewalsDue: renewalsMap[owner] ?? 0,
    }))

  const total = rows.length
  const maxContracts = items[0]?.contracts ?? 0
  const maxPct = total > 0 ? (maxContracts / total) * 100 : 0
  const balance: 'BALANCED' | 'UNEVEN' | 'CRITICAL' =
    maxPct > 40 ? 'CRITICAL' : maxPct > 30 ? 'UNEVEN' : 'BALANCED'

  return { items, balance }
}

// ── Renewal Calendar ──────────────────────────────────────────────────────────

export interface CalendarEntry {
  name: string
  date: string
}

export function getRenewalCalendar(
  rows: ContractRow[],
  today = todayUtc()
): { quarters: Record<string, CalendarEntry[]>; peakQuarter: string } {
  const quarters: Record<string, CalendarEntry[]> = {}

  for (const row of rows) {
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    if (!endDate || endDate <= today) continue

    const year = endDate.getUTCFullYear()
    const month = endDate.getUTCMonth() // 0-indexed
    const quarter = Math.floor(month / 3) + 1
    const key = year === new Date().getUTCFullYear() ? `Q${quarter} ${year}` : `${year}`

    if (!quarters[key]) quarters[key] = []
    quarters[key].push({
      name: row.Company_Name__c ?? row.Name ?? 'Unknown',
      date: formatDate(endDate),
    })
  }

  const peakQuarter =
    Object.entries(quarters).sort((a, b) => b[1].length - a[1].length)[0]?.[0] ?? ''

  return { quarters, peakQuarter }
}

// ── Chart: Renewal Timeline ───────────────────────────────────────────────────

export interface TimelinePoint {
  month: string
  count: number
  contracts: string[]
}

export function getRenewalTimelineData(rows: ContractRow[], today = todayUtc()): TimelinePoint[] {
  const end = addDays(today, 365)
  const map: Record<string, { count: number; contracts: string[] }> = {}

  for (const row of rows) {
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    if (!endDate || endDate <= today || endDate > end) continue
    const key = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}`
    if (!map[key]) map[key] = { count: 0, contracts: [] }
    map[key].count++
    map[key].contracts.push(row.Company_Name__c ?? row.Name ?? 'Unknown')
  }

  const points: TimelinePoint[] = []
  const current = new Date(today)
  for (let i = 0; i < 12; i++) {
    const year = current.getUTCFullYear()
    const month = current.getUTCMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const label = new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    points.push({ month: label, count: map[key]?.count ?? 0, contracts: map[key]?.contracts ?? [] })
    current.setUTCMonth(current.getUTCMonth() + 1)
  }

  return points
}

// ── Chart: Status Distribution ────────────────────────────────────────────────

export interface StatusSlice {
  status: string
  count: number
  color: string
}

const STATUS_COLORS: Record<string, string> = {
  Active: '#10B981',
  'Signed and Finalized': '#3B82F6',
  'Operating under Extension': '#F59E0B',
  Lost: '#EF4444',
  'Closed Lost': '#EF4444',
}

export function getStatusDistribution(rows: ContractRow[]): StatusSlice[] {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    const s = row.Agreement_Status__c ?? 'Unknown'
    counts[s] = (counts[s] ?? 0) + 1
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      status,
      count,
      color: STATUS_COLORS[status] ?? '#D1D5DB',
    }))
}

// ── Chart: Owner Workload ─────────────────────────────────────────────────────

export interface OwnerBar {
  owner: string
  contracts: number
}

export function getOwnerWorkloadChartData(rows: ContractRow[]): OwnerBar[] {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    const owner = (row.Owner_Email__c ?? 'unknown').split('@')[0]
    counts[owner] = (counts[owner] ?? 0) + 1
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([owner, contracts]) => ({ owner, contracts }))
}

// ── Chart: Client Concentration ───────────────────────────────────────────────

export interface CompanySlice {
  company: string
  value: number
  color: string
}

export function getClientConcentrationChartData(rows: ContractRow[]): CompanySlice[] {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    const company = row.Company_Name__c ?? 'Unknown'
    counts[company] = (counts[company] ?? 0) + 1
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const top2 = sorted.slice(0, 2)
  const othersCount = sorted.slice(2).reduce((sum, [, c]) => sum + c, 0)

  /** Indigo, teal, violet for top segments; neutral grey for aggregate */
  const colors = ['#4F46E5', '#0F766A', '#7C3AED']
  const othersColor = '#CBD5E1'
  const result: CompanySlice[] = top2.map(([company, value], i) => ({
    company,
    value,
    color: colors[i] ?? colors[0],
  }))
  if (othersCount > 0) {
    result.push({ company: 'Others', value: othersCount, color: othersColor })
  }
  return result
}

// ── Chart: Expiry Heat Map ────────────────────────────────────────────────────

export interface QuarterBar {
  quarter: string
  count: number
  color: string
  contracts: string[]
}

export function getExpiryHeatMapData(rows: ContractRow[], today = todayUtc()): QuarterBar[] {
  const map: Record<string, { count: number; contracts: string[] }> = {}

  for (const row of rows) {
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    if (!endDate || endDate <= today) continue

    const year = endDate.getUTCFullYear()
    const month = endDate.getUTCMonth()
    const quarter = Math.floor(month / 3) + 1
    const key = `Q${quarter} ${year}`

    if (!map[key]) map[key] = { count: 0, contracts: [] }
    map[key].count++
    map[key].contracts.push(row.Company_Name__c ?? row.Name ?? 'Unknown')
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, { count, contracts }]) => ({
      quarter,
      count,
      contracts,
      color: count >= 4 ? '#EF4444' : count >= 2 ? '#F59E0B' : '#10B981',
    }))
}

// ── Chart: Metrics Cards ──────────────────────────────────────────────────────

export interface MetricCard {
  title: string
  value: string
  subtitle: string
  accentColor: string
}

export function getMetricsCards(rows: ContractRow[], today = todayUtc()): MetricCard[] {
  const total = rows.length
  const t90 = addDays(today, 90)
  let active = 0
  let atRisk = 0
  let lost = 0

  for (const row of rows) {
    const endDate = parseDate(row.Original_Contract_End_Date__c)
    const status = row.Agreement_Status__c ?? ''
    if (['Lost', 'Closed Lost'].includes(status)) {
      lost++
    } else if (endDate && endDate > today) {
      active++
      if (endDate <= t90) atRisk++
    }
  }

  const churnPct = total > 0 ? Math.round((lost / total) * 100) : 0
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0
  const atRiskPct = total > 0 ? Math.round((atRisk / total) * 100) : 0

  return [
    {
      title: 'Active',
      value: `${active}/${total}`,
      subtitle: `${activePct}% of portfolio`,
      accentColor: '#10B981',
    },
    {
      title: 'At-Risk Soon',
      value: String(atRisk),
      subtitle: `${atRiskPct}% expiring <90d`,
      accentColor: '#F59E0B',
    },
    {
      title: 'Renewals (90d)',
      value: String(atRisk),
      subtitle: 'contracts need action',
      accentColor: '#06B6D4',
    },
    {
      title: 'Lost / Churned',
      value: String(lost),
      subtitle: `${churnPct}% churn rate`,
      accentColor: '#EF4444',
    },
  ]
}

// ── Proactive insights for banner ─────────────────────────────────────────────

export interface ProactiveInsight {
  kind: 'warning' | 'alert' | 'info'
  text: string
}

export function buildProactiveInsights(
  health: PortfolioHealth,
  atRisk: AtRiskContract[],
  expiredCompanies: string[],
): ProactiveInsight[] {
  const insights: ProactiveInsight[] = []

  for (const company of expiredCompanies) {
    insights.push({
      kind: 'warning',
      text: `${company}: active status but primary agreement expired — resolve before Q3 renewal window opens.`,
    })
  }

  if (atRisk.length > 0) {
    const top = atRisk[0]
    insights.push({
      kind: 'alert',
      text: `${top.name} contract expires in ${top.days} days (${top.date}) — renewal action needed.`,
    })
  }

  insights.push({
    kind: 'info',
    text: `Portfolio health: ${health.score}/100 — ${health.active} active, ${health.atRisk} at risk, ${health.lost} lost.`,
  })

  return insights
}

// ── Natural-language agent summary ────────────────────────────────────────────

export interface AgentSummary {
  main: string
  risk: string | null
  anomaly: string | null
  team: string | null
}

export function buildAgentSummary(
  health: PortfolioHealth,
  pipeline: RenewalPipeline,
  atRisk: AtRiskContract[],
  expiredCompanies: string[],
  workload: { items: OwnerWorkloadItem[]; balance: 'BALANCED' | 'UNEVEN' | 'CRITICAL' },
): AgentSummary {
  const shape =
    health.status === 'HEALTHY' ? 'strong' : health.status === 'GOOD' ? 'good' : 'concerning'
  const main = `Your portfolio is in ${shape} shape — ${health.score}% of ${health.total} contracts are active.`

  let risk: string | null = null
  if (pipeline.next90 > 0 && atRisk.length > 0) {
    const top = atRisk[0]
    risk = `${pipeline.next90} agreement${pipeline.next90 !== 1 ? 's' : ''} expire within 90 days. Start with ${top.name} — ${top.days} days remaining.`
  }

  let anomaly: string | null = null
  if (expiredCompanies.length > 0) {
    const names = expiredCompanies.join(' and ')
    anomaly = `⚠ ${names}: agreement${expiredCompanies.length > 1 ? 's' : ''} expired but still showing active — running under extension.`
  }

  let team: string | null = null
  const ownersWithDue = workload.items.filter((w) => w.renewalsDue > 0)
  if (ownersWithDue.length > 0) {
    const totalDue = ownersWithDue.reduce((s, w) => s + w.renewalsDue, 0)
    team = `${ownersWithDue.length} account owner${ownersWithDue.length !== 1 ? 's' : ''} ${ownersWithDue.length !== 1 ? 'have' : 'has'} ${totalDue} renewal${totalDue !== 1 ? 's' : ''} requiring attention in the next 90 days.`
  }

  return { main, risk, anomaly, team }
}

// ── Dynamic chat welcome ───────────────────────────────────────────────────────

export function buildDynamicWelcome(
  health: PortfolioHealth,
  atRisk: AtRiskContract[],
  expiredCompanies: string[],
): string {
  const shape =
    health.status === 'HEALTHY' ? 'strong' : health.status === 'GOOD' ? 'good' : 'at risk'

  let text =
    `I've been monitoring your **BCD contract portfolio** — **${health.active} of ${health.total} contracts are active** and the portfolio is in **${shape} shape** (${health.score}/100).`

  if (expiredCompanies.length > 0) {
    text += `\n\n**⚠ Watch:** ${expiredCompanies[0]} has an expired agreement but is still showing active — this needs resolution before the Q3 renewal window.`
  } else if (atRisk.length > 0) {
    const top = atRisk[0]
    text += `\n\n**Most urgent:** ${top.name} expires in **${top.days} days** (${top.date}).`
  }

  text += '\n\nAsk me anything about your contracts, or explore the **Insights** and **Charts** tabs to see what I\'ve surfaced.'

  return text
}
