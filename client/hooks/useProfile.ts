import {
    Dike_SEPOLIA_ADDRESS,
    DikeAbi,
    PYUSD_ABI,
    PYUSD_SEPOLIA_ADDRESS,
} from "@/app/abi";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { useEffect, useState } from "react";
import { Prediction } from "@/app/interfaces/interface";

// User Profile Data Interface
export interface UserProfileData {
    address: string;
    totalInvested: bigint;
    totalClaimed: bigint;
    pyusdBalance: bigint;
    ethBalance: bigint;
    allowance: bigint;
    createdPredictions: Prediction[];
    userInvestments: UserInvestment[];
    totalProfitLoss: bigint;
    activePredictions: number;
    resolvedPredictions: number;
}

export interface UserInvestment {
    predictionId: number;
    yesAmount: bigint;
    noAmount: bigint;
    totalAmount: bigint;
    timestamp: number;
    claimed: boolean;
    prediction?: Prediction;
}

export interface UserChainData {
    totalInvested: bigint;
    totalClaimed: bigint;
}

export interface PredictionInvestment {
    investor: string;
    predictionId: number;
    yesAmount: bigint;
    noAmount: bigint;
    timestamp: number;
    claimed: boolean;
}

export interface MarketInvestment {
    predictionId: number;
    investor: string;
    amount: bigint;
    side: boolean; // true for Yes, false for No
    expectedVotes: bigint;
    timestamp: number;
    claimed: boolean;
}

export interface MarketPrices {
    yesPrice: bigint;
    noPrice: bigint;
}

export interface DetailedMarket extends Prediction {
    currentPrices: MarketPrices;
    totalLiquidity: bigint;
    investments: MarketInvestment[];
    userInvestments: MarketInvestment[];
    userTotalInvestment: {
        totalAmount: bigint;
        yesAmount: bigint;
        noAmount: bigint;
    };
}

// Hook to get user's PyUSD balance
export const useUserPyUSDBalance = () => {
    const { address } = useAccount();
    
    const balance = useBalance({
        chainId: 11155111,
        address: address,
        token: PYUSD_SEPOLIA_ADDRESS,
    });

    return { 
        balance: balance.data, 
        isLoading: balance.isLoading, 
        refetch: balance.refetch 
    };
};

// Hook to get user's ETH balance
export const useUserETHBalance = () => {
    const { address } = useAccount();
    
    const balance = useBalance({
        chainId: 11155111,
        address: address,
    });

    return { 
        ethBalance: balance.data, 
        isLoading: balance.isLoading, 
        refetch: balance.refetch 
    };
};

// Hook to get user's PyUSD allowance for Dike contract
export const useUserAllowance = () => {
    const { address } = useAccount();
    
    const { data: allowance, refetch, isLoading } = useReadContract({
        address: PYUSD_SEPOLIA_ADDRESS,
        abi: PYUSD_ABI,
        functionName: "allowance",
        args: address ? [address, Dike_SEPOLIA_ADDRESS] : undefined,
        query: {
            enabled: !!address,
        },
    });

    return { allowance, refetch, isLoading };
};

// Hook to get user's chain data (total invested and claimed)
export const useUserChainData = () => {
    const { address } = useAccount();
    
    const { data: userChain, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserChain",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    return { 
        userChain: userChain as UserChainData | undefined, 
        refetch, 
        isLoading 
    };
};

// Hook to get all predictions created by the user
export const useUserCreatedPredictions = () => {
    const { address } = useAccount();
    const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);

    // Get all predictions first
    const { data: allPredictions, refetch: refetchAllPredictions } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getAllPredictions",
        args: [],
    });

    useEffect(() => {
        if (allPredictions && address) {
            // Filter predictions created by the user
            const filtered = (allPredictions as Prediction[]).filter(
                prediction => prediction.creator.toLowerCase() === address.toLowerCase()
            );
            setUserPredictions(filtered);
        }
    }, [allPredictions, address]);

    return { 
        userPredictions, 
        refetchUserPredictions: refetchAllPredictions,
        isLoading: !allPredictions
    };
};

// Hook to get user's investments in a specific prediction
export const useUserInvestmentsInPrediction = (predictionId: number) => {
    const { address } = useAccount();
    
    const { data: investments, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserInvestmentsInPrediction",
        args: address && predictionId ? [address, predictionId] : undefined,
        query: {
            enabled: !!address && predictionId > 0,
        },
    });

    return { 
        investments: investments as PredictionInvestment[] | undefined, 
        refetch, 
        isLoading 
    };
};

