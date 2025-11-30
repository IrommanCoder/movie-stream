import React, { useState } from 'react';
import tutorialGuide from '../assets/tutorial_guide.png';
import TermsModal from './TermsModal';
import { Search, Play, Popcorn } from 'lucide-react';

const Footer = () => {
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    return (
        <>
            <footer className="bg-gradient-to-b from-black to-[#0a0a0a] border-t border-white/5 pt-20 pb-12 mt-24 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
                        {/* Tutorial Section */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="w-1 h-8 bg-blue-500 rounded-full" />
                                How to Watch
                            </h3>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl backdrop-blur-sm">
                                <img
                                    src={tutorialGuide}
                                    alt="How to watch tutorial"
                                    className="w-full h-auto rounded-xl opacity-90 mb-8 shadow-lg"
                                    loading="lazy"
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center space-y-2">
                                        <div className="w-10 h-10 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <p className="text-white font-medium text-sm">1. Pick a Movie</p>
                                        <p className="text-white/40 text-xs">Search or browse</p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="w-10 h-10 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                                            <Play className="w-5 h-5 fill-current" />
                                        </div>
                                        <p className="text-white font-medium text-sm">2. Click Play</p>
                                        <p className="text-white/40 text-xs">Instant stream</p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="w-10 h-10 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400">
                                            <Popcorn className="w-5 h-5" />
                                        </div>
                                        <p className="text-white font-medium text-sm">3. Enjoy</p>
                                        <p className="text-white/40 text-xs">No ads, high quality</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legal & Info Section */}
                        <div className="flex flex-col justify-center space-y-10 lg:pl-12">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white">Privacy & Security</h3>
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                                    We value your privacy above all else. This application is built with a <span className="text-white font-medium">zero-log policy</span>. We do not store any personal data, viewing history, or search logs on our servers. All data is stored locally on your device or handled securely by trusted third-party services.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white">Terms & Conditions</h3>
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                                        By using this service, you agree to our terms of service. This platform is strictly for educational purposes.
                                    </p>
                                    <button
                                        onClick={() => setIsTermsOpen(true)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center gap-2 group"
                                    >
                                        Read Full Terms of Service
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-white/10 pt-8 text-center">
                        <p className="text-white/30 text-sm">
                            © {new Date().getFullYear()} Movies. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            <TermsModal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
            />
        </>
    );
};

export default Footer;
