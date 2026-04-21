'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ProjectCard } from '@/components/project-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Project, PROJECT_CATEGORIES, ProjectCategory, ProjectStatus } from '@/types'
import { Search, SlidersHorizontal, Sprout } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProjectsPage() {
  const [category, setCategory] = useState<ProjectCategory | 'all'>('all')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const queryParams = new URLSearchParams()
  if (category !== 'all') queryParams.set('category', category)
  if (status !== 'all') queryParams.set('status', status)
  queryParams.set('limit', '50')

  const { data, isLoading, error } = useSWR<{ success: boolean; data: Project[] }>(
    `/api/projects?${queryParams.toString()}`,
    fetcher
  )

  const projects = data?.data || []

  // Client-side search filtering
  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.farmer?.name?.toLowerCase().includes(query) ||
      project.farmer?.location?.province?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Projects</h1>
        <p className="text-lg text-muted-foreground">
          Discover and support Filipino farmers making a difference in their communities.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, farmers, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={category} onValueChange={(v) => setCategory(v as ProjectCategory | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PROJECT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus | 'all')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-destructive">Failed to load projects. Please try again.</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border">
          <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || category !== 'all' || status !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Be the first to list a project on AgriPledge!'}
          </p>
          {(searchQuery || category !== 'all' || status !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setCategory('all')
                setStatus('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project._id?.toString()} project={project} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
