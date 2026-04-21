'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useWallet } from '@/contexts/wallet-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Pledge, Project } from '@/types'
import { 
  Wallet,
  TrendingUp,
  Sprout,
  Coins,
  Loader2,
  ExternalLink,
  ArrowRight,
  Heart
} from 'lucide-react'
import { formatAddress } from '@/lib/stellar'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface InvestorStats {
  totalInvested: number
  activeProjects: number
  totalPledges: number
}

interface PledgeWithProject extends Pledge {
  project?: Project
}

export default function InvestorDashboardPage() {
  const { isConnected, publicKey, connect, isConnecting, balance } = useWallet()
  
  const { data, isLoading } = useSWR<{ 
    success: boolean
    data: { 
      pledges: PledgeWithProject[]
      stats: InvestorStats 
    } 
  }>(
    isConnected && publicKey ? `/api/pledges/investor/${publicKey}` : null,
    fetcher
  )

  const pledges = data?.data?.pledges || []
  const stats = data?.data?.stats || {
    totalInvested: 0,
    activeProjects: 0,
    totalPledges: 0,
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Freighter wallet to view your investment portfolio.
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

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Investor Dashboard</h1>
          <p className="text-muted-foreground">
            Track your impact investments in Filipino farmers.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/projects">
            Browse Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
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
                <p className="text-2xl font-bold">{stats.totalInvested.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XLM Invested</p>
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
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
                <p className="text-xs text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPledges}</p>
                <p className="text-xs text-muted-foreground">Total Pledges</p>
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
        {/* Pledges List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">My Pledges</h2>
          
          {pledges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Pledges Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start supporting Filipino farmers by making your first pledge.
                </p>
                <Button asChild>
                  <Link href="/projects">Browse Projects</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pledges.map((pledge) => (
                <PledgeListItem key={pledge._id?.toString()} pledge={pledge} />
              ))}
            </div>
          )}
        </div>

        {/* Wallet Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Connected Address</p>
                <p className="font-mono text-sm break-all">{formatAddress(publicKey || '', 12)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">{balance.toFixed(2)} XLM</p>
              </div>
              <div className="pt-4 border-t">
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  View on Stellar Expert
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <Sprout className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Impact Investing</h3>
              <p className="text-sm text-muted-foreground">
                Your pledges directly support Filipino farmers, helping them 
                expand their operations and improve their livelihoods.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PledgeListItem({ pledge }: { pledge: PledgeWithProject }) {
  const project = pledge.project
  
  const progressPercent = project 
    ? Math.min((project.currentFunding / project.fundingGoal) * 100, 100)
    : 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {project ? (
                <Link 
                  href={`/projects/${project._id}`}
                  className="font-semibold hover:text-primary transition-colors"
                >
                  {project.title}
                </Link>
              ) : (
                <span className="font-semibold text-muted-foreground">Project Unavailable</span>
              )}
              <Badge variant={
                pledge.status === 'confirmed' ? 'default' :
                pledge.status === 'pending' ? 'outline' :
                'secondary'
              }>
                {pledge.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              <span>
                Pledged: <span className="font-medium text-foreground">{pledge.amount} XLM</span>
              </span>
              <span>
                {new Date(pledge.createdAt).toLocaleDateString()}
              </span>
            </div>

            {project && (
              <div className="space-y-2">
                <Progress value={progressPercent} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>
                    {project.currentFunding.toLocaleString()} / {project.fundingGoal.toLocaleString()} XLM
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(progressPercent)}% funded
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {pledge.stellarTxHash && (
          <div className="mt-4 pt-4 border-t">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${pledge.stellarTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              View Transaction
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
