
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';
import { useNavigate } from 'react-router-dom';

interface BundlesDealsProps {
    products: Product[];
    onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
    onLogView: (id: string) => void;
    onToggleWishlist: (product: Product) => void;
    isWishlisted: (id: string) => boolean;
    selectedProductIds?: string[];
}

const BundlesDeals: React.FC<BundlesDealsProps> = ({
    products,
    onAddToCart,
    onLogView,
    onToggleWishlist,
    isWishlisted,
    selectedProductIds
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Mocking specific products for this section
    // In a real app, you might filter by a 'bundle' tag or 'sale' category

    const bundleProducts = selectedProductIds && selectedProductIds.length > 0
        ? products.filter(p => selectedProductIds.includes(p.id))
        : products
            .slice(0, 8)
            .sort(() => 0.5 - Math.random()); // Shuffle for variety

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-20 bg-white border-t border-stone-100">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex flex-row justify-between items-center mb-10">
                    <div>
                        <span className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.3em] mb-3 block">
                            Last Chance To Buy
                        </span>
                        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 leading-tight">
                            Bundles <span className="italic text-stone-400">Deals</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => scroll('left')}
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <button
                            onClick={() => navigate('/?tag=bundle')}
                            className="hidden md:flex items-center px-5 py-2 border border-stone-200 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all"
                        >
                            View All
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-1 snap-x snap-mandatory"
                >
                    {bundleProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05, duration: 0.5 }}
                            className="w-[260px] md:w-[280px] flex-shrink-0 snap-start bg-stone-50/50 p-3 rounded-sm"
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
                </div>
            </div>
        </section>
    );
};

export default BundlesDeals;
