const COLORS = [
  'bg-[var(--color-brand-800)] text-[var(--color-brand-300)]',
  'bg-[var(--color-success-50)] text-[var(--color-success-500)]',
  'bg-[var(--color-danger-50)] text-[var(--color-danger-500)]',
  'bg-[var(--color-warning-50)] text-[var(--color-warning-500)]',
  'bg-[var(--color-border-default)] text-[var(--color-text-secondary)]',
  'bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)]',
]

function hashName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return Math.abs(h) % COLORS.length
}

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const SIZE_CLASS = { xs: 'w-5 h-5 text-[9px]', sm: 'w-7 h-7 text-[11px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' }

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const color = COLORS[hashName(name)]
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-mono font-medium shrink-0 ${SIZE_CLASS[size]} ${color}`}>
      {initials}
    </span>
  )
}
