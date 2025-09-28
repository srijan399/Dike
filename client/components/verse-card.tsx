"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, CheckCircle, Globe } from "lucide-react"

interface VerseMeta {
    id: string
    title: string
    ownership: number
    totalValue: number
    icon: string
    status: "active" | "resolving" | "pending"
    opportunities: number
    universeDescription: string
}

interface VerseCardProps {
    verse: VerseMeta
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
            className="verse-card cursor-pointer float-animation group relative overflow-hidden"
            onClick={onClick}
            style={{ animationDelay: `${Math.random() * 2}s` }}
        >
            {/* Glassmorphic background with enhanced blur and transparency */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-lg"></div>
            </div>
            
            {/* Subtle outer glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-purple-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            <CardHeader className="px-5 pt-5 pb-3 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-2xl">{verse.icon}</div>
                        <Globe className="w-4 h-4 text-primary/60" />
                    </div>
                    <Badge className={`text-xs ${getStatusColor(verse.status)} flex items-center gap-1 backdrop-blur-sm bg-white/10 border-white/20`}>
                        {getStatusIcon(verse.status)}
                        {verse.status}
                    </Badge>
                </div>
                <CardTitle
                    className="text-base sm:text-lg leading-tight text-balance break-words group-hover:text-primary transition-colors text-white/90 group-hover:text-cyan-300"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                    {verse.title}
                </CardTitle>
                <p
                    className="text-xs text-white/60 text-pretty break-words"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                    {verse.universeDescription}
                </p>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Total Value</span>
                    <span className="font-semibold text-blue-300">${verse.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Opportunities</span>
                    <span className="font-semibold text-white/90">{verse.opportunities}</span>
                </div>

                <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-2 mt-3 border border-white/20">
                    <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500 pulse-neon shadow-lg shadow-cyan-500/30"
                        style={{ width: `${verse.ownership}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
