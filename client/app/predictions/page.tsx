'use client'

import { OpportunitiesPage } from "@/components/opportunities-page"
import PageBackground from '@/components/PageBackground';
import LandingNavbar from '@/components/LandingNavbar';

export default function Home() {
    return (
        <div className="relative min-h-screen">
            <PageBackground />
            <LandingNavbar />
            <div className="relative z-10">
                <OpportunitiesPage />
            </div>
        </div>
    )
}
