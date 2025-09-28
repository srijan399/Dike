"use client"

import { useReadContract, useWriteContract, useAccount } from "wagmi"
import { DikeAbi, Dike_SEPOLIA_ADDRESS } from "@/app/abi"
import { useMemo } from "react"

// Types for chain data
export interface UserChainData {
    predictionIds: bigint[]
    totalInvested: bigint
    totalClaimed: bigint
}

export interface CollateralPosition {
    parentId: bigint
    totalUsed: bigint
    childIds: bigint[]
    liquidated: boolean
    availableCollateral: bigint
    positionValue: bigint
}

export interface ChainInvestment {
    predictionId: bigint
    parentPredictionId: bigint
    amount: bigint
    side: boolean
    expectedVotes: bigint
    timestamp: bigint
    claimed: boolean
    isCollateralBased: boolean
}

// Hook to get user's chain data
export function useUserChain() {
    const { address } = useAccount()
    
    const { data: chainData, isLoading, error, refetch } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserChain",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })

    const formattedChainData = useMemo(() => {
        if (!chainData) return null
        
        const [predictionIds, totalInvested, totalClaimed] = chainData as [bigint[], bigint, bigint]
        
        return {
            predictionIds,
            totalInvested,
            totalClaimed,
        } as UserChainData
    }, [chainData])

    return {
        chainData: formattedChainData,
        isLoading,
        error,
        refetch,
    }
}

// Hook to get user's parent prediction IDs
export function useUserParentPredictionIds() {
    const { address } = useAccount()
    
    const { data: parentIds, isLoading, error } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserParentPredictionIds",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })

    return {
        parentIds: (parentIds as bigint[]) || [],
        isLoading,
        error,
    }
}

// Hook to get collateral position for a specific parent prediction
export function useUserCollateralPosition(parentPredictionId: bigint | undefined) {
    const { address } = useAccount()
    
    const { data: positionData, isLoading, error } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserCollateralPosition",
        args: address && parentPredictionId ? [address, parentPredictionId] : undefined,
        query: {
            enabled: !!address && !!parentPredictionId,
        },
    })

    const formattedPosition = useMemo(() => {
        if (!positionData) return null
        
        const [parentId, totalUsed, childIds, liquidated, availableCollateral, positionValue] = positionData as [
            bigint,
            bigint,
            bigint[],
            boolean,
            bigint,
            bigint
        ]
        
        return {
            parentId,
            totalUsed,
            childIds,
            liquidated,
            availableCollateral,
            positionValue,
        } as CollateralPosition
    }, [positionData])

    return {
        position: formattedPosition,
        isLoading,
        error,
    }
}

// Hook to get available collateral for a user and parent prediction
export function useAvailableCollateral(parentPredictionId: bigint | undefined) {
    const { address } = useAccount()
    
    const { data: availableCollateral, isLoading, error } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getAvailableCollateral",
        args: address && parentPredictionId ? [address, parentPredictionId] : undefined,
        query: {
            enabled: !!address && !!parentPredictionId,
        },
    })

    return {
        availableCollateral: (availableCollateral as bigint) || BigInt(0),
        isLoading,
        error,
    }
}

// Hook to get all investments for a specific prediction (all users)
export function usePredictionInvestments(predictionId: bigint | undefined) {
    const { data: investments, isLoading, error } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPredictionInvestments",
        args: predictionId ? [predictionId] : undefined,
        query: {
            enabled: !!predictionId,
        },
    })

    const formattedInvestments = useMemo(() => {
        if (!investments) return []
        
        return (investments as any[]).map((investment: any) => ({
            predictionId: investment.predictionId,
            investor: investment.investor,
            amount: investment.amount,
            side: investment.side,
            expectedVotes: investment.expectedVotes,
            timestamp: investment.timestamp,
            claimed: investment.claimed,
            isCollateralBased: investment.isCollateralBased,
            parentPredictionId: investment.parentPredictionId,
        })) as ChainInvestment[]
    }, [investments])

    return {
        investments: formattedInvestments,
        isLoading,
        error,
    }
}

