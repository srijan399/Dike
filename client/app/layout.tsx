import type { Metadata } from "next";
import {
    Geist,
    Geist_Mono,
    Inter,
    Orbitron,
    JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import GradientBlinds from "@/components/GradientBlinds";
import Providers from "./_providers/provider";
import { dikeTheme } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import GrainGradientComponent from "@/components/GrainGradient";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const orbitron = Orbitron({
    variable: "--font-orbitron",
    subsets: ["latin"],
    weight: ["400", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
    weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
    title: "Dike Protocol",
    description: "Do more with less. Stop siloing your capital. Unlock compounded exposures without fresh capital. Unlock capital efficiency. Unlock Dike.",
    icons: {
        icon: "/favicon.png",
    },
    openGraph: {
        title: "Dike Protocol",
        description: "Do more with less. Stop siloing your capital. Unlock compounded exposures without fresh capital. Unlock capital efficiency. Unlock Dike.",
        type: "website",
        url: "https://dikeprotocol.xyz",
        siteName: "Dike Protocol",
        locale: "en_US",
        images: [
            {
                url: "/favicon.png",
                width: 1200,
                height: 630,
                alt: "Dike Protocol",
            },
        ],
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} antialiased relative min-h-screen bg-black overflow-x-hidden`}
            >
                <Providers>
                    {/* Global Prism Background */}
                    {/* Global readability overlay */}
                    <div
                        className={`absolute inset-0 z-5 ${dikeTheme.backgroundOverlayClass}`}
                    ></div>

                    {/* App content */}
                    <div className="relative z-10 min-h-screen">
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
