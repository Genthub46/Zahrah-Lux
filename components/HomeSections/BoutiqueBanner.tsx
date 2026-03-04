
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface BoutiqueBannerProps {
    image?: string;
}

const BoutiqueBanner: React.FC<BoutiqueBannerProps & { title?: string }> = ({ image, title }) => {
    const scrollToCollection = () => {
        const el = document.getElementById('collection-start');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="boutique" className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden bg-stone-900">
            <div className="absolute inset-0">
                <motion.img
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    viewport={{ once: true }}
                    src={image || "https://images.unsplash.com/photo-1569388330292-7de71879fb1f?q=80&w=2527&auto=format&fit=crop"} // Luxury fashion/interior vibe
                    alt="Zarhrah Manor"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-16 left-8 md:bottom-24 md:left-24 text-white z-10">
                <motion.h2
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-3xl md:text-5xl font-black uppercase tracking-[0.1em] mb-6 drop-shadow-lg"
                >
                    {title || "Zarhrah Manor"}
                </motion.h2>

                <motion.button
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onClick={scrollToCollection}
                    className="flex items-center text-xs md:text-sm font-bold uppercase tracking-[0.3em] hover:text-[#C5A059] transition-colors group"
                >
                    <ArrowRight size={18} className="mr-3 group-hover:translate-x-2 transition-transform" />
                    Shop Now
                </motion.button>
            </div>
        </section>
    );
};

export default BoutiqueBanner;
