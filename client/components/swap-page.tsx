"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowUpDown, Settings, Wallet, TrendingUp, Info } from "lucide-react"
import PriceChart from "@/components/price-chart"
import TransactionSummary from "@/components/transaction-summary"

const currencies = [
    // Only ETH supported as an input, swapping into pyUSD
    { id: "eth", name: "ETH", price: 2347.23 },
]

export default function SwapPage() {
    const [fromCurrency, setFromCurrency] = useState("eth")
    const [fromAmount, setFromAmount] = useState("")
    const [toAmount, setToAmount] = useState("")
    const [slippage, setSlippage] = useState("0.5")
    const [isConnected, setIsConnected] = useState(false)

    const selectedCurrency = currencies.find((c) => c.id === fromCurrency)
    const exchangeRate = selectedCurrency?.price || 0

    const handleFromAmountChange = (value: string) => {
        setFromAmount(value)
        if (value && selectedCurrency) {
            const calculated = (Number.parseFloat(value) * selectedCurrency.price).toFixed(2)
            setToAmount(calculated)
        } else {
            setToAmount("")
        }
    }

    const handleMaxClick = () => {
        const maxAmount = "1.5" // Mock max balance
        handleFromAmountChange(maxAmount)
    }

    const handleSwap = () => {
        if (!isConnected) {
            setIsConnected(true)
            return
        }
        // Handle swap logic
        console.log("Executing swap...")
    }

    return (
        <div className="min-h-screen bg-background relative">
            <div className="relative z-10">
                <div className="container mx-auto px-6 py-8">
                    {/* Page Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold mb-2 neon-text text-neon-blue">Swap</h2>
                        <p className="text-muted-foreground text-lg">Swap your assets into pyUSD (pegged to USD)</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Main Swap Card */}
                        <div className="lg:col-span-2">
                            <Card className="glass-effect border-border/50 cosmic-glow">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">Swap Assets</CardTitle>
                                        <Badge variant="outline" className="border-neon-green/50 text-neon-green">
                                            Best Rate
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* From Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-muted-foreground">From</label>
                                            <span className="text-xs text-muted-foreground">Balance: 1.5 ETH</span>
                                        </div>

                                        <div className="flex gap-3 h-12">
                                            <Select value={fromCurrency} onValueChange={setFromCurrency}>
                                                <SelectTrigger className="w-48 bg-secondary/50 border-border/50 hover:border-neon-blue/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border/50">
                                                    {currencies.map((currency) => (
                                                        <SelectItem key={currency.id} value={currency.id}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full" />
                                                                <div className="font-medium">{currency.name}</div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <div className="flex-1 relative">
                                                <Input
                                                    type="number"
                                                    placeholder="0.0"
                                                    value={fromAmount}
                                                    onChange={(e) => handleFromAmountChange(e.target.value)}
                                                    className="h-12 text-right text-xl font-semibold bg-secondary/50 border-border/50 hover:border-neon-blue/50 focus:border-neon-blue pr-16"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={handleMaxClick}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neon-blue hover:text-neon-blue/80 hover:bg-neon-blue/10"
                                                >
                                                    MAX
                                                </Button>
                                            </div>
                                        </div>

                                        {fromAmount && (
                                            <div className="text-sm text-muted-foreground text-right">
                                                ≈ ${(Number.parseFloat(fromAmount) * (selectedCurrency?.price || 0)).toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Swap Arrow */}
                                    <div className="flex justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full w-10 h-10 p-0 border-border/50 hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-300 bg-transparent"
                                        >
                                            <ArrowUpDown className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* To Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-muted-foreground">To</label>
                                            <span className="text-xs text-muted-foreground">Balance: 0 pyUSD</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="w-48 flex items-center gap-2 px-3 py-2 bg-secondary/30 border border-border/50 rounded-md">
                                                <div className="w-6 h-6 bg-gradient-to-r from-neon-green to-neon-blue rounded-full" />
                                                <div>
                                                    <div className="font-medium">pyUSD</div>
                                                    <div className="text-xs text-muted-foreground">PayPal USD</div>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    placeholder="0.0"
                                                    value={toAmount}
                                                    readOnly
                                                    className="h-12 text-right text-xl font-semibold bg-secondary/30 border-border/50 text-muted-foreground"
                                                />
                                            </div>
                                        </div>

                                        {toAmount && (
                                            <div className="text-sm text-muted-foreground text-right">
                                                ≈ ${Number.parseFloat(toAmount).toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="bg-border/50" />

                                    {/* Exchange Rate & Details */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Exchange Rate</span>
                                            <span className="font-medium">
                                                1 {selectedCurrency?.name} = {selectedCurrency?.price.toLocaleString()} pyUSD
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Slippage Tolerance</span>
                                            <div className="flex items-center gap-2">
                                                <Select value={slippage} onValueChange={setSlippage}>
                                                    <SelectTrigger className="w-20 h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0.1">0.1%</SelectItem>
                                                        <SelectItem value="0.5">0.5%</SelectItem>
                                                        <SelectItem value="1.0">1.0%</SelectItem>
                                                        <SelectItem value="3.0">3.0%</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Network Fee</span>
                                            <span className="font-medium">~$2.50</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Route</span>
                                            <span className="font-medium text-xs">{selectedCurrency?.name} → pyUSD</span>
                                        </div>
                                    </div>

                                    {/* Swap Button */}
                                    <Button
                                        onClick={handleSwap}
                                        disabled={!fromAmount || Number.parseFloat(fromAmount) <= 0}
                                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 neon-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {!isConnected ? "Connect Wallet" : "Swap Assets"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Side Panel */}
                        <div className="space-y-6">
                            {/* Price Chart */}
                            <Card className="glass-effect border-border/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-neon-green" />
                                        Price Chart
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PriceChart currency={selectedCurrency} />
                                </CardContent>
                            </Card>

                            {/* Transaction Summary */}
                            <Card className="glass-effect border-border/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Info className="w-5 h-5 text-neon-blue" />
                                        Transaction Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TransactionSummary
                                        fromAmount={fromAmount}
                                        fromCurrency={selectedCurrency}
                                        toAmount={toAmount}
                                        slippage={slippage}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
