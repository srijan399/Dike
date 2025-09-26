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
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              DIKE
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Experience the future of web development with stunning visual effects
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-3">Interactive</h3>
              <p className="text-gray-400">Dynamic 3D graphics that respond to user interaction</p>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-3">Modern</h3>
              <p className="text-gray-400">Built with cutting-edge web technologies</p>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-3">Performant</h3>
              <p className="text-gray-400">Optimized for smooth animations and rendering</p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-200 transition-colors duration-300 mr-4">
              Get Started
            </button>
            <button className="border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:border-white/50 transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
