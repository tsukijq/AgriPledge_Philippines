"use client";

import { useState } from "react";
import { useAppStore } from "../lib/store";
import { connectWallet, formatAddress } from "../lib/stellar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, LogOut, User, ChevronDown, Loader2, Sprout, ShoppingBag, ExternalLink } from "lucide-react";
import type { UserRole } from "../lib/types";
import { cn } from "@/lib/utils";

export function WalletButton() {
  const {
    publicKey,
    isConnected,
    role,
    setPublicKey,
    setConnected,
    setRole,
    disconnect,
  } = useAppStore();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const key = await connectWallet();
      if (key) {
        setPublicKey(key);
        setConnected(true);
        setShowRoleDialog(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect wallet. Make sure Freighter is installed."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSelectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setShowRoleDialog(false);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!isConnected) {
    return (
      <>
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="h-10 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>

        {error && (
          <Dialog open={!!error} onOpenChange={() => setError(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connection Failed</DialogTitle>
                <DialogDescription>{error}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  To use AgriPledge, you need the Freighter wallet extension for Stellar.
                </p>
                <Button asChild className="w-full">
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Install Freighter
                  </a>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Role Selection Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Welcome to AgriPledge</DialogTitle>
              <DialogDescription>
                How would you like to participate?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <button
                onClick={() => handleSelectRole("farmer")}
                className="group flex items-start gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">I am a Farmer</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create harvest commitments and receive pre-financing for your crops
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleSelectRole("buyer")}
                className="group flex items-start gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 transition-colors group-hover:bg-accent/30">
                  <ShoppingBag className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">I am a Buyer</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pre-purchase harvests directly from farmers at better prices
                  </p>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 gap-2 border-2 pl-2 pr-3">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground",
              role === "farmer" ? "bg-primary" : "bg-accent"
            )}>
              {role === "farmer" ? (
                <Sprout className="h-4 w-4" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
            </div>
            <span className="hidden font-medium sm:inline">{formatAddress(publicKey!)}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {role === "farmer" ? "Farmer Account" : "Buyer Account"}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatAddress(publicKey!, 10)}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowRoleDialog(true)}
            className="cursor-pointer gap-2"
          >
            <User className="h-4 w-4" />
            Switch Role
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Selection Dialog (for switching) */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch Role</DialogTitle>
            <DialogDescription>Select your new role</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <button
              onClick={() => handleSelectRole("farmer")}
              className={cn(
                "group flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all hover:shadow-lg",
                role === "farmer"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                role === "farmer" ? "bg-primary text-primary-foreground" : "bg-primary/10"
              )}>
                <Sprout className={cn("h-6 w-6", role !== "farmer" && "text-primary")} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Farmer</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create and manage harvest commitments
                </p>
              </div>
            </button>
            <button
              onClick={() => handleSelectRole("buyer")}
              className={cn(
                "group flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all hover:shadow-lg",
                role === "buyer"
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card hover:border-accent/50 hover:bg-accent/10"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                role === "buyer" ? "bg-accent text-accent-foreground" : "bg-accent/20"
              )}>
                <ShoppingBag className={cn("h-6 w-6", role !== "buyer" && "text-accent-foreground")} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Buyer</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fund commitments and purchase harvests
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
