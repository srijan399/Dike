"use client"

import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Prediction } from "@/app/interfaces/interface"

interface PredictionDetailsModalProps {
    prediction: Prediction
    onClose: () => void
}

function formatDate(ts?: number | bigint) {
    if (!ts) return "—"
    const n = typeof ts === "bigint" ? Number(ts) : ts
    const ms = n < 10_000_000_000 ? n * 1000 : n
    return new Date(ms).toLocaleString()
}

function yesNo(v?: boolean) {
    if (v === undefined || v === null) return "—"
    return v ? "Yes" : "No"
}

export function PredictionDetailsModal({ prediction, onClose }: PredictionDetailsModalProps) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl galaxy-border cosmic-glow">
                <div>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold">Prediction Details</CardTitle>
                            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close details modal">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">All fields from the Prediction interface.</p>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Detail label="ID" value={String(prediction.id)} />
                            <Detail label="Creator" value={prediction.creator} mono />
                            <Detail label="Title" value={prediction.title} />
                            <Detail label="Category" value={prediction.category} />
                            <Detail label="Metadata" value={prediction.metadata} long />
                            <Detail label="Resolution Date" value={formatDate(prediction.resolutionDate)} />
                            <Detail label="Initial Liquidity" value={String(prediction.initialLiquidity)} />
                            <Detail label="Yes Liquidity" value={String(prediction.yesLiquidity)} />
                            <Detail label="No Liquidity" value={String(prediction.noLiquidity)} />
                            <Detail label="Resolved" value={yesNo(prediction.resolved)} />
                            <Detail label="Outcome" value={yesNo(prediction.outcome)} />
                            <Detail label="Created At" value={formatDate(prediction.createdAt)} />
                            <Detail label="Active" value={yesNo(prediction.active)} />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button variant="outline" onClick={onClose} className="bg-transparent">Close</Button>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </div>
    )
}

function Detail({ label, value, mono, long }: { label: string; value: string; mono?: boolean; long?: boolean }) {
    return (
        <div className="p-3 rounded border border-border bg-card/50">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className={`text-sm ${mono ? "font-mono break-all" : ""} ${long ? "text-pretty" : "truncate"}`}>{value || "—"}</div>
        </div>
    )
}
