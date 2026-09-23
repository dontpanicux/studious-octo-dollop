import type { ReactNode } from 'react'
import { useState } from 'react'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyLabel?: string
  onRowClick?: (row: T) => void
  keyFn?: (row: T) => string
}

export function DataTable<T>({ columns, data, loading, emptyLabel = 'No data', onRowClick, keyFn }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-subtle)]">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)] whitespace-nowrap ${ALIGN[col.align ?? 'left']} ${col.sortable ? 'cursor-pointer select-none hover:text-[var(--color-text-secondary)]' : ''} ${col.width ?? ''}`}
              >
                {col.header}
                {col.sortable && sortKey === col.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--color-border-subtle)]">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton height="h-4" width={col.align === 'right' ? 'w-16 ml-auto' : 'w-32'} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyLabel} />
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={keyFn ? keyFn(row) : i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-[var(--color-border-subtle)] transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[var(--color-surface-overlay)]' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 text-[var(--color-text-primary)] ${ALIGN[col.align ?? 'left']}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
