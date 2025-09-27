// Landing page uses the global background from layout

export default function Home() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-8">
            <div className="text-center max-w-4xl mx-auto space-y-16">

                    {/* Main Title */}
                    <div className="space-y-8">
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-4 leading-tight tracking-wider" style={{ fontFamily: 'var(--font-orbitron)' }}>
                            DIKE<span className="text-5xl">PROTOCOL</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 font-light tracking-wide" style={{ fontFamily: 'var(--font-inter)' }}>
                            High-leverage prediction markets for professional traders
                        </p>
                    </div>

                    {/* Core Stats - Minimal */}
                    <div className="flex justify-center space-x-16">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                                15x
                            </div>
                            <div className="text-sm text-slate-400 uppercase tracking-widest mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
                                Leverage
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                                1000%
                            </div>
                            <div className="text-sm text-slate-400 uppercase tracking-widest mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
                                Max ROI
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                                24/7
                            </div>
                            <div className="text-sm text-slate-400 uppercase tracking-widest mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
                                Markets
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-6">
                        <button
                            className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-white/30 hover:text-black transition-all duration-200 tracking-wide shadow-lg shadow-white/10"
                            style={{
                                fontFamily: 'var(--font-inter)',
                                boxShadow: '0 4px 24px 0 rgba(255,255,255,0.08)',
                                border: '1.5px solid rgba(255,255,255,0.18)',
                                WebkitBackdropFilter: 'blur(12px)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            ENTER PROTOCOL
                        </button>
                        <p className="text-xs text-amber-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                            High risk — Professional traders only
                        </p>
                    </div>
            </div>
        </div>
    );
}
