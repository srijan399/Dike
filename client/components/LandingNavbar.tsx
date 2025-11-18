'use client'

import Link from "next/link";
import { Instrument_Sans } from "next/font/google";
import { ConnectKitButton } from "connectkit";
import { Wallet, ChevronDown } from "lucide-react";
import { Instrument_Serif } from "next/font/google";
import { useState, useEffect, useRef } from "react";

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

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
                
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="relative flex items-center gap-1 text-base font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group"
                    >
                        trading
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 py-3 min-w-40 backdrop-blur-md bg-linear-to-b from-white/10 to-white/5 border border-white/30 rounded-md shadow-xl shadow-black/50">
                            <Link
                                href="/swap"
                                onClick={() => setIsDropdownOpen(false)}
                                className="block px-5 py-2.5 text-base font-normal tracking-wide transition-all duration-300 hover:text-white hover:bg-white/20 hover:pl-6"
                            >
                                swap
                            </Link>
                            <Link
                                href="/dashboard"
                                onClick={() => setIsDropdownOpen(false)}
                                className="block px-5 py-2.5 text-base font-normal tracking-wide transition-all duration-300 hover:text-white hover:bg-white/20 hover:pl-6"
                            >
                                dashboard
                            </Link>
                        </div>
                    )}
                </div>

                <Link
                    href="/"
                    className={`${instrumentSerif.className} relative text-4xl font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group`}
                >
                    DIKE
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>

                <Link
                    href="/create-predic"
                    className="relative text-base font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group"
                >
                    create
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

