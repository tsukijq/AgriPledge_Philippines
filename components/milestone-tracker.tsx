'use client'

import { Check, Sprout, Leaf, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContractMilestones, ProjectStatus } from '@/types'

// Fixed milestones matching the AgriPledge contract
const MILESTONE_CONFIG = [
  {
    key: 'plantingPaid' as const,
    title: 'Planting',
    description: '40% released when buyer funds commitment',
    percentage: 40,
    icon: Sprout,
  },
  {
    key: 'midcropPaid' as const,
    title: 'Mid-Crop',
    description: '20% released when farmer submits proof',
    percentage: 20,
    icon: Leaf,
  },
  {
    key: 'deliveryPaid' as const,
    title: 'Delivery',
    description: '40% released when buyer confirms delivery',
    percentage: 40,
    icon: Truck,
  },
]

interface MilestoneTrackerProps {
  milestones: ContractMilestones
  status: ProjectStatus
  totalAmount?: number
  className?: string
}

export function MilestoneTracker({ milestones, status, totalAmount, className }: MilestoneTrackerProps) {
  const completedCount = [milestones.plantingPaid, milestones.midcropPaid, milestones.deliveryPaid].filter(Boolean).length
  
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Milestone Progress</h3>
        <span className="text-sm text-muted-foreground">{completedCount} of 3 completed</span>
      </div>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-border" />
        <div 
          className="absolute left-4 top-8 w-0.5 bg-primary transition-all duration-500"
          style={{ height: `${(completedCount / 3) * 100}%`, maxHeight: 'calc(100% - 4rem)' }}
        />
        
        <div className="space-y-6">
          {MILESTONE_CONFIG.map((milestone) => {
            const isCompleted = milestones[milestone.key]
            const Icon = milestone.icon
            const amount = totalAmount ? (totalAmount * milestone.percentage) / 100 : null
            
            return (
              <div key={milestone.key} className="flex items-start gap-4 relative">
                {/* Icon Circle */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                      'font-medium',
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {milestone.title}
                    </h4>
                    <span className={cn(
                      'text-sm font-medium',
                      isCompleted ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {milestone.percentage}%
                      {amount && ` ($${amount.toFixed(2)})`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {milestone.description}
                  </p>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                      <Check className="w-3 h-3" />
                      Released
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Contract Status</span>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = {
    open: { label: 'Open', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    funded: { label: 'Funded', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    midcrop: { label: 'Mid-Crop', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    completed: { label: 'Completed', className: 'bg-primary/10 text-primary' },
    cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
  }
  
  const { label, className } = config[status]
  
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  )
}
