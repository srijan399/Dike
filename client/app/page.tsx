import Prism from "../components/Prism";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Prism Background */}
      <div className="absolute inset-0 z-0">
        <Prism 
          height={3}
          baseWidth={5}
          animationType="rotate"
          glow={1.0}
          noise={0}
          transparent={true}
          scale={2.9}
          hueShift={0.5}
          colorFrequency={1}
          bloom={1.5}
          timeScale={0.5}
        />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <div className="mb-12">
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
              A spectrum of colors that spark creativity
            </h1>
          </div>
          
          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4  justify-center items-center">
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-200 transition-colors duration-300">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
