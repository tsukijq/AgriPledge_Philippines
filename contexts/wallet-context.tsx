'use client'

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react'
import { isValidStellarAddress, NETWORK, getAccountBalance } from '@/lib/stellar'

interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  isConnecting: boolean
  error: string | null
  balance: number
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (xdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Freighter API types
interface FreighterApi {
  isConnected: () => Promise<boolean>
  getPublicKey: () => Promise<string>
  getNetwork: () => Promise<string>
  signTransaction: (xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>
  requestAccess: () => Promise<string>
}

declare global {
  interface Window {
    freighterApi?: FreighterApi
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)

  // Check if Freighter is available
  const getFreighter = useCallback((): FreighterApi | null => {
    if (typeof window === 'undefined') return null
    return window.freighterApi || null
  }, [])

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      const freighter = getFreighter()
      if (!freighter) return

      try {
        const connected = await freighter.isConnected()
        if (connected) {
          const key = await freighter.getPublicKey()
          const network = await freighter.getNetwork()
          
          // Verify correct network
          if (network !== NETWORK) {
            setError(`Please switch to ${NETWORK} in Freighter`)
            return
          }
          
          if (isValidStellarAddress(key)) {
            setPublicKey(key)
            setIsConnected(true)
            
            // Fetch balance
            const bal = await getAccountBalance(key)
            setBalance(bal)
          }
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err)
      }
    }

    // Small delay to ensure Freighter is loaded
    const timer = setTimeout(checkConnection, 500)
    return () => clearTimeout(timer)
  }, [getFreighter])

  // Update balance periodically when connected
  useEffect(() => {
    if (!isConnected || !publicKey) return

    const updateBalance = async () => {
      const bal = await getAccountBalance(publicKey)
      setBalance(bal)
    }

    const interval = setInterval(updateBalance, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [isConnected, publicKey])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const freighter = getFreighter()
      
      if (!freighter) {
        setError('Freighter wallet not found. Please install the Freighter browser extension.')
        return
      }

      // Request access to the wallet
      const key = await freighter.requestAccess()
      
      if (!isValidStellarAddress(key)) {
        setError('Invalid Stellar address received from wallet')
        return
      }

      // Check network
      const network = await freighter.getNetwork()
      if (network !== NETWORK) {
        setError(`Please switch to ${NETWORK} in Freighter settings`)
        return
      }

      setPublicKey(key)
      setIsConnected(true)
      
      // Fetch balance
      const bal = await getAccountBalance(key)
      setBalance(bal)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(message)
    } finally {
      setIsConnecting(false)
    }
  }, [getFreighter])

  const disconnect = useCallback(() => {
    setIsConnected(false)
    setPublicKey(null)
    setBalance(0)
    setError(null)
  }, [])

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    const freighter = getFreighter()
    
    if (!freighter || !isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      const signedXdr = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK === 'TESTNET' 
          ? 'Test SDF Network ; September 2015'
          : 'Public Global Stellar Network ; September 2015'
      })
      return signedXdr
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to sign transaction')
    }
  }, [getFreighter, isConnected])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        publicKey,
        isConnecting,
        error,
        balance,
        connect,
        disconnect,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
