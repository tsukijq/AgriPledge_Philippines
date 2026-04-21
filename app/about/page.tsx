import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Sprout, 
  Shield, 
  Users, 
  Globe, 
  Coins,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Sprout className="h-14 w-14 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
          Empowering Filipino Farmers Through Blockchain
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          AgriPledge Philippines is a transparent crowdfunding platform that connects 
          impact investors with hardworking Filipino farmers using Stellar blockchain technology.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            Agriculture is the backbone of the Philippine economy, yet many farmers 
            struggle to access the capital they need to grow their operations. 
            Traditional lending often comes with high interest rates and complex requirements.
          </p>
          <p className="text-muted-foreground mb-4">
            AgriPledge bridges this gap by connecting farmers directly with impact investors 
            who want to make a difference. Our blockchain-based platform ensures complete 
            transparency - every peso can be tracked from pledge to project completion.
          </p>
          <p className="text-muted-foreground">
            We believe that when farmers thrive, communities flourish. Join us in building 
            a more sustainable and equitable agricultural future for the Philippines.
          </p>
        </div>
        <div className="bg-muted rounded-xl p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">81</p>
              <p className="text-sm text-muted-foreground">Philippine Provinces</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">10M+</p>
              <p className="text-sm text-muted-foreground">Filipino Farmers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">25%</p>
              <p className="text-sm text-muted-foreground">of Labor Force</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">9.2%</p>
              <p className="text-sm text-muted-foreground">of GDP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Stellar */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Stellar Blockchain?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <Coins className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Near-Zero Fees</h3>
              <p className="text-sm text-muted-foreground">
                Stellar transactions cost fractions of a cent, meaning more of your 
                pledge goes directly to farmers instead of intermediaries.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Smart Contracts</h3>
              <p className="text-sm text-muted-foreground">
                Soroban smart contracts ensure funds are only released when farmers 
                achieve verified milestones, protecting both parties.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Globe className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Global Access</h3>
              <p className="text-sm text-muted-foreground">
                Anyone with a Stellar wallet can participate, enabling diaspora 
                Filipinos and international supporters to invest in local farms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                For Farmers
              </h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">1</span>
                  <span className="text-muted-foreground">Connect your Freighter wallet and register your farm profile</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">2</span>
                  <span className="text-muted-foreground">Create a project with funding goals and milestones</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">3</span>
                  <span className="text-muted-foreground">Use AI to generate a compelling story for investors</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">4</span>
                  <span className="text-muted-foreground">Receive funds as you complete milestones</span>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                For Investors
              </h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">1</span>
                  <span className="text-muted-foreground">Connect your Freighter wallet with XLM tokens</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">2</span>
                  <span className="text-muted-foreground">Browse verified farmer projects and read their stories</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">3</span>
                  <span className="text-muted-foreground">Pledge any amount to projects you believe in</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">4</span>
                  <span className="text-muted-foreground">Track progress on-chain with full transparency</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Built With</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { name: 'Next.js', desc: 'React Framework' },
            { name: 'Stellar', desc: 'Blockchain Network' },
            { name: 'Soroban', desc: 'Smart Contracts' },
            { name: 'MongoDB', desc: 'Database' },
            { name: 'Groq AI', desc: 'Story Generation' },
            { name: 'Freighter', desc: 'Wallet' },
          ].map((tech) => (
            <div key={tech.name} className="px-4 py-3 rounded-lg bg-card border text-center min-w-[120px]">
              <p className="font-medium">{tech.name}</p>
              <p className="text-xs text-muted-foreground">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-primary/5 rounded-2xl p-12 border border-primary/20">
        <h2 className="text-2xl font-bold mb-4">Ready to Make an Impact?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Whether you&apos;re a farmer seeking funding or an investor looking to create 
          positive change, AgriPledge is your platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/projects">
              Browse Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <a 
              href="https://github.com/tsukijq/AgriPledge_Philippines"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
