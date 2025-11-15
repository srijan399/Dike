'use client'

import { GrainGradient } from "@paper-design/shaders-react";
import { Instrument_Serif } from "next/font/google"
import { Google_Sans_Code } from "next/font/google";
import { Instrument_Sans } from "next/font/google";
import Link from "next/link";
import LandingNavbar from "@/components/LandingNavbar";


const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
})

const googleSansCode = Google_Sans_Code({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
})

const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
})

export default function LandingPage() {
    return (
        <main className="relative overflow-x-hidden">
            {/* First Section */}
            <section className="relative min-h-screen flex items-center justify-center">
                <LandingNavbar />

                <div className="absolute inset-0 z-0">
                    <GrainGradient
                        width="100%"
                        height="100%"
                        colors={["#702d00", "#88ddae"]}
                        colorBack="#140a00"
                        softness={0.1}
                        intensity={0.34}
                        frame={2}
                        noise={0.3}
                        shape="sphere"
                        speed={0}
                        scale={0.5}
                    />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
                    <h1
                        className={`${instrumentSerif.className} text-white text-center text-balance font-normal tracking-tight text-7xl z-10`}
                    >
                        infinite worlds.
                        <br />infinite possibilities.
                    </h1>
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full flex justify-center z-10">
                        <p className={`${instrumentSerif.className} text-white text-center text-balance font-normal tracking-tight mb-20 text-3xl`}>
                            One stake. Multiple predictions.
                            <br />
                            Maximum efficiency.
                        </p>
                    </div>
                </div>
            </section>

            {/* Second Section */}
            <section className="relative min-h-screen flex flex-col">
                <div className="absolute inset-0 z-0">
                    <GrainGradient
                        width="100%"
                        height="100%"
                        colors={["#702d00", "#88ddae"]}
                        colorBack="#140a00"
                        softness={0.15}
                        intensity={0.34}
                        frame={10000}
                        noise={0.3}
                        shape="wave"
                        speed={0}
                        scale={0.6}
                    />
                </div>

                {/* Top Half - Heading and Explanation */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-0">
                    <div className="max-w-6xl w-full ms-60">
                        <h1
                            className={`${instrumentSerif.className} text-white text-left text-balance font-normal tracking-tight text-7xl mb-8 max-w-4xl`}
                        >
                            Unlocking <i>Capital Efficiency</i> in Prediction Markets
                        </h1>
                        <p className={`${instrumentSans.className} text-white text-left text-balance font-normal tracking-tight text-lg leading-relaxed max-w-5xl`}>
                            Traditional prediction markets silo capital; <b>DIKE liberates it.</b> Through a multiverse of conditional wagers, a single stake can echo across multiple futures, turning thoughtful speculation into a more fluid and capital-efficient practice.
                        </p>
                    </div>
                </div>

                {/* Bottom Half - Key Features */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pt-0">
                    <b>
                        <div className="max-w-6xl w-full">
                            <h2 className={`${instrumentSerif.className} text-black text-center text-balance font-bold tracking-tight text-7xl mb-12`}>
                                Key Features
                            </h2>
                            <div className="flex items-start justify-center gap-0">
                                <div className="flex-1 flex flex-col items-center text-center px-8">
                                    <h3 className={`${instrumentSerif.className} text-black font-bold tracking-tight text-5xl mb-3`}>
                                        Prediction Chaining
                                    </h3>
                                    <p className={`${instrumentSans.className} text-black/80 font-bold text-xl leading-relaxed`}>
                                        Link bets, maximize capital. Collateralize new predictions.
                                    </p>
                                </div>
                                <div className="w-px h-16 bg-black/20 self-center"></div>
                                <div className="flex-1 flex flex-col items-center text-center px-8">
                                    <h3 className={`${instrumentSerif.className} text-black font-bold tracking-tight text-5xl mb-3`}>
                                        Multiverse Finance
                                    </h3>
                                    <p className={`${instrumentSans.className} text-black/80 font-bold text-xl leading-relaxed`}>
                                        Explore conditional outcomes across parallel realities.
                                    </p>
                                </div>
                                <div className="w-px h-16 bg-black/20 self-center"></div>
                                <div className="flex-1 flex flex-col items-center text-center px-8">
                                    <h3 className={`${instrumentSerif.className} text-black font-bold tracking-tight text-5xl mb-3`}>
                                        Capital Efficiency
                                    </h3>
                                    <p className={`${instrumentSans.className} text-black/80 font-bold text-xl leading-relaxed`}>
                                        Reduce siloed funds, potential returns.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </b>
                </div>
            </section>

            {/* Third Section */}
            <section className="relative min-h-screen flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <GrainGradient
                        width="100%"
                        height="100%"
                        colors={["#702d00", "#88ddae"]}
                        colorBack="#140a00"
                        softness={0.15}
                        intensity={0.34}
                        frame={10000}
                        noise={0.25}
                        shape="wave"
                        speed={0}
                        scale={0.6}
                        rotation={180}
                        offsetY={-0.35}
                    />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center px-8 max-w-6xl mx-auto text-center">
                    <div className={`${instrumentSerif.className} text-white text-6xl leading-relaxed mb-12 mt-20`}>
                        Read our whitepaper <Link href="/whitepaper" className="italic underline hover:text-white/80 transition-colors duration-300">here</Link>.
                    </div>
                    <div className={`${instrumentSans.className} text-white/90 text-xl leading-relaxed mb-10 max-w-2xl`}>
                        Be among the first to experience the future of prediction markets.<br/>Join our waitlist to get early access and stay updated on our launch.
                    </div>
                    <Link 
                        href="/waitlist"
                        className={`${instrumentSerif.className} text-white text-3xl font-normal tracking-wide px-12 py-5 border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300 rounded-sm`}
                    >
                        Join the Waitlist
                    </Link>
                </div>

                {/* Footer */}
                <footer className="absolute bottom-0 left-0 right-0 z-50">
                    {/* Floating line separator */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-px bg-white/20"></div>
                    </div>
                    
                    {/* Footer content */}
                    <div className={`${instrumentSans.className} flex items-center justify-center gap-12 text-white/70 text-sm pb-6 px-8`}>
                        <Link 
                            href="/"
                            className="hover:text-white/90 transition-colors duration-300"
                        >
                            Home
                        </Link>
                        <Link 
                            href="/predictions"
                            className="hover:text-white/90 transition-colors duration-300"
                        >
                            Predictions
                        </Link>
                        <Link 
                            href="/swap"
                            className="hover:text-white/90 transition-colors duration-300"
                        >
                            Swap
                        </Link>
                        <Link 
                            href="/dashboard"
                            className="hover:text-white/90 transition-colors duration-300"
                        >
                            Dashboard
                        </Link>
                        <Link 
                            href="/whitepaper"
                            className="hover:text-white/90 transition-colors duration-300"
                        >
                            Whitepaper
                        </Link>
                        <div className="text-white/50">
                            © 2025 DIKE Protocol
                        </div>
                    </div>
                </footer>
            </section>
        </main>
    )
}