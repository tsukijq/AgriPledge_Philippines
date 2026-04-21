import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { WalletProvider } from '@/contexts/wallet-context'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AgriPledge Philippines - Blockchain Crowdfunding for Filipino Farmers',
  description: 'Empowering Filipino farmers through transparent blockchain-powered crowdfunding. Connect with impact investors, fund agricultural projects, and build sustainable farming communities.',
  keywords: ['crowdfunding', 'Philippines', 'farming', 'agriculture', 'blockchain', 'Stellar', 'Soroban', 'impact investing'],
  authors: [{ name: 'AgriPledge Team' }],
  openGraph: {
    title: 'AgriPledge Philippines',
    description: 'Blockchain Crowdfunding for Filipino Farmers',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3d7a4a' },
    { media: '(prefers-color-scheme: dark)', color: '#4a9e5a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <WalletProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </WalletProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
