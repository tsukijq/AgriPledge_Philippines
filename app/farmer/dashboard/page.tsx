"use client";

import { useAppStore } from "@/frontend/lib/store";
import { CommitmentCard } from "@/frontend/components/commitment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sprout,
  ArrowUpRight,
  Leaf,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatUSDC } from "@/frontend/lib/stellar";
import { ContractStatus } from "@/frontend/lib/types";

export default function FarmerDashboardPage() {
  const { isConnected, role, publicKey, commitments } = useAppStore();

  // Redirect if not connected or not a farmer
  if (!isConnected || role !== "farmer") {
    redirect("/");
  }

  // Filter commitments for this farmer (in a real app, filter by publicKey)
  const myCommitments = commitments.filter(
    (c) => c.status !== ContractStatus.Cancelled
  );

  const openCommitments = myCommitments.filter(
    (c) => c.status === ContractStatus.Open
  );
  const activeCommitments = myCommitments.filter(
    (c) =>
      c.status === ContractStatus.Funded || c.status === ContractStatus.MidCrop
  );
  const completedCommitments = myCommitments.filter(
    (c) => c.status === ContractStatus.Completed
  );

  // Calculate stats
  const totalEarnings = completedCommitments.reduce(
    (sum, c) => sum + c.totalAmount,
    0
  );
  const pendingFunds = activeCommitments.reduce((sum, c) => {
    const released = c.milestones.delivery
      ? c.totalAmount
      : c.milestones.midCrop
        ? c.totalAmount * 0.6
        : c.milestones.planting
          ? c.totalAmount * 0.4
          : 0;
    return sum + (c.totalAmount - released);
  }, 0);

  return (
    <div className="relative min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-64 -left-64 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sprout className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary" className="font-normal">
                  Farmer Portal
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Welcome back, Magsasaka!
              </h1>
              <p className="max-w-xl text-muted-foreground">
                Manage your harvest commitments and track payments from buyers.
                Get funded upfront with zero interest.
              </p>
            </div>
            <Button asChild size="lg" className="w-full shadow-lg sm:w-auto">
              <Link href="/farmer/create">
                <Plus className="mr-2 h-5 w-5" />
                Create New Commitment
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md transition-all hover:shadow-lg">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground">
                {formatUSDC(totalEarnings)}
              </div>
              <p className="mt-1 flex items-center text-xs text-muted-foreground">
                <CheckCircle2 className="mr-1 h-3 w-3 text-primary" />
                From {completedCommitments.length} completed
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-accent/20 via-accent/10 to-transparent shadow-md transition-all hover:shadow-lg">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-all group-hover:bg-accent/20" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Release
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                <Clock className="h-5 w-5 text-accent-foreground" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground">
                {formatUSDC(pendingFunds)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Locked in escrow
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-chart-3/10 blur-2xl transition-all group-hover:bg-chart-3/20" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Growing
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/10">
                <Leaf className="h-5 w-5 text-chart-3" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground">
                {activeCommitments.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Commitments in progress
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-chart-4/10 blur-2xl transition-all group-hover:bg-chart-4/20" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Awaiting Funding
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/10">
                <Sun className="h-5 w-5 text-chart-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground">
                {openCommitments.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Looking for buyers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Card */}
        <Card className="mb-8 border-dashed">
          <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Connected Wallet</p>
                <p className="font-mono text-sm text-muted-foreground">
                  {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-primary/30 text-primary">
                <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-primary" />
                Stellar Testnet
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Commitments Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none">
            <TabsTrigger value="active" className="gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Active</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeCommitments.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="open" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Awaiting</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {openCommitments.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {completedCommitments.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeCommitments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <Leaf className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No Active Commitments
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Create a harvest commitment to start receiving pre-financing
                    from buyers.
                  </p>
                  <Button asChild className="mt-6">
                    <Link href="/farmer/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Commitment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activeCommitments.map((commitment) => (
                  <CommitmentCard
                    key={commitment.id}
                    commitment={commitment}
                    showFarmerInfo={false}
                    actionLabel={
                      commitment.status === ContractStatus.Funded
                        ? "Submit Mid-Crop Proof"
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            {openCommitments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <Clock className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    All Caught Up!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    All your commitments have found buyers. Great work!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {openCommitments.map((commitment) => (
                  <CommitmentCard
                    key={commitment.id}
                    commitment={commitment}
                    showFarmerInfo={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedCommitments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No Completed Commitments Yet
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Once you deliver your first harvest, it will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {completedCommitments.map((commitment) => (
                  <CommitmentCard
                    key={commitment.id}
                    commitment={commitment}
                    showFarmerInfo={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
