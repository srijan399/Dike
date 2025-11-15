"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowUpDown, Settings, Wallet, TrendingUp, Info, Loader2 } from "lucide-react"
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { parseEther, parseUnits, zeroAddress } from "viem"
import { USDC_BNB_TESTNET_ADDRESS, SWAP_BNB_TESTNET_ADDRESS, Swap_ABI, PYUSD_ABI } from "@/app/abi"
import PriceChart from "@/components/price-chart"
import TransactionSummary from "@/components/transaction-summary"

const currencies = [
    { id: "bnb", name: "BNB" },
    { id: "usdc", name: "USDC" },
]

export default function SwapPage() {
    const [fromCurrency, setFromCurrency] = useState("bnb")
    const [fromAmount, setFromAmount] = useState("")
    const [toAmount, setToAmount] = useState("")
    const [slippage, setSlippage] = useState("0.5")
    const [errorMsg, setErrorMsg] = useState<string>("")
    const { address } = useAccount()
    const isConnected = !!address

    const { data: bnbBal } = useBalance({ address })
    const { data: usdcBal } = useReadContract({
        address: USDC_BNB_TESTNET_ADDRESS as `0x${string}`,
        abi: PYUSD_ABI as any, // USDC uses same ABI as PYUSD (standard ERC20)
        functionName: "balanceOf",
        args: [address ?? zeroAddress],
        query: { enabled: !!address },
    })

    const { data: priceTuple } = useReadContract({
        address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
        abi: Swap_ABI as any,
        functionName: "getBnbUsd",
    }) as { data: readonly [bigint, bigint] | undefined }

    const { data: reserves } = useReadContract({
        address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
        abi: Swap_ABI as any,
        functionName: "getReserves",
    }) as { data: readonly [bigint, bigint] | undefined }

    const oracleRate = useMemo(() => {
        if (!priceTuple) return 0
        const [price] = priceTuple
        // Chainlink price has 8 decimals, convert to human-readable
        const usdcPerBnb = Number(price) / 1e8
        return usdcPerBnb
    }, [priceTuple])

    const selectedCurrency = currencies.find((c) => c.id === fromCurrency)
    const exchangeRate = oracleRate || 0
    const slipPct = Number(slippage) / 100
    const minReceivePreview = useMemo(() => {
        const out = Number(toAmount || 0)
        if (!out) return "-"
        const min = out * (1 - slipPct)
        return fromCurrency === "bnb" ? `${min.toFixed(2)} USDC` : `${min.toFixed(6)} BNB`
    }, [toAmount, slipPct, fromCurrency])

    const handleFromAmountChange = (value: string) => {
        setFromAmount(value)
        if (!value) { setToAmount(""); return }
        const v = Number.parseFloat(value || "0")
        if (fromCurrency === "bnb") {
            setToAmount((v * exchangeRate).toFixed(2))
        } else {
            // USDC -> BNB
            setToAmount((v / (exchangeRate || 1)).toFixed(6))
        }
    }

    const handleMaxClick = () => {
        if (fromCurrency === "bnb") {
            const bal = bnbBal ? Number(bnbBal.formatted) : 0
            const safe = Math.max(0, bal - 0.0002)
            handleFromAmountChange(safe.toString())
        } else {
            const bal = usdcBal ? Number(usdcBal as unknown as bigint) / 1e6 : 0
            handleFromAmountChange(bal.toString())
        }
    }

    const { writeContractAsync, isPending } = useWriteContract()
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
    const { isSuccess: txSuccess, isLoading: waitingTx } = useWaitForTransactionReceipt({ hash: txHash })
    const publicClient = usePublicClient()

    const handleSwap = async () => {
        if (!isConnected || !fromAmount) return
        const slip = Number(slippage) / 100
        setErrorMsg("")
        try {
        if (fromCurrency === "bnb") {
            const bnbInWei = parseEther(fromAmount)
            // Simulate to get exact on-chain quote, then apply slippage
            const sim = await publicClient!.simulateContract({
                address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
                abi: Swap_ABI as any,
                functionName: "swapBnbForUsdc",
                args: [BigInt(0), address as `0x${string}`],
                value: bnbInWei,
                account: address as `0x${string}`,
            })
            const expected: bigint = sim.result as unknown as bigint
            const bps = Math.round(slip * 10000)
            const minOut = expected - (expected * BigInt(bps)) / BigInt(10000) - BigInt(1)
            const h = await writeContractAsync({
                address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
                abi: Swap_ABI as any,
                functionName: "swapBnbForUsdc",
                args: [minOut, address as `0x${string}`],
                value: bnbInWei,
            })
            setTxHash(h as `0x${string}`)
        } else {
            // USDC -> BNB flow requires prior USDC approve
            const amountUsdc = parseUnits(fromAmount, 6)
            const sim = await publicClient!.simulateContract({
                address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
                abi: Swap_ABI as any,
                functionName: "swapUsdcForBnb",
                args: [amountUsdc, BigInt(0), address as `0x${string}`],
                account: address as `0x${string}`,
            })
            const expectedBnb: bigint = sim.result as unknown as bigint
            const bps = Math.round(slip * 10000)
            const minBnbOut = expectedBnb - (expectedBnb * BigInt(bps)) / BigInt(10000) - BigInt(1)
            const h = await writeContractAsync({
                address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
                abi: Swap_ABI as any,
                functionName: "swapUsdcForBnb",
                args: [amountUsdc, minBnbOut, address as `0x${string}`],
            })
            setTxHash(h as `0x${string}`)
        }
        } catch (e: any) {
            console.error("swap failed", e)
            setErrorMsg(e?.shortMessage || e?.message || "Swap failed")
            setTxHash(undefined)
        }
    }

    return (
        <div className="min-h-screen relative">
            {/* Ambient gradient background */}
            {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_80%_-20%,rgba(56,189,248,0.15),transparent),radial-gradient(800px_400px_at_10%_0%,rgba(168,85,247,0.12),transparent)]" /> */}
            <div className="relative z-10">
                <div className="container mx-auto px-6 py-8">
                    {/* Page Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold mb-2 tracking-tight bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">Swap</h2>
                        <p className="text-cyan-100 text-lg">Oracle-priced swaps between BNB and USDC</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Main Swap Card */}
                        <div className="lg:col-span-2">
                            <Card className="glass-effect border-border/50 cosmic-glow shadow-2xl">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl text-white">Swap Assets</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-neon-blue/50 text-neon-blue">BNB Chain</Badge>
                                            <Badge variant="outline" className="border-neon-green/50 text-neon-green">Chainlink</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* From Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-yellow-200">From</label>
                                            <span className="text-xs text-cyan-100">Balance: {fromCurrency === "bnb" ? (bnbBal ? Number(bnbBal.formatted).toFixed(4) : "-") + " BNB" : (usdcBal ? (Number(usdcBal as unknown as bigint) / 1e6).toFixed(2) : 0) + " USDC"}</span>
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
                                                    className="h-12 text-right text-xl font-semibold bg-secondary/50 border border-border/50 hover:border-neon-blue/50 focus:border-neon-blue pr-16 rounded-md"
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
                                            <div className="text-sm text-cyan-100 text-right">
                                                Est. output: {toAmount || "-"} {fromCurrency === "bnb" ? "USDC" : "BNB"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Swap Arrow */}
                                    <div className="flex justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                const newFrom = fromCurrency === "bnb" ? "usdc" : "bnb"
                                                setFromCurrency(newFrom)
                                                // flip amounts using current rate
                                                if (fromAmount) {
                                                    const v = Number(fromAmount)
                                                    if (newFrom === "bnb") {
                                                        setFromAmount((Number(toAmount || "0") / (exchangeRate || 1)).toString())
                                                        setToAmount(fromAmount)
                                                    } else {
                                                        setFromAmount(toAmount)
                                                        setToAmount((v / (exchangeRate || 1)).toFixed(6))
                                                    }
                                                } else {
                                                    setToAmount("")
                                                }
                                            }}
                                            className="rounded-full w-10 h-10 p-0 border-border/50 hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-300 bg-transparent"
                                        >
                                            <ArrowUpDown className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* To Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-yellow-200">To</label>
                                            <span className="text-xs text-cyan-100">Balance: {usdcBal ? (Number(usdcBal as unknown as bigint) / 1e6).toFixed(2) : 0} USDC</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="w-48 flex items-center gap-2 px-3 py-2 bg-secondary/30 border border-border/50 rounded-md">
                                                <div className="w-6 h-6 bg-gradient-to-r from-neon-green to-neon-blue rounded-full" />
                                                <div>
                                                    <div className="font-medium">{fromCurrency === "bnb" ? "USDC" : "BNB"}</div>
                                                    <div className="text-xs text-cyan-100">{fromCurrency === "bnb" ? "USD Coin" : "Binance Coin"}</div>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    placeholder="0.0"
                                                    value={toAmount}
                                                    readOnly
                                                    className="h-12 text-right text-xl font-semibold bg-secondary/30 border border-border/50 text-white rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {toAmount && (
                                            <div className="text-sm text-cyan-100 text-right">
                                                ≈ ${Number.parseFloat(toAmount).toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="bg-border/50" />

                                    {/* Exchange Rate & Details */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-yellow-200">Exchange Rate</span>
                                            <span className="font-medium text-white">
                                                {fromCurrency === "bnb"
                                                    ? `1 BNB = ${exchangeRate ? exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"} USDC`
                                                    : `1 USDC = ${exchangeRate ? (1 / exchangeRate).toFixed(6) : "-"} BNB`}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-yellow-200">Min received (after slippage)</span>
                                            <span className="font-medium text-white">{minReceivePreview}</span>
                                        </div>

                                        {reserves && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-yellow-200">Pool Reserves</span>
                                                <span className="font-medium text-white text-xs">
                                                    {Number(reserves[0]) / 1e18} BNB • {Number(reserves[1]) / 1e6} USDC
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-yellow-200">Slippage Tolerance</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {["0.1","0.5","1.0","3.0"].map(v => (
                                                        <button key={v} onClick={() => setSlippage(v)} className={`px-2 py-1 text-xs rounded-md border ${slippage===v?"border-yellow-400 text-yellow-300":"border-white/30 text-cyan-100 hover:text-white"}`}>{v}%</button>
                                                    ))}
                                                </div>
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
                                            <span className="text-yellow-200">Network Fee</span>
                                            <span className="font-medium text-white">~$2.50</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-yellow-200">Route</span>
                                            <span className="font-medium text-white text-xs">{selectedCurrency?.name} → {fromCurrency === "bnb" ? "USDC" : "BNB"}</span>
                                        </div>
                                    </div>

                                    {/* Error message */}
                                    {errorMsg && (
                                        <div className="text-xs rounded-md border border-red-500/40 bg-red-500/10 text-red-400 px-3 py-2">
                                            {errorMsg}
                                        </div>
                                    )}

                                    {/* Liquidity Actions (visible if owner or liquidity manager) */}
                                    {/* Owner/manager detection */}
                                    {/* Simple inline queries */}
                                    {/* Note: UI hides actions when not eligible */}
                                    <LiquiditySection address={address} />

                                    {/* Swap Button (sticky to always visible) */}
                                    <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-background/80 to-transparent backdrop-blur rounded-b-md">
                                        <Button
                                            onClick={handleSwap}
                                            disabled={!fromAmount || Number.parseFloat(fromAmount) <= 0}
                                            className="w-full h-12 text-lg text-white font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 neon-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            {!isConnected ? "Connect Wallet" : isPending || waitingTx ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{isPending?"Confirm in wallet...":"Swapping..."}</span>) : txSuccess ? "Swapped" : "Swap"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Side Panel */}
                        <div className="space-y-6">
                            {/* Price Chart */}
                            <Card className="glass-effect border-border/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                                        <TrendingUp className="w-5 h-5 text-yellow-300" />
                                        Price Chart
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PriceChart currency={{ name: selectedCurrency?.name || "ETH", price: exchangeRate }} />
                                </CardContent>
                            </Card>

                            {/* Transaction Summary */}
                            <Card className="glass-effect border-border/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                                        <Info className="w-5 h-5 text-yellow-300" />
                                        Transaction Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TransactionSummary
                                        fromAmount={fromAmount}
                                        fromCurrency={{ name: selectedCurrency?.name || "ETH", price: exchangeRate }}
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

