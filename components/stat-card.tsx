import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  suffix?: string
  className?: string
}

export function StatCard({ label, value, icon: Icon, suffix, className }: StatCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center p-6 rounded-lg bg-card border",
      className
    )}>
      <Icon className="h-8 w-8 text-primary mb-3" />
      <div className="text-3xl font-bold text-foreground">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="text-lg ml-1">{suffix}</span>}
      </div>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
