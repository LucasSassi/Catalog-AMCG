import type { ReactNode } from 'react'

interface InscriptionFieldProps {
  label: string
  children: ReactNode
  className?: string
  required?: boolean
}

export function InscriptionField({
  label,
  children,
  className = '',
  required = false,
}: InscriptionFieldProps) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="block rounded-t-md bg-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  )
}

export const inscriptionControlClassName =
  'min-h-11 w-full rounded-b-md border border-t-0 border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none'

export const inscriptionTextareaClassName =
  'min-h-28 w-full rounded-b-md border border-t-0 border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none'
