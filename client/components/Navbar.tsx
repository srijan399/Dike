"use client";

import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X, Wallet, BarChart3, User, Activity } from "lucide-react";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLElement>(null);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navigationItems = [
        {
            label: "Investment",
            href: "/predictions",
            icon: <Activity className="w-4 h-4" />,
            hasDropdown: false,
        },
        {
            label: "Trading",
            href: "/swap",
            icon: <Wallet className="w-4 h-4" />,
            hasDropdown: true,
            dropdownItems: [
                { label: "Swap", href: "/swap", icon: <Wallet className="w-4 h-4" /> },
                { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-4 h-4" /> },
            ]
        },
        {
            label: "Profile",
            href: "/profile",
            icon: <User className="w-4 h-4" />,
            hasDropdown: false,
        },
    ];

    return (
        <header ref={navRef} className="sticky top-4 left-4 right-4 z-50 max-w-7xl mx-auto">
            {/* Floating glassmorphic container with blue hue */}
            <div className="relative">
                {/* Outer glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/40 via-blue-400/50 to-cyan-500/40 rounded-2xl blur-lg opacity-75"></div>
                
                {/* Main floating container */}
                <div className="relative bg-black/40 backdrop-blur-xl border border-blue-400/20 rounded-2xl shadow-2xl shadow-blue-500/20">
                    {/* Inner gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-black/10 to-gray-900/20 rounded-2xl"></div>
                    
                    <nav className="relative flex h-16 items-center justify-center px-4 sm:px-6 lg:px-8 sm:h-18">
                <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                    {/* Left side - Logo */}
                    <div className="flex items-center gap-4">
                    <Link 
                        href="/" 
                        className="group flex items-center gap-3 transition-all duration-300 hover:scale-105"
                    >
                        {/* Glowing DIKE symbol with blue glassmorphic container */}
                        <div className="relative">
                            {/* Outer glow effect with blue theme */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/50 via-blue-400/60 to-cyan-400/50 rounded-xl blur-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Black glassmorphic container with blue border */}
                            <div className="relative bg-black/30 backdrop-blur-md border border-blue-300/30 rounded-lg px-3 py-2 shadow-lg shadow-blue-500/30">
                                <div className="text-2xl font-black text-white tracking-wider group-hover:text-gray-100 transition-colors duration-300 drop-shadow-lg" 
                                     style={{ 
                                         fontFamily: 'var(--font-orbitron)',
                                         textShadow: '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)'
                                     }}>
                                    DIKE
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-xs text-white uppercase tracking-widest font-medium group-hover:text-gray-200 transition-colors duration-300"
                             style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                            PROTOCOL
                        </div>
                    </Link>
                    </div>

                    {/* Center - Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
                        <div className="relative">
                            {/* Black glassmorphic navigation container with blue border */}
                            <div className="bg-black/20 backdrop-blur-md border border-blue-400/20 rounded-xl px-2 py-1 shadow-lg shadow-blue-500/10">
                                <div className="flex items-center gap-1">
                                    {navigationItems.map((item) => (
                                        <div key={item.label} className="relative">
                                            {item.hasDropdown ? (
                                                <div className="group">
                                                    <button
                                                        onClick={() => toggleDropdown(item.label)}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-gray-200 hover:bg-black/30 rounded-lg backdrop-blur-sm border border-transparent hover:border-blue-400/30 transition-all duration-200 font-medium tracking-wide relative group"
                                                        style={{ fontFamily: 'var(--font-inter)' }}
                                                    >
                                                        {item.icon}
                                                        <span className="relative z-10">{item.label}</span>
                                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                    </button>
                                                    
                                                    {/* Black Dropdown Menu with Blue Border */}
                                                    {activeDropdown === item.label && (
                                                        <div className="absolute top-full left-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-blue-400/30 rounded-xl shadow-xl shadow-blue-500/20 overflow-hidden z-50">
                                                            <div className="py-2">
                                                                {item.dropdownItems?.map((dropItem) => (
                                                                    <Link
                                                                        key={dropItem.href}
                                                                        href={dropItem.href}
                                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:text-gray-200 hover:bg-gray-800/30 transition-all duration-200"
                                                                        onClick={() => setActiveDropdown(null)}
                                                                    >
                                                                        {dropItem.icon}
                                                                        <span>{dropItem.label}</span>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-gray-200 hover:bg-black/30 rounded-lg backdrop-blur-sm border border-transparent hover:border-blue-400/30 transition-all duration-200 font-medium tracking-wide relative group"
                                                    style={{ fontFamily: 'var(--font-inter)' }}
                                                >
                                                    {item.icon}
                                                    <span className="relative z-10">{item.label}</span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Connect Button and Mobile Menu */}
                    <div className="flex items-center gap-3">
                     {/* Enhanced ConnectKit button wrapper with black glassmorphic structure and blue border */}
                     <div className="relative group">
                         {/* Outer blue glow for the button */}
                         <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 via-blue-400/60 to-cyan-400/50 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                         
                         {/* Black glassmorphic button container with blue border */}
                         <div className="relative bg-black/30 backdrop-blur-lg border border-blue-400/30 rounded-xl p-1 shadow-xl shadow-blue-500/20">
                             <div className="relative bg-gradient-to-r from-gray-900/20 to-black/20 rounded-lg">
                                 <ConnectKitButton showBalance />
                             </div>
                         </div>
                         
                         {/* Additional subtle inner glow */}
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/8 to-transparent rounded-xl pointer-events-none"></div>
                     </div>

                     {/* Mobile Menu Button */}
                     <div className="lg:hidden">
                         <button
                             onClick={toggleMobileMenu}
                             className="p-2 text-white hover:text-gray-200 hover:bg-black/30 rounded-lg transition-all duration-200"
                         >
                             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                         </button>
                     </div>
                 </div>
                </div>
            </nav>

                </div>
            </div>

            {/* Black Mobile Menu with Blue Border */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-black/95 backdrop-blur-xl border border-blue-400/30 rounded-2xl shadow-2xl shadow-blue-500/20">
                    <div className="px-6 py-4">
                        <div className="space-y-2">
                            {navigationItems.map((item) => (
                                <div key={item.label}>
                                    {item.hasDropdown ? (
                                        <div>
                                            <button
                                                onClick={() => toggleDropdown(`mobile-${item.label}`)}
                                                className="flex items-center justify-between w-full px-4 py-3 text-white hover:text-gray-200 hover:bg-gray-800/30 rounded-lg transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon}
                                                    <span className="font-medium">{item.label}</span>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === `mobile-${item.label}` ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {activeDropdown === `mobile-${item.label}` && (
                                                <div className="ml-4 mt-2 space-y-1">
                                                    {item.dropdownItems?.map((dropItem) => (
                                                        <Link
                                                            key={dropItem.href}
                                                            href={dropItem.href}
                                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/20 rounded-lg transition-all duration-200"
                                                            onClick={() => {
                                                                setActiveDropdown(null);
                                                                setIsMobileMenuOpen(false);
                                                            }}
                                                        >
                                                            {dropItem.icon}
                                                            <span>{dropItem.label}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="flex items-center gap-3 px-4 py-3 text-white hover:text-gray-200 hover:bg-gray-800/30 rounded-lg transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.icon}
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
