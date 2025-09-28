"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Zap, TrendingUp, DollarSign, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ChainTree } from "@/hooks/useOpportunitiesTree"

interface VerseTreeViewProps {
    verseId: string
    onBack: () => void
    tree?: ChainTree
}

const mockTreeData = {
    "1": {
        title: "Chronoverse I: Fractured Ledger",
        icon: "🏛️",
        description: "Macro dislocations across sovereign balance sheets",
        opportunities: [
            {
                id: "root",
                title: "Will a global rate shock happen in 2026?",
                type: "root",
                ownership: 23.5,
                value: 45600,
                x: 400,
                y: 100,
                description: "Foundational dislocation spawning multiple trade paths",
                valuation: { positive: 0.58, negative: 0.42 },
            },
            {
                id: "fired-2025",
                title: "Will the Fed pivot before Q4 2025?",
                type: "opportunity",
                ownership: 15.2,
                value: 28900,
                x: 200,
                y: 250,
                description: "Market-implied timing of policy pivot",
                valuation: { positive: 0.46, negative: 0.54 },
            },
            {
                id: "fired-2026",
                title: "Will CPI stay below 3% for 4 consecutive quarters?",
                type: "opportunity",
                ownership: 8.3,
                value: 16700,
                x: 600,
                y: 250,
                description: "Sustained disinflation scenario",
                valuation: { positive: 0.41, negative: 0.59 },
            },
            {
                id: "market-crash",
                title: "Will a liquidity spiral trigger circuit breakers?",
                type: "sub-opportunity",
                ownership: 7.1,
                value: 12400,
                x: 100,
                y: 400,
                description: "Cross-venue margin stress and forced deleveraging",
                valuation: { positive: 0.22, negative: 0.78 },
            },
            {
                id: "policy-failure",
                title: "Will a major central bank abandon forward guidance?",
                type: "sub-opportunity",
                ownership: 8.1,
                value: 16500,
                x: 300,
                y: 400,
                description: "Orthodoxy challenged by sustained mispricing loop",
                valuation: { positive: 0.19, negative: 0.81 },
            },
        ],
    },
    "2": {
        title: "Chronoverse II: The Golden Halving",
        icon: "₿",
        description: "Hard-cap adoption and reserve migration",
        opportunities: [
            {
                id: "root",
                title: "Will BTC close a month above $500k by 2028?",
                type: "root",
                ownership: 12.8,
                value: 89200,
                x: 400,
                y: 100,
                description: "Liquidity gravity pulls collateral into hard assets",
                valuation: { positive: 0.27, negative: 0.73 },
            },
            {
                id: "institutional",
                title: "Will a G10 sovereign add BTC to reserves?",
                type: "opportunity",
                ownership: 8.5,
                value: 52000,
                x: 250,
                y: 250,
                description: "Reserve migration into digital assets",
                valuation: { positive: 0.18, negative: 0.82 },
            },
            {
                id: "supply-shock",
                title: "Will exchange BTC float drop below 8%?",
                type: "opportunity",
                ownership: 4.3,
                value: 37200,
                x: 550,
                y: 250,
                description: "Float compression from LTH accumulation",
                valuation: { positive: 0.36, negative: 0.64 },
            },
        ],
    },
    "3": {
        title: "Chronoverse III: Minds Beyond Flesh",
        icon: "🤖",
        description: "Runaway capability emergence",
        opportunities: [
            {
                id: "root",
                title: "Will AGI be publicly demonstrated by 2027?",
                type: "root",
                ownership: 67.2,
                value: 156000,
                x: 400,
                y: 100,
                description: "Qualitative leap in generalization and tool-use",
                valuation: { positive: 0.44, negative: 0.56 },
            },
            {
                id: "openai-breakthrough",
                title: "Will a lab publish a model passing Turing-style evals?",
                type: "opportunity",
                ownership: 35.1,
                value: 89000,
                x: 200,
                y: 250,
                description: "Public benchmark demonstrations",
                valuation: { positive: 0.51, negative: 0.49 },
            },
            {
                id: "google-deepmind",
                title: "Will training compute double quarter-over-quarter?",
                type: "opportunity",
                ownership: 20.8,
                value: 45000,
                x: 400,
                y: 250,
                description: "Scaling laws and hardware throughput",
                valuation: { positive: 0.33, negative: 0.67 },
            },
            {
                id: "meta-ai",
                title: "Will an open-weights model top closed benchmarks?",
                type: "opportunity",
                ownership: 11.3,
                value: 22000,
                x: 600,
                y: 250,
                description: "Ecosystem externalities from permissive licensing",
                valuation: { positive: 0.29, negative: 0.71 },
            },
        ],
    },
    "4": {
        title: "Chronoverse IV: Red Dust Commonwealth",
        icon: "🚀",
        description: "Thin-atmosphere industry and logistics",
        opportunities: [
            {
                id: "root",
                title: "Will a crewed Mars base be continuously occupied by 2032?",
                type: "root",
                ownership: 8.9,
                value: 23400,
                x: 400,
                y: 100,
                description: "Charter markets and off-world property rights",
                valuation: { positive: 0.24, negative: 0.76 },
            },
            {
                id: "spacex-mission",
                title: "Will Starship complete 10 consecutive orbital flights?",
                type: "opportunity",
                ownership: 5.2,
                value: 15000,
                x: 300,
                y: 250,
                description: "Transfer cadence aligns with capex cycles",
                valuation: { positive: 0.37, negative: 0.63 },
            },
            {
                id: "nasa-artemis",
                title: "Will an interagency Mars logistics MoU be signed?",
                type: "opportunity",
                ownership: 3.7,
                value: 8400,
                x: 500,
                y: 250,
                description: "Standards, interfaces, and sovereign underwriting",
                valuation: { positive: 0.42, negative: 0.58 },
            },
        ],
    },
}

