"use client"

import { useEffect, useMemo, useState } from "react"
import { useReadContract } from "wagmi"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OpportunityCard } from "@/components/opportunity-card"
import { BranchingModal } from "@/components/branching-modal"
import { PredictionDetailsModal } from "@/components/prediction-details-modal"
import { ChainVisualization } from "@/components/chain-visualization"
import type { Prediction } from "@/app/interfaces/interface"
import usePyUsdBalance from "@/hooks/usePyUsdBalance"
import { useUserChain } from "@/hooks/useChain"
import { DikeAbi, Dike_SEPOLIA_ADDRESS } from "@/app/abi"
import { Search, RefreshCw, Link as LinkIcon } from "lucide-react"

type OpportunityUI = {
    id: string
    title: string
    description: string
    resolutionDate: string
    yesPercentage: number
    noPercentage: number
    totalVotes: number
    category: string
    oracle: string
    potentialPayout: string
    rules: string
}

type IPFSMetadata = {
    title?: string
    category?: string
    description?: string
    tags?: string[]
    image?: string
    createdAt?: number
    version?: string
}

// Removed mock data - now using real chain data from useUserChain hook

export function OpportunitiesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedSort, setSelectedSort] = useState("popularity")
    const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)
    const [showBranchingModal, setShowBranchingModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
    const [showChains, setShowChains] = useState(false)
    const { data: pyusdBalance, isLoading: isPyusdLoading } = usePyUsdBalance()
    const { chainData, isLoading: isChainLoading } = useUserChain()

    const { data: allPredictionsData, isLoading: isPredLoading, isFetching: isPredFetching, refetch: refetchAllPredictions } =
        useReadContract({ address: Dike_SEPOLIA_ADDRESS, abi: DikeAbi, functionName: "getAllPredictions" })

    useEffect(() => {
        const id = setInterval(() => refetchAllPredictions(), 10000)
        return () => clearInterval(id)
    }, [refetchAllPredictions])

    const predictions: Prediction[] = useMemo(() => {
        const arr = (allPredictionsData as any[] | undefined) ?? []
        return arr
            .map((p: any) => {
                try {
                    return {
                        id: Number(p.id),
                        creator: String(p.creator),
                        title: String(p.title),
                        category: String(p.category),
                        metadata: String(p.metadata),
                        resolutionDate: Number(p.resolutionDate),
                        initialLiquidity: Number(p.initialLiquidity),
                        yesLiquidity: Number(p.yesLiquidity),
                        noLiquidity: Number(p.noLiquidity),
                        resolved: Boolean(p.resolved),
                        outcome: Boolean(p.outcome),
                        createdAt: Number(p.createdAt),
                        active: Boolean(p.active),
                    } as Prediction
                } catch {
                    return null
                }
            })
            .filter(Boolean) as Prediction[]
    }, [allPredictionsData])

    // Cache of fetched IPFS metadata by CID string
    const [ipfsMeta, setIpfsMeta] = useState<Record<string, IPFSMetadata | null>>({})

    // Fetch IPFS JSON for unique metadata CIDs present in predictions
    useEffect(() => {
        const cids = Array.from(new Set(predictions.map((p) => String(p.metadata || "").trim()).filter(Boolean)))
        const toFetch = cids.filter((cid) => !(cid in ipfsMeta))
        if (toFetch.length === 0) return

        let cancelled = false
        ;(async () => {
            const entries: Array<[string, IPFSMetadata | null]> = await Promise.all(
                toFetch.map(async (cid) => {
                    try {
                        // Use a public IPFS gateway; could be swapped to your own if needed
                        const res = await fetch(`https://ipfs.io/ipfs/${cid}`)
                        if (!res.ok) return [cid, null] as [string, IPFSMetadata | null]
                        const json = (await res.json()) as IPFSMetadata
                        return [cid, json]
                    } catch {
                        return [cid, null]
                    }
                })
            )
            if (!cancelled) {
                setIpfsMeta((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
            }
        })()

        return () => {
            cancelled = true
        }
    }, [predictions, ipfsMeta])

    const chainOpportunities: OpportunityUI[] = useMemo(() => {
        return predictions.map((pred) => {
            const cid = String(pred.metadata || "").trim()
            const meta = cid ? ipfsMeta[cid] : undefined
            const yes = Math.max(0, Number(pred.yesLiquidity))
            const no = Math.max(0, Number(pred.noLiquidity))
            const total = yes + no
            const yesPct = total > 0 ? Math.round((yes / total) * 100) : 50
            const noPct = 100 - yesPct
            const payout = yesPct > 0 ? 1 / (yesPct / 100) : 0
            const iso = new Date(Number(pred.resolutionDate) * 1000).toISOString()

            return {
                id: String(pred.id),
                title: meta?.title || pred.title,
                description: meta?.description || "",
                resolutionDate: iso,
                yesPercentage: yesPct,
                noPercentage: noPct,
                totalVotes: total,
                category: meta?.category || pred.category || "General",
                oracle: "On-chain",
                potentialPayout: payout ? `${payout.toFixed(2)}x` : "-",
                rules: meta?.description || "",
            }
        })
    }, [predictions, ipfsMeta])

    const filteredOpportunities = chainOpportunities.filter((opportunity) => {
        const matchesSearch =
            opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opportunity.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "all" || opportunity.category.toLowerCase() === selectedCategory
        return matchesSearch && matchesCategory
    })

    const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
        switch (selectedSort) {
            case "popularity":
                return b.totalVotes - a.totalVotes
            case "resolution":
                return new Date(a.resolutionDate).getTime() - new Date(b.resolutionDate).getTime()
            case "payout":
                return Number.parseFloat(b.potentialPayout) - Number.parseFloat(a.potentialPayout)
            default:
                return 0
        }
    })

    return (
        <div className="min-h-screen pt-24">
            <div className="container mx-auto px-6">
                <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/30 shadow-sm">
                    {/* soft, minimal ambient accents */}
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <span className="absolute -top-12 -right-12 h-40 w-40 bg-primary/10 blur-3xl rounded-full" />
                        <span className="absolute -bottom-14 -left-10 h-44 w-44 bg-accent/10 blur-3xl rounded-full" />
                    </div>

                    <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Explore Opportunities</h2>
                            <div className="flex items-center gap-2 md:gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-transparent"
                                    onClick={() => setShowChains(!showChains)}
                                    title="Toggle chain view"
                                >
                                    <span className="inline-flex items-center gap-1 text-xs md:text-sm">
                                        <LinkIcon className="w-3.5 h-3.5" />
                                        {showChains ? 'Hide Chains' : 'Show Chains'}
                                        {chainData && chainData.predictionIds.length > 0 && (
                                            <Badge variant="secondary" className="ml-1 text-xs">
                                                {chainData.predictionIds.length}
                                            </Badge>
                                        )}
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-transparent"
                                    onClick={() => refetchAllPredictions()}
                                    disabled={isPredFetching}
                                    title="Refresh predictions"
                                >
                                    {isPredFetching ? (
                                        <span className="inline-flex items-center gap-2 text-xs md:text-sm">
                                            <span className="w-3 h-3 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                            Refreshing
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs md:text-sm">
                                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 md:mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search opportunities..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-10 w-full bg-input/50 backdrop-blur-sm"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-10 w-full bg-input/50 backdrop-blur-sm">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="politics">Politics</SelectItem>
                                        <SelectItem value="crypto">Crypto</SelectItem>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="stocks">Stocks</SelectItem>
                                        <SelectItem value="space">Space</SelectItem>
                                        <SelectItem value="economics">Economics</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-3">
                                <Select value={selectedSort} onValueChange={setSelectedSort}>
                                    <SelectTrigger className="h-10 w-full bg-input/50 backdrop-blur-sm">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="popularity">Popularity</SelectItem>
                                        <SelectItem value="resolution">Resolution Date</SelectItem>
                                        <SelectItem value="payout">Potential Payout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex">
                <main className={`flex-1 transition-all duration-300 ml-0`}>
                    <div className="container mx-auto px-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card className="galaxy-border">
                                <div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Opportunities</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-primary">
                                            {isPredLoading && !predictions.length ? "Loading..." : predictions.length}
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>

                            <Card className="galaxy-border">
                                <div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Votes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-accent">
                                            {isPredLoading && !predictions.length
                                                ? "Loading..."
                                                : predictions
                                                    .reduce((sum, p) => sum + Math.max(0, Number(p.yesLiquidity) + Number(p.noLiquidity)), 0)
                                                    .toLocaleString()}
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>

                            <Card className="galaxy-border">
                                <div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Your Investments</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-chart-4">
                                            {isChainLoading 
                                                ? "Loading..." 
                                                : chainData?.predictionIds.length || 0
                                            }
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>

                            <Card className="galaxy-border">
                                <div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-chart-5">
                                            {isPyusdLoading
                                                ? "Loading..."
                                                : pyusdBalance?.formatted
                                                    ? `${Number(pyusdBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${pyusdBalance.symbol ?? "PYUSD"}`
                                                    : "Connect wallet"}
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        </div>

                        {/* Chain Visualization Section */}
                        {showChains && (
                            <div className="mb-8">
                                <ChainVisualization 
                                    onSelectPrediction={(predictionId) => {
                                        const pred = predictions.find((p) => String(p.id) === predictionId)
                                        if (pred) {
                                            setSelectedPrediction(pred)
                                            setShowDetailsModal(true)
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {isPredLoading && !predictions.length ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i} className="h-64 animate-pulse bg-muted/30 border-border/40" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {sortedOpportunities.map((opportunity) => (
                                    <OpportunityCard
                                        key={opportunity.id}
                                        opportunity={opportunity}
                                        onViewDetails={(opp) => {
                                            setSelectedOpportunity(opp)
                                            const pred = predictions.find((p) => String(p.id) === String(opp.id))
                                            if (pred) {
                                                setSelectedPrediction(pred)
                                                setShowDetailsModal(true)
                                            }
                                        }}
                                        onBranch={(opp) => {
                                            setSelectedOpportunity(opp)
                                            setShowBranchingModal(true)
                                        }}
                                        hasActiveVerses={true}
                                    />
                                ))}
                            </div>
                        )}

                        {!isPredLoading && sortedOpportunities.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground text-lg">No opportunities found.</div>
                                <Button
                                    variant="outline"
                                    className="mt-4 bg-transparent"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSelectedCategory("all")
                                        setSelectedSort("popularity")
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showBranchingModal && selectedOpportunity && (
                <BranchingModal
                    opportunity={selectedOpportunity}
                    onClose={() => {
                        setShowBranchingModal(false)
                        setSelectedOpportunity(null)
                    }}
                    onConfirm={(parentPredictionId, collateralAmount) => {
                        console.log("Branching opportunity", selectedOpportunity.id, "from parent", parentPredictionId, "with collateral", collateralAmount)
                        // TODO: Implement actual chain extension logic here
                        setShowBranchingModal(false)
                        setSelectedOpportunity(null)
                    }}
                />
            )}

            {showDetailsModal && selectedPrediction && (
                <PredictionDetailsModal
                    prediction={selectedPrediction}
                    onClose={() => {
                        setShowDetailsModal(false)
                        setSelectedPrediction(null)
                    }}
                />
            )}
        </div>
    )
}
