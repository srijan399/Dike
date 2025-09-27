"use client"

import { useMemo } from "react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, ComposedChart, Bar, Cell, Line, ReferenceLine } from "recharts"

interface PriceChartProps {
    currency: { name: string; price: number } | undefined
}

type Candle = {
    time: string
    open: number
    high: number
    low: number
    close: number
    bodyBase: number
    body: number
    lowBase: number
    wick: number
    up: boolean
}

function generateCandles(current: number, count = 36): Candle[] {
    const candles: Candle[] = []
    const now = new Date()
    let close = Math.max(0.01, current)

    for (let i = 0; i < count; i++) {
        // Mean-reverting random walk around anchor (current price)
        const meanRevert = 0.18 // keep series stable overall
        const noiseAmp = 0.015  // local volatility ~1.5%

        // Open equals previous close for continuity
        const open = close

        // Compute next close with mean reversion + noise
        let c = Math.max(
            0.01,
            open + (current - open) * meanRevert + (Math.random() * 2 - 1) * noiseAmp * open
        )
        // Guarantee visible body size
        const minBodyPct = 0.004 // 0.4%
        if (Math.abs(c - open) / open < minBodyPct) {
            c = open * (c >= open ? 1 + minBodyPct : 1 - minBodyPct)
        }

        const baseMax = Math.max(open, c)
        const baseMin = Math.min(open, c)
        const high = baseMax * (1 + Math.random() * 0.003)
        const low = baseMin * (1 - Math.random() * 0.003)

        const t = new Date(now.getTime() - (count - 1 - i) * 30 * 60 * 1000)
        const hh = String(t.getHours()).padStart(2, "0")
        const mm = String(t.getMinutes()).padStart(2, "0")
        const up = c >= open

        const bodyBase = Math.min(open, c)
        const body = Math.abs(c - open)
        const lowBase = low
        const wick = high - low

        candles.push({
            time: `${hh}:${mm}`,
            open,
            high,
            low,
            close: c,
            bodyBase,
            body,
            lowBase,
            wick,
            up,
        })

        // Next candle starts from this close -> continuity
        close = c
    }
    // Ensure last candle close is anchored to current (visual accuracy)
    if (candles.length) {
        const last = candles[candles.length - 1]
        last.close = current
        last.body = Math.abs(last.close - last.open)
        last.up = last.close >= last.open
        last.high = Math.max(last.high, last.open, last.close)
        last.low = Math.min(last.low, last.open, last.close)
        last.bodyBase = Math.min(last.open, last.close)
        last.lowBase = last.low
        last.wick = last.high - last.low
    }
    return candles
}

export default function PriceChart({ currency }: PriceChartProps) {
    if (!currency) return null

    const data = useMemo(() => generateCandles(currency.price, 36), [currency.price])

    // Relative Y-axis domain based on candle highs/lows with padding
    const yDomain = useMemo(() => {
        if (!data.length) return [0, 1]
        let min = data[0].low
        let max = data[0].high
        for (const d of data) {
            if (d.low < min) min = d.low
            if (d.high > max) max = d.high
        }
        const pad = Math.max(0.0001, (max - min) * 0.08)
        return [min - pad, max + pad]
    }, [data])

    const upColor = "#22c55e"
    const downColor = "#ef4444"
    const medianClose = useMemo(() => {
        const closes = data.map(d => d.close).slice().sort((a, b) => a - b)
        const m = Math.floor(closes.length / 2)
        return closes.length % 2 ? closes[m] : (closes[m - 1] + closes[m]) / 2
    }, [data])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-neon-green">${currency.price.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{currency.name} / pyUSD</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-neon-green">24h</div>
                    <div className="text-xs text-muted-foreground">candles (30m)</div>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ left: 8, right: 8, top: 12, bottom: 0 }} barCategoryGap={"10%"} barGap={1}>
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            minTickGap={20}
                            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                        />
                        <YAxis hide domain={yDomain as any} allowDataOverflow />
                        <Tooltip
                            formatter={(val: number, key: string, payload: any) => {
                                if (key === "body") return [payload.payload.close.toFixed(2), "Close"]
                                return [val.toFixed(2), key]
                            }}
                            labelFormatter={(label) => `Time ${label}`}
                            contentStyle={{
                                backgroundColor: "var(--color-card)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                        />
                        {/* Wick outline (behind) */}
                        <Bar dataKey="lowBase" stackId="wickOutline" fill="transparent" isAnimationActive={false} />
                        <Bar dataKey="wick" stackId="wickOutline" barSize={7} isAnimationActive={false}>
                            {data.map((_, i) => (
                                <Cell key={`wo-${i}`} fill="rgba(0,0,0,0.35)" />
                            ))}
                        </Bar>
                        {/* Colored wick (front) */}
                        <Bar dataKey="lowBase" stackId="wick" fill="transparent" isAnimationActive={false} />
                        <Bar dataKey="wick" stackId="wick" barSize={5} isAnimationActive={false}>
                            {data.map((d, i) => (
                                <Cell key={`w-${i}`} fill={d.up ? upColor : downColor} />
                            ))}
                        </Bar>
                        {/* Body outline (behind) */}
                        <Bar dataKey="bodyBase" stackId="bodyOutline" fill="transparent" isAnimationActive={false} />
                        <Bar dataKey="body" stackId="bodyOutline" barSize={12} radius={[3, 3, 3, 3]} isAnimationActive={false}>
                            {data.map((_, i) => (
                                <Cell key={`bo-${i}`} fill="rgba(0,0,0,0.35)" />
                            ))}
                        </Bar>
                        {/* Colored body (front) */}
                        <Bar dataKey="bodyBase" stackId="body" fill="transparent" isAnimationActive={false} />
                        <Bar dataKey="body" stackId="body" barSize={10} radius={[2, 2, 2, 2]} isAnimationActive={false}>
                            {data.map((d, i) => (
                                <Cell key={`b-${i}`} fill={d.up ? upColor : downColor} />
                            ))}
                        </Bar>
                        {/* Trend line through closes */}
                        <Line type="monotone" dataKey="close" stroke="#fde047" strokeWidth={2.5} dot={false} opacity={0.95} />
                        {/* Median line */}
                        <ReferenceLine y={medianClose as any} stroke="#6b7280" strokeDasharray="4 4" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
