"use client"

import React, { useState, useMemo } from "react"
import { X, GitBranch, Zap, ArrowRight, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserChain, useUserParentPredictionIds, useUserCollateralPosition, useExtendChain, useUserInvestedPredictions, useUserInvestmentsInPrediction, useCurrentPositionValue } from "@/hooks/useChain"
import { useReadContract, useAccount } from "wagmi"
import { DikeAbi, Dike_SEPOLIA_ADDRESS } from "@/app/abi"
import { formatUnits } from "viem"

interface BranchingModalProps {
    opportunity: {
        id: string
        title: string
        description: string
        category: string
        potentialPayout: string
    }
    onClose: () => void
    onConfirm: (parentPredictionId: string, collateralAmount: string) => void
}

interface ChainBranch {
    id: string
    name: string
    availableCollateral: string
    positionValue: string
    childCount: number
    isLiquidatable: boolean
}

export function BranchingModal({ opportunity, onClose, onConfirm }: BranchingModalProps) {
    const [selectedParent, setSelectedParent] = useState<string>("")
    const [collateralAmount, setCollateralAmount] = useState<string>("")
    const [selectedSide, setSelectedSide] = useState<"yes" | "no" | "">("")
    const [minExpectedVotes, setMinExpectedVotes] = useState<string>("")
    
    // Get user's invested predictions (potential parent chains)
    const { potentialParents, isLoading: isParentLoading } = useUserInvestedPredictions()
    
    // Chain extension hook
    const { extendChain, isPending: isExtending, isSuccess, isError, error } = useExtendChain()
    
    // Create a component to fetch individual parent prediction data
    const ParentPredictionData = ({ parentId }: { parentId: bigint }) => {
        const { position } = useUserCollateralPosition(parentId)
        const { data: predictionData } = useReadContract({
            address: Dike_SEPOLIA_ADDRESS,
            abi: DikeAbi,
            functionName: "getPrediction",
            args: [parentId],
        })
        
        return { position, predictionData }
    }
    
    // Format available chains for dropdown
    const availableChains = useMemo(() => {
        if (!potentialParents || potentialParents.length === 0) return []
        
        return potentialParents.map((parent) => ({
            id: parent.predictionId.toString(),
            predictionId: parent.predictionId,
            totalInvestment: parent.totalInvestment
        }))
    }, [potentialParents])
    
    const formatPyUSD = (amount: bigint): string => {
        return `${Number(formatUnits(amount, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 })} PYUSD`
    }

    const handleConfirm = async () => {
        if (!selectedParent || !collateralAmount || !selectedSide) return

        try {
            const parentPredictionId = BigInt(selectedParent)
            const childPredictionId = BigInt(opportunity.id)
            const collateralAmountBigInt = BigInt(Math.floor(parseFloat(collateralAmount) * 1000000)) // Convert to 6 decimals
            const side = selectedSide === "yes"
            const minExpectedVotesBigInt = minExpectedVotes ? BigInt(Math.floor(parseFloat(minExpectedVotes) * 1000000)) : BigInt(0)

            await extendChain({
                parentPredictionId,
                childPredictionId,
                collateralAmount: collateralAmountBigInt,
                side,
                minExpectedVotes: minExpectedVotesBigInt
            })

            // Don't close immediately, let the success state handle it
        } catch (error) {
            console.error("Failed to extend chain:", error)
        }
    }

    // Handle success
    React.useEffect(() => {
        if (isSuccess) {
            onConfirm(selectedParent, collateralAmount)
            onClose()
        }
    }, [isSuccess, selectedParent, collateralAmount, onConfirm, onClose])

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl galaxy-border cosmic-glow">
                <div>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-primary" />
                                Branch Into New Reality
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Connect this opportunity to one of your active verses to create a new branch in the multiverse.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Opportunity Preview */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-accent" />
                                Opportunity
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{opportunity.category}</Badge>
                                    <Badge className="bg-primary/20 text-primary">{opportunity.potentialPayout}</Badge>
                                </div>
                                <h4 className="font-medium text-balance">{opportunity.title}</h4>
                                <p className="text-sm text-muted-foreground text-pretty">{opportunity.description}</p>
                            </div>
                        </div>

                        {/* Chain Selection */}
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                Select Parent Chain
                            </h3>
                            {isParentLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading chains...</span>
                                </div>
                            ) : availableChains.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-medium mb-2">No parent chains available for branching</p>
                                    <p className="text-sm">You need to create some investments first to enable chain branching.</p>
                                    <p className="text-sm mt-2">
                                        <strong>How to create a parent chain:</strong>
                                    </p>
                                    <ol className="text-sm mt-2 text-left max-w-md mx-auto space-y-1">
                                        <li>1. Invest in any prediction market</li>
                                        <li>2. Your investment becomes a "parent chain"</li>
                                        <li>3. Use that investment's collateral to branch into new predictions</li>
                                    </ol>
                                </div>
                            ) : (
                                <Select value={selectedParent} onValueChange={setSelectedParent}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a parent chain to branch from..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableChains.map((chain) => (
                                            <InvestedPredictionItem 
                                                key={chain.id} 
                                                predictionId={chain.predictionId}
                                                totalInvestment={chain.totalInvestment}
                                            />
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Collateral Amount Input */}
                        {selectedParent && (
                            <div className="space-y-3">
                                <h3 className="font-semibold">Collateral Amount</h3>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        placeholder="Enter PYUSD amount"
                                        value={collateralAmount}
                                        onChange={(e) => setCollateralAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                                        min="0"
                                        step="0.01"
                                    />
                                    <SelectedInvestmentInfo predictionId={BigInt(selectedParent)} />
                                </div>
                            </div>
                        )}

                        {/* Side Selection */}
                        {selectedParent && collateralAmount && (
                            <div className="space-y-3">
                                <h3 className="font-semibold">Choose Your Position</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant={selectedSide === "yes" ? "default" : "outline"}
                                        className={`h-16 flex flex-col gap-1 ${
                                            selectedSide === "yes" 
                                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                                : "hover:bg-green-500/20 hover:border-green-500/50"
                                        }`}
                                        onClick={() => setSelectedSide("yes")}
                                    >
                                        <span className="text-lg font-bold">YES</span>
                                        <span className="text-xs opacity-80">Predict outcome will happen</span>
                                    </Button>
                                    <Button
                                        variant={selectedSide === "no" ? "default" : "outline"}
                                        className={`h-16 flex flex-col gap-1 ${
                                            selectedSide === "no" 
                                                ? "bg-red-600 hover:bg-red-700 text-white" 
                                                : "hover:bg-red-500/20 hover:border-red-500/50"
                                        }`}
                                        onClick={() => setSelectedSide("no")}
                                    >
                                        <span className="text-lg font-bold">NO</span>
                                        <span className="text-xs opacity-80">Predict outcome won't happen</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Min Expected Votes (Optional) */}
                        {selectedParent && collateralAmount && selectedSide && (
                            <div className="space-y-3">
                                <h3 className="font-semibold">Min Expected Votes (Optional)</h3>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        placeholder="Minimum expected votes (slippage protection)"
                                        value={minExpectedVotes}
                                        onChange={(e) => setMinExpectedVotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                                        min="0"
                                        step="0.01"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty for no slippage protection. This sets the minimum votes you expect to receive.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Branch Preview */}
                        {selectedParent && collateralAmount && selectedSide && (
                            <BranchPreview 
                                parentId={BigInt(selectedParent)} 
                                collateralAmount={collateralAmount}
                                selectedSide={selectedSide}
                                opportunity={opportunity}
                            />
                        )}

                        {/* Error Display */}
                        {isError && error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-destructive text-sm font-medium">Transaction Failed</p>
                                <p className="text-destructive text-xs mt-1">
                                    {error.message || "Failed to extend chain. Please try again."}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleConfirm} 
                                disabled={!selectedParent || !collateralAmount || !selectedSide || isExtending || availableChains.length === 0} 
                                className="flex-1 cosmic-glow"
                            >
                                {isExtending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                        Extending Chain...
                                    </div>
                                ) : isSuccess ? (
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        Chain Extended!
                                    </div>
                                ) : (
                                    <>
                                        <GitBranch className="w-4 h-4 mr-2" />
                                        Extend Chain
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </div>
    )
}

// Helper component for invested prediction dropdown items
function InvestedPredictionItem({ 
    predictionId, 
    totalInvestment 
}: { 
    predictionId: bigint
    totalInvestment: bigint 
}) {
    const { data: predictionData } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPrediction",
        args: [predictionId],
    })

    const formatPyUSD = (amount: bigint): string => {
        return `${Number(formatUnits(amount, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 })} PYUSD`
    }

    if (!predictionData) {
        return (
            <SelectItem value={predictionId.toString()}>
                <div className="flex items-center justify-between w-full">
                    <span>Loading...</span>
                </div>
            </SelectItem>
        )
    }

    const prediction = predictionData as any

    return (
        <SelectItem value={predictionId.toString()}>
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                    <span className="font-medium">{prediction.title}</span>
                    <span className="text-xs text-muted-foreground">
                        #{predictionId.toString()} • Your investment
                    </span>
                </div>
                <div className="text-right ml-4">
                    <div className="text-sm font-medium text-blue-600">
                        {formatPyUSD(totalInvestment)}
                    </div>
                    <div className="text-xs text-muted-foreground">invested</div>
                </div>
            </div>
        </SelectItem>
    )
}

// Helper component for selected investment info
function SelectedInvestmentInfo({ predictionId }: { predictionId: bigint }) {
    const { address } = useAccount()
    const { investments } = useUserInvestmentsInPrediction(predictionId)
    const { positionValue } = useCurrentPositionValue(predictionId)

    const formatPyUSD = (amount: bigint): string => {
        return `${Number(formatUnits(amount, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 })} PYUSD`
    }

    if (!address || investments.length === 0) return null

    // Calculate total direct investment (non-collateral based)
    const directInvestments = investments.filter(inv => !inv.isCollateralBased)
    const totalDirectInvestment = directInvestments.reduce((sum, inv) => sum + inv.amount, BigInt(0))
    
    // Check if this investment can be used as collateral (has direct investment)
    const canUseAsCollateral = directInvestments.length > 0

    return (
        <div className="p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-muted-foreground">Your Investment:</span>
                    <div className="font-medium text-blue-600">{formatPyUSD(totalDirectInvestment)}</div>
                </div>
                <div>
                    <span className="text-muted-foreground">Current Value:</span>
                    <div className="font-medium">{formatPyUSD(positionValue)}</div>
                </div>
            </div>
            {!canUseAsCollateral && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                    ⚠️ This investment cannot be used as collateral (no direct investments found)
                </div>
            )}
            {canUseAsCollateral && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                    ✅ This investment can be used as collateral for chain extension
                </div>
            )}
        </div>
    )
}

// Helper component for branch preview
function BranchPreview({ 
    parentId, 
    collateralAmount, 
    selectedSide,
    opportunity 
}: { 
    parentId: bigint
    collateralAmount: string
    selectedSide: "yes" | "no"
    opportunity: { title: string; category: string }
}) {
    const { position } = useUserCollateralPosition(parentId)
    const { data: predictionData } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPrediction",
        args: [parentId],
    })

    if (!position || !predictionData) return null

    const prediction = predictionData as any
    const collateralAmountBigInt = BigInt(Math.floor(parseFloat(collateralAmount || "0") * 1000000)) // Convert to 6 decimals
    const isValidAmount = collateralAmountBigInt > 0 && collateralAmountBigInt <= position.availableCollateral

    return (
        <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="font-semibold mb-4">Branch Preview</h3>
            <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2 cosmic-glow-accent">
                        <LinkIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-sm font-medium">{prediction.title}</div>
                    <div className="text-xs text-muted-foreground">{position.childIds.length} existing branches</div>
                </div>

                <ArrowRight className="w-6 h-6 text-muted-foreground" />

                <div className="text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-2 pulse-glow">
                        <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-sm font-medium">New Branch</div>
                    <div className="text-xs text-muted-foreground">{opportunity.category}</div>
                </div>
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded text-center">
                <div className="text-sm text-muted-foreground">
                    Using {collateralAmount} PYUSD collateral to branch into:
                </div>
                <div className="font-medium mt-1 text-balance">"{opportunity.title}"</div>
                <div className="mt-2">
                    <Badge 
                        variant="outline" 
                        className={`${selectedSide === "yes" ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}`}
                    >
                        {selectedSide.toUpperCase()} Position
                    </Badge>
                </div>
                {!isValidAmount && collateralAmount && (
                    <div className="mt-2 text-sm text-destructive">
                        ⚠️ Amount exceeds available collateral
                    </div>
                )}
            </div>
        </div>
    )
}
