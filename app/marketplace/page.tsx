"use client";

import { useEffect } from "react";
import { fetchCommitments, updateCommitmentFunded } from "@/frontend/lib/supabase";
import { useAppStore, DEPLOYED_CONTRACT_ID } from "@/frontend/lib/store";
import { useState } from "react";
import { CommitmentCard } from "@/frontend/components/commitment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Wheat, TrendingUp, Wallet } from "lucide-react";
import { ContractStatus } from "@/frontend/lib/types";
import { useRouter } from "next/navigation";
import { fundCommitment as fundCommitmentContract } from "@/frontend/lib/stellar";

export default function MarketplacePage() {
  const router = useRouter();
  const { commitments, isConnected, role, publicKey, fundCommitment, addCommitment } =
    useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    async function loadCommitments() {
      try {
        const data = await fetchCommitments();
        data.forEach((c: any) => {
          if (!commitments.find((existing) => existing.id === c.id)) {
            addCommitment({
              id: c.id,
              contractId: DEPLOYED_CONTRACT_ID,
              farmer: c.farmer_address,
              farmerName: c.farmer_name,
              token: c.token,
              totalAmount: c.total_amount,
              cropDescription: c.crop_description,
              status: c.status,
              milestones: c.milestones,
              createdAt: new Date(c.created_at),
              expectedHarvestDate: new Date(c.expected_harvest_date),
              buyer: c.buyer_address,
              fundedAt: c.funded_at ? new Date(c.funded_at) : undefined,
              location: c.location,
            });
          }
        });
      } catch (err) {
        console.error("Failed to load commitments:", err);
      }
    }
    loadCommitments();
  }, []);

  // Filter commitments
  const filteredCommitments = commitments
    .filter((c) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.cropDescription.toLowerCase().includes(query) ||
          c.farmerName.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((c) => {
      // Status filter
      if (statusFilter === "all") return c.status !== ContractStatus.Cancelled;
      return c.status === statusFilter;
    })
    .sort((a, b) => {
      // Sort
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount-high":
          return b.totalAmount - a.totalAmount;
        case "amount-low":
          return a.totalAmount - b.totalAmount;
        case "harvest-soon":
          return (
            new Date(a.expectedHarvestDate).getTime() -
            new Date(b.expectedHarvestDate).getTime()
          );
        default:
          return 0;
      }
    });

  const openCommitments = filteredCommitments.filter(
    (c) => c.status === ContractStatus.Open
  );

  const handleFund = async (id: string) => {
    if (!isConnected) { alert("Please connect your wallet first"); return; }
    if (role !== "buyer") { alert("Please switch to buyer mode"); return; }

    try {
      await updateCommitmentFunded(id, publicKey!);
      fundCommitment(id, publicKey!);
      router.push(`/commitment/${id}`);
    } catch (err) {
      console.error("Failed to fund commitment:", err);
      alert("Failed to fund commitment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                Harvest Marketplace
              </h1>
              <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
                Browse and fund harvest commitments from Filipino farmers. Support local agriculture with zero-interest pre-financing.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{openCommitments.length}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{filteredCommitments.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <Card className="mb-8 border-2">
          <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by crop, farmer, or location..."
                className="h-11 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Funded">Funded</SelectItem>
                  <SelectItem value="MidCrop">Growing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 w-[170px]">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Highest Amount</SelectItem>
                  <SelectItem value="amount-low">Lowest Amount</SelectItem>
                  <SelectItem value="harvest-soon">Harvest Soonest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredCommitments.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                <Wheat className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                No Commitments Found
              </h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters to find what you're looking for"
                  : "Check back soon for new harvest commitments from Filipino farmers"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCommitments.map((commitment) => (
              <CommitmentCard
                key={commitment.id}
                commitment={commitment}
                onAction={
                  commitment.status === ContractStatus.Open && isConnected && role === "buyer"
                    ? () => handleFund(commitment.id)
                    : undefined
                }
                actionLabel={
                  commitment.status === ContractStatus.Open
                    ? "Fund Commitment"
                    : undefined
                }
                actionDisabled={!isConnected || role !== "buyer"}
              />
            ))}
          </div>
        )}

        {/* CTA for non-connected users */}
        {!isConnected && (
          <Card className="mt-12 overflow-hidden border-2 border-primary/20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
              <CardContent className="relative flex flex-col items-center justify-center gap-6 py-12 text-center sm:flex-row sm:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    Ready to Support Filipino Farmers?
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Connect your Stellar wallet to fund harvest commitments and receive pre-agreed harvests at competitive prices.
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 px-4 py-2 text-sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Zero Interest
                </Badge>
              </CardContent>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
