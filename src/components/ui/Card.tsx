import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-slate-700 bg-surface p-4 shadow-lg ${className}`}
      {...props}
    />
  )
}

export function CardHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-3 ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold text-slate-100 ${className}`} {...props} />
}
