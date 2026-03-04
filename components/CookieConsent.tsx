import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('ZARHRAH_COOKIE_CONSENT');
        if (!consent) {
            // Delay showing the banner slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('ZARHRAH_COOKIE_CONSENT', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('ZARHRAH_COOKIE_CONSENT', 'false');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto md:max-w-sm z-50"
                >
                    <div className="bg-[#1A2621] text-stone-300 p-6 shadow-2xl rounded-sm border border-[#2D4A3A]">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#2D4A3A]/30 flex items-center justify-center text-[#9CC0AC]">
                                    <Cookie size={16} />
                                </div>
                                <h3 className="text-sm font-medium text-white tracking-wide">Cookie Preferences</h3>
                            </div>
                            <button
                                onClick={handleDecline}
                                className="text-stone-500 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-[11px] leading-relaxed mb-6 font-light">
                            We use cookies to elevate your styling experience, analyze platform traffic,
                            and serve personalized luxury recommendations. By continuing, you agree to our{' '}
                            <Link to="/p/privacy-policy" className="text-[#9CC0AC] underline underline-offset-2 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-[#2D4A3A] hover:bg-[#38634D] text-white text-[10px] font-medium uppercase tracking-[0.2em] py-3 transition-colors"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleDecline}
                                className="flex-1 bg-transparent border border-[#2D4A3A] hover:bg-white/5 text-white text-[10px] font-medium uppercase tracking-[0.2em] py-3 transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
