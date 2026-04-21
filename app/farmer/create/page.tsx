"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, USDC_TOKEN_ID } from "@/frontend/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Info,
  Wheat,
  Sprout,
  Leaf,
  CheckCircle2,
  Lightbulb,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MilestoneTracker } from "@/frontend/components/milestone-tracker";
import type { MockCommitment } from "@/frontend/lib/types";
import { ContractStatus } from "@/frontend/lib/types";
import { createCommitment } from "@/frontend/lib/stellar";

const cropTypes = [
  { value: "rice", label: "Rice", icon: "🌾" },
  { value: "corn", label: "Corn", icon: "🌽" },
  { value: "mango", label: "Mango", icon: "🥭" },
  { value: "banana", label: "Banana", icon: "🍌" },
  { value: "coconut", label: "Coconut", icon: "🥥" },
  { value: "sugarcane", label: "Sugarcane", icon: "🎋" },
  { value: "vegetables", label: "Vegetables", icon: "🥬" },
  { value: "other", label: "Other", icon: "🌱" },
];

const locations = [
  "Central Luzon",
  "Ilocos Region",
  "Cagayan Valley",
  "CALABARZON",
  "MIMAROPA",
  "Bicol Region",
  "Western Visayas",
  "Central Visayas",
  "Eastern Visayas",
  "Zamboanga Peninsula",
  "Northern Mindanao",
  "Davao Region",
  "SOCCSKSARGEN",
  "Caraga",
  "BARMM",
  "CAR",
];