// Hook to get user's investments in a specific prediction
export function useUserInvestmentsInPrediction(predictionId: bigint | undefined) {
    const { address } = useAccount()
    
    const { data: investments, isLoading, error } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserInvestmentsInPrediction",
        args: address && predictionId ? [address, predictionId] : undefined,
        query: {
            enabled: !!address && !!predictionId,
        },
    })

    const formattedInvestments = useMemo(() => {
        if (!investments) return []
        
        return (investments as any[]).map((investment: any) => ({
            predictionId: investment.predictionId,
            amount: investment.amount,
            side: investment.side,
            expectedVotes: investment.expectedVotes,
            timestamp: investment.timestamp,
            claimed: investment.claimed,
            isCollateralBased: investment.isCollateralBased,
            parentPredictionId: investment.parentPredictionId,
        })) as ChainInvestment[]
    }, [investments])

    return {
        investments: formattedInvestments,
        isLoading,
        error,
    }
}

// Hook to check if a position is liquidatable
export function useIsPositionLiquidatable(parentPredictionId: bigint | undefined) {
    const { address } = useAccount()
    
    const { data: isLiquidatable, isLoading, error } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "isPositionLiquidatable",
        args: address && parentPredictionId ? [address, parentPredictionId] : undefined,
        query: {
            enabled: !!address && !!parentPredictionId,
        },
    })

    return {
        isLiquidatable: (isLiquidatable as boolean) || false,
        isLoading,
        error,
    }
}

// Hook to get current position value
export function useCurrentPositionValue(predictionId: bigint | undefined) {
    const { address } = useAccount()
    
    const { data: positionValue, isLoading, error } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getCurrentPositionValue",
        args: address && predictionId ? [address, predictionId] : undefined,
        query: {
            enabled: !!address && !!predictionId,
        },
    })

    return {
        positionValue: (positionValue as bigint) || BigInt(0),
        isLoading,
        error,
    }
}

// Hook for extending chains
export function useExtendChain() {
    const { writeContract, isPending, isSuccess, isError, error, data: hash } = useWriteContract()

    const extendChain = async ({
        parentPredictionId,
        childPredictionId,
        collateralAmount,
        side,
        minExpectedVotes
    }: {
        parentPredictionId: bigint
        childPredictionId: bigint
        collateralAmount: bigint
        side: boolean
        minExpectedVotes: bigint
    }) => {
        return writeContract({
            address: Dike_SEPOLIA_ADDRESS,
            abi: DikeAbi,
            functionName: "extendChain",
            args: [parentPredictionId, childPredictionId, collateralAmount, side, minExpectedVotes],
        })
    }

    return {
        extendChain,
        isPending,
        isSuccess,
        isError,
        error,
        hash,
    }
}

// Hook to get all predictions where user has invested (potential parent chains)
export function useUserInvestedPredictions() {
    const { address } = useAccount()
    const { chainData } = useUserChain()
    
    // Get all predictions where user has invested
    const predictionIds = chainData?.predictionIds || []
    
    // For each prediction, get the user's investments to check if they're direct investments (not collateral-based)
    const investmentQueries = predictionIds.map(predictionId => {
        return useUserInvestmentsInPrediction(predictionId)
    })
    
    const potentialParents = useMemo(() => {
        if (!address || predictionIds.length === 0) return []
        
        const parents: { predictionId: bigint; totalInvestment: bigint; hasDirectInvestment: boolean }[] = []
        
        predictionIds.forEach((predictionId, index) => {
            const query = investmentQueries[index]
            if (query.investments.length > 0) {
                // Check if user has direct investments (not collateral-based) in this prediction
                const directInvestments = query.investments.filter(inv => !inv.isCollateralBased)
                const totalDirectInvestment = directInvestments.reduce((sum, inv) => sum + inv.amount, BigInt(0))
                
                if (directInvestments.length > 0) {
                    parents.push({
                        predictionId,
                        totalInvestment: totalDirectInvestment,
                        hasDirectInvestment: true
                    })
                }
            }
        })
        
        return parents
    }, [address, predictionIds, investmentQueries])
    
    const isLoading = investmentQueries.some(query => query.isLoading)
    
    return {
        potentialParents,
        isLoading,
    }
}
