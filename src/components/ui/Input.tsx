import { forwardRef, type InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
