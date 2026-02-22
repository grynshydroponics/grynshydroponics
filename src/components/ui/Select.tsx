import { forwardRef, type SelectHTMLAttributes } from 'react'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'
