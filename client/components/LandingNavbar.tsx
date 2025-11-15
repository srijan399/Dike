'use client'

import Link from "next/link";
import { Instrument_Sans } from "next/font/google";
import { ConnectKitButton } from "connectkit";
import { Wallet } from "lucide-react";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
})

const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
})

export default function LandingNavbar() {

    return (
        <nav className="absolute top-0 left-0 right-0 z-50 flex items-center py-4 px-8">
            {/* Nav Items - Absolutely Centered */}
            <div className={`${instrumentSans.className} absolute left-1/2 -translate-x-1/2 flex items-center gap-12 text-white`}>
                <Link
                    href="/predictions"
                    className="relative text-base font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group"
                >
                    predictions
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                    href="/swap"
                    className="relative text-base font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group"
                >
                    swap
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                    href="/"
                    className={`${instrumentSerif.className} relative text-4xl font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group`}
                >
                    DIKE
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                    href="/dashboard"
                    className="relative text-base font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group"
                >
                    dashboard
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                    href="/profile"
                    className="relative text-base font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group"
                >
                    profile
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </div>
            
            {/* Wallet Connect Button - Right */}
            <div className={`${instrumentSans.className} ml-auto flex items-center`}>
                <ConnectKitButton.Custom>
                    {({ isConnected, show, address, ensName }) => {
                        return (
                            <button
                                onClick={show}
                                className="relative flex items-center gap-2 px-4 py-2 text-base font-normal tracking-wide text-white transition-all duration-300 hover:text-white/80 group border border-white/20 hover:border-white/40 rounded-sm backdrop-blur-sm bg-white/5 hover:bg-white/10"
                            >
                                <Wallet className="w-4 h-4" />
                                {isConnected ? (
                                    <>
                                        {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                                    </>
                                ) : (
                                    "Connect Wallet"
                                )}
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                            </button>
                        );
                    }}
                </ConnectKitButton.Custom>
            </div>
        </nav>
    );
}

