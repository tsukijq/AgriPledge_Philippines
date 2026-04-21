"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  FileText,
  DollarSign,
  Sprout,
  Camera,
  Truck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Users,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

const farmerSteps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description:
      "Install Freighter wallet and connect to Stellar testnet. Make sure you have XLM for transaction fees.",
  },
  {
    icon: FileText,
    title: "Create Commitment",
    description:
      "List your upcoming harvest with details like crop type, quantity, location, and requested USDC amount.",
  },
  {
    icon: DollarSign,
    title: "Receive Planting Funds",
    description:
      "When a buyer funds your commitment, 40% is immediately released to your wallet for seeds and supplies.",
  },
  {
    icon: Camera,
    title: "Submit Mid-Crop Proof",
    description:
      "Upload geo-tagged photos of your growing crops to verify progress and release the 20% mid-crop milestone.",
  },
  {
    icon: Truck,
    title: "Deliver Harvest",
    description:
      "Deliver the agreed harvest to your buyer. They confirm receipt and the final 40% is released.",
  },
  {
    icon: CheckCircle2,
    title: "Complete!",
    description:
      "Contract is fulfilled. You've received 100% of the agreed amount with zero interest.",
  },
];

const buyerSteps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description:
      "Install Freighter wallet and ensure you have USDC on Stellar testnet ready for funding.",
  },
  {
    icon: FileText,
    title: "Browse Marketplace",
    description:
      "Explore harvest commitments from verified farmers. Filter by crop type, location, and amount.",
  },
  {
    icon: DollarSign,
    title: "Fund Commitment",
    description:
      "Select a commitment and fund it with USDC. Your funds are locked in the Soroban escrow contract.",
  },
  {
    icon: Sprout,
    title: "Track Progress",
    description:
      "Monitor the farmer's progress as they submit mid-crop proof. 20% is released at this milestone.",
  },
  {
    icon: Truck,
    title: "Receive Delivery",
    description:
      "Receive the harvest as agreed. Inspect quality and quantity before confirming.",
  },
  {
    icon: CheckCircle2,
    title: "Confirm Delivery",
    description:
      "Confirm receipt to release the final 40% to the farmer. Contract is complete.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-foreground">How It Works</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AgriPledge uses Stellar blockchain and Soroban smart contracts to
          create trustless agricultural pre-financing
        </p>
      </div>

      {/* Milestone Breakdown */}
      <div className="mt-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">
            The Milestone System
          </h2>
          <p className="mt-2 text-muted-foreground">
            Funds are released in three stages to protect both parties
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              percentage: "40%",
              stage: "Planting",
              trigger: "Buyer deposits USDC",
              icon: Sprout,
              description:
                "When a buyer funds the commitment, 40% is immediately released to the farmer for seeds, fertilizer, and planting costs.",
            },
            {
              percentage: "20%",
              stage: "Mid-Crop",
              trigger: "Farmer submits proof",
              icon: Camera,
              description:
                "Farmer uploads geo-tagged photos showing crop progress. This verifies the crop is growing and releases 20% for ongoing care.",
            },
            {
              percentage: "40%",
              stage: "Delivery",
              trigger: "Buyer confirms receipt",
              icon: CheckCircle2,
              description:
                "After harvest delivery, the buyer confirms they received the goods. The final 40% is released to complete the contract.",
            },
          ].map((milestone) => (
            <Card key={milestone.stage} className="relative overflow-hidden">
              <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-4 py-2">
                <span className="text-xl font-bold text-primary-foreground">
                  {milestone.percentage}
                </span>
              </div>
              <CardHeader className="pt-12">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <milestone.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{milestone.stage}</CardTitle>
                <p className="text-sm font-medium text-primary">
                  {milestone.trigger}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {milestone.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* For Farmers */}
      <div className="mt-24">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">For Farmers</h2>
            <p className="text-muted-foreground">
              Get pre-financing for your harvest
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {farmerSteps.map((step, index) => (
            <Card key={step.title}>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* For Buyers */}
      <div className="mt-24">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <DollarSign className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">For Buyers</h2>
            <p className="text-muted-foreground">
              Pre-purchase harvests at competitive prices
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buyerSteps.map((step, index) => (
            <Card key={step.title}>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                  <step.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Section */}
      <div className="mt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Built on Stellar
          </h2>
          <p className="mt-2 text-muted-foreground">
            Enterprise-grade blockchain infrastructure for secure, fast, and
            low-cost transactions
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="border-0 bg-muted/50">
            <CardContent className="pt-6">
              <Shield className="mb-4 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Soroban Smart Contracts</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All escrow logic is encoded in an immutable smart contract.
                Funds can only be released according to the predefined rules.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/50">
            <CardContent className="pt-6">
              <DollarSign className="mb-4 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">USDC Stablecoin</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All transactions use USDC, a regulated stablecoin pegged 1:1 to
                USD. No crypto volatility for farmers.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/50">
            <CardContent className="pt-6">
              <Zap className="mb-4 h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Near-Zero Fees</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Stellar transactions cost ~$0.00001. This makes micro-financing
                economically viable for small farmers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Contract Info */}
      <div className="mt-16">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-between gap-6 py-8 sm:flex-row">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                View the Smart Contract
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Our Soroban escrow contract is deployed on Stellar testnet and
                fully auditable.
              </p>
              <code className="mt-2 block rounded bg-background/80 px-3 py-1 text-xs">
                CAIJY7YRYSZX3JTDMRF35A4QPTRHSMAL3P3GDFKQ5QOBIOTEZSRDI3WW
              </code>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <a
                  href="https://stellar.expert/explorer/testnet/contract/CAIJY7YRYSZX3JTDMRF35A4QPTRHSMAL3P3GDFKQ5QOBIOTEZSRDI3WW"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href="https://github.com/tsukijq/AgriPledge_Philippines"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source Code
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">Ready to Start?</h2>
        <p className="mt-2 text-muted-foreground">
          Connect your wallet and explore the marketplace
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/marketplace">
              Browse Marketplace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Freighter Wallet
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