export default function CreateCommitmentPage() {
  const router = useRouter();
  const { isConnected, role, publicKey, addCommitment, commitments } =
    useAppStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    cropType: "",
    quantity: "",
    unit: "kg",
    grade: "",
    description: "",
    amount: "",
    location: "",
    harvestMonth: "",
    farmerName: "",
  });

  // Redirect if not connected or not a farmer
  if (!isConnected || role !== "farmer") {
    redirect("/");
  }

  const previewAmount = parseFloat(formData.amount) || 0;
  const selectedCrop = cropTypes.find((c) => c.value === formData.cropType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (
        !formData.cropType ||
        !formData.quantity ||
        !formData.amount ||
        !formData.location
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (previewAmount < 100) {
        throw new Error("Minimum commitment amount is $100 USDC");
      }

      // Build crop description
      const cropDescription = `${formData.quantity}${formData.unit} ${formData.grade ? formData.grade + " " : ""}${cropTypes.find((c) => c.value === formData.cropType)?.label || formData.cropType}${formData.description ? ` - ${formData.description}` : ""}`;

      // Create new commitment (demo - in production this would call the smart contract)
      const newCommitment: MockCommitment = {
        id: (commitments.length + 1).toString(),
        contractId: "CAIJY7YRYSZX3JTDMRF35A4QPTRHSMAL3P3GDFKQ5QOBIOTEZSRDI3WW",
        farmer: publicKey!,
        token: USDC_TOKEN_ID,
        totalAmount: previewAmount,
        cropDescription,
        status: ContractStatus.Open,
        milestones: { planting: false, midCrop: false, delivery: false },
        createdAt: new Date(),
        farmerName: formData.farmerName || "Anonymous Farmer",
        location: formData.location,
        expectedHarvestDate: new Date(
          formData.harvestMonth || Date.now() + 90 * 24 * 60 * 60 * 1000
        ),
      };

      // Call the actual Soroban smart contract
      try {
        await createCommitment(
          publicKey!,
          USDC_TOKEN_ID,
          previewAmount,
          cropDescription
        );
      } catch (contractErr) {
        console.error("Contract call failed, saving locally:", contractErr);
      }

      addCommitment(newCommitment);
      router.push("/farmer/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create commitment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Crop Info", icon: Sprout },
    { number: 2, title: "Details", icon: MapPin },
    { number: 3, title: "Pricing", icon: DollarSign },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-64 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 -ml-2">
            <Link href="/farmer/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 sm:flex">
              <Wheat className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Create Harvest Commitment
              </h1>
              <p className="mt-1 text-muted-foreground">
                List your upcoming harvest and receive upfront financing from
                buyers
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isComplete = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.number)}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all sm:px-4 ${isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : isComplete
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-8 sm:w-12 ${currentStep > step.number ? "bg-primary" : "bg-border"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="overflow-hidden border-none shadow-xl">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {currentStep === 1 && (
                      <>
                        <Sprout className="h-5 w-5 text-primary" />
                        Crop Information
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <MapPin className="h-5 w-5 text-primary" />
                        Location & Timeline
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <DollarSign className="h-5 w-5 text-primary" />
                        Pricing & Review
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 &&
                      "Tell us about the crop you are committing to grow"}
                    {currentStep === 2 &&
                      "Provide your location and expected harvest date"}
                    {currentStep === 3 &&
                      "Set your price and review your commitment"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Step 1: Crop Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      {/* Farmer Name */}
                      <div className="space-y-2">
                        <Label htmlFor="farmerName">
                          Your Name / Farm Name
                        </Label>
                        <Input
                          id="farmerName"
                          placeholder="e.g., Mang Roberto's Farm"
                          value={formData.farmerName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              farmerName: e.target.value,
                            })
                          }
                          className="h-12"
                        />
                      </div>

                      {/* Crop Type */}
                      <div className="space-y-2">
                        <Label>Crop Type *</Label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {cropTypes.map((crop) => (
                            <button
                              key={crop.value}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, cropType: crop.value })
                              }
                              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:border-primary/50 ${formData.cropType === crop.value
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                                }`}
                            >
                              <span className="text-2xl">{crop.icon}</span>
                              <span className="text-sm font-medium">
                                {crop.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="quantity">Quantity *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="e.g., 1000"
                            value={formData.quantity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                quantity: e.target.value,
                              })
                            }
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit">Unit</Label>
                          <Select
                            value={formData.unit}
                            onValueChange={(value) =>
                              setFormData({ ...formData, unit: value })
                            }
                          >
                            <SelectTrigger id="unit" className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">Kilograms</SelectItem>
                              <SelectItem value="ton">Tons</SelectItem>
                              <SelectItem value="cavan">Cavans</SelectItem>
                              <SelectItem value="pieces">Pieces</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Grade */}
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade / Variety (Optional)</Label>
                        <Input
                          id="grade"
                          placeholder="e.g., Premium, Carabao Variety, Organic"
                          value={formData.grade}
                          onChange={(e) =>
                            setFormData({ ...formData, grade: e.target.value })
                          }
                          className="h-12"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="w-full sm:w-auto"
                        >
                          Continue
                          <Leaf className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location & Timeline */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      {/* Location */}
                      <div className="space-y-2">
                        <Label htmlFor="location">Region *</Label>
                        <Select
                          value={formData.location}
                          onValueChange={(value) =>
                            setFormData({ ...formData, location: value })
                          }
                        >
                          <SelectTrigger id="location" className="h-12">
                            <SelectValue placeholder="Select your region" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}, Philippines
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Harvest Date */}
                      <div className="space-y-2">
                        <Label htmlFor="harvestMonth">
                          Expected Harvest Month
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="harvestMonth"
                            type="month"
                            value={formData.harvestMonth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                harvestMonth: e.target.value,
                              })
                            }
                            min={new Date().toISOString().slice(0, 7)}
                            className="h-12 pl-11"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Additional Details (Optional)
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Any additional details about your harvest..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      <div className="flex justify-between gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                        >
                          Continue
                          <DollarSign className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Pricing & Review */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="amount">
                          Requested Amount (USDC) *
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            className="h-14 pl-10 text-2xl font-bold"
                            value={formData.amount}
                            onChange={(e) =>
                              setFormData({ ...formData, amount: e.target.value })
                            }
                            min="100"
                            step="0.01"
                          />
                          <Badge
                            variant="secondary"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            USDC
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Minimum $100 USDC. This is the total amount a buyer
                          will pay for your harvest.
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="rounded-xl bg-muted/50 p-4">
                        <h4 className="mb-3 font-semibold text-foreground">
                          Commitment Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Crop</span>
                            <span className="font-medium">
                              {selectedCrop?.icon} {selectedCrop?.label || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Quantity
                            </span>
                            <span className="font-medium">
                              {formData.quantity || "-"} {formData.unit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Location
                            </span>
                            <span className="font-medium">
                              {formData.location || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Harvest
                            </span>
                            <span className="font-medium">
                              {formData.harvestMonth
                                ? new Date(formData.harvestMonth).toLocaleDateString(
                                  "en-US",
                                  { month: "long", year: "numeric" }
                                )
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Box */}
                      <Alert className="border-primary/20 bg-primary/5">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-foreground">
                          Once funded, <strong>40%</strong> is released
                          immediately for planting. Submit mid-crop proof to
                          receive <strong>20%</strong>, and the final{" "}
                          <strong>40%</strong> upon delivery confirmation.
                        </AlertDescription>
                      </Alert>

                      <div className="flex justify-between gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 sm:flex-none"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Create Commitment
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Preview */}
            <Card className="sticky top-24 border-none shadow-xl">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Payment Schedule
                </CardTitle>
                <CardDescription>
                  How funds will be released to you
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <MilestoneTracker
                  totalAmount={previewAmount}
                  milestones={{ planting: false, midCrop: false, delivery: false }}
                />
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    1
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Be specific</strong> -
                    Include variety, grade, and quality details.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    2
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Fair pricing</strong> -
                    Set competitive prices to attract buyers.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    3
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Realistic timeline</strong>{" "}
                    - Account for weather and other factors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
