"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const mockData = [
    { time: "00:00", price: 2340 },
    { time: "04:00", price: 2345 },
    { time: "08:00", price: 2342 },
    { time: "12:00", price: 2348 },
    { time: "16:00", price: 2346 },
    { time: "20:00", price: 2350 },
    { time: "24:00", price: 2347 },
]

interface PriceChartProps {
    currency: { name: string; price: number } | undefined
}

export default function PriceChart({ currency }: PriceChartProps) {
    if (!currency) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-neon-green">${currency.price.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{currency.name} / pyUSD</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-neon-green">+2.34%</div>
                    <div className="text-xs text-muted-foreground">24h</div>
                </div>
            </div>

            <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                        />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--color-card)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="var(--color-neon-green)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: "var(--color-neon-green)" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
