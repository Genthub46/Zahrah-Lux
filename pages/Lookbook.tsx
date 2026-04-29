import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { subscribeToLayout, subscribeToProducts } from '../services/dbUtils';
import { HomeLayoutConfig, Product } from '../types';
import { ArrowLeft, ShoppingBag, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LookbookProps {
    onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
}

const ParallaxImage = ({ src, alt }: { src: string, alt: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    return (
        <div ref={ref} className="absolute inset-0 overflow-hidden w-full h-full">
            <motion.img
                style={{ y }}
                src={src}
                alt={alt}
                className="w-full h-full object-cover scale-[1.35] transition-transform duration-1000 ease-out group-hover:scale-[1.45] group-hover:blur-[2px]"
            />
            <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/60 transition-colors duration-700" />
        </div>
    );
};

// Generates stable but scattered pseudo-random positions for hotspots based on index
const getHotspotPosition = (index: number) => {
    const positions = [
        { top: '35%', left: '40%' },
        { top: '65%', left: '55%' },
        { top: '25%', left: '60%' },
        { top: '75%', left: '35%' },
        { top: '50%', left: '50%' }
    ];
    return positions[index % positions.length];
};

const Lookbook = ({ onAddToCart }: LookbookProps) => {
    const [layoutConfig, setLayoutConfig] = useState<HomeLayoutConfig | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeLookId, setActiveLookId] = useState<string | null>(null); // For mobile tap vs desktop hover

    useEffect(() => {
        const unsubLayout = subscribeToLayout((data) => {
            if (data) setLayoutConfig(data);
        });
        const unsubProducts = subscribeToProducts((data) => {
            if (data) setProducts(data);
        });
        return () => {
            unsubLayout();
            unsubProducts();
        };
    }, []);

    const looks = layoutConfig?.stylingLooks || [];

    const handleBuyTheLook = (e: React.MouseEvent, items: Product[]) => {
        e.preventDefault();
        e.stopPropagation();
        items.forEach(item => {
            onAddToCart(item, 1);
        });
    };

    return (
        <div className="pt-32 pb-32 min-h-screen bg-stone-50 overflow-hidden">
            <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
                <Link
                    to="/"
                    className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors mb-20 group"
                >
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-2" />
                    <span>Back to Boutique</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-24 md:pl-8 border-l-2 border-[#C5A059]"
                >
                    <span className="text-[#C5A059] font-bold text-[10px] uppercase tracking-[0.4em] block mb-6">
                        Editorial Campaign
                    </span>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-stone-900 mb-8 leading-[0.9]">
                        The <br className="hidden md:block" /> Lookbook
                    </h1>
                    <p className="text-stone-500 max-w-xl font-light text-lg lg:text-xl leading-relaxed">
                        Curated silhouettes and remarkable ensembles for the modern aesthete.
                        Hover to explore individual pieces, or acquire the complete vision.
                    </p>
                </motion.div>

                {looks.length > 0 ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {looks.map((look, idx) => {
                            const lookProducts = look.productIds
                                ? look.productIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p)
                                : products.filter(p => look.productIds.includes(p.id));

                            const isHovered = activeLookId === look.id;

                            // For Masonry visual variance, every 2nd or 3rd item can have a different aspect ratio container
                            const aspectClass = idx % 2 === 0 ? "aspect-[3/4]" : idx % 3 === 0 ? "aspect-[4/5]" : "aspect-[2/3]";

                            return (
                                <motion.div
                                    key={look.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: (idx % 3) * 0.1, ease: "easeOut" }}
                                    className={`group relative ${aspectClass} rounded-sm overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 bg-stone-100 break-inside-avoid`}
                                    onMouseEnter={() => setActiveLookId(look.id)}
                                    onMouseLeave={() => setActiveLookId(null)}
                                    onClick={() => setActiveLookId(activeLookId === look.id ? null : look.id)}
                                >
                                    {/* Parallax Image Background */}
                                    <ParallaxImage src={look.image} alt={look.title} />

                                    {/* Abstract Title Overlay (Visible initially) */}
                                    <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-0 group-hover:translate-y-8 group-hover:opacity-0 transition-all duration-500 pointer-events-none z-10">
                                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                                            Look {String(idx + 1).padStart(2, '0')}
                                        </p>
                                        <h3 className="text-4xl text-white font-serif italic drop-shadow-md">
                                            {look.title}
                                        </h3>
                                    </div>

                                    {/* Interactive Hotspots (Visible on Hover) */}
                                    <AnimatePresence>
                                        {isHovered && lookProducts.map((prod, pIdx) => {
                                            const pos = getHotspotPosition(pIdx);
                                            return (
                                                <motion.div
                                                    key={prod.id + pIdx}
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    transition={{ delay: 0.1 * pIdx, duration: 0.3 }}
                                                    className="absolute z-20 flex items-center justify-center group/dot"
                                                    style={{ top: pos.top, left: pos.left }}
                                                >
                                                    {/* Pulsing ring */}
                                                    <span className="absolute w-8 h-8 bg-white/30 rounded-full animate-ping" />
                                                    {/* Solid dot */}
                                                    <span className="relative flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-lg backdrop-blur-sm transition-transform group-hover/dot:scale-125">
                                                        <Plus size={12} className="text-stone-900" />
                                                    </span>

                                                    {/* Tooltip */}
                                                    <div className="absolute left-1/2 -top-12 -translate-x-1/2 opacity-0 group-hover/dot:opacity-100 group-hover/dot:translate-y-0 pointer-events-none transition-all duration-300 transform translate-y-2 whitespace-nowrap bg-white/90 backdrop-blur-md px-3 py-2 rounded shadow-xl border border-stone-100">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059]">{prod.name}</p>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>

                                    {/* Shop Overlay (Bottom slide-up) */}
                                    <div
                                        className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-xl p-6 md:p-8 transform translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-30 border-t border-stone-200"
                                        onClick={(e) => e.stopPropagation()} // Prevent closing look on mobile when clicking panel
                                    >
                                        <div className="flex justify-between items-end mb-6">
                                            <div>
                                                <p className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Featured Pieces</p>
                                                <h4 className="text-stone-900 font-serif text-2xl italic">{look.title}</h4>
                                            </div>
                                            <p className="text-stone-500 text-xs italic">
                                                {lookProducts.length} Items
                                            </p>
                                        </div>

                                        {/* Products List Carousel/Grid */}
                                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory">
                                            {lookProducts.length > 0 ? lookProducts.map(product => (
                                                <Link
                                                    to={`/product/${product.id}`}
                                                    key={product.id}
                                                    className="flex-none w-32 md:w-40 snap-start bg-stone-50 rounded-lg p-2 border border-transparent hover:border-[#C5A059] transition-colors group/item"
                                                >
                                                    <div className="aspect-[3/4] rounded mb-3 overflow-hidden bg-white">
                                                        <img src={product.images[0]} className="w-full h-full object-cover mix-blend-multiply group-hover/item:scale-105 transition-transform duration-500" alt={product.name} />
                                                    </div>
                                                    <p className="text-[10px] uppercase font-bold text-stone-900 truncate tracking-wide">{product.name}</p>
                                                    <p className="text-[10px] text-stone-500 mt-1">₦{product.price.toLocaleString()}</p>
                                                </Link>
                                            )) : (
                                                <div className="w-full text-center text-stone-400 text-xs italic py-8">
                                                    No products linked to this ensemble.
                                                </div>
                                            )}
                                        </div>

                                        {/* Buy The Look Action */}
                                        {lookProducts.length > 0 && (
                                            <button
                                                onClick={(e) => handleBuyTheLook(e, lookProducts)}
                                                className="w-full bg-stone-900 text-white py-4 flex items-center justify-center space-x-3 hover:bg-[#C5A059] transition-colors group/btn"
                                            >
                                                <ShoppingBag size={14} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Acquire The Look</span>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 opacity-60">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="aspect-[3/4] bg-stone-200 relative overflow-hidden animate-pulse rounded-sm break-inside-avoid mb-8">
                                <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-serif italic text-2xl">
                                    Curating Ensembles...
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lookbook;
