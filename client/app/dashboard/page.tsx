"use client"

import { useState, useMemo } from "react"
import { Search, User, Wallet, Settings, TrendingUp, Globe, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { VerseCard } from "@/components/verse-card"
import { VerseTreeView } from "@/components/verse-tree-view"
import { StatsOverview } from "@/components/stats-overview"
import useOpportunitiesTree from "@/hooks/useOpportunitiesTree"
import { useRouter } from "next/navigation"

const mockVerses = [
    {
        id: "1",
        title: "Chronoverse I: Fractured Ledger",
        ownership: 23.5,
        totalValue: 45600,
        icon: "🏛️",
        status: "active" as const,
        opportunities: 5,
        universeDescription: "Monetary regimes fracture and capital flows fork across timelines.",
    },
    {
        id: "2",
        title: "Chronoverse II: The Golden Halving",
        ownership: 12.8,
        totalValue: 89200,
        icon: "₿",
        status: "resolving" as const,
        opportunities: 3,
        universeDescription: "Digital scarcity rewrites settlement finality and reserve doctrines.",
    },
    {
        id: "3",
        title: "Chronoverse III: Minds Beyond Flesh",
        ownership: 67.2,
        totalValue: 156000,
        icon: "🤖",
        status: "active" as const,
        opportunities: 4,
        universeDescription: "Synthetic cognition compounds beyond biological cadence.",
    },
    {
        id: "4",
        title: "Chronoverse IV: Red Dust Commonwealth",
        ownership: 8.9,
        totalValue: 23400,
        icon: "🚀",
        status: "pending" as const,
        opportunities: 3,
        universeDescription: "Frontier economies bootstrap under thin skies and long latencies.",
    },
]

export default function MultiverseDashboard() {
    const [selectedVerse, setSelectedVerse] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()
    const { verses, isLoading } = useOpportunitiesTree()

    const filteredVerses = useMemo(() => {
        const q = searchQuery.toLowerCase()
        return (verses || []).filter(v =>
            v.title.toLowerCase().includes(q) || v.universeDescription.toLowerCase().includes(q)
        )
    }, [verses, searchQuery])

    return (
        <div className="relative min-h-screen">

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {!selectedVerse ? (
                    <>
                        {/* Stats Overview */}
                        <StatsOverview />

                        {/* Main Dashboard Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-balance">Your Multiverse Portfolio</h2>
                                    <p className="text-muted-foreground mt-1">
                                        Explore your positions across {mockVerses.length} parallel realities
                                    </p>
                                </div>
                            </div>

                            {/* Verse Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {(isLoading ? [] : filteredVerses).map((verse, idx) => (
                                    <VerseCard
                                        key={verse.id}
                                        verse={verse as any}
                                        onClick={() => router.push(`/chains/${verse.id}`)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions removed by request */}
                    </>
                ) : (
                    <VerseTreeView verseId={selectedVerse} onBack={() => setSelectedVerse(null)} />
                )}
            </div>
        </div>
    )
}
