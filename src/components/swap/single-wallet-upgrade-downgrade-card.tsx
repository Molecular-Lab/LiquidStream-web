"use client"

import { useState } from "react"
import { useAccount } from "wagmi"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Zap, ArrowUp, ArrowDown } from "lucide-react"
import { formatUnits, parseUnits } from "viem"
import { useTokenBalances } from "@/hooks/use-token-balances"
import { useSingleWalletTokenOperations, useSingleWalletUpgradeWithApproval } from "@/hooks/use-single-wallet-tokens"
import { PYUSDX_ADDRESS } from "@/lib/contract"

export function SingleWalletUpgradeDowngradeCard() {
    const { address } = useAccount()
    const [amount, setAmount] = useState("")
    const [operation, setOperation] = useState<'upgrade' | 'downgrade'>('upgrade')

    const { data: balances, isLoading: balancesLoading } = useTokenBalances()
    const { mutate: tokenOperation, isPending: isTokenPending } = useSingleWalletTokenOperations()
    const { mutate: upgradeWithApproval, isPending: isUpgradePending } = useSingleWalletUpgradeWithApproval()

    const isLoading = balancesLoading || isTokenPending || isUpgradePending

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !address) return

        const parsedAmount = operation === 'upgrade'
            ? parseUnits(amount, 6)  // PYUSD has 6 decimals
            : parseUnits(amount, 18) // PYUSDx has 18 decimals

        if (operation === 'upgrade') {
            // Use combined approval + upgrade for better UX
            upgradeWithApproval({
                amount: parsedAmount,
                tokenSymbol: "PYUSD"
            })
        } else {
            // Direct downgrade
            tokenOperation({
                operation: 'downgrade',
                tokenAddress: PYUSDX_ADDRESS,
                amount: parsedAmount,
                tokenSymbol: "PYUSDx"
            })
        }

        setAmount("")
    }

    const maxBalance = operation === 'upgrade'
        ? balances?.pyusd || 0
        : balances?.pyusdx || 0

    const symbol = operation === 'upgrade' ? 'PYUSD' : 'PYUSDx'
    const targetSymbol = operation === 'upgrade' ? 'PYUSDx' : 'PYUSD'

    const handleMaxClick = () => {
        if (maxBalance > 0) {
            setAmount(maxBalance.toString())
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#0070BA] to-[#009CDE] rounded-full flex items-center justify-center">
                            <ArrowUpDown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Token Operations</CardTitle>
                            <CardDescription>
                                Convert between PYUSD and PYUSDx SuperToken (Direct Wallet)
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                        <Zap className="mr-1 h-3 w-3" />
                        Instant
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Operation Toggle */}
                    <div className="flex items-center justify-center">
                        <div className="flex items-center bg-muted rounded-lg p-1">
                            <Button
                                type="button"
                                variant={operation === 'upgrade' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setOperation('upgrade')}
                                className="flex items-center gap-2"
                            >
                                <ArrowUp className="h-4 w-4" />
                                Upgrade
                            </Button>
                            <Button
                                type="button"
                                variant={operation === 'downgrade' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setOperation('downgrade')}
                                className="flex items-center gap-2"
                            >
                                <ArrowDown className="h-4 w-4" />
                                Downgrade
                            </Button>
                        </div>
                    </div>

                    {/* Token Conversion Display */}
                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{symbol}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium text-[#0070BA]">{targetSymbol}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {operation === 'upgrade' ? 'Enable streaming' : 'Return to base token'}
                            </div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="amount">Amount ({symbol})</Label>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Balance: {maxBalance.toFixed(6)} {symbol}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-[#0070BA] hover:text-[#005A9A]"
                                    onClick={handleMaxClick}
                                    disabled={maxBalance === 0}
                                >
                                    MAX
                                </Button>
                            </div>
                        </div>
                        <Input
                            id="amount"
                            type="number"
                            step="0.000001"
                            min="0"
                            placeholder={`Enter ${symbol} amount`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#0070BA] to-[#009CDE] hover:from-[#005A9A] hover:to-[#007FB8]"
                        disabled={!amount || isLoading || !address || maxBalance === 0}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {operation === 'upgrade' && isUpgradePending ? 'Processing Upgrade...' :
                                    operation === 'upgrade' ? 'Approving & Upgrading...' : 'Downgrading...'}
                            </div>
                        ) : (
                            `${operation === 'upgrade' ? 'Upgrade' : 'Downgrade'} ${symbol}`
                        )}
                    </Button>

                    {/* Operation Info */}
                    <div className="text-xs text-muted-foreground space-y-1">
                        {operation === 'upgrade' ? (
                            <>
                                <div>• Approval + Upgrade executed in 2 transactions</div>
                                <div>• PYUSDx SuperTokens enable streaming capabilities</div>
                                <div>• Transaction executes immediately with your wallet</div>
                            </>
                        ) : (
                            <>
                                <div>• Converts PYUSDx back to regular PYUSD tokens</div>
                                <div>• Single transaction execution</div>
                                <div>• Stop all streams before downgrading</div>
                            </>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}