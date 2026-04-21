import Link from 'next/link'
import { Sprout } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">AgriPledge</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering Filipino farmers through blockchain-powered crowdfunding.
              Transparent, secure, and community-driven.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Platform</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Browse Projects
              </Link>
              <Link href="/farmer/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Become a Farmer
              </Link>
              <Link href="/investor/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Investor Dashboard
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Resources</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <a 
                href="https://stellar.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Stellar Network
              </a>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Connect</h3>
            <nav className="flex flex-col gap-2">
              <a 
                href="https://github.com/tsukijq/AgriPledge_Philippines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Get Freighter Wallet
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              2026 AgriPledge Philippines. Built on Stellar Soroban.
            </p>
            <p className="text-sm text-muted-foreground">
              Running on {process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
