
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';
import { useNavigate } from 'react-router-dom';

interface ManorCollectionProps {
    products: Product[];
    onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
    onLogView: (id: string) => void;
    onToggleWishlist: (product: Product) => void;
    isWishlisted: (id: string) => boolean;
    selectedProductIds?: string[];
}

const ManorCollection: React.FC<ManorCollectionProps> = ({
    products,
    onAddToCart,
    onLogView,
    onToggleWishlist,
    isWishlisted,
    selectedProductIds
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Filter relevant products - for now taking the most expensive ones or 'Premium' tagged
    // In a real app this would be a specific collection fetch
    const manorProducts = selectedProductIds && selectedProductIds.length > 0
        ? products.filter(p => selectedProductIds.includes(p.id))
        : products
            .filter(p => p.price > 100000 || p.tags.includes('Manor'))
            .slice(0, 8);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-20 bg-stone-50">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex flex-row justify-between items-end mb-12">
                    <div>
                        <span className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.3em] mb-3 block">
                            Exclusive Selection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 leading-tight">
                            Zarhrah <span className="italic text-stone-400">Manor</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/?collection=manor')}
                            className="hidden md:flex items-center px-6 py-2.5 border border-stone-300 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                        >
                            View All
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-1 snap-x snap-mandatory"
                >
                    {manorProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="w-[280px] md:w-[320px] flex-shrink-0 snap-start bg-white p-4 rounded-sm" // Added white card bg for 'Manor' feel
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
                        className="w-[280px] md:w-[320px] flex-shrink-0 snap-start flex items-center justify-center bg-stone-100 rounded-sm cursor-pointer group"
                        onClick={() => navigate('/?collection=manor')}
                    >
                        <div className="flex flex-col items-center text-stone-400 group-hover:text-[#C5A059] transition-colors">
                            <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center mb-4">
                                <ArrowRight size={24} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">View All Products</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ManorCollection;
