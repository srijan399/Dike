"use client";

import { useCallback, useMemo, useState } from "react";
import {
    DikeAbi,
    Dike_SEPOLIA_ADDRESS,
    PYUSD_ABI,
    PYUSD_SEPOLIA_ADDRESS,
} from "@/app/abi";
import { parseUnits } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";

export type InvestParams = {
    predictionId: number | string;
    amount: string; // human input, e.g. "12.5"
    side: "yes" | "no"; // yes = true, no = false
    slippageBps?: number; // default 200 = 2%
};

export default function useInvestInPrediction() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();

    const [isApproving, setIsApproving] = useState(false);
    const [isInvesting, setIsInvesting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Token decimals: Using 6 based on PYUSD usage elsewhere in this repo.
    const PYUSD_DECIMALS = 6 as const;

    const enabled = Boolean(address);

    // Helper: fetch prices for a prediction (yesPrice, noPrice)
    const getPrices = useCallback(async (predictionId: number | string) => {
        try {
            if (!publicClient) return undefined;
            const [yesPrice, noPrice] = (await publicClient.readContract({
                address: Dike_SEPOLIA_ADDRESS,
                abi: DikeAbi,
                functionName: "getCurrentPrices",
                args: [BigInt(predictionId as any)],
            })) as unknown as [bigint, bigint];
            return { yesPrice, noPrice };
        } catch {
            return undefined;
        }
    }, [publicClient]);

    // A reactive allowance read. Consumers can also ignore it; we still double-check at runtime.
    const { data: allowance } = useReadContract({
        address: PYUSD_SEPOLIA_ADDRESS,
        abi: PYUSD_ABI,
        functionName: "allowance",
        args: address ? [address, Dike_SEPOLIA_ADDRESS] : undefined,
        query: { enabled },
    });

    const invest = useCallback(
        async ({ predictionId, amount, side, slippageBps = 200 }: InvestParams) => {
            setError(null);
            setTxHash(null);
            if (!address) throw new Error("Connect wallet");

            // Parse amount to smallest units
            const amountUnits = parseUnits(amount || "0", PYUSD_DECIMALS);
            if (amountUnits <= BigInt(0)) throw new Error("Enter a valid amount");

            // Ensure allowance
            try {
                const currentAllowance =
                    typeof allowance === "bigint" ? allowance : BigInt(0);
                if (currentAllowance < amountUnits) {
                    setIsApproving(true);
                    // Approve exact needed amount (idempotent enough for demo)
                    const approveTx = await writeContractAsync({
                        address: PYUSD_SEPOLIA_ADDRESS,
                        abi: PYUSD_ABI,
                        functionName: "approve",
                        args: [Dike_SEPOLIA_ADDRESS, amountUnits],
                    });
                    // Optional: user can wait for confirmations in their wallet UI.
                    setTxHash(approveTx as unknown as string);
                }
            } catch (e: any) {
                setIsApproving(false);
                const msg = e?.shortMessage || e?.message || "Approve failed";
                setError(msg);
                throw e;
            } finally {
                setIsApproving(false);
            }

            // Compute minExpectedVotes; try to fetch current prices; fallback to 0 (skip slippage guard)
            let minExpectedVotes = BigInt(0);
            try {
                const prices = await getPrices(predictionId);
                if (prices) {
                    const price = side === "yes" ? prices.yesPrice : prices.noPrice;
                    if (price > BigInt(0)) {
                        const expectedVotes =
                            (amountUnits * (BigInt(10) ** BigInt(18))) / price;
                        const bps = BigInt(10000 - Math.max(0, Math.min(10000, slippageBps)));
                        minExpectedVotes = (expectedVotes * bps) / BigInt(10000);
                    }
                }
            } catch (_) {
                // ignore and use 0
            }

            // Invest
            try {
                setIsInvesting(true);
                const investTx = await writeContractAsync({
                    address: Dike_SEPOLIA_ADDRESS,
                    abi: DikeAbi,
                    functionName: "investInPrediction",
                    args: [
                        BigInt(predictionId as any),
                        amountUnits,
                        side === "yes",
                        minExpectedVotes,
                    ],
                });
                setTxHash(investTx as unknown as string);
                return investTx;
            } catch (e: any) {
                const msg = e?.shortMessage || e?.message || "Invest failed";
                setError(msg);
                throw e;
            } finally {
                setIsInvesting(false);
            }
        },
        [address, allowance, writeContractAsync, getPrices]
    );

    return useMemo(
        () => ({
            invest,
            isApproving,
            isInvesting,
            txHash,
            error,
        }),
        [invest, isApproving, isInvesting, txHash, error]
    );
}
