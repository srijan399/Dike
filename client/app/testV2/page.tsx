"use client";
import {
    DikeAbi,
    PYUSD_ABI,
    PYUSD_SEPOLIA_ADDRESS,
    Dike_SEPOLIA_ADDRESS,
} from "@/app/abi";
import { Button } from "@/components/ui/button";
import {
    useAccount,
    useBalance,
    useReadContract,
    useWriteContract,
} from "wagmi";
import useCreatePrediction from "@/hooks/createOpportunity";
import { useEffect, useState } from "react";
import { Prediction } from "../interfaces/interface";
import { allowanceAdmin, myAddress } from "../constants/address";
import { parseUnits } from "viem";

export default function TestV2() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const { createPrediction: createPredictionFn } = useCreatePrediction();
    const [activePredictions, setActivePredictions] = useState<Prediction[]>(
        []
    );

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

        console.log(predictions);
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

    const [currentPrices, setCurrentPrices] = useState({});

    const { data: currentPricesTokens, refetch: refetchCurrentPrices } =
        useReadContract({
            address: Dike_SEPOLIA_ADDRESS,
            abi: DikeAbi,
            functionName: "getCurrentPrices",
            args: [1],
        });

    useEffect(() => {
        if (currentPricesTokens) {
            setCurrentPrices(
                currentPricesTokens as { yesPrice: number; noPrice: number }
            );
        }

        console.log(currentPricesTokens);
    }, [currentPricesTokens]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const newPredictions = await refetchCurrentPrices();
            if (newPredictions?.data) {
                setCurrentPrices(
                    newPredictions.data as { yesPrice: number; noPrice: number }
                );
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [refetchCurrentPrices]);

    const [allPredictions, setAllPredictions] = useState({});

    const { data: allPredictionsTokens, refetch: refetchAllPredictions } =
        useReadContract({
            address: Dike_SEPOLIA_ADDRESS,
            abi: DikeAbi,
            functionName: "getAllPredictions",
            args: [1],
        });

    useEffect(() => {
        if (allPredictionsTokens) {
            setAllPredictions(
                allPredictionsTokens as { yesPrice: number; noPrice: number }
            );
        }

        console.log(allPredictions);
    }, [allPredictionsTokens]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const newPredictions = await refetchAllPredictions();
            if (newPredictions?.data) {
                setAllPredictions(
                    newPredictions.data as { yesPrice: number; noPrice: number }
                );
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [refetchAllPredictions]);

    const balance = useBalance({
        chainId: 11155111,
        address: address,
        token: PYUSD_SEPOLIA_ADDRESS,
    });

    const approveWallet = async () => {
        const tx = await writeContractAsync({
            address: PYUSD_SEPOLIA_ADDRESS,
            abi: PYUSD_ABI,
            functionName: "approve",
            args: [Dike_SEPOLIA_ADDRESS, "1000000000"],
        });
        console.log(tx);
    };

    const { data: allowance } = useReadContract({
        address: PYUSD_SEPOLIA_ADDRESS,
        abi: PYUSD_ABI,
        functionName: "allowance",
        args: [allowanceAdmin, myAddress],
    });

    const sendTokens = async () => {
        const tx = await writeContractAsync({
            address: PYUSD_SEPOLIA_ADDRESS,
            abi: PYUSD_ABI,
            functionName: "transferFrom",
            args: [myAddress, Dike_SEPOLIA_ADDRESS, "1000000"],
        });
        console.log(tx);
    };

    const createPred = async () => {
        await createPredictionFn({
            title: "Test Prediction",
            category: "General",
            metadata: "",
            resolutionDate: new Date(Date.now() + 3600 * 1000).toISOString(),
            initialLiquidity: "1000000",
        });
    };

    // const yesPrice = currentPrices?.yesPrice;
    // const collateralAmount = parseUnits("3", 6);
    // const expectedVotes = (collateralAmount * BigInt(10 ** 6)) / yesPrice;

    // const minExpectedVotes = (expectedVotes * BigInt(90)) / BigInt(100);
    // console.log(minExpectedVotes);

    const extend = async () => {
        const tx = await writeContractAsync({
            address: Dike_SEPOLIA_ADDRESS,
            abi: DikeAbi,
            functionName: "extendChain",
            args: [1, 2, parseUnits("3", 1), true, BigInt(0)],
        });
        console.log(tx);
    };

    return (
        <>
            <div className="mb-20">TestV2</div>
            <Button onClick={() => console.log(balance.data)}>
                Check Balance
            </Button>

            <Button onClick={() => console.log(allowance)}>
                Check Allowance
            </Button>

            <Button onClick={() => approveWallet()}>Approve Wallet</Button>

            <Button onClick={() => sendTokens()}>Send Tokens</Button>

            <Button onClick={() => createPred()}>Create Prediction</Button>

            <Button onClick={() => refetchPredictions()}>
                Get Predictions
            </Button>

            <Button onClick={() => refetchCurrentPrices()}>
                Get Current Prices
            </Button>

            <Button onClick={() => refetchAllPredictions}>
                Fetch all predictions
            </Button>

            <Button onClick={() => extend()}>Extend</Button>
        </>
    );
}
