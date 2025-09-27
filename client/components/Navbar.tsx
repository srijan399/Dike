"use client";

import Link from "next/link";
import { ConnectKitButton } from "connectkit";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/60 border-b border-white/10">
            <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
                <div className="flex items-center gap-3">
                    <Link href="/" className="font-semibold tracking-tight text-white">
                        Dike
                    </Link>
                    {/* Add nav links here if needed */}
                </div>

                <div className="flex items-center gap-2">
                    <ConnectKitButton showBalance />
                </div>
            </nav>
        </header>
    );
}
