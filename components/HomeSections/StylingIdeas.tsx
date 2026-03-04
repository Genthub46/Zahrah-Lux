import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, ArrowUpRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';

interface StylingLook {
    id: string;
    image: string;
    title: string;
    price?: string;
    productIds: string[];
    hotspots?: { x: number; y: number; label: string; price?: string }[];
}

interface StylingIdeasProps {
    products: Product[];
    onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
    onLogView: (id: string) => void;
    onToggleWishlist: (product: Product) => void;
    isWishlisted: (id: string) => boolean;
    selectedProductIds?: string[]; // Legacy fallback
    looks?: StylingLook[];
}

const StylingIdeas: React.FC<StylingIdeasProps> = ({
    products,
    onAddToCart,
    onLogView,
    onToggleWishlist,
    isWishlisted,
    selectedProductIds,
    looks
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeLookIndex, setActiveLookIndex] = useState(0);
    const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

    // Construct valid looks list
    const validLooks: StylingLook[] = (looks && looks.length > 0)
        ? looks
        : [{
            id: 'default',
            image: "https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=2670&auto=format&fit=crop",
            title: "Urban Botanical",
            price: "₦150,000",
            productIds: selectedProductIds || []
        }];

    // Get current look data
    const currentLook = validLooks[activeLookIndex];

    // Get products for current look
    // If look has specific IDs, match them. If not, fallback to slice/logic.
    const lookProducts = currentLook.productIds && currentLook.productIds.length > 0
        ? currentLook.productIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p)
        : (activeLookIndex === 0 && selectedProductIds?.length ? selectedProductIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p) : products.slice(0, 5));

    const changeLook = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            setActiveLookIndex((prev) => (prev + 1) % validLooks.length);
        } else {
            setActiveLookIndex((prev) => (prev - 1 + validLooks.length) % validLooks.length);
        }
        // Reset scroll position on look change
        if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'instant' });
    };

    return (
        <section className="py-32 bg-[#FCFCFC] overflow-hidden">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
                            Curated Ensembles
                        </span>
                        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 leading-tight">
                            The <span className="italic text-stone-400">Art</span> of Styling
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center text-xs font-bold uppercase tracking-widest text-stone-400 mr-4">
                            Look 0{activeLookIndex + 1} / 0{validLooks.length}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => changeLook('prev')}
                                className="w-12 h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => changeLook('next')}
                                className="w-12 h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                    {/* The Look Image - Interactive */}
                    <div className="w-full lg:w-[32%] flex-shrink-0 relative group">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentLook.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5 }}
                                className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl"
                            >
                                <img
                                    src={currentLook.image}
                                    alt={currentLook.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                                {/* Render Hotspots if any - Simulating defaults if none */}
                                {(currentLook.hotspots || []).map((hotspot, idx) => (
                                    <React.Fragment key={idx}>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            className="absolute w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer border border-white/50 text-white z-10"
                                            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                            onMouseEnter={() => setActiveHotspot(idx)}
                                            onMouseLeave={() => setActiveHotspot(null)}
                                        >
                                            <Plus size={14} strokeWidth={3} />
                                        </motion.button>
                                        <AnimatePresence>
                                            {activeHotspot === idx && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute z-20 bg-white p-4 shadow-xl rounded-sm w-48 pointer-events-none"
                                                    style={{
                                                        left: hotspot.x > 50 ? 'auto' : `calc(${hotspot.x}% + 2rem)`,
                                                        right: hotspot.x > 50 ? `calc(${100 - hotspot.x}% + 2rem)` : 'auto',
                                                        top: `${hotspot.y}%`
                                                    }}
                                                >
                                                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">Item 0{idx + 1}</p>
                                                    <p className="text-sm font-serif font-bold text-stone-900">{hotspot.label}</p>
                                                    {hotspot.price && <p className="text-xs text-[#C5A059] font-bold mt-1">{hotspot.price}</p>}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}

                                {/* Fallback static hotspots if no config and default image used (legacy compatibility) */}
                                {!currentLook.hotspots && currentLook.id === 'default' && (
                                    <>
                                        <div className="absolute top-[30%] left-[45%] w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white z-10">
                                            <Plus size={14} />
                                        </div>
                                    </>
                                )}


                                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                    <div className="text-white">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-white/80">Featured Look</p>
                                        <h3 className="text-2xl font-serif italic">{currentLook.title}</h3>
                                    </div>
                                    <Link to="/lookbook">
                                        <button className="w-12 h-12 bg-white text-stone-900 rounded-full flex items-center justify-center hover:bg-[#C5A059] hover:text-white transition-colors duration-300">
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Matched Products Scroll */}
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                        <div className="mb-8">
                            <h3 className="text-xl font-serif text-stone-900 mb-2">Shop This Look</h3>
                            <p className="text-stone-500 font-light text-sm max-w-md">
                                Each piece matches the unique aesthetic of the Zarhrah collection. Combine items to create your personal statement.
                            </p>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth items-stretch snap-x snap-mandatory py-4 -mx-4 px-4"
                        >
                            <AnimatePresence mode='popLayout'>
                                {lookProducts.length > 0 ? lookProducts.map((product, index) => (
                                    <motion.div
                                        key={`${currentLook.id}-${product.id}`}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                        className="w-[260px] flex-shrink-0 snap-start bg-white p-3 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-300 group/card"
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-4 rounded-xl">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover mix-blend-multiply group-hover/card:scale-105 transition-transform duration-700"
                                            />
                                            {isWishlisted(product.id) && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C5A059]" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest truncate">{product.brand}</p>
                                            <h4 className="text-sm font-bold text-stone-900 truncate font-serif">{product.name}</h4>
                                            <div className="flex justify-between items-center pt-2 border-t border-stone-50 mt-3">
                                                <span className="text-xs font-medium text-stone-900">₦{product.price.toLocaleString()}</span>
                                                <button
                                                    onClick={() => onAddToCart(product)}
                                                    className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 hover:bg-stone-900 hover:text-white transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-stone-400 text-sm italic">
                                        No products linked to {currentLook.title}.
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default StylingIdeas;
