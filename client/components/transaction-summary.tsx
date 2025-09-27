"use client"

import { Separator } from "@/components/ui/separator"

interface TransactionSummaryProps {
    fromAmount: string
    fromCurrency: { name: string; price: number } | undefined
    toAmount: string
    slippage: string
}

export default function TransactionSummary({ fromAmount, fromCurrency, toAmount, slippage }: TransactionSummaryProps) {
    if (!fromAmount || !fromCurrency || !toAmount) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>Enter swap details to see summary</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount In</span>
                    <div className="text-right">
                        <div className="font-medium">
                            {fromAmount} {fromCurrency.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            ${(Number.parseFloat(fromAmount) * fromCurrency.price).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount Out</span>
                    <div className="text-right">
                        <div className="font-medium text-neon-green">{toAmount} pyUSD</div>
                        <div className="text-xs text-muted-foreground">${Number.parseFloat(toAmount).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network Fee</span>
                    <span className="text-sm font-medium">~$2.50</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Slippage</span>
                    <span className="text-sm font-medium">{slippage}%</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Route</span>
                    <span className="text-xs font-medium">Direct</span>
                </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="flex items-center justify-between font-medium">
                <span>Total Cost</span>
                <div className="text-right">
                    <div>${(Number.parseFloat(fromAmount) * fromCurrency.price + 2.5).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Including fees</div>
                </div>
            </div>
        </div>
    )
}
