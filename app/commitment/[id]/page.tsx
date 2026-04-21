"use client";

import { use } from "react";
import { useAppStore } from "@/frontend/lib/store";
import { MilestoneTracker } from "@/frontend/components/milestone-tracker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sprout,
  Camera,
  Truck,
  Shield,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatUSDC,
  getExplorerUrl,
  formatAddress,
} from "@/frontend/lib/stellar";
import { ContractStatus } from "@/frontend/lib/types";
import { useState } from "react";

const statusConfig: Record<
  ContractStatus,
  { color: string; bgColor: string; icon: React.ElementType; label: string }
> = {
  [ContractStatus.Open]: {
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    icon: AlertCircle,
    label: "Awaiting Funding",
  },
  [ContractStatus.Funded]: {
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: Sprout,
    label: "Funded - Growing",
  },
  [ContractStatus.MidCrop]: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    icon: Camera,
    label: "Mid-Crop Verified",
  },
  [ContractStatus.Completed]: {
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
    icon: CheckCircle2,
    label: "Completed",
  },
  [ContractStatus.Cancelled]: {
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/20",
    icon: AlertCircle,
    label: "Cancelled",
  },
};

export default function CommitmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    commitments,
    isConnected,
    role,
    publicKey,
    fundCommitment,
    updateMilestone,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    "planting" | "midCrop" | "delivery" | null
  >(null);
  const [copied, setCopied] = useState(false);

  const commitment = commitments.find((c) => c.id === id);

  if (!commitment) {
    notFound();
  }

  const status = statusConfig[commitment.status as ContractStatus];
  const StatusIcon = status.icon;

  const isFarmer = isConnected && role === "farmer";
  const isBuyer = isConnected && role === "buyer";

  const canFund = commitment.status === ContractStatus.Open && isBuyer;
  const canSubmitProof =
    commitment.status === ContractStatus.Funded && isFarmer;
  const canConfirmDelivery =
    commitment.status === ContractStatus.MidCrop && isBuyer;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFund = async () => {
    setIsLoading(true);
    setCurrentAction("planting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      fundCommitment(commitment.id, publicKey!);
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const handleSubmitProof = async () => {
    setIsLoading(true);
    setCurrentAction("midCrop");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateMilestone(commitment.id, "midCrop");
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const handleConfirmDelivery = async () => {
    setIsLoading(true);
    setCurrentAction("delivery");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateMilestone(commitment.id, "delivery");
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-64 -left-64 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href={role === "farmer" ? "/farmer/dashboard" : "/marketplace"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {role === "farmer" ? "Dashboard" : "Marketplace"}
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header Card */}
            <Card className="overflow-hidden border-none shadow-xl">
              <div className={`h-2 ${
                commitment.status === ContractStatus.Open
                  ? "bg-amber-500"
                  : commitment.status === ContractStatus.Funded
                    ? "bg-emerald-500"
                    : commitment.status === ContractStatus.MidCrop
                      ? "bg-blue-500"
                      : commitment.status === ContractStatus.Completed
                        ? "bg-primary"
                        : "bg-destructive"
              }`} />
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <Badge
                      className={`${status.bgColor} ${status.color} border font-medium`}
                    >
                      <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                      {status.label}
                    </Badge>
                    <CardTitle className="text-2xl sm:text-3xl">
                      {commitment.cropDescription}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        {commitment.farmerName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {commitment.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(
                          commitment.expectedHarvestDate
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <span className="text-xl font-bold text-primary">$</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Value
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatUSDC(commitment.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Expected Harvest
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {new Date(
                          commitment.expectedHarvestDate
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between rounded-lg py-3 transition-colors hover:bg-muted/50">
                  <span className="text-muted-foreground">Contract ID</span>
                  <button
                    onClick={() => handleCopy(commitment.contractId)}
                    className="flex items-center gap-2 font-mono text-sm"
                  >
                    <code className="rounded bg-muted px-2 py-1">
                      {formatAddress(commitment.contractId, 8)}
                    </code>
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <Separator />
                <div className="flex items-center justify-between rounded-lg py-3 transition-colors hover:bg-muted/50">
                  <span className="text-muted-foreground">Farmer</span>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {formatAddress(commitment.farmer, 8)}
                  </code>
                </div>
                {commitment.buyer && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between rounded-lg py-3 transition-colors hover:bg-muted/50">
                      <span className="text-muted-foreground">Buyer</span>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {formatAddress(commitment.buyer, 8)}
                      </code>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex items-center justify-between rounded-lg py-3 transition-colors hover:bg-muted/50">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium text-foreground">
                    {new Date(commitment.createdAt).toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                {commitment.fundedAt && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between rounded-lg py-3 transition-colors hover:bg-muted/50">
                      <span className="text-muted-foreground">Funded</span>
                      <span className="font-medium text-foreground">
                        {new Date(commitment.fundedAt).toLocaleDateString(
                          "en-US",
                          {
                            dateStyle: "medium",
                          }
                        )}
                      </span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="pt-2">
                  <a
                    href={getExplorerUrl(commitment.contractId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                  >
                    View on Stellar Explorer
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            {(canFund || canSubmitProof || canConfirmDelivery) && (
              <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
                <div className="h-1 bg-gradient-to-r from-primary to-accent" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {canFund && (
                      <>
                        <Sprout className="h-5 w-5 text-primary" />
                        Fund This Commitment
                      </>
                    )}
                    {canSubmitProof && (
                      <>
                        <Camera className="h-5 w-5 text-primary" />
                        Submit Mid-Crop Proof
                      </>
                    )}
                    {canConfirmDelivery && (
                      <>
                        <Truck className="h-5 w-5 text-primary" />
                        Confirm Delivery
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {canFund &&
                      "By funding this commitment, you agree to pre-purchase the harvest. 40% will be released immediately to the farmer for planting."}
                    {canSubmitProof &&
                      "Submit geo-tagged proof of your growing crops to release the 20% mid-crop milestone payment."}
                    {canConfirmDelivery &&
                      "Confirm you have received the harvest to release the final 40% payment to the farmer."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full shadow-lg"
                    size="lg"
                    disabled={isLoading}
                    onClick={
                      canFund
                        ? handleFund
                        : canSubmitProof
                          ? handleSubmitProof
                          : handleConfirmDelivery
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : canFund ? (
                      <>
                        <Sprout className="mr-2 h-5 w-5" />
                        Fund {formatUSDC(commitment.totalAmount)}
                      </>
                    ) : canSubmitProof ? (
                      <>
                        <Camera className="mr-2 h-5 w-5" />
                        Submit Proof
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Confirm Delivery Received
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Milestone Tracker */}
            <Card className="sticky top-24 border-none shadow-xl">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Payment Schedule
                </CardTitle>
                <CardDescription>
                  Track milestone payments for this commitment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <MilestoneTracker
                  totalAmount={commitment.totalAmount}
                  milestones={commitment.milestones}
                  currentAction={currentAction}
                />
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">How This Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Buyer Funds</p>
                    <p className="text-muted-foreground">
                      USDC locked in escrow, 40% released to farmer
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Mid-Crop Proof
                    </p>
                    <p className="text-muted-foreground">
                      Farmer submits proof, 20% is released
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Delivery</p>
                    <p className="text-muted-foreground">
                      Buyer confirms, final 40% released
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
