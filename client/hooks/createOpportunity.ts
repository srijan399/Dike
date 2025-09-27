import {
    Dike_SEPOLIA_ADDRESS,
    DikeAbi,
    PYUSD_ABI,
    PYUSD_SEPOLIA_ADDRESS,
} from "@/app/abi";
import { parseUnits } from "viem";
import { useAccount, useWriteContract, useReadContract, useBalance } from "wagmi";
import { useEffect, useState } from "react";

export interface PredictionFormData {
    title: string;
    category: string;
    metadata: string;
    resolutionDate: string;
    initialLiquidity: string;
}

export interface Prediction {
    id: number;
    creator: string;
    title: string;
    category: string;
    metadata: string;
    resolutionDate: number;
    initialLiquidity: number;
    yesLiquidity: number;
    noLiquidity: number;
    resolved: boolean;
    outcome: boolean;
    createdAt: number;
    active: boolean;
}

const useCreatePrediction = () => {
    const { writeContractAsync, isPending: isCreatePending } = useWriteContract();
    const { address } = useAccount();

    const createPrediction = async (formData: PredictionFormData) => {
        if (!formData.title || !formData.resolutionDate || !formData.initialLiquidity) {
            throw new Error("Missing required fields");
        }

        const resolutionTimestamp = Math.floor(new Date(formData.resolutionDate).getTime() / 1000);
        const liquidityAmount = parseUnits(formData.initialLiquidity, 6);

        const tx = await writeContractAsync({
            address: Dike_SEPOLIA_ADDRESS,
            abi: DikeAbi,
            functionName: "createPrediction",
            args: [
                formData.title,
                formData.category || "General",
                formData.metadata || "",
                resolutionTimestamp,
                liquidityAmount,
            ],
        });

        return tx;
    };

    return { createPrediction, isCreatePending };
};

export const useApproveToken = () => {
    const { writeContractAsync, isPending: isApprovalPending } = useWriteContract();

    const approve = async (amount: string) => {
        const amountToApprove = parseUnits(amount, 6);
        
        const tx = await writeContractAsync({
            address: PYUSD_SEPOLIA_ADDRESS,
            abi: PYUSD_ABI,
            functionName: "approve",
            args: [Dike_SEPOLIA_ADDRESS, amountToApprove],
        });

        return tx;
    };

    // Alternative approve method like in testV2
    const approveWallet = async () => {
        const tx = await writeContractAsync({
            address: PYUSD_SEPOLIA_ADDRESS,
            abi: PYUSD_ABI,
            functionName: "approve",
            args: [Dike_SEPOLIA_ADDRESS, "1000000000"],
        });
        return tx;
    };

    return { approve, approveWallet, isApprovalPending };
};

export const usePyUSDBalance = () => {
    const { address } = useAccount();
    
    const balance = useBalance({
        chainId: 11155111,
        address: address,
        token: PYUSD_SEPOLIA_ADDRESS,
    });

    return { balance: balance.data, isLoading: balance.isLoading, refetch: balance.refetch };
};

export const useAllowance = () => {
    const { address } = useAccount();
    
    const { data: allowance, refetch } = useReadContract({
        address: PYUSD_SEPOLIA_ADDRESS,
        abi: PYUSD_ABI,
        functionName: "allowance",
        args: address ? [address, Dike_SEPOLIA_ADDRESS] : undefined,
        query: {
            enabled: !!address,
        },
    });

    return { allowance, refetch };
};

export const useMinimumLiquidity = () => {
    const { data: minimumLiquidity } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "MINIMUM_LIQUIDITY",
    });

    return { minimumLiquidity };
};

export const useActivePredictions = () => {
    const [activePredictions, setActivePredictions] = useState<Prediction[]>([]);

    const { data: predictions, refetch: refetchPredictions } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getActivePredictions",
        args: [],
    });

    useEffect(() => {
        if (predictions) {
            setActivePredictions(predictions as Prediction[]);
        }
    }, [predictions]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const newPredictions = await refetchPredictions();
            if (newPredictions?.data) {
                setActivePredictions(newPredictions.data as Prediction[]);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [refetchPredictions]);

    return { activePredictions, refetchPredictions };
};

export const useCurrentPrices = (predictionId: number) => {
    const [currentPrices, setCurrentPrices] = useState<{yesPrice: number; noPrice: number}>({yesPrice: 0, noPrice: 0});

    const { data: currentPricesTokens, refetch: refetchCurrentPrices } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getCurrentPrices",
        args: [predictionId],
    });

    useEffect(() => {
        if (currentPricesTokens) {
            setCurrentPrices(currentPricesTokens as { yesPrice: number; noPrice: number });
        }
    }, [currentPricesTokens]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const newPrices = await refetchCurrentPrices();
            if (newPrices?.data) {
                setCurrentPrices(newPrices.data as { yesPrice: number; noPrice: number });
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [refetchCurrentPrices]);

    return { currentPrices, refetchCurrentPrices };
};

export const useAllPredictions = (predictionId: number) => {
    const [allPredictions, setAllPredictions] = useState<{yesPrice: number; noPrice: number}>({yesPrice: 0, noPrice: 0});

    const { data: allPredictionsTokens, refetch: refetchAllPredictions } = useReadContract({
        address: Dike_SEPOLIA_ADDRESS,
        abi: DikeAbi,
        functionName: "getAllPredictions",
        args: [predictionId],
    });

    useEffect(() => {
        if (allPredictionsTokens) {
            setAllPredictions(allPredictionsTokens as { yesPrice: number; noPrice: number });
        }
    }, [allPredictionsTokens]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const newPredictions = await refetchAllPredictions();
            if (newPredictions?.data) {
                setAllPredictions(newPredictions.data as { yesPrice: number; noPrice: number });
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [refetchAllPredictions]);

    return { allPredictions, refetchAllPredictions };
};

export const useSendTokens = () => {
    const { writeContractAsync } = useWriteContract();

    const sendTokens = async (fromAddress: string, toAddress: string, amount: string) => {
        const tx = await writeContractAsync({
            address: PYUSD_SEPOLIA_ADDRESS,
            abi: PYUSD_ABI,
            functionName: "transferFrom",
            args: [fromAddress, toAddress, amount],
        });
        return tx;
    };

    return { sendTokens };
};

export default useCreatePrediction;
