"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useUserChain, useUserParentPredictionIds, useUserCollateralPosition, useUserInvestmentsInPrediction } from "@/hooks/useChain"
import { useReadContract } from "wagmi"
import { DikeAbi, Dike_SEPOLIA_ADDRESS } from "@/app/abi"
import { formatUnits } from "viem"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, DollarSign, Target, Link as LinkIcon } from "lucide-react"

interface ChainVisualizationProps {
    onSelectPrediction?: (predictionId: string) => void
}

export function ChainVisualization({ onSelectPrediction }: ChainVisualizationProps) {
    const { chainData, isLoading: isChainLoading } = useUserChain()
    const { parentIds, isLoading: isParentLoading } = useUserParentPredictionIds()

    const formatPyUSD = (amount: bigint): string => {
        return `${Number(formatUnits(amount, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 })} PYUSD`
    }

    const formatDate = (timestamp: bigint): string => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isChainLoading || isParentLoading) {
        return (
            <Card className="galaxy-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        Your Investment Chains
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="ml-2 text-muted-foreground">Loading chains...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!chainData || chainData.predictionIds.length === 0) {
        return (
            <Card className="galaxy-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        Your Investment Chains
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No investment chains found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Start investing in predictions to build your chains
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Chain Overview */}
            <Card className="galaxy-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        Your Investment Chains
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-card/50 rounded-lg border">
                            <div className="text-2xl font-bold text-primary">
                                {chainData.predictionIds.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Active Positions</div>
                        </div>
                        <div className="text-center p-4 bg-card/50 rounded-lg border">
                            <div className="text-2xl font-bold text-accent">
                                {formatPyUSD(chainData.totalInvested)}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Invested</div>
                        </div>
                        <div className="text-center p-4 bg-card/50 rounded-lg border">
                            <div className="text-2xl font-bold text-chart-4">
                                {formatPyUSD(chainData.totalClaimed)}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Claimed</div>
                        </div>
                    </div>

                    {/* Parent Predictions (Chain Roots) */}
                    {parentIds.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Chain Roots</h3>
                            <div className="grid gap-4">
                                {parentIds.map((parentId) => (
                                    <ParentPredictionCard 
                                        key={parentId.toString()} 
                                        parentId={parentId}
                                        onSelectPrediction={onSelectPrediction}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator className="my-6" />

                    {/* All Chain Positions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">All Chain Positions</h3>
                        <div className="grid gap-3">
                            {chainData.predictionIds.map((predictionId) => (
                                <ChainPositionCard 
                                    key={predictionId.toString()} 
                                    predictionId={predictionId}
                                    onSelectPrediction={onSelectPrediction}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ParentPredictionCard({ parentId, onSelectPrediction }: { 
    parentId: bigint
    onSelectPrediction?: (predictionId: string) => void 
}) {
    const { position, isLoading } = useUserCollateralPosition(parentId)
    
    const { data: predictionData } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPrediction",
        args: [parentId],
    })

    const formatPyUSD = (amount: bigint): string => {
        return `${Number(formatUnits(amount, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 })} PYUSD`
    }

    if (isLoading || !position || !predictionData) {
        return (
            <Card className="border-l-4 border-l-primary/50">
                <CardContent className="p-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const prediction = predictionData as any

    return (
        <Card className={`border-l-4 ${position.liquidated ? 'border-l-destructive' : 'border-l-primary'} hover:shadow-lg transition-shadow cursor-pointer`}
              onClick={() => onSelectPrediction?.(parentId.toString())}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{prediction.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Badge variant="outline" className="text-xs">
                                Root Chain #{parentId.toString()}
                            </Badge>
                            {position.liquidated && (
                                <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Liquidated
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-muted-foreground">Used Collateral:</span>
                                <div className="font-medium">{formatPyUSD(position.totalUsed)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Available:</span>
                                <div className="font-medium text-green-600">{formatPyUSD(position.availableCollateral)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Position Value</div>
                        <div className="font-bold text-sm">{formatPyUSD(position.positionValue)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {position.childIds.length} child positions
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ChainPositionCard({ predictionId, onSelectPrediction }: { 
    predictionId: bigint
    onSelectPrediction?: (predictionId: string) => void 
}) {
    const { investments, isLoading: isInvestmentsLoading } = useUserInvestmentsInPrediction(predictionId)
    
    const { data: predictionData } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPrediction",
        args: [predictionId],
    })

    const formatPyUSD = (amount: bigint): string => {
        return `${Number(formatUnits(amount, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 })} PYUSD`
    }

    const formatDate = (timestamp: bigint): string => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    if (isInvestmentsLoading || !predictionData) {
        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                    <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const prediction = predictionData as any
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, BigInt(0))
    const hasCollateralBased = investments.some(inv => inv.isCollateralBased)
    const yesInvestments = investments.filter(inv => inv.side)
    const noInvestments = investments.filter(inv => !inv.side)

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectPrediction?.(predictionId.toString())}>
            <CardContent className="p-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h5 className="font-medium text-sm mb-1">{prediction.title}</h5>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Badge variant="outline" className="text-xs">
                                #{predictionId.toString()}
                            </Badge>
                            {hasCollateralBased && (
                                <Badge variant="secondary" className="text-xs">
                                    <LinkIcon className="w-3 h-3 mr-1" />
                                    Chained
                                </Badge>
                            )}
                            {prediction.resolved && (
                                <Badge variant={prediction.outcome ? "default" : "secondary"} className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {prediction.outcome ? "Yes Won" : "No Won"}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            {yesInvestments.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600">
                                        {formatPyUSD(yesInvestments.reduce((sum, inv) => sum + inv.amount, BigInt(0)))}
                                    </span>
                                </div>
                            )}
                            {noInvestments.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                    <span className="text-red-600">
                                        {formatPyUSD(noInvestments.reduce((sum, inv) => sum + inv.amount, BigInt(0)))}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-sm">{formatPyUSD(totalInvested)}</div>
                        <div className="text-xs text-muted-foreground">
                            {investments.length} position{investments.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatDate(BigInt(prediction.resolutionDate))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
