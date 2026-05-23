import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
            {/* Subtle background texture */}
            <div className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        45deg,
                        #C5A059 0px,
                        #C5A059 1px,
                        transparent 1px,
                        transparent 60px
                    )`
                }}
            />

            {/* Gold ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C5A059]/5 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex flex-col items-center text-center max-w-2xl"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="w-24 h-24 mb-12"
                >
                    <Logo size="100%" />
                </motion.div>

                {/* 404 Number */}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="text-[120px] md:text-[180px] font-serif font-light leading-none text-stone-800 select-none"
                    style={{ WebkitTextStroke: '1px #C5A059' }}
                >
                    404
                </motion.span>

                {/* Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="w-24 h-px bg-[#C5A059] my-8"
                />

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                >
                    <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-bold mb-4">
                        Page Not Found
                    </p>
                    <h1 className="text-2xl md:text-3xl font-serif font-light text-stone-200 mb-4 leading-snug">
                        This Collection Has Moved
                    </h1>
                    <p className="text-stone-500 text-sm font-light leading-relaxed max-w-md mx-auto">
                        The page you are looking for may have been renamed, relocated, or is temporarily unavailable.
                        Our concierge team is always here to assist you.
                    </p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 mt-12"
                >
                    <Link
                        to="/"
                        className="px-8 py-4 bg-[#C5A059] text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#E2C285] transition-colors duration-300"
                    >
                        Return to Boutique
                    </Link>
                    <Link
                        to="/?tag=new"
                        className="px-8 py-4 border border-stone-700 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors duration-300"
                    >
                        New Arrivals
                    </Link>
                </motion.div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="mt-16 text-[9px] text-stone-700 uppercase tracking-[0.3em] font-medium"
                >
                    Zarhrah Luxury Collections • London • Lagos
                </motion.p>
            </motion.div>
        </div>
    );
};

export default NotFound;
