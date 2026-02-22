import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none'
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-muted',
      secondary: 'bg-surface text-slate-100 hover:bg-surface-muted border border-slate-600',
      ghost: 'text-slate-300 hover:bg-surface hover:text-slate-100',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