export function VerseTreeView({ verseId, onBack, tree }: VerseTreeViewProps) {
    const [selectedNode, setSelectedNode] = useState<string | null>("root")

    // If dynamic tree provided, map it to a local structure with positions
    const dynamicVerseData = useMemo(() => {
        if (!tree) return null
        const width = 800
        const height = 500
        const rootX = 400
        const rootY = 100
        const children = tree.nodes.filter((n) => n.id !== tree.parentId)
        const span = 600
        const left = 100
        const step = children.length > 1 ? span / (children.length - 1) : 0
        const nodesWithPos = tree.nodes.map((n, idx) => {
            const isRoot = n.id === tree.parentId
            const x = isRoot ? rootX : left + step * children.findIndex((c) => c.id === n.id)
            const y = isRoot ? rootY : 250
            const nodeType: "root" | "opportunity" | "sub-opportunity" = isRoot ? "root" : "opportunity"
            return {
                id: n.id,
                title: n.title,
                type: nodeType,
                ownership: n.ownership,
                value: n.value,
                x,
                y,
                description: n.description || "",
                valuation: n.valuation,
            }
        })
        return {
            title: tree.title,
            icon: "🔮",
            description: tree.description || "",
            opportunities: nodesWithPos,
            edges: tree.edges,
        }
    }, [tree])

    const verseData = dynamicVerseData || mockTreeData[verseId as keyof typeof mockTreeData]

    if (!verseData) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Verse data not found</p>
                <Button onClick={onBack} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    const selectedOpportunity = verseData.opportunities.find((opp: any) => opp.id === selectedNode)
    const pos = selectedOpportunity?.valuation?.positive ?? 0.5
    const neg = selectedOpportunity?.valuation?.negative ?? (1 - pos)

    return (
    <div className="space-y-6 overflow-visible">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={onBack} className="gap-2 bg-transparent">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-3xl">{verseData.icon}</span>
                            {verseData.title}
                        </h1>
                        <p className="text-muted-foreground">{verseData.description}</p>
                    </div>
                </div>
                <Button className="gap-2 cosmic-glow">
                    <Zap className="w-4 h-4" />
                    Invest in This Verse
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tree Visualization */}
                <div className="lg:col-span-2">
                    <Card className="verse-card glass-card border-border/40 h-[600px]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Opportunity Tree Network
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-full">
                            <div className="relative w-full h-full bg-gradient-to-br from-secondary/20 to-background rounded-lg overflow-hidden">
                                {/* SVG Tree Visualization */}
                                <svg className="w-full h-full" viewBox="0 0 800 500">
                                    {/* Connection Lines */}
                                    <defs>
                                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.6" />
                                            <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.6" />
                                        </linearGradient>
                                    </defs>

                                    {verseData.opportunities.map((opportunity: any) => {
                                        if (opportunity.type === "root") return null
                                            const rootNode = verseData.opportunities.find((opp: any) => opp.type === "root")
                                        if (!rootNode) return null

                                        return (
                                            <line
                                                key={`connection-${opportunity.id}`}
                                                x1={rootNode.x}
                                                y1={rootNode.y}
                                                x2={opportunity.x}
                                                y2={opportunity.y}
                                                stroke="url(#connectionGradient)"
                                                strokeWidth="2"
                                                className="pulse-neon"
                                            />
                                        )
                                    })}

                                    {/* Node circles */}
                                        {verseData.opportunities.map((opportunity: any) => (
                                        <g key={opportunity.id}>
                                            <circle
                                                cx={opportunity.x}
                                                cy={opportunity.y}
                                                r={opportunity.type === "root" ? "30" : opportunity.type === "opportunity" ? "25" : "20"}
                                                fill={selectedNode === opportunity.id ? "rgb(99, 102, 241)" : "rgb(30, 41, 59)"}
                                                stroke={opportunity.ownership > 0 ? "rgb(6, 182, 212)" : "rgb(100, 116, 139)"}
                                                strokeWidth="3"
                                                className="cursor-pointer transition-all duration-300 hover:stroke-primary"
                                                onClick={() => setSelectedNode(opportunity.id)}
                                                style={{
                                                    filter: opportunity.ownership > 0 ? "drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))" : "none",
                                                }}
                                            />
                                            <text
                                                x={opportunity.x}
                                                y={opportunity.y + 5}
                                                textAnchor="middle"
                                                className="fill-foreground text-xs font-medium pointer-events-none"
                                            >
                                            </text>
                                        </g>
                                    ))}
                                </svg>

                                {/* Floating labels */}
                                    {verseData.opportunities.map((opportunity: any) => (
                                    <div
                                        key={`label-${opportunity.id}`}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none backdrop-blur-sm"
                                        style={{
                                            left: `${(opportunity.x / 800) * 100}%`,
                                            top: `${((opportunity.y + 50) / 500) * 100}%`,
                                        }}
                                    >
                                        <div className="glass-chip rounded-lg px-2 py-1 text-xs text-center max-w-28">
                                            {opportunity.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Opportunity Details Panel */}
                <div className="flex flex-col gap-4 h-[600px]">
                    {selectedOpportunity && (
                        <Card className="verse-card glass-card border-border/40">
                            <CardHeader>
                                <CardTitle className="text-lg">Prediction</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-primary mb-2">{selectedOpportunity.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">{selectedOpportunity.description}</p>
                                    <Badge className="bg-accent/20 text-accent">Yes / No</Badge>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Positive (Yes)</span>
                                        <span className="font-semibold text-primary">{pos.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Negative (No)</span>
                                        <span className="font-semibold text-chart-4">{neg.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                        <div className="h-2 bg-primary inline-block" style={{ width: `${pos * 100}%` }} />
                                        <div className="h-2 bg-accent inline-block" style={{ width: `${neg * 100}%` }} />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-right">Sum: {(pos + neg).toFixed(2)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {/* Spacer to push the timeline card to the bottom and increase spacing */}
                    <div className="flex-1" />
                    {/* Timeline */}
                    <Card className="verse-card glass-card border-border/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-chart-4" />
                                Resolution Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                                    <div>
                                        <p className="text-sm font-medium">Q4 2024</p>
                                        <p className="text-xs text-muted-foreground">Initial branches resolve</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                                    <div>
                                        <p className="text-sm font-medium">Dec 2026</p>
                                        <p className="text-xs text-muted-foreground">Final resolution</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
