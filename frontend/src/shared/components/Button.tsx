import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-darker',
  secondary:
    'border border-primary bg-white text-primary-darker hover:bg-secondary-background',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-primary-darker hover:bg-secondary-background',
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  let widthClass = ''

  if (fullWidth) {
    widthClass = 'w-full'
  }

  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${widthClass} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
