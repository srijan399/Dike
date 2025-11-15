'use client'

import SwapPage from "@/components/swap-page"
import PageBackground from '@/components/PageBackground';
import LandingNavbar from '@/components/LandingNavbar';

export default function Home() {
    return (
        <div className="relative min-h-screen">
            <PageBackground />
            <LandingNavbar />
            <div className="relative z-10">
                <SwapPage />
            </div>
        </div>
    )
}
