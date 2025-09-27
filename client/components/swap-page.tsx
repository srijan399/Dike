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
import { PYUSD_SEPOLIA_ADDRESS, SWAP_SEPOLIA_ADDRESS, Swap_ABI, PYUSD_ABI } from "@/app/abi"
import PriceChart from "@/components/price-chart"
import TransactionSummary from "@/components/transaction-summary"

const currencies = [
    { id: "eth", name: "ETH" },
    { id: "pyusd", name: "pyUSD" },
]

export default function SwapPage() {
    const [fromCurrency, setFromCurrency] = useState("eth")
    const [fromAmount, setFromAmount] = useState("")
    const [toAmount, setToAmount] = useState("")
    const [slippage, setSlippage] = useState("0.5")
    const [errorMsg, setErrorMsg] = useState<string>("")
    const { address } = useAccount()
    const isConnected = !!address

    const { data: ethBal } = useBalance({ address })
    const { data: pyusdBal } = useReadContract({
        address: PYUSD_SEPOLIA_ADDRESS as `0x${string}`,
        abi: PYUSD_ABI as any,
        functionName: "balanceOf",
        args: [address ?? zeroAddress],
        query: { enabled: !!address },
    })

    const { data: priceTuple } = useReadContract({
        address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
        abi: Swap_ABI as any,
        functionName: "getEthUsd",
    }) as { data: readonly [bigint, bigint, number] | undefined }

    const { data: reserves } = useReadContract({
        address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
        abi: Swap_ABI as any,
        functionName: "getReserves",
    }) as { data: readonly [bigint, bigint] | undefined }

    const oracleRate = useMemo(() => {
        if (!priceTuple) return 0
        const [price, _conf, expo] = priceTuple
        const expoAbs = Math.abs(expo)
        const pyPerEth = Number(price) / 10 ** expoAbs
        return pyPerEth
    }, [priceTuple])

    const selectedCurrency = currencies.find((c) => c.id === fromCurrency)
    const exchangeRate = oracleRate || 0
    const slipPct = Number(slippage) / 100
    const minReceivePreview = useMemo(() => {
        const out = Number(toAmount || 0)
        if (!out) return "-"
        const min = out * (1 - slipPct)
        return fromCurrency === "eth" ? `${min.toFixed(2)} pyUSD` : `${min.toFixed(6)} ETH`
    }, [toAmount, slipPct, fromCurrency])

    const handleFromAmountChange = (value: string) => {
        setFromAmount(value)
        if (!value) { setToAmount(""); return }
        const v = Number.parseFloat(value || "0")
        if (fromCurrency === "eth") {
            setToAmount((v * exchangeRate).toFixed(2))
        } else {
            // pyUSD -> ETH
            setToAmount((v / (exchangeRate || 1)).toFixed(6))
        }
    }

    const handleMaxClick = () => {
        if (fromCurrency === "eth") {
            const bal = ethBal ? Number(ethBal.formatted) : 0
            const safe = Math.max(0, bal - 0.0002)
            handleFromAmountChange(safe.toString())
        } else {
            const bal = pyusdBal ? Number(pyusdBal as unknown as bigint) / 1e6 : 0
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
        if (fromCurrency === "eth") {
            const ethInWei = parseEther(fromAmount)
            // Simulate to get exact on-chain quote, then apply slippage
            const sim = await publicClient!.simulateContract({
                address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
                abi: Swap_ABI as any,
                functionName: "swapEthForPyUsd",
                args: [BigInt(0), address as `0x${string}`],
                value: ethInWei,
                account: address as `0x${string}`,
            })
            const expected: bigint = sim.result as unknown as bigint
            const bps = Math.round(slip * 10000)
            const minOut = expected - (expected * BigInt(bps)) / BigInt(10000) - BigInt(1)
            const h = await writeContractAsync({
                address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
                abi: Swap_ABI as any,
                functionName: "swapEthForPyUsd",
                args: [minOut, address as `0x${string}`],
                value: ethInWei,
            })
            setTxHash(h as `0x${string}`)
        } else {
            // PYUSD -> ETH flow requires prior PYUSD approve
            const amountPyUsd = parseUnits(fromAmount, 6)
            const sim = await publicClient!.simulateContract({
                address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
                abi: Swap_ABI as any,
                functionName: "swapPyUsdForEth",
                args: [amountPyUsd, BigInt(0), address as `0x${string}`],
                account: address as `0x${string}`,
            })
            const expectedEth: bigint = sim.result as unknown as bigint
            const bps = Math.round(slip * 10000)
            const minEthOut = expectedEth - (expectedEth * BigInt(bps)) / BigInt(10000) - BigInt(1)
            const h = await writeContractAsync({
                address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
                abi: Swap_ABI as any,
                functionName: "swapPyUsdForEth",
                args: [amountPyUsd, minEthOut, address as `0x${string}`],
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
        <div className="min-h-screen bg-background relative">
            {/* Ambient gradient background */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_80%_-20%,rgba(56,189,248,0.15),transparent),radial-gradient(800px_400px_at_10%_0%,rgba(168,85,247,0.12),transparent)]" />
            <div className="relative z-10">
                <div className="container mx-auto px-6 py-8">
                    {/* Page Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold mb-2 tracking-tight bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">Swap</h2>
                        <p className="text-muted-foreground text-lg">Oracle-priced swaps between ETH and pyUSD</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Main Swap Card */}
                        <div className="lg:col-span-2">
                            <Card className="glass-effect border-border/50 cosmic-glow shadow-2xl">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">Swap Assets</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-neon-blue/50 text-neon-blue">Sepolia</Badge>
                                            <Badge variant="outline" className="border-neon-green/50 text-neon-green">Oracle</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* From Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-muted-foreground">From</label>
                                            <span className="text-xs text-muted-foreground">Balance: {fromCurrency === "eth" ? (ethBal ? Number(ethBal.formatted).toFixed(4) : "-") + " ETH" : (pyusdBal ? (Number(pyusdBal as unknown as bigint) / 1e6).toFixed(2) : 0) + " pyUSD"}</span>
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
                                            <div className="text-sm text-muted-foreground text-right">
                                                Est. output: {toAmount || "-"} {fromCurrency === "eth" ? "pyUSD" : "ETH"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Swap Arrow */}
                                    <div className="flex justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                const newFrom = fromCurrency === "eth" ? "pyusd" : "eth"
                                                setFromCurrency(newFrom)
                                                // flip amounts using current rate
                                                if (fromAmount) {
                                                    const v = Number(fromAmount)
                                                    if (newFrom === "eth") {
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
                                            <label className="text-sm font-medium text-muted-foreground">To</label>
                                            <span className="text-xs text-muted-foreground">Balance: {pyusdBal ? (Number(pyusdBal as unknown as bigint) / 1e6).toFixed(2) : 0} pyUSD</span>
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
                                                    className="h-12 text-right text-xl font-semibold bg-secondary/30 border border-border/50 text-muted-foreground rounded-md"
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
                                                {fromCurrency === "eth"
                                                    ? `1 ETH = ${exchangeRate ? exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"} pyUSD`
                                                    : `1 pyUSD = ${exchangeRate ? (1 / exchangeRate).toFixed(6) : "-"} ETH`}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Min received (after slippage)</span>
                                            <span className="font-medium">{minReceivePreview}</span>
                                        </div>

                                        {reserves && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Pool Reserves</span>
                                                <span className="font-medium text-xs">
                                                    {Number(reserves[0]) / 1e18} ETH • {Number(reserves[1]) / 1e6} pyUSD
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Slippage Tolerance</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {["0.1","0.5","1.0","3.0"].map(v => (
                                                        <button key={v} onClick={() => setSlippage(v)} className={`px-2 py-1 text-xs rounded-md border ${slippage===v?"border-neon-blue text-neon-blue":"border-border/50 text-muted-foreground hover:text-foreground"}`}>{v}%</button>
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
                                            <span className="text-muted-foreground">Network Fee</span>
                                            <span className="font-medium">~$2.50</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Route</span>
                                            <span className="font-medium text-xs">{selectedCurrency?.name} → pyUSD</span>
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
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-neon-green" />
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
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Info className="w-5 h-5 text-neon-blue" />
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
        address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
        abi: Swap_ABI as any,
        functionName: "owner",
    }) as { data: `0x${string}` | undefined }

    const { data: isMgr } = useReadContract({
        address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
        abi: Swap_ABI as any,
        functionName: "isLiquidityManager",
        args: [address ?? zeroAddress],
        query: { enabled: !!address },
    }) as { data: boolean | undefined }

    const show = !!address && (owner?.toLowerCase() === address?.toLowerCase() || isMgr)
    const { writeContractAsync, isPending } = useWriteContract()
    const [pyAmount, setPyAmount] = useState("")
    const [ethAmount, setEthAmount] = useState("")

    if (!show) return null

    const addPy = async () => {
        if (!pyAmount) return
        const amt = parseUnits((Number(pyAmount)).toFixed(0), 6)
        console.log("addPy", amt)
        await writeContractAsync({
            address: PYUSD_SEPOLIA_ADDRESS as `0x${string}`,
            abi: PYUSD_ABI as any,
            functionName: "approve",
            args: [SWAP_SEPOLIA_ADDRESS, amt],
        })
        await writeContractAsync({
            address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
            abi: Swap_ABI as any,
            functionName: "addLiquidityPyUsd",
            args: [amt],
        })
    }

    const addEth = async () => {
        if (!ethAmount) return
        await writeContractAsync({
            address: SWAP_SEPOLIA_ADDRESS as `0x${string}`,
            abi: Swap_ABI as any,
            functionName: "addLiquidityEth",
            args: [],
            value: parseEther(ethAmount),
        })
    }

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium">Liquidity (owner/managers)</div>
            <div className="flex gap-3">
                <Input type="number" placeholder="PYUSD" value={pyAmount} onChange={(e) => setPyAmount(e.target.value)} />
                <Button variant="outline" onClick={addPy} disabled={isPending}>Add PYUSD</Button>
            </div>
            <div className="flex gap-3">
                <Input type="number" placeholder="ETH" value={ethAmount} onChange={(e) => setEthAmount(e.target.value)} />
                <Button variant="outline" onClick={addEth} disabled={isPending}>Add ETH</Button>
            </div>
        </div>
    )
}
