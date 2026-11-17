import type { ReactNode, Ref } from 'react'

interface SearchFieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
  inputRef?: Ref<HTMLInputElement>
  hint?: ReactNode
}

export function SearchField({
  label,
  placeholder,
  value,
  onChange,
  className = '',
  inputRef,
  hint,
}: SearchFieldProps) {
  return (
    <label
      className={`flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 focus-within:border-primary ${className}`}
    >
      <svg
        className="h-[18px] w-[18px] shrink-0 text-text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span className="sr-only">{label}</span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault()
            onChange('')
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
      />
      {hint && !value ? (
        <span className="hidden shrink-0 lg:inline-flex" aria-hidden="true">
          {hint}
        </span>
      ) : null}
    </label>
  )
}
