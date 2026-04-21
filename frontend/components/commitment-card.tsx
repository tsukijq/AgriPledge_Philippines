"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, ExternalLink, Sprout, TrendingUp, Check } from "lucide-react";
import { formatUSDC, getExplorerUrl } from "../lib/stellar";
import type { MockCommitment } from "../lib/types";
import { ContractStatus } from "../lib/types";
import Link from "next/link";

interface CommitmentCardProps {
  commitment: MockCommitment;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  showFarmerInfo?: boolean;
}

const statusConfig: Record<ContractStatus, { bg: string; text: string; border: string; label: string }> = {
  [ContractStatus.Open]: {
    bg: "bg-accent/20",
    text: "text-accent-foreground",
    border: "border-accent/50",
    label: "Open for Funding",
  },
  [ContractStatus.Funded]: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    label: "Funded",
  },
  [ContractStatus.MidCrop]: {
    bg: "bg-chart-2/20",
    text: "text-chart-4",
    border: "border-chart-2/30",
    label: "Growing",
  },
  [ContractStatus.Completed]: {
    bg: "bg-primary/20",
    text: "text-primary",
    border: "border-primary/40",
    label: "Completed",
  },
  [ContractStatus.Cancelled]: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/30",
    label: "Cancelled",
  },
};

export function CommitmentCard({
  commitment,
  onAction,
  actionLabel,
  actionDisabled,
  showFarmerInfo = true,
}: CommitmentCardProps) {
  const progressPercentage =
    commitment.milestones.delivery
      ? 100
      : commitment.milestones.midCrop
        ? 60
        : commitment.milestones.planting
          ? 40
          : 0;

  const status = statusConfig[commitment.status as ContractStatus];

  return (
    <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      {/* Decorative gradient */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
      
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
              {commitment.cropDescription}
            </h3>
            {showFarmerInfo && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>{commitment.farmerName}</span>
              </div>
            )}
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 ${status.bg} ${status.text} ${status.border} font-medium`}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {/* Location and Date */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <span>{commitment.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <span>
              {new Date(commitment.expectedHarvestDate).toLocaleDateString(
                "en-US",
                { month: "short", year: "numeric" }
              )}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Commitment</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {formatUSDC(commitment.totalAmount)}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">
              {progressPercentage}% released
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Milestone markers */}
            <div className="absolute inset-y-0 left-[40%] w-px bg-background/50" />
            <div className="absolute inset-y-0 left-[60%] w-px bg-background/50" />
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sprout className="h-3 w-3" />
              <span>40%</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>20%</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="h-3 w-3" />
              <span>40%</span>
            </div>
          </div>
        </div>

        {/* Contract link */}
        <a
          href={getExplorerUrl(commitment.contractId)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          View on Stellar Explorer
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>

      {(onAction || actionLabel) && (
        <CardFooter className="relative border-t border-border bg-muted/30 pt-4">
          <div className="flex w-full gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/commitment/${commitment.id}`}>View Details</Link>
            </Button>
            {onAction && (
              <Button
                onClick={onAction}
                disabled={actionDisabled}
                className="flex-1 shadow-lg shadow-primary/20"
              >
                {actionLabel}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
