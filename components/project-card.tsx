import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Project, PROJECT_CATEGORIES } from '@/types'
import { MapPin, Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const progressPercent = Math.min(
    (project.currentFunding / project.fundingGoal) * 100,
    100
  )
  
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )
  
  const categoryLabel = PROJECT_CATEGORIES.find(c => c.value === project.category)?.label || project.category

  return (
    <Link href={`/projects/${project._id}`}>
      <Card className={cn(
        "h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
        className
      )}>
        <CardHeader className="p-0">
          <div className="aspect-[16/10] relative bg-muted overflow-hidden">
            {project.images?.[0] ? (
              <img
                src={project.images[0]}
                alt={project.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <span className="text-4xl">🌾</span>
              </div>
            )}
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3"
            >
              {categoryLabel}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2 text-balance">
            {project.title}
          </h3>
          
          {project.farmer && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">
                {project.farmer.location?.municipality}, {project.farmer.location?.province}
              </span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
          
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="font-medium text-primary">
                {project.currentFunding.toLocaleString()} XLM
              </span>
              <span className="text-muted-foreground">
                of {project.fundingGoal.toLocaleString()} XLM
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{daysLeft} days left</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{Math.floor(progressPercent)}% funded</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
