"use client"

import { useState } from "react"
import { Address, formatEther } from "viem"
import { useAccount } from "wagmi"
import { 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Filter,
  RefreshCw
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSafe } from "@/store/safe"
import { useConnectedSafeInfo } from "@/hooks/use-safe-apps-sdk"
import { 
  useBlockscoutTransactions, 
  useBlockscoutTokenTransfers,
  openBlockscout,
  formatTxTimestamp,
  getTransactionLabel,
  type SupportedNetwork 
} from "@/hooks/use-blockscout"
import { PYUSD_ADDRESS, PYUSDX_ADDRESS } from "@/lib/contract"

type FilterType = "all" | "sent" | "received" | "stream" | "token"

export function TransactionHistory() {
  const { address } = useAccount()
  const { safeConfig } = useSafe()
  const { safeInfo, isInSafeContext } = useConnectedSafeInfo()
  
  const [filter, setFilter] = useState<FilterType>("all")
  const [network] = useState<SupportedNetwork>("sepolia")

  // Prioritize Safe address if connected
  const activeAddress = (isInSafeContext && safeInfo ? safeInfo.safeAddress : safeConfig?.address || address) as Address | undefined

  // Debug logging
  console.log("TransactionHistory - Address info:", {
    connectedAddress: address,
    safeConfigAddress: safeConfig?.address,
    safeInfoAddress: safeInfo?.safeAddress,
    isInSafeContext,
    activeAddress,
    network
  })

  // Fetch regular transactions
  const { 
    data: transactions, 
    isLoading: txLoading,
    error: txError,
    refetch: refetchTx 
  } = useBlockscoutTransactions(activeAddress, network)

  // Fetch token transfers (PYUSD and PYUSDx)
  const { 
    data: tokenTransfers, 
    isLoading: tokenLoading,
    error: tokenError,
    refetch: refetchTokens
  } = useBlockscoutTokenTransfers(activeAddress, undefined, network)

  const isLoading = txLoading || tokenLoading

  const handleRefresh = () => {
    refetchTx()
    refetchTokens()
  }

  // Filter transactions
  const filteredTokenTransfers = tokenTransfers?.filter((transfer) => {
    if (filter === "all") return true
    if (filter === "sent") return transfer.from.toLowerCase() === activeAddress?.toLowerCase()
    if (filter === "received") return transfer.to.toLowerCase() === activeAddress?.toLowerCase()
    if (filter === "token") return true
    if (filter === "stream") {
      // Check if it's a Superfluid-related token (PYUSDx)
      return transfer.contractAddress.toLowerCase() === PYUSDX_ADDRESS.toLowerCase()
    }
    return true
  }) || []

  const getTransactionDirection = (from: string, to: string) => {
    const fromAddr = from.toLowerCase()
    const toAddr = to.toLowerCase()
    const myAddr = activeAddress?.toLowerCase()

    if (fromAddr === myAddr) return "sent"
    if (toAddr === myAddr) return "received"
    return "internal"
  }

  const formatAmount = (value: string, decimals: string) => {
    const amount = BigInt(value)
    const divisor = BigInt(10 ** parseInt(decimals))
    return (Number(amount) / Number(divisor)).toFixed(4)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              View all transactions on Blockscout
              {activeAddress && (
                <span className="ml-2 font-mono text-xs">
                  {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="stream">Streams</SelectItem>
                <SelectItem value="token">Tokens</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!activeAddress ? (
          <div className="text-center py-8 text-muted-foreground">
            Connect your wallet to view transaction history
          </div>
        ) : (txError || tokenError) ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-2">Failed to load transactions</p>
            <p className="text-sm text-muted-foreground mb-4">
              {txError?.message || tokenError?.message || "Unknown error"}
            </p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredTokenTransfers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">No transactions found</p>
            <p className="text-xs">
              Check browser console for API details
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>From/To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTokenTransfers.map((transfer) => {
                  const direction = getTransactionDirection(transfer.from, transfer.to)
                  const otherAddress = direction === "sent" ? transfer.to : transfer.from
                  const amount = formatAmount(transfer.value, transfer.tokenDecimal)
                  
                  return (
                    <TableRow key={`${transfer.hash}-${transfer.transactionIndex}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {direction === "sent" ? (
                            <ArrowUpRight className="h-4 w-4 text-orange-500" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          )}
                          <span className="capitalize">{direction}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{transfer.tokenSymbol}</span>
                          <span className="text-xs text-muted-foreground">
                            {transfer.tokenName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {otherAddress.slice(0, 6)}...{otherAddress.slice(-4)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={direction === "sent" ? "text-orange-600" : "text-green-600"}>
                          {direction === "sent" ? "-" : "+"}{amount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatTxTimestamp(transfer.timeStamp)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Success
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openBlockscout("tx", transfer.hash, network)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Link to full Blockscout page */}
        {activeAddress && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => openBlockscout("address", activeAddress, network)}
            >
              View Full History on Blockscout
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
