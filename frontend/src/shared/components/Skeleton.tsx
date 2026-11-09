export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-md bg-slate-200/80 motion-safe:animate-pulse ${className}`}
    />
  )
}
