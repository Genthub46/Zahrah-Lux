import React from 'react';
import { motion } from 'framer-motion';

const Lookbook = () => {
    return (
        <div className="pt-32 pb-20 min-h-screen bg-stone-50">
            <div className="max-w-[1800px] mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.4em] block mb-4">
                        Autumn / Winter 2025
                    </span>
                    <h1 className="text-5xl md:text-8xl font-serif text-stone-900 mb-8">
                        The Lookbook
                    </h1>
                    <p className="text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
                        A curation of our latest campaign, shot on location in Lagos and London.
                        Exploring the duality of modern luxury.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="aspect-[3/4] bg-stone-200 relative group overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-serif italic text-2xl">
                                Look {item}
                            </div>
                            {/* Placeholder Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Lookbook;
