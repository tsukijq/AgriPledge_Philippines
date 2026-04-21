'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useWallet } from '@/contexts/wallet-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Farmer, Project, PROJECT_CATEGORIES, ProjectCategory } from '@/types'
import { 
  Sprout, 
  Plus, 
  Wallet,
  TrendingUp,
  Users,
  Coins,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react'
import { formatAddress } from '@/lib/stellar'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function FarmerDashboardPage() {
  const { isConnected, publicKey, connect, isConnecting, balance } = useWallet()
  
  const { data: farmerData, isLoading: farmerLoading } = useSWR<{ success: boolean; data: Farmer }>(
    isConnected && publicKey ? `/api/farmers/${publicKey}` : null,
    fetcher
  )

  const { data: projectsData, isLoading: projectsLoading, mutate: mutateProjects } = useSWR<{ success: boolean; data: Project[] }>(
    farmerData?.data?._id ? `/api/projects?farmerId=${farmerData.data._id}` : null,
    fetcher
  )

  const farmer = farmerData?.data
  const projects = projectsData?.data || []
  const isLoading = farmerLoading || projectsLoading

  // Calculate stats
  const totalRaised = projects.reduce((sum, p) => sum + p.currentFunding, 0)
  const activeProjects = projects.filter(p => p.status === 'active').length
  const fundedProjects = projects.filter(p => p.status === 'funded' || p.status === 'completed').length

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Freighter wallet to access your farmer dashboard.
            </p>
            <Button onClick={connect} disabled={isConnecting} className="gap-2">
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!farmer) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Not Registered</h2>
            <p className="text-muted-foreground mb-6">
              This wallet is not registered as a farmer. Register to start listing projects.
            </p>
            <Button asChild>
              <Link href="/farmer/register">Register as Farmer</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Farmer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {farmer.name}!
          </p>
        </div>
        <CreateProjectDialog farmerId={farmer._id?.toString() || ''} onSuccess={() => mutateProjects()} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRaised.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XLM Raised</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeProjects}</p>
                <p className="text-xs text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{fundedProjects}</p>
                <p className="text-xs text-muted-foreground">Funded Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{balance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">XLM Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">My Projects</h2>
          
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Projects Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first project to start receiving pledges from investors.
                </p>
                <CreateProjectDialog farmerId={farmer._id?.toString() || ''} onSuccess={() => mutateProjects()} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectListItem key={project._id?.toString()} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Farmer Profile Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Farm Name</p>
                <p className="font-medium">{farmer.farmName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {farmer.location?.municipality}, {farmer.location?.province}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Farm Size</p>
                <p className="font-medium">{farmer.farmSize} hectares</p>
              </div>
              {farmer.crops && farmer.crops.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Crops</p>
                  <div className="flex flex-wrap gap-1">
                    {farmer.crops.map((crop, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Stellar Address</p>
                <p className="font-mono text-xs truncate">{formatAddress(farmer.stellarAddress, 8)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ProjectListItem({ project }: { project: Project }) {
  const progressPercent = Math.min(
    (project.currentFunding / project.fundingGoal) * 100,
    100
  )
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href={`/projects/${project._id}`}
                className="font-semibold hover:text-primary transition-colors"
              >
                {project.title}
              </Link>
              <Badge variant={
                project.status === 'active' ? 'default' :
                project.status === 'funded' ? 'secondary' :
                'outline'
              }>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {project.description}
            </p>
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>
                  {project.currentFunding.toLocaleString()} / {project.fundingGoal.toLocaleString()} XLM
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {daysLeft} days left
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateProjectDialog({ 
  farmerId, 
  onSuccess 
}: { 
  farmerId: string
  onSuccess: () => void 
}) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    endDate: '',
    category: '' as ProjectCategory | '',
    aiStory: '',
  })

  const handleGenerateStory = async () => {
    if (!formData.title || !formData.description) {
      setError('Please fill in title and description first')
      return
    }

    setIsGeneratingStory(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: 'Farmer',
          farmName: 'Farm',
          location: { municipality: 'Town', province: 'Province' },
          farmSize: 2,
          crops: ['Rice'],
          projectTitle: formData.title,
          projectDescription: formData.description,
          fundingGoal: formData.fundingGoal,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, aiStory: data.data.story }))
      } else {
        setError('Failed to generate story')
      }
    } catch {
      setError('Failed to generate story')
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          title: formData.title,
          description: formData.description,
          aiGeneratedStory: formData.aiStory,
          fundingGoal: parseFloat(formData.fundingGoal),
          endDate: formData.endDate,
          category: formData.category,
          milestones: [],
        }),
      })

      const data = await response.json()
      if (data.success) {
        setOpen(false)
        setFormData({
          title: '',
          description: '',
          fundingGoal: '',
          endDate: '',
          category: '',
          aiStory: '',
        })
        onSuccess()
      } else {
        setError(data.error || 'Failed to create project')
      }
    } catch {
      setError('Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a funding campaign for your farming project.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Rice Paddy Expansion Project"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your project and how the funds will be used..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fundingGoal">Funding Goal (XLM) *</Label>
              <Input
                id="fundingGoal"
                type="number"
                placeholder="e.g., 5000"
                value={formData.fundingGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, fundingGoal: e.target.value }))}
                min="100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as ProjectCategory }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Story Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiStory">AI-Generated Story</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateStory}
                disabled={isGeneratingStory}
                className="gap-1"
              >
                {isGeneratingStory ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Generate Story
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="aiStory"
              placeholder="Click 'Generate Story' to create an AI-powered narrative for your project..."
              value={formData.aiStory}
              onChange={(e) => setFormData(prev => ({ ...prev, aiStory: e.target.value }))}
              rows={5}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
