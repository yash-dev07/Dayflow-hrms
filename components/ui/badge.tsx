import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 badge",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]",
        secondary:
          "border-transparent bg-muted text-foreground hover:bg-muted/80",
        destructive:
          "border-transparent bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        warning: "border-transparent bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        blue: "border-transparent bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.2)]",
      },
    },
    defaultVariants: { variant: 'default' }
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
