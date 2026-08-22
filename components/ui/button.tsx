import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'btn-3d text-white hover:bg-indigo-700 active:scale-[0.98] shadow-sm',
        destructive: 'btn-3d !from-rose-500 !to-rose-700 text-white shadow-sm',
        outline: 'border border-border bg-card/50 hover:bg-muted text-foreground backdrop-blur-md shadow-sm',
        secondary: 'bg-muted text-foreground hover:bg-muted/80 backdrop-blur-md',
        ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground',
        link: 'text-indigo-400 underline-offset-4 hover:underline',
        success: 'btn-3d !from-emerald-500 !to-emerald-700 text-white shadow-sm',
        warning: 'btn-3d !from-amber-500 !to-amber-700 text-white shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <div className="spinner" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