// Hook to get user's total investment in a specific prediction
export const useUserTotalInvestmentInPrediction = (predictionId: number) => {
    const { address } = useAccount();
    
    const { data: totalInvestment, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserTotalInvestmentInPrediction",
        args: address && predictionId ? [address, predictionId] : undefined,
        query: {
            enabled: !!address && predictionId > 0,
        },
    });

    return { 
        totalInvestment: totalInvestment as {yesAmount: bigint, noAmount: bigint} | undefined, 
        refetch, 
        isLoading 
    };
};

// Hook to get all user investments across all predictions
export const useAllUserInvestments = () => {
    const { address } = useAccount();
    const [allInvestments, setAllInvestments] = useState<UserInvestment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // For now, return empty investments - this would need to be implemented
    // with proper contract calls or subgraph queries
    useEffect(() => {
        setAllInvestments([]);
        setIsLoading(false);
    }, [address]);

    const refetch = () => {
        // Placeholder for refetch logic
        console.log('Refetching user investments...');
    };

    return { allInvestments, isLoading, refetch };
};

// Hook to get total liquidity for a prediction
export const usePredictionTotalLiquidity = (predictionId: number) => {
    const { data: totalLiquidity, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getTotalLiquidity",
        args: predictionId ? [predictionId] : undefined,
        query: {
            enabled: predictionId > 0,
        },
    });

    return { totalLiquidity, refetch, isLoading };
};

// Hook to get prediction with current prices
export const usePredictionWithPrices = (predictionId: number) => {
    const { data: predictionWithPrices, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPredictionWithPrices",
        args: predictionId ? [predictionId] : undefined,
        query: {
            enabled: predictionId > 0,
        },
    });

    return { predictionWithPrices, refetch, isLoading };
};

// Hook to get prediction counter (total number of predictions)
export const usePredictionCounter = () => {
    const { data: predictionCounter, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "predictionCounter",
        args: [],
    });

    return { predictionCounter, refetch, isLoading };
};

// Hook to get minimum liquidity required
export const useMinimumLiquidity = () => {
    const { data: minimumLiquidity, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "MINIMUM_LIQUIDITY",
        args: [],
    });

    return { minimumLiquidity, refetch, isLoading };
};

// Hook to get detailed market information including prices and investments
export const useDetailedMarket = (predictionId: number) => {
    const { address } = useAccount();
    const [detailedMarket, setDetailedMarket] = useState<DetailedMarket | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get prediction details with prices
    const { data: predictionWithPrices, refetch: refetchPredictionWithPrices } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPredictionWithPrices",
        args: predictionId ? [predictionId] : undefined,
        query: {
            enabled: predictionId > 0,
        },
    });

    // Get total liquidity
    const { data: totalLiquidity, refetch: refetchTotalLiquidity } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getTotalLiquidity",
        args: predictionId ? [predictionId] : undefined,
        query: {
            enabled: predictionId > 0,
        },
    });

    // Get all investments in this prediction
    const { data: allInvestments, refetch: refetchAllInvestments } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPredictionInvestments",
        args: predictionId ? [predictionId] : undefined,
        query: {
            enabled: predictionId > 0,
        },
    });

    // Get user's investments in this prediction
    const { data: userInvestments, refetch: refetchUserInvestments } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserInvestmentsInPrediction",
        args: address && predictionId ? [address, predictionId] : undefined,
        query: {
            enabled: !!address && predictionId > 0,
        },
    });

    // Get user's total investment amounts
    const { data: userTotalInvestment, refetch: refetchUserTotalInvestment } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getUserTotalInvestmentInPrediction",
        args: address && predictionId ? [address, predictionId] : undefined,
        query: {
            enabled: !!address && predictionId > 0,
        },
    });

    useEffect(() => {
        if (predictionWithPrices && totalLiquidity !== undefined) {
            const prediction = (predictionWithPrices as any).prediction;
            const yesPrice = (predictionWithPrices as any).yesPrice;
            const noPrice = (predictionWithPrices as any).noPrice;

            const detailed: DetailedMarket = {
                ...prediction,
                currentPrices: {
                    yesPrice: BigInt(yesPrice),
                    noPrice: BigInt(noPrice),
                },
                totalLiquidity: totalLiquidity ? BigInt(totalLiquidity as number | string) : BigInt(0),
                investments: (allInvestments as MarketInvestment[]) || [],
                userInvestments: (userInvestments as MarketInvestment[]) || [],
                userTotalInvestment: userTotalInvestment ? {
                    totalAmount: BigInt((userTotalInvestment as any).totalAmount),
                    yesAmount: BigInt((userTotalInvestment as any).yesAmount),
                    noAmount: BigInt((userTotalInvestment as any).noAmount),
                } : {
                    totalAmount: BigInt(0),
                    yesAmount: BigInt(0),
                    noAmount: BigInt(0),
                },
            };

            setDetailedMarket(detailed);
            setIsLoading(false);
        }
    }, [predictionWithPrices, totalLiquidity, allInvestments, userInvestments, userTotalInvestment]);

    const refetchAll = async () => {
        setIsLoading(true);
        await Promise.all([
            refetchPredictionWithPrices(),
            refetchTotalLiquidity(),
            refetchAllInvestments(),
            refetchUserInvestments(),
            refetchUserTotalInvestment(),
        ]);
    };

    return { detailedMarket, isLoading, refetchAll };
};

