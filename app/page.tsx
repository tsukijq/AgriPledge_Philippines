'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { ProjectCard } from '@/components/project-card'
import { 
  Sprout, 
  Shield, 
  Coins, 
  Users, 
  ArrowRight, 
  Wallet,
  FileCheck,
  TrendingUp,
  Heart
} from 'lucide-react'
import { Project, PlatformStats } from '@/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function HomePage() {
  const { data: statsData } = useSWR<{ success: boolean; data: PlatformStats }>('/api/stats', fetcher)
  const { data: projectsData } = useSWR<{ success: boolean; data: Project[] }>(
    '/api/projects?featured=true&limit=6',
    fetcher
  )

  const stats = statsData?.data || {
    totalFunded: 125000,
    farmersHelped: 48,
    activeProjects: 23,
    totalPledges: 312,
  }

  const projects = projectsData?.data || []

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sprout className="h-4 w-4" />
              Powered by Stellar Blockchain
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Invest in Filipino Farmers,{' '}
              <span className="text-primary">Grow Communities</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              AgriPledge connects impact investors with hardworking Filipino farmers through 
              transparent blockchain-powered crowdfunding. Every pledge creates real change.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/projects">
                  Browse Projects
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/farmer/register">
                  <Sprout className="h-4 w-4" />
                  Register as Farmer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              icon={Coins} 
              value={stats.totalFunded} 
              suffix="XLM"
              label="Total Funded" 
            />
            <StatCard 
              icon={Users} 
              value={stats.farmersHelped} 
              label="Farmers Helped" 
            />
            <StatCard 
              icon={Sprout} 
              value={stats.activeProjects} 
              label="Active Projects" 
            />
            <StatCard 
              icon={Heart} 
              value={stats.totalPledges} 
              label="Total Pledges" 
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How AgriPledge Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A transparent, blockchain-powered process that ensures every peso reaches those who need it most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Use Freighter wallet to securely connect to the platform. Your keys, your control.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose a Project</h3>
              <p className="text-muted-foreground">
                Browse verified farmer projects with AI-generated stories that bring their journeys to life.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor milestones on-chain. Funds release only when farmers achieve their goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Projects</h2>
              <p className="text-muted-foreground">
                Support these farmers and help them achieve their dreams.
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/projects">
                View All Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {projects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project._id?.toString()} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border">
              <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first farmer to list a project on AgriPledge!
              </p>
              <Button asChild>
                <Link href="/farmer/register">Register as Farmer</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Trust AgriPledge?</h2>
              <p className="text-lg text-muted-foreground">
                Built on Stellar blockchain for maximum transparency and security.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-6 rounded-xl bg-card border">
                <Shield className="h-10 w-10 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Blockchain Transparency</h3>
                  <p className="text-muted-foreground text-sm">
                    Every transaction is recorded on the Stellar network. Verify fund movements anytime, anywhere.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-xl bg-card border">
                <FileCheck className="h-10 w-10 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Milestone-Based Releases</h3>
                  <p className="text-muted-foreground text-sm">
                    Smart contracts ensure funds are only released when farmers complete verified milestones.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-xl bg-card border">
                <Coins className="h-10 w-10 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Low Fees</h3>
                  <p className="text-muted-foreground text-sm">
                    Stellar network fees are fractions of a cent. More of your pledge goes directly to farmers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-xl bg-card border">
                <Users className="h-10 w-10 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
                  <p className="text-muted-foreground text-sm">
                    Join a community of impact investors making real differences in Filipino farming communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Whether you are a farmer seeking funding or an investor looking to create change, 
            AgriPledge is your platform for transparent agricultural crowdfunding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/projects">
                Start Investing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 border-primary-foreground/30 hover:bg-primary-foreground/10">
              <Link href="/farmer/register">
                List Your Farm
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
