"use client";

import Prism from "../components/Prism";
import { ConnectKitButton } from "connectkit";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Prism Background */}
      <div className="absolute inset-0 z-0">
        <Prism
          height={3}
          baseWidth={5}
          animationType="rotate"
          glow={0.6}
          noise={0.2}
          transparent={true}
          scale={2.9}
          hueShift={0.2}
          colorFrequency={1}
          bloom={1}
          timeScale={0.5}
        />
      </div>
      <ConnectKitButton />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
              DIKE PROTOCOL
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-300 mb-8 leading-relaxed">
              High-Stakes Prediction Markets
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              Where courage meets opportunity. Dike Protocol revolutionizes prediction markets with
              <span className="text-white font-semibold"> exponentially higher risk-to-reward ratios</span>.
              For traders who demand more than the ordinary.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-red-400 mb-2">10x+</div>
                <div className="text-white font-medium mb-2">Risk Multiplier</div>
                <div className="text-gray-400 text-sm">Higher stakes, higher rewards</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">500%</div>
                <div className="text-white font-medium mb-2">Max ROI</div>
                <div className="text-gray-400 text-sm">Unprecedented returns</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                <div className="text-white font-medium mb-2">Global Markets</div>
                <div className="text-gray-400 text-sm">Never stop trading</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/25">
              Enter the Arena
            </button>
            <button className="bg-white border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300">
              Learn More
            </button>
          </div>

          {/* Risk Warning */}
          <div className="mt-12 max-w-2xl mx-auto">
            <p className="text-yellow-400 text-sm font-medium mb-2">⚠️ HIGH RISK WARNING</p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Dike Protocol involves substantial risk of loss. Only participate with funds you can afford to lose.
              Past performance does not guarantee future results. Trade responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