// Hook to get all detailed markets for user's created predictions
export const useUserDetailedMarkets = () => {
    const { userPredictions } = useUserCreatedPredictions();
    const [detailedMarkets, setDetailedMarkets] = useState<DetailedMarket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetailedMarkets = async () => {
            if (!userPredictions || userPredictions.length === 0) {
                setDetailedMarkets([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const detailed: DetailedMarket[] = [];

            try {
                // Fetch detailed information for each prediction
                for (const prediction of userPredictions) {
                    // This would be more efficient with parallel requests
                    // For now, we'll use the basic prediction data and add minimal details
                    const basicDetailed: DetailedMarket = {
                        ...prediction,
                        currentPrices: {
                            yesPrice: BigInt(0),
                            noPrice: BigInt(0),
                        },
                        totalLiquidity: BigInt(prediction.yesLiquidity) + BigInt(prediction.noLiquidity),
                        investments: [],
                        userInvestments: [],
                        userTotalInvestment: {
                            totalAmount: BigInt(0),
                            yesAmount: BigInt(0),
                            noAmount: BigInt(0),
                        },
                    };
                    detailed.push(basicDetailed);
                }

                setDetailedMarkets(detailed);
            } catch (error) {
                console.error('Error fetching detailed markets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetailedMarkets();
    }, [userPredictions]);

    return { detailedMarkets, isLoading };
};

// Hook to get current prices for a specific prediction
export const useMarketPrices = (predictionId: number) => {
    const { data: prices, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getCurrentPrices",
        args: predictionId ? [predictionId] : undefined,
        query: {
            enabled: predictionId > 0,
        },
    });

    const marketPrices: MarketPrices | null = prices ? {
        yesPrice: BigInt((prices as any).yesPrice),
        noPrice: BigInt((prices as any).noPrice),
    } : null;

    return { marketPrices, refetch, isLoading };
};

// Hook to get specific prediction details
export const usePredictionDetails = (predictionId: number) => {
    const { data: prediction, refetch, isLoading } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getPrediction",
        args: predictionId ? [predictionId] : undefined,
        query: {
            enabled: predictionId > 0,
        },
    });

    return { prediction: prediction as Prediction | undefined, refetch, isLoading };
};

// Main comprehensive profile hook that combines all user data
export const useUserProfile = () => {
    const { address } = useAccount();
    const { balance: pyusdBalance, refetch: refetchPyUSD } = useUserPyUSDBalance();
    const { ethBalance, refetch: refetchETH } = useUserETHBalance();
    const { allowance, refetch: refetchAllowance } = useUserAllowance();
    const { userChain, refetch: refetchUserChain } = useUserChainData();
    const { userPredictions, refetchUserPredictions } = useUserCreatedPredictions();
    const { allInvestments, refetch: refetchInvestments } = useAllUserInvestments();

    const [profileData, setProfileData] = useState<UserProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (address && pyusdBalance && ethBalance && userChain && userPredictions) {
            const activePredictions = userPredictions.filter(p => p.active).length;
            const resolvedPredictions = userPredictions.filter(p => p.resolved).length;

            // Calculate total profit/loss (simplified)
            const totalInvested = userChain.totalInvested;
            const totalClaimed = userChain.totalClaimed;
            const totalProfitLoss = totalClaimed - totalInvested;

            const profile: UserProfileData = {
                address,
                totalInvested: totalInvested,
                totalClaimed: totalClaimed,
                pyusdBalance: pyusdBalance.value,
                ethBalance: ethBalance.value,
                allowance: (allowance as bigint) || BigInt(0),
                createdPredictions: userPredictions,
                userInvestments: allInvestments,
                totalProfitLoss,
                activePredictions,
                resolvedPredictions,
            };

            setProfileData(profile);
            setIsLoading(false);
        }
    }, [address, pyusdBalance, ethBalance, userChain, userPredictions, allInvestments, allowance]);

    const refetchAll = async () => {
        await Promise.all([
            refetchPyUSD(),
            refetchETH(),
            refetchAllowance(),
            refetchUserChain(),
            refetchUserPredictions(),
            refetchInvestments(),
        ]);
    };

    return { profileData, isLoading, refetchAll };
};
