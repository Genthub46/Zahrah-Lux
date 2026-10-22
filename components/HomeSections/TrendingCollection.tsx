import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';
import { useNavigate } from 'react-router-dom';

interface TrendingCollectionProps {
    title?: string;
    products: Product[];
    onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
    onLogView: (id: string) => void;
    onToggleWishlist: (product: Product) => void;
    isWishlisted: (id: string) => boolean;
    selectedProductIds?: string[];
}

const TrendingCollection: React.FC<TrendingCollectionProps> = ({
    title = "Trending",
    products,
    onAddToCart,
    onLogView,
    onToggleWishlist,
    isWishlisted,
    selectedProductIds
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 1. Try to find the selected products that ACTUALLY exist in the active catalog
    const explicitlySelected = selectedProductIds && selectedProductIds.length > 0
        ? products.filter(p => selectedProductIds.includes(p.id))
        : [];

    // 2. Defensive fallback: if no valid products are explicitly selected, fall back to active boutique highlights
    const fallbackProducts = products
        .filter(p => p.tags?.some(t => /trending|featured|best|hot|new/i.test(t)) || (p.price && p.price > 45000))
        .slice(0, 8);

    const trendingProducts = explicitlySelected.length > 0
        ? explicitlySelected
        : (fallbackProducts.length > 0 ? fallbackProducts : products.slice(0, 8));

    if (trendingProducts.length === 0) {
        return null;
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-12 md:py-16 bg-[#FAF9F7] border-t border-stone-200/80 overflow-hidden w-full">
            <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12 w-full min-w-0">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={13} className="text-[#C5A059]" />
                            <span className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.3em] block">
                                Curated Edit
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 leading-tight">
                            {title} <span className="italic text-stone-400 font-light">Collection</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-sm"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-sm"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/?tag=trending')}
                            className="hidden md:flex items-center px-6 py-2.5 border border-stone-300 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-sm"
                        >
                            View All
                        </button>
                    </div>
                </div>

                {/* Product Carousel */}
                <div
                    ref={scrollRef}
                    className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-1 snap-x snap-mandatory"
                >
                    {trendingProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08, duration: 0.5 }}
                            className="w-[280px] md:w-[320px] flex-shrink-0 snap-start bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <ProductCard
                                product={product}
                                onAddToCart={onAddToCart}
                                onLogView={onLogView}
                                onToggleWishlist={onToggleWishlist}
                                isWishlisted={isWishlisted(product.id)}
                            />
                        </motion.div>
                    ))}

                    {/* View All Card */}
                    <motion.div
                        className="w-[280px] md:w-[320px] flex-shrink-0 snap-start flex items-center justify-center bg-stone-100/80 rounded-xl border border-stone-200/50 cursor-pointer group hover:bg-stone-100 transition-colors"
                        onClick={() => navigate('/?tag=trending')}
                    >
                        <div className="flex flex-col items-center text-stone-400 group-hover:text-[#C5A059] transition-colors p-8 text-center">
                            <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ArrowRight size={24} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Explore All Pieces</span>
                            <span className="text-[10px] text-stone-400 mt-1">Discover more in our catalogue</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default TrendingCollection;
