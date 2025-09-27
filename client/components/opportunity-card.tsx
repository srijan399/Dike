"use client"

import { useState } from "react"
import { Calendar, Users, TrendingUp, Eye, GitBranch } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { InvestModal } from "@/components/invest-modal"

interface OpportunityCardProps {
    opportunity: {
        id: string
        title: string
        description: string
        resolutionDate: string
        yesPercentage: number
        noPercentage: number
        totalVotes: number
        category: string
        oracle: string
        potentialPayout: string
        rules: string
    }
    onViewDetails: (opportunity: any) => void
    onBranch: (opportunity: any) => void
    hasActiveVerses: boolean
}

export function OpportunityCard({ opportunity, onViewDetails, onBranch, hasActiveVerses }: OpportunityCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [investSide, setInvestSide] = useState<"yes" | "no" | null>(null)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getCategoryColor = (category: string) => {
        const colors = {
            Politics: "bg-red-500/20 text-red-300 border-red-500/30",
            Crypto: "bg-orange-500/20 text-orange-300 border-orange-500/30",
            Technology: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            Stocks: "bg-green-500/20 text-green-300 border-green-500/30",
            Space: "bg-purple-500/20 text-purple-300 border-purple-500/30",
            Economics: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        }
        return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }

    const openInvest = (side: "yes" | "no") => setInvestSide(side)

    return (
        <>
            <Card
                className={`verse-card glass-card border-border/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden ${isHovered ? "cosmic-glow" : ""}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative">
                    {/* Orbital animation elements */}
                    {isHovered && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-primary/70 rounded-full orbit-animation opacity-60"></div>
                    )}

                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`text-xs ${getCategoryColor(opportunity.category)}`}>{opportunity.category}</Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {opportunity.potentialPayout}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg font-bold text-balance leading-tight">{opportunity.title}</CardTitle>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground text-pretty line-clamp-2 mt-2">{opportunity.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Voting Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-400">YES {opportunity.yesPercentage}%</span>
                                <span className="text-red-400">NO {opportunity.noPercentage}%</span>
                            </div>
                            <div className="relative">
                                <Progress value={opportunity.yesPercentage} className="h-2 bg-red-500/20" />
                                <div
                                    className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-300"
                                    style={{ width: `${opportunity.yesPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{opportunity.totalVotes.toLocaleString()} votes</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(opportunity.resolutionDate)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className={`transition-all duration-200 hover:bg-green-500/20 hover:border-green-500/50`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    openInvest("yes")
                                }}
                            >
                                <TrendingUp className="w-3 h-3 mr-1" />
                                YES
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className={`transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/50`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    openInvest("no")
                                }}
                            >
                                <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                                NO
                            </Button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onViewDetails(opportunity)
                                }}
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                Details
                            </Button>

                            {hasActiveVerses && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="flex-1 text-xs cosmic-glow-accent"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onBranch(opportunity)
                                    }}
                                >
                                    <GitBranch className="w-3 h-3 mr-1" />
                                    Branch
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </div>
            </Card>
            {investSide && (
                <InvestModal
                    predictionId={opportunity.id}
                    title={opportunity.title}
                    defaultSide={investSide as "yes" | "no"}
                    onClose={() => setInvestSide(null)}
                    onSuccess={() => setInvestSide(null)}
                />
            )}
        </>
    )
}
