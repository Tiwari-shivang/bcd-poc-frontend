import type {
  AgentResponse,
  ContractRow,
  DemoQueriesMap,
  QueryRequest,
  SchemaMetadata,
} from '@/types/agent-api'

function getApiBase(): string {
  const env = import.meta.env.VITE_API_BASE_URL
  if (env !== undefined && env !== '') {
    return env.replace(/\/$/, '')
  }
  return '/api'
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) {
    return undefined as T
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
