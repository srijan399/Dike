"use client"

import { useState } from "react"
import { X, GitBranch, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BranchingModalProps {
    opportunity: {
        id: string
        title: string
        description: string
        category: string
        potentialPayout: string
    }
    activeVerses: Array<{
        id: string
        name: string
        balance: string
        branches: number
    }>
    onClose: () => void
    onConfirm: (verseId: string) => void
}

export function BranchingModal({ opportunity, activeVerses, onClose, onConfirm }: BranchingModalProps) {
    const [selectedVerse, setSelectedVerse] = useState<string>("")
    const [isConfirming, setIsConfirming] = useState(false)

    const handleConfirm = async () => {
        if (!selectedVerse) return

        setIsConfirming(true)
        // Simulate branching process
        await new Promise((resolve) => setTimeout(resolve, 2000))
        onConfirm(selectedVerse)
        setIsConfirming(false)
    }

    const selectedVerseData = activeVerses.find((v) => v.id === selectedVerse)

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl galaxy-border cosmic-glow">
                <div>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-primary" />
                                Branch Into New Reality
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Connect this opportunity to one of your active verses to create a new branch in the multiverse.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Opportunity Preview */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-accent" />
                                Opportunity
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{opportunity.category}</Badge>
                                    <Badge className="bg-primary/20 text-primary">{opportunity.potentialPayout}</Badge>
                                </div>
                                <h4 className="font-medium text-balance">{opportunity.title}</h4>
                                <p className="text-sm text-muted-foreground text-pretty">{opportunity.description}</p>
                            </div>
                        </div>

                        {/* Verse Selection */}
                        <div className="space-y-3">
                            <h3 className="font-semibold">Select Source Verse</h3>
                            <Select value={selectedVerse} onValueChange={setSelectedVerse}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a verse to branch from..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeVerses.map((verse) => (
                                        <SelectItem key={verse.id} value={verse.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{verse.name}</span>
                                                <span className="text-xs text-muted-foreground ml-2">{verse.balance}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tree Preview */}
                        {selectedVerseData && (
                            <div className="p-4 bg-card border border-border rounded-lg">
                                <h3 className="font-semibold mb-4">Branch Preview</h3>
                                <div className="flex items-center justify-center space-x-4">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2 cosmic-glow-accent">
                                            <GitBranch className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-sm font-medium">{selectedVerseData.name}</div>
                                        <div className="text-xs text-muted-foreground">{selectedVerseData.branches} branches</div>
                                    </div>

                                    <ArrowRight className="w-6 h-6 text-muted-foreground" />

                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-2 pulse-glow">
                                            <Zap className="w-6 h-6 text-accent" />
                                        </div>
                                        <div className="text-sm font-medium">New Branch</div>
                                        <div className="text-xs text-muted-foreground">{opportunity.category}</div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-muted/30 rounded text-center">
                                    <div className="text-sm text-muted-foreground">
                                        This will create a new branch where your verse can explore the outcome of:
                                    </div>
                                    <div className="font-medium mt-1 text-balance">"{opportunity.title}"</div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                                Cancel
                            </Button>
                            <Button onClick={handleConfirm} disabled={!selectedVerse || isConfirming} className="flex-1 cosmic-glow">
                                {isConfirming ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                        Branching Reality...
                                    </div>
                                ) : (
                                    <>
                                        <GitBranch className="w-4 h-4 mr-2" />
                                        Confirm Branch
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </div>
    )
}
