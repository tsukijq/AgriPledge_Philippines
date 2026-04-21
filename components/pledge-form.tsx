'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wallet, ExternalLink, CheckCircle } from 'lucide-react'
import { pledgeTx, executeSignedTransaction } from '@/lib/contract'
import { Project } from '@/types'

interface PledgeFormProps {
  project: Project
  onPledgeSuccess?: () => void
}

export function PledgeForm({ project, onPledgeSuccess }: PledgeFormProps) {
  const { isConnected, publicKey, balance, connect, signTransaction } = useWallet()
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !publicKey) return

    const pledgeAmount = parseFloat(amount)
    if (isNaN(pledgeAmount) || pledgeAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (pledgeAmount > balance) {
      setError('Insufficient balance')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Check if project has on-chain ID
      if (!project.stellarProjectId) {
        setError('This project is not yet registered on the blockchain')
        setIsSubmitting(false)
        return
      }

      // Build the transaction
      const unsignedXdr = await pledgeTx(
        publicKey,
        project.stellarProjectId,
        pledgeAmount
      )

      // Sign with Freighter
      const signedXdr = await signTransaction(unsignedXdr)

      // Submit to network
      const result = await executeSignedTransaction(signedXdr)

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed')
      }

      // Record pledge in database
      await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project._id,
          investorAddress: publicKey,
          amount: pledgeAmount,
          stellarTxHash: result.hash,
        }),
      })

      setSuccess(true)
      setTxHash(result.hash || null)
      setAmount('')
      onPledgeSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process pledge')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Pledge Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Thank you for supporting this farmer.
              </p>
            </div>
            {txHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View on Stellar Expert
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <Button 
              variant="outline" 
              onClick={() => setSuccess(false)}
              className="w-full"
            >
              Make Another Pledge
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Pledge</CardTitle>
        <CardDescription>
          Support this project with XLM. All transactions are recorded on the Stellar blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Freighter wallet to make a pledge.
            </p>
            <Button onClick={connect} className="w-full gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-muted text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Balance</span>
                <span className="font-medium">{balance.toFixed(2)} XLM</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Pledge Amount (XLM)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            {/* Quick amount buttons */}
            <div className="flex gap-2">
              {[10, 50, 100, 500].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={quickAmount > balance || isSubmitting}
                >
                  {quickAmount}
                </Button>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !amount}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pledge Now'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By pledging, you agree to our terms. Funds are held in a smart contract 
              and released based on milestone completion.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
