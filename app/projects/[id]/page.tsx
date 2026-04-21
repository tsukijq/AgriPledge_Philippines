'use client'

import { use } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressRing } from '@/components/progress-ring'
import { MilestoneTracker } from '@/components/milestone-tracker'
import { PledgeForm } from '@/components/pledge-form'
import { Project, PROJECT_CATEGORIES } from '@/types'
import { 
  MapPin, 
  Calendar, 
  Users,
  ArrowLeft,
  Sprout,
  ExternalLink,
  User,
  Leaf
} from 'lucide-react'
import { formatAddress } from '@/lib/stellar'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params)
  
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Project & { pledgeCount?: number } }>(
    `/api/projects/${id}`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !data?.success || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The project you are looking for does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/projects">Browse Projects</Link>
        </Button>
      </div>
    )
  }

  const project = data.data
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
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link 
        href="/projects" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{categoryLabel}</Badge>
              <Badge variant={project.status === 'active' ? 'default' : 'outline'}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              {project.title}
            </h1>
            
            {project.farmer && (
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{project.farmer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {project.farmer.location?.municipality}, {project.farmer.location?.province}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Image Gallery */}
          <div className="aspect-video bg-muted rounded-xl overflow-hidden">
            {project.images?.[0] ? (
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sprout className="h-20 w-20 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                About This Project
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* AI Generated Story */}
          {project.aiGeneratedStory && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  The Farmer&apos;s Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {project.aiGeneratedStory}
                </p>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  Generated with AI to bring this farmer&apos;s journey to life.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneTracker milestones={project.milestones} />
            </CardContent>
          </Card>

          {/* Farmer Info */}
          {project.farmer && (
            <Card>
              <CardHeader>
                <CardTitle>About the Farmer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{project.farmer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.farmer.farmName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.farmer.farmSize} hectares in {project.farmer.location?.municipality}
                    </p>
                  </div>
                </div>
                {project.farmer.crops && project.farmer.crops.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Crops</p>
                    <div className="flex flex-wrap gap-2">
                      {project.farmer.crops.map((crop, i) => (
                        <Badge key={i} variant="outline">{crop}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {project.farmer.stellarAddress && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Stellar Address: {' '}
                      <a
                        href={`https://stellar.expert/explorer/testnet/account/${project.farmer.stellarAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {formatAddress(project.farmer.stellarAddress, 8)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-6">
                <ProgressRing progress={progressPercent} size={140} strokeWidth={10} />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-primary text-lg">
                      {project.currentFunding.toLocaleString()} XLM
                    </span>
                    <span className="text-muted-foreground">
                      of {project.fundingGoal.toLocaleString()} XLM
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold">{project.pledgeCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Backers</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold">{daysLeft}</p>
                    <p className="text-xs text-muted-foreground">Days Left</p>
                  </div>
                </div>

                {project.stellarProjectId && (
                  <div className="pt-4 border-t">
                    <a
                      href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_CONTRACT_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View on Stellar Explorer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pledge Form */}
          {project.status === 'active' && (
            <PledgeForm project={project} onPledgeSuccess={() => mutate()} />
          )}

          {project.status === 'funded' && (
            <Card className="border-primary">
              <CardContent className="pt-6 text-center">
                <Sprout className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Fully Funded!</h3>
                <p className="text-sm text-muted-foreground">
                  This project has reached its funding goal. Thank you to all supporters!
                </p>
              </CardContent>
            </Card>
          )}

          {project.status === 'completed' && (
            <Card className="border-primary">
              <CardContent className="pt-6 text-center">
                <Sprout className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Project Completed!</h3>
                <p className="text-sm text-muted-foreground">
                  All milestones have been achieved and funds have been released.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
