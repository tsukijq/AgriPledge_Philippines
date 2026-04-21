'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/contexts/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PHILIPPINE_PROVINCES } from '@/types'
import { Loader2, Wallet, Sprout, X, CheckCircle } from 'lucide-react'

const COMMON_CROPS = [
  'Rice', 'Corn', 'Coconut', 'Sugarcane', 'Banana', 'Mango',
  'Vegetables', 'Coffee', 'Cacao', 'Pineapple', 'Cassava', 'Abaca'
]

export default function FarmerRegisterPage() {
  const router = useRouter()
  const { isConnected, publicKey, connect, isConnecting } = useWallet()
  
  const [formData, setFormData] = useState({
    name: '',
    farmName: '',
    province: '',
    municipality: '',
    farmSize: '',
    crops: [] as string[],
    customCrop: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCropToggle = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop]
    }))
  }

  const addCustomCrop = () => {
    if (formData.customCrop.trim() && !formData.crops.includes(formData.customCrop.trim())) {
      setFormData(prev => ({
        ...prev,
        crops: [...prev.crops, prev.customCrop.trim()],
        customCrop: ''
      }))
    }
  }

  const removeCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.filter(c => c !== crop)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !publicKey) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stellarAddress: publicKey,
          name: formData.name,
          farmName: formData.farmName,
          location: {
            province: formData.province,
            municipality: formData.municipality,
          },
          farmSize: parseFloat(formData.farmSize) || 0,
          crops: formData.crops,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to register')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/farmer/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto border-primary">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to AgriPledge! Redirecting to your dashboard...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Sprout className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Register as a Farmer</h1>
          <p className="text-muted-foreground">
            Join AgriPledge and connect with impact investors to fund your farming projects.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Farmer Registration</CardTitle>
            <CardDescription>
              Fill in your details to create your farmer profile. You&apos;ll need a Freighter wallet to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-8 space-y-4">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please connect your Freighter wallet to register. Your Stellar address will be your unique identifier.
                  </p>
                </div>
                <Button onClick={connect} disabled={isConnecting} className="gap-2">
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4" />
                      Connect Freighter Wallet
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Connected wallet info */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Connected Wallet</p>
                  <p className="font-mono text-sm truncate">{publicKey}</p>
                </div>

                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Personal Information</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Juan dela Cruz"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmName">Farm Name *</Label>
                      <Input
                        id="farmName"
                        placeholder="Dela Cruz Family Farm"
                        value={formData.farmName}
                        onChange={(e) => setFormData(prev => ({ ...prev, farmName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Farm Location</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Select
                        value={formData.province}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, province: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {PHILIPPINE_PROVINCES.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="municipality">Municipality/City *</Label>
                      <Input
                        id="municipality"
                        placeholder="Enter municipality"
                        value={formData.municipality}
                        onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Farm Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      placeholder="e.g., 2.5"
                      value={formData.farmSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmSize: e.target.value }))}
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Crops You Grow</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {COMMON_CROPS.map((crop) => (
                        <Badge
                          key={crop}
                          variant={formData.crops.includes(crop) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleCropToggle(crop)}
                        >
                          {crop}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Selected crops */}
                    {formData.crops.filter(c => !COMMON_CROPS.includes(c)).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.crops.filter(c => !COMMON_CROPS.includes(c)).map((crop) => (
                          <Badge key={crop} variant="default" className="gap-1">
                            {crop}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeCrop(crop)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom crop"
                        value={formData.customCrop}
                        onChange={(e) => setFormData(prev => ({ ...prev, customCrop: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCrop())}
                      />
                      <Button type="button" variant="outline" onClick={addCustomCrop}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By registering, you agree to our terms of service. Your information will be 
                  used to connect you with potential investors.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
