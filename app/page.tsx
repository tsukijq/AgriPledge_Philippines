"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sprout,
  Shield,
  Zap,
  DollarSign,
  ArrowRight,
  Check,
  Wheat,
  Users,
  TrendingUp,
  Leaf,
  Sun,
  Droplets,
} from "lucide-react";
import { useAppStore } from "@/frontend/lib/store";

export default function HomePage() {
  const { isConnected, role } = useAppStore();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-farmer.jpg"
            alt="Filipino farmer in rice paddy"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        </div>
        
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        
        {/* Floating decorative elements */}
        <div className="absolute left-[10%] top-[25%] hidden lg:block">
          <div className="animate-float rounded-2xl border border-primary/20 bg-card/90 p-3 shadow-xl backdrop-blur-md">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="absolute right-[12%] top-[35%] hidden lg:block">
          <div className="animate-float-delayed rounded-2xl border border-accent/20 bg-card/90 p-3 shadow-xl backdrop-blur-md">
            <Sun className="h-6 w-6 text-accent" />
          </div>
        </div>
        <div className="absolute bottom-[25%] left-[18%] hidden lg:block">
          <div className="animate-float rounded-2xl border border-chart-3/20 bg-card/90 p-3 shadow-xl backdrop-blur-md">
            <Droplets className="h-6 w-6 text-chart-3" />
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary shadow-sm">
              <div className="flex h-2 w-2 animate-pulse-soft rounded-full bg-primary" />
              Powered by Stellar & Soroban Smart Contracts
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-foreground">Interest-Free Financing for</span>
              <br />
              <span className="text-gradient">Filipino Farmers</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              AgriPledge connects smallholder farmers directly with buyers through 
              blockchain-powered harvest commitments. Receive funds in USDC with 
              milestone-based releases. <strong className="text-foreground">Zero interest. Zero middlemen.</strong>
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isConnected ? (
                <>
                  {role === "farmer" ? (
                    <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                      <Link href="/farmer/dashboard">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : role === "buyer" ? (
                    <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                      <Link href="/marketplace">
                        Browse Marketplace
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                      <Link href="/marketplace">
                        Explore Commitments
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                    <Link href="/marketplace">
                      View Marketplace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                    <Link href="/how-it-works">Learn How It Works</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span>Secure Escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <span>USDC Stable Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span>Sub-cent Fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative border-y border-border bg-muted/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Breaking the Cycle of Debt
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We&apos;re transforming how Filipino farmers access capital
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* The Problem */}
            <Card className="group relative overflow-hidden border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent transition-all hover:border-destructive/30 hover:shadow-lg">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-destructive/10 blur-2xl transition-all group-hover:bg-destructive/15" />
              <CardContent className="relative p-8">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive">
                  The Problem
                </div>
                <p className="text-lg leading-relaxed text-foreground">
                  Mang Roberto, a rice farmer in Central Luzon, needs P50,000 for
                  seeds and fertilizer. His only option is a{" "}
                  <strong>&quot;5-6&quot; loan</strong> - borrow P5, repay P6 in 30 days 
                  (20% monthly interest) - with a condition to sell his harvest at{" "}
                  <strong>30% below market value</strong>.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "No access to formal banking",
                    "Predatory informal lending (20%/month)",
                    "Forced below-market sales",
                    "No collateral options",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                        <span className="h-2 w-2 rounded-full bg-destructive" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* The Solution */}
            <Card className="group relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/15" />
              <CardContent className="relative p-8">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Our Solution
                </div>
                <p className="text-lg leading-relaxed text-foreground">
                  AgriPledge lets farmers tokenize{" "}
                  <strong>Harvest Commitments</strong>{" "}
                  on Stellar. Buyers pre-purchase using USDC, funds are locked in
                  a Soroban escrow contract, and released to farmers in three
                  milestone-based payments.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Zero interest financing",
                    "Direct farmer-buyer connection",
                    "Milestone-based fund release",
                    "Sub-cent transaction fees",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Milestone Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
              <DollarSign className="h-4 w-4" />
              How Funds Flow
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Milestone-Based Release
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              USDC is held in escrow and released in three secure milestones
            </p>
          </div>

          {/* Timeline connector */}
          <div className="relative mt-16">
            <div className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary via-accent to-primary lg:block" />
            
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                {
                  stage: "Planting",
                  percentage: "40%",
                  trigger: "Buyer deposits funds",
                  description:
                    "When a buyer funds the commitment, 40% is immediately released to the farmer for seeds and supplies.",
                  icon: Sprout,
                  color: "primary",
                },
                {
                  stage: "Mid-Crop",
                  percentage: "20%",
                  trigger: "Farmer submits proof",
                  description:
                    "Farmer uploads geo-tagged photo evidence of growing crops, releasing 20% for ongoing care.",
                  icon: TrendingUp,
                  color: "accent",
                },
                {
                  stage: "Delivery",
                  percentage: "40%",
                  trigger: "Buyer confirms receipt",
                  description:
                    "Upon successful harvest delivery, the buyer confirms and the final 40% is released.",
                  icon: Check,
                  color: "primary",
                },
              ].map((milestone, index) => (
                <Card
                  key={milestone.stage}
                  className="group relative overflow-hidden border-2 transition-all hover:border-primary/30 hover:shadow-xl"
                >
                  {/* Percentage badge */}
                  <div className="absolute right-4 top-4 z-10 rounded-xl bg-primary px-4 py-2 text-xl font-bold text-primary-foreground shadow-lg">
                    {milestone.percentage}
                  </div>
                  
                  {/* Step number */}
                  <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </div>

                  <CardContent className="pt-16 pb-8">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                      <milestone.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {milestone.stage}
                    </h3>
                    <p className="mt-2 font-medium text-primary">
                      {milestone.trigger}
                    </p>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {milestone.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-y border-border bg-muted/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
              <Zap className="h-4 w-4" />
              Technology
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Built on Stellar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Leveraging blockchain technology for transparent, secure agricultural financing
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Soroban Smart Contracts",
                description:
                  "Milestone escrow logic with secure authorization and automated state management",
              },
              {
                icon: DollarSign,
                title: "USDC Stable Value",
                description:
                  "No crypto volatility exposure for farmers - all funds denominated in stable USD",
              },
              {
                icon: Zap,
                title: "Near-Zero Fees",
                description:
                  "~$0.00001 per transaction on Stellar network - practically free transfers",
              },
              {
                icon: Users,
                title: "Trustless Trading",
                description:
                  "Smart contracts ensure both parties honor commitments without intermediaries",
              },
            ].map((feature) => (
              <Card key={feature.title} className="group border-2 border-transparent bg-card transition-all hover:border-primary/20 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16">
            {/* Decorative elements */}
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
            
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Connect your Stellar wallet and start pre-financing harvests or
                listing your crops today.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-12 w-full px-8 text-base shadow-lg sm:w-auto"
                >
                  <Link href="/marketplace">
                    Browse Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-primary-foreground/30 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                >
                  <Link href="/how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                <Wheat className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-foreground">AgriPledge PH</span>
                <p className="text-xs text-muted-foreground">Interest-free harvest financing</p>
              </div>
            </div>
            <div className="flex gap-6">
              <a
                href="https://stellar.expert/explorer/testnet/contract/CAIJY7YRYSZX3JTDMRF35A4QPTRHSMAL3P3GDFKQ5QOBIOTEZSRDI3WW"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Smart Contract
              </a>
              <a
                href="https://github.com/tsukijq/AgriPledge_Philippines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub
              </a>
              <Link
                href="/how-it-works"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
