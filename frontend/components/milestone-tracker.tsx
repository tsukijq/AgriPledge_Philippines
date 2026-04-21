"use client";

import { cn } from "@/lib/utils";
import { Check, Circle, Loader2, Sprout, TrendingUp, Package } from "lucide-react";
import type { MilestoneInfo } from "../lib/types";
import { formatUSDC } from "../lib/stellar";

interface MilestoneTrackerProps {
  totalAmount: number;
  milestones: {
    planting: boolean;
    midCrop: boolean;
    delivery: boolean;
  };
  currentAction?: "planting" | "midCrop" | "delivery" | null;
}

export function MilestoneTracker({
  totalAmount,
  milestones,
  currentAction,
}: MilestoneTrackerProps) {
  const milestoneData: (MilestoneInfo & { icon: typeof Sprout })[] = [
    {
      name: "Planting",
      percentage: 40,
      amount: (totalAmount * 40) / 100,
      paid: milestones.planting,
      description: "Released when buyer funds the commitment",
      icon: Sprout,
    },
    {
      name: "Mid-Crop",
      percentage: 20,
      amount: (totalAmount * 20) / 100,
      paid: milestones.midCrop,
      description: "Released when farmer submits proof",
      icon: TrendingUp,
    },
    {
      name: "Delivery",
      percentage: 40,
      amount: (totalAmount * 40) / 100,
      paid: milestones.delivery,
      description: "Released when buyer confirms delivery",
      icon: Package,
    },
  ];

  const totalReleased = milestoneData.reduce(
    (acc, m) => acc + (m.paid ? m.amount : 0),
    0
  );
  const progressPercentage = (totalReleased / totalAmount) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Milestone Releases
        </h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {progressPercentage.toFixed(0)}% Released
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
          {/* Milestone markers */}
          <div className="absolute inset-y-0 left-[40%] w-px bg-background/50" />
          <div className="absolute inset-y-0 left-[60%] w-px bg-background/50" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>40%</span>
          <span>60%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        {milestoneData.map((milestone, index) => {
          const isActive =
            currentAction ===
            (index === 0
              ? "planting"
              : index === 1
                ? "midCrop"
                : "delivery");
          const isPaid = milestone.paid;
          const isNext =
            !isPaid &&
            (index === 0 ||
              milestoneData[index - 1]?.paid);
          const Icon = milestone.icon;

          return (
            <div
              key={milestone.name}
              className={cn(
                "relative rounded-xl border-2 p-4 transition-all",
                isPaid
                  ? "border-primary/30 bg-primary/5"
                  : isNext
                    ? "border-primary/20 bg-card"
                    : "border-border bg-muted/30"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isPaid
                      ? "bg-primary text-primary-foreground"
                      : isNext
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isActive ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : isPaid ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        className={cn(
                          "font-semibold",
                          isPaid
                            ? "text-foreground"
                            : isNext
                              ? "text-foreground"
                              : "text-muted-foreground"
                        )}
                      >
                        {milestone.name}
                      </h4>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-lg font-bold",
                          isPaid ? "text-primary" : "text-foreground"
                        )}
                      >
                        {formatUSDC(milestone.amount)}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {milestone.percentage}% of total
                      </p>
                    </div>
                  </div>

                  {isPaid && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Released to farmer
                      </span>
                    </div>
                  )}
                  
                  {isNext && !isPaid && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1">
                      <Circle className="h-2.5 w-2.5 animate-pulse fill-accent text-accent" />
                      <span className="text-xs font-medium text-accent-foreground">
                        Next milestone
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Released</p>
            <p className="text-2xl font-bold text-primary">
              {formatUSDC(totalReleased)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Remaining in Escrow</p>
            <p className="text-2xl font-bold text-foreground">
              {formatUSDC(totalAmount - totalReleased)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
