'use client'

import { GrainGradient } from "@paper-design/shaders-react";
import { Instrument_Serif } from "next/font/google"
import { Instrument_Sans } from "next/font/google";
import Link from "next/link";
import { useState, useEffect } from "react";
import { WaitlistSearchBar } from "@/components/ui/waitlist-search-bar";


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

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main id="top" className="relative overflow-x-hidden">
      {/* First Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <nav className="absolute top-4 md:top-10 left-0 right-0 z-50 flex items-center py-4 px-4 md:px-8">
          {/* Nav Items - Absolutely Centered */}
          <div className={`${instrumentSans.className} absolute left-1/2 -translate-x-1/2 flex items-center gap-12 text-white`}>
            <Link
              href="/"
              className={`${instrumentSerif.className} relative text-3xl md:text-5xl font-normal tracking-wide transition-colors duration-300 hover:text-white/80 group`}
            >
              DIKE
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        </nav>

        <div className="absolute inset-0 z-0">
          <GrainGradient
            width="100%"
            height="100%"
            colors={["#D00613", "#FFBF02"]}
            colorBack="#140a00"
            softness={0.1}
            intensity={0.34}
            frame={2}
            noise={0.3}
            shape="sphere"
            speed={0}
            scale={isMobile ? 0.9 : 0.5}
            offsetY={isMobile ? -0.35 : -0.10}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <h1
            className={`${instrumentSerif.className} text-white text-center text-balance font-normal tracking-tight text-5xl md:text-5xl lg:text-7xl z-10 lg:translate-y-[-10vh] translate-y-[-16vh]`}
          >
            infinite worlds.
            <br />infinite possibilities.
          </h1>
          <div className="absolute bottom-6 md:bottom-10 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center justify-center z-10 px-4 translate-y-[8vh]">

            <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-md translate-y-[-6vh] lg:translate-none">
              <div className="text-center mb-[-16]">
                <h2 className={`${instrumentSerif.className} text-white text-3xl md:text-3xl lg:text-4xl font-normal tracking-tight mb-2`}>
                  Be among the first.
                </h2>
                <p className={`${instrumentSans.className} text-white/80 text-base md:text-base lg:text-lg`}>
                  Join the future of prediction markets.
                </p>
              </div>

              <div className="w-full flex justify-center">
                <WaitlistSearchBar
                  onEmailSubmit={(email: string) => {
                    console.log('Email submitted:', email);
                  }}
                />
              </div>
            </div>
            <p className={`${instrumentSerif.className} text-white text-center text-balance font-normal tracking-tight mb-8 md:mb-10 text-xl md:text-2xl lg:text-3xl py-10 pb-20 lg:pb-10`}>
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
            colors={["#D00613", "#FFBF02"]}
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
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 pb-0">
          <div className="max-w-6xl w-full ms-0 lg:ms-60">
            <h1
              className={`${instrumentSerif.className} text-white text-center lg:text-left text-balance font-normal tracking-tight text-3xl md:text-4xl lg:text-7xl mb-6 md:mb-8 max-w-4xl`}
            >
              Unlocking <i>Capital Efficiency</i> in Prediction Markets
            </h1>
            <p className={`${instrumentSans.className} text-white text-center lg:text-left text-balance font-normal tracking-tight text-base md:text-lg leading-relaxed max-w-5xl`}>
              Traditional prediction markets silo capital; <b>DIKE liberates it.</b> Through a multiverse of conditional wagers, a single stake can echo across multiple futures, turning thoughtful speculation into a more fluid and capital-efficient practice.
            </p>
          </div>
        </div>

        {/* Bottom Half - Key Features */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 mt-64 md:pt-0">
          <b>
            <div className="max-w-6xl w-full">
              <h2 className={`${instrumentSerif.className} text-black text-center text-balance font-bold tracking-tight text-3xl md:text-4xl lg:text-7xl mb-8 md:mb-12`}>
                Key Features
              </h2>
              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-0">
                <div className="flex-1 flex flex-col items-center text-center px-4 md:px-8 mb-8 lg:mb-0 w-full lg:w-auto">
                  <h3 className={`${instrumentSerif.className} text-black font-bold tracking-tight text-2xl md:text-3xl lg:text-5xl mb-3`}>
                    Prediction Chaining
                  </h3>
                  <p className={`${instrumentSans.className} text-black/80 font-bold text-base md:text-lg lg:text-xl leading-relaxed`}>
                    Link bets, maximize capital. Collateralize new predictions.
                  </p>
                </div>
                <div className="hidden lg:block w-px h-16 bg-black/20 self-center"></div>
                <div className="flex-1 flex flex-col items-center text-center px-4 md:px-8 mb-8 lg:mb-0 w-full lg:w-auto">
                  <h3 className={`${instrumentSerif.className} text-black font-bold tracking-tight text-2xl md:text-3xl lg:text-5xl mb-3`}>
                    Multiverse Finance
                  </h3>
                  <p className={`${instrumentSans.className} text-black/80 font-bold text-base md:text-lg lg:text-xl leading-relaxed`}>
                    Explore conditional outcomes across parallel realities.
                  </p>
                </div>
                <div className="hidden lg:block w-px h-16 bg-black/20 self-center"></div>
                <div className="flex-1 flex flex-col items-center text-center px-4 md:px-8 mb-8 lg:mb-0 w-full lg:w-auto">
                  <h3 className={`${instrumentSerif.className} text-black font-bold tracking-tight text-2xl md:text-3xl lg:text-5xl mb-3`}>
                    Capital Efficiency
                  </h3>
                  <p className={`${instrumentSans.className} text-black/80 font-bold text-base md:text-lg lg:text-xl leading-relaxed`}>
                    Reduce siloed funds, potential returns.
                  </p>
                </div>
              </div>
            </div>
          </b>
        </div>
      </section>

      {/* Third Section */}
      <section id="waitlist" className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <GrainGradient
            width="100%"
            height="100%"
            colors={["#D00613", "#FFBF02"]}
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
        <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-8 max-w-6xl mx-auto text-center">
          <div className={`${instrumentSerif.className} text-white text-2xl md:text-3xl lg:text-6xl leading-relaxed mb-8 md:mb-12 mt-12 md:mt-20`}>
            Read our whitepaper <Link href="/whitepaper" className="italic underline hover:text-white/80 transition-colors duration-300">here</Link>.
          </div>
          <div className={`${instrumentSans.className} text-white/90 text-base md:text-lg lg:text-xl leading-relaxed mb-8 md:mb-10 max-w-2xl`}>
            Be among the first to experience the future of prediction markets.<br />Join our waitlist to get early access and stay updated on our launch.
          </div>
          <Link
            href="#top"
            className={`${instrumentSerif.className} text-white text-lg md:text-xl lg:text-3xl font-normal tracking-wide px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-5 border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300 rounded-sm`}
          >
            Join the Waitlist
          </Link>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 z-50">
          {/* Floating line separator */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="w-24 h-px bg-white/20"></div>
          </div>

          {/* Footer content */}
          <div className={`${instrumentSans.className} flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-white/70 text-xs md:text-sm pb-4 md:pb-6 px-4 md:px-8`}>
            <Link
              href="/"
              className="hover:text-white/90 transition-colors duration-300"
            >
              Home
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