function LiquiditySection({ address }: { address?: `0x${string}` }) {
    const { data: owner } = useReadContract({
        address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
        abi: Swap_ABI as any,
        functionName: "owner",
    }) as { data: `0x${string}` | undefined }

    const { data: isMgr } = useReadContract({
        address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
        abi: Swap_ABI as any,
        functionName: "isLiquidityManager",
        args: [address ?? zeroAddress],
        query: { enabled: !!address },
    }) as { data: boolean | undefined }

    const show = !!address && (owner?.toLowerCase() === address?.toLowerCase() || isMgr)
    const { writeContractAsync, isPending } = useWriteContract()
    const [usdcAmount, setUsdcAmount] = useState("")
    const [bnbAmount, setBnbAmount] = useState("")

    if (!show) return null

    const addUsdc = async () => {
        if (!usdcAmount) return
        const amt = parseUnits((Number(usdcAmount)).toFixed(0), 6)
        console.log("addUsdc", amt)
        await writeContractAsync({
            address: USDC_BNB_TESTNET_ADDRESS as `0x${string}`,
            abi: PYUSD_ABI as any, // USDC uses same ABI as PYUSD (standard ERC20)
            functionName: "approve",
            args: [SWAP_BNB_TESTNET_ADDRESS, amt],
        })
        await writeContractAsync({
            address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
            abi: Swap_ABI as any,
            functionName: "addLiquidityUsdc",
            args: [amt],
        })
    }

    const addBnb = async () => {
        if (!bnbAmount) return
        await writeContractAsync({
            address: SWAP_BNB_TESTNET_ADDRESS as `0x${string}`,
            abi: Swap_ABI as any,
            functionName: "addLiquidityBnb",
            args: [],
            value: parseEther(bnbAmount),
        })
    }

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium">Liquidity (owner/managers)</div>
            <div className="flex gap-3">
                <Input type="number" placeholder="USDC" value={usdcAmount} onChange={(e) => setUsdcAmount(e.target.value)} />
                <Button variant="outline" onClick={addUsdc} disabled={isPending}>Add USDC</Button>
            </div>
            <div className="flex gap-3">
                <Input type="number" placeholder="BNB" value={bnbAmount} onChange={(e) => setBnbAmount(e.target.value)} />
                <Button variant="outline" onClick={addBnb} disabled={isPending}>Add BNB</Button>
            </div>
        </div>
    )
}
