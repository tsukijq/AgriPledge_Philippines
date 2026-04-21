'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sprout, Sparkles, Loader2, RefreshCw, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FarmerStoryProps {
  story?: string
  farmerData: {
    name: string
    farmName?: string
    location: { municipality: string; province: string }
    farmSize?: number
    crops?: string[]
  }
  projectData?: {
    title: string
    description: string
    fundingGoal: number
  }
  onStoryUpdate?: (story: string) => void
  editable?: boolean
  className?: string
}

export function FarmerStory({
  story,
  farmerData,
  projectData,
  onStoryUpdate,
  editable = false,
  className,
}: FarmerStoryProps) {
  const [currentStory, setCurrentStory] = useState(story || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStory, setEditedStory] = useState(currentStory)
  const [error, setError] = useState<string | null>(null)

  const generateStory = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: farmerData.name,
          farmName: farmerData.farmName,
          location: farmerData.location,
          farmSize: farmerData.farmSize,
          crops: farmerData.crops,
          projectTitle: projectData?.title,
          projectDescription: projectData?.description,
          fundingGoal: projectData?.fundingGoal,
        }),
      })

      const data = await response.json()
      
      if (data.success && data.data?.story) {
        setCurrentStory(data.data.story)
        setEditedStory(data.data.story)
        onStoryUpdate?.(data.data.story)
      } else {
        setError('Failed to generate story. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveEdit = () => {
    setCurrentStory(editedStory)
    onStoryUpdate?.(editedStory)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setEditedStory(currentStory)
    setIsEditing(false)
  }

  if (!currentStory && !editable) {
    return null
  }

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            {currentStory ? "The Farmer's Story" : "Generate Story"}
          </CardTitle>
          {editable && currentStory && !isEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateStory}
                disabled={isGenerating}
                className="gap-1"
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!currentStory ? (
          <div className="text-center py-6">
            <Sparkles className="h-10 w-10 text-primary/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Generate an AI-powered story that brings this farmer&apos;s journey to life.
            </p>
            <Button
              onClick={generateStory}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Story...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-destructive mt-4">{error}</p>
            )}
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedStory}
              onChange={(e) => setEditedStory(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {currentStory}
            </p>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Generated with AI to bring this farmer&apos;s journey to life.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
