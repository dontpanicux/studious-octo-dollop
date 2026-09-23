const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const COLS = [0, 1, 2, 3, 4, 5, 6]

// Synthetic retention data for display (would come from DB in production)
const DATA: number[][] = [
  [100, 96, 93, 91, 89, 87, 85],
  [100, 94, 91, 88, 86, 84],
  [100, 97, 94, 92, 90],
  [100, 95, 92, 90],
  [100, 96, 93],
  [100, 94],
  [100],
]

function retentionColor(v: number) {
  if (v >= 90) return 'var(--color-success-50)'
  if (v >= 80) return 'var(--color-success-100)'
  if (v >= 70) return 'var(--color-warning-50)'
  if (v >= 60) return 'var(--color-warning-100)'
  return 'var(--color-danger-50)'
}

function retentionText(v: number) {
  if (v >= 80) return 'var(--color-success-700)'
  if (v >= 60) return 'var(--color-warning-700)'
  return 'var(--color-danger-700)'
}

export function RetentionGrid() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr>
            <th className="text-left pb-2 pr-3 text-[var(--color-text-tertiary)] font-medium uppercase text-[10px] tracking-wide">Cohort</th>
            {COLS.map(c => (
              <th key={c} className="pb-2 px-1 text-center text-[var(--color-text-tertiary)] font-medium uppercase text-[10px] tracking-wide">M+{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MONTHS.map((month, ri) => (
            <tr key={month}>
              <td className="pr-3 py-1 text-[var(--color-text-secondary)] whitespace-nowrap">{month} 2026</td>
              {COLS.map(ci => {
                const val = DATA[ri]?.[ci]
                return (
                  <td key={ci} className="px-1 py-1">
                    {val !== undefined ? (
                      <div
                        className="rounded-[var(--radius-xs)] text-center py-1 px-0.5 text-[10px] font-medium min-w-[36px]"
                        style={{ background: retentionColor(val), color: retentionText(val) }}
                      >
                        {val}%
                      </div>
                    ) : (
                      <div className="min-w-[36px]" />
                    )}
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
