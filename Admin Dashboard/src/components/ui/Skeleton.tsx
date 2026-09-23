interface SkeletonProps {
  className?: string
  height?: string
  width?: string
}

export function Skeleton({ className = '', height = 'h-4', width = 'w-full' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-[var(--color-border-subtle)] ${height} ${width} ${className}`}
    />
  )
}
