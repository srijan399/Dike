import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "Dike Protocol · Waitlist",
  description: "Dike Protocol is a one-of-a-kind prediction market protocol that allows users to chain predictions and achieve maximum capital efficiency. Join the waitlist to be the first to experience the Dike Protocol. Get early access and stay updated on our launch.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Dike Protocol · Waitlist",
    type: "website",
    url: "https://dike.xyz",
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
    description: "Dike Protocol is a one-of-a-kind prediction market protocol that allows users to chain predictions and achieve maximum capital efficiency. Join the waitlist to be the first to experience the Dike Protocol. Get early access and stay updated on our launch.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} antialiased relative min-h-screen bg-black overflow-x-hidden`}
      >
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
