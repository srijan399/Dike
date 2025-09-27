"use client";

import Link from "next/link";
import { ConnectKitButton } from "connectkit";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Glassmorphic background with enhanced blur and transparency */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>
            </div>
            
            <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:h-18 sm:px-8">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/" 
                        className="group flex items-center gap-3 transition-all duration-300 hover:scale-105"
                    >
                        {/* Glowing DIKE symbol with glassmorphic container */}
                        <div className="relative">
                            {/* Outer glow effect */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-cyan-400/40 to-purple-500/30 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Glassmorphic container */}
                            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 shadow-lg shadow-cyan-500/20">
                                <div className="text-2xl font-black text-white tracking-wider group-hover:text-cyan-300 transition-colors duration-300 drop-shadow-lg" 
                                     style={{ 
                                         fontFamily: 'var(--font-orbitron)',
                                         textShadow: '0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)'
                                     }}>
                                    DIKE
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-xs text-slate-400 uppercase tracking-widest font-medium group-hover:text-cyan-400 transition-colors duration-300"
                             style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                            PROTOCOL
                        </div>
                    </Link>
                    
                    {/* Navigation links with glassmorphic styling */}
                     <div className="hidden md:flex items-center gap-2 ml-8">
                         <div className="relative">
                             {/* Glassmorphic navigation container */}
                             <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-2 py-1 shadow-lg">
                                 <div className="flex items-center gap-1">
                                     <Link 
                                         href="/test" 
                                         className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/15 rounded-lg backdrop-blur-sm border border-transparent hover:border-white/30 transition-all duration-200 font-medium tracking-wide relative group"
                                         style={{ fontFamily: 'var(--font-inter)' }}
                                     >
                                         <span className="relative z-10">Test</span>
                                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                     </Link>
                                     <Link 
                                         href="/markets" 
                                         className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/15 rounded-lg backdrop-blur-sm border border-transparent hover:border-white/30 transition-all duration-200 font-medium tracking-wide relative group"
                                         style={{ fontFamily: 'var(--font-inter)' }}
                                     >
                                         <span className="relative z-10">Markets</span>
                                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                     </Link>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>

                <div className="flex items-center gap-3">
                     {/* Enhanced ConnectKit button wrapper with glassmorphic structure */}
                     <div className="relative group">
                         {/* Outer glow for the button */}
                         <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/40 via-cyan-400/50 to-purple-500/40 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                         
                         {/* Glassmorphic button container */}
                         <div className="relative bg-white/8 backdrop-blur-lg border border-white/20 rounded-xl p-1 shadow-xl shadow-cyan-500/10">
                             <div className="relative bg-gradient-to-r from-white/5 to-white/10 rounded-lg">
                                 <ConnectKitButton showBalance />
                             </div>
                         </div>
                         
                         {/* Additional subtle inner glow */}
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent rounded-xl pointer-events-none"></div>
                     </div>
                 </div>
            </nav>
        </header>
    );
}
