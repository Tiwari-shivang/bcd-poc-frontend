import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) {
    return 0
  }
  if (a === null || a === undefined) {
    return 1
  }
  if (b === null || b === undefined) {
    return -1
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  return formatCell(a).localeCompare(formatCell(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

export interface ResultsTableProps {
  rows: Record<string, unknown>[]
  className?: string
}

export function ResultsTable({ rows, className }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const columns = useMemo(
    () => (rows.length > 0 ? Object.keys(rows[0] ?? {}) : []),
    [rows]
  )

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return rows
    }
    const next = [...rows]
    next.sort((ra, rb) => {
      const c = compareValues(ra[sortKey], rb[sortKey])
      return sortDir === 'asc' ? c : -c
    })
    return next
  }, [rows, sortKey, sortDir])

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-[#6B7280]">
        No records returned for this query.
      </p>
    )
  }

  return (
    <div
      className={cn(
        'oip-hide-scrollbar max-h-[min(18rem,46vh)] overflow-auto rounded-md border border-[#E5E7EB] bg-white shadow-sm sm:max-h-[min(24rem,52vh)] [-webkit-overflow-scrolling:touch]',
        className
      )}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead className="sticky top-0 z-10 shadow-[0_1px_0_#E5E7EB]">
          <tr className="text-white">
            {columns.map((col) => {
              const active = sortKey === col
              return (
                <th
                  key={col}
                  scope="col"
                  className="whitespace-nowrap bg-[#1F2937] px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col)}
                    className="group flex w-full items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wide text-white/95 transition-colors hover:text-white"
                  >
                    <span className="truncate">{col}</span>
                    <span className="shrink-0 text-white/70 group-hover:text-white">
                      {active ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="size-3" aria-hidden />
                        ) : (
                          <ArrowDown className="size-3" aria-hidden />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-60" aria-hidden />
                      )}
                    </span>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB] bg-white">
          {sortedRows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'transition-colors hover:bg-[#EFF6FF]/80',
                i % 2 === 1 ? 'bg-[#F9FAFB]' : 'bg-white'
              )}
            >
              {columns.map((col) => {
                const raw = formatCell(row[col])
                return (
                  <td
                    key={col}
                    className="max-w-[18rem] whitespace-nowrap px-3 py-2.5 text-[#374151] first:font-medium"
                  >
                    <span className="block truncate" title={raw}>
                      {raw}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
