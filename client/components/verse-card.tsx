"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, CheckCircle, Globe } from "lucide-react"

interface VerseCardProps {
    verse: {
        id: string
        title: string
        ownership: number
        totalValue: number
        icon: string
        status: "active" | "resolving" | "pending"
        opportunities: number
        universeDescription: string
    }
    onClick: () => void
}

export function VerseCard({ verse, onClick }: VerseCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-chart-4/20 text-chart-4 border-chart-4/30"
            case "resolving":
                return "bg-accent/20 text-accent border-accent/30"
            case "pending":
                return "bg-chart-5/20 text-chart-5 border-chart-5/30"
            default:
                return "bg-muted/20 text-muted-foreground border-muted/30"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CheckCircle className="w-3 h-3" />
            case "resolving":
                return <TrendingUp className="w-3 h-3" />
            case "pending":
                return <Clock className="w-3 h-3" />
            default:
                return null
        }
    }

    return (
        <Card
            className="verse-card cursor-pointer float-animation group"
            onClick={onClick}
            style={{ animationDelay: `${Math.random() * 2}s` }}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-2xl">{verse.icon}</div>
                        <Globe className="w-4 h-4 text-primary/60" />
                    </div>
                    <Badge className={`text-xs ${getStatusColor(verse.status)} flex items-center gap-1`}>
                        {getStatusIcon(verse.status)}
                        {verse.status}
                    </Badge>
                </div>
                <CardTitle className="text-lg leading-tight text-balance group-hover:text-primary transition-colors">
                    {verse.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground text-pretty">{verse.universeDescription}</p>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ownership</span>
                    <span className="font-semibold text-primary">{verse.ownership}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <span className="font-semibold text-accent">${verse.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Opportunities</span>
                    <span className="font-semibold">{verse.opportunities}</span>
                </div>

                <div className="w-full bg-secondary rounded-full h-2 mt-3">
                    <div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500 pulse-neon"
                        style={{ width: `${verse.ownership}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
