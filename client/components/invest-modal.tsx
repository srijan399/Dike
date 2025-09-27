"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useInvestInPrediction from "@/hooks/useInvestInPrediction";

type Side = "yes" | "no";

export function InvestModal({
    predictionId,
    title,
    defaultSide,
    onClose,
    onSuccess,
}: {
    predictionId: number | string;
    title?: string;
    defaultSide: Side;
    onClose: () => void;
    onSuccess?: (txHash?: string) => void;
}) {
    const [amount, setAmount] = useState("");
    const [side, setSide] = useState<Side>(defaultSide);
    const [slippage, setSlippage] = useState(2); // %
    const { invest, isApproving, isInvesting, error, txHash } = useInvestInPrediction();

    const disabled = useMemo(() => {
        const v = Number(amount);
        return !amount || isNaN(v) || v <= 0 || isApproving || isInvesting;
    }, [amount, isApproving, isInvesting]);

    async function handleInvest() {
        const bps = Math.round((Math.max(0, Math.min(100, slippage)) / 100) * 10000);
        try {
            const tx = await invest({
                predictionId,
                amount,
                side,
                slippageBps: bps,
            });
            onSuccess?.(tx as unknown as string);
            onClose();
        } catch { }
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md galaxy-border cosmic-glow">
                <div>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold">Invest</CardTitle>
                            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        {title ? (
                            <p className="text-sm text-muted-foreground truncate">{title}</p>
                        ) : null}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Amount (PYUSD)</label>
                            <Input
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                inputMode="decimal"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={side === "yes" ? "default" : "outline"}
                                onClick={() => setSide("yes")}
                            >
                                YES
                            </Button>
                            <Button
                                type="button"
                                variant={side === "no" ? "default" : "outline"}
                                onClick={() => setSide("no")}
                            >
                                NO
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Slippage (%)</label>
                            <Input
                                placeholder="2"
                                value={slippage}
                                onChange={(e) => setSlippage(Number(e.target.value))}
                                inputMode="numeric"
                            />
                        </div>

                        {error ? (
                            <div className="text-xs text-red-400 border border-red-500/40 bg-red-500/10 rounded p-2">
                                {error}
                            </div>
                        ) : null}

                        {txHash ? (
                            <div className="text-xs text-green-400 truncate">Tx: {String(txHash)}</div>
                        ) : null}

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose} className="bg-transparent">
                                Cancel
                            </Button>
                            <Button onClick={handleInvest} disabled={disabled}>
                                {isApproving
                                    ? "Approving..."
                                    : isInvesting
                                        ? "Investing..."
                                        : "Invest"}
                            </Button>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}
