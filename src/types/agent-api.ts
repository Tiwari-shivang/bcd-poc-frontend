export interface QueryRequest {
  query: string
}

export interface DataCitations {
  tables: string[]
  columns: string[]
}

export interface StepMetadata {
  step_name: string
  duration_ms: number
}

export interface AgentResponse {
  query_used: string
  matched_query_id: string
  results: Record<string, unknown>[]
  analysis: string
  data_citations: DataCitations
  step_metadata: StepMetadata[]
}

export interface DemoQueryItem {
  id: string
  prompt: string
  description: string
}

export type DemoQueriesMap = Record<string, DemoQueryItem>

export interface SchemaColumnMeta {
  type: string
  description: string
}

export interface SchemaTableMeta {
  description: string
  columns: Record<string, SchemaColumnMeta>
  csv_path: string
}

export type SchemaMetadata = Record<string, SchemaTableMeta>

export interface ContractRow {
  Name: string | null
  Company_Name__c: string | null
  Agreement_Status__c: string | null
  Original_Contract_End_Date__c: string | null
  Owner_Email__c: string | null
}
