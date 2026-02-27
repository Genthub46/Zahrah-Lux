
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';
import { useNavigate } from 'react-router-dom';

interface CuratedPicksProps {
    products: Product[];
    onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
    onLogView: (id: string) => void;
    onToggleWishlist: (product: Product) => void;
    isWishlisted: (id: string) => boolean;
}

const TAB_GROUPS = [
    ['T-Shirts', 'Pants', 'Jackets'],
    ['Shorts', 'Slides', 'Bags']
];

interface CuratedSectionProps extends CuratedPicksProps {
    tabs: string[];
    sectionIndex: number;
}

const CuratedSection: React.FC<CuratedSectionProps> = ({
    tabs,
    sectionIndex,
    products,
    onAddToCart,
    onLogView,
    onToggleWishlist,
    isWishlisted
}) => {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const navigate = useNavigate();

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const search = activeTab.toLowerCase().replace('-', '');
            const tags = p.tags.map(t => t.toLowerCase());
            const category = p.category.toLowerCase();

            if (search === 'tshirts') return tags.includes('t-shirts') || tags.includes('tees') || category.includes('t-shirt');
            return tags.includes(search) || category.includes(search) || p.name.toLowerCase().includes(search);
        }).slice(0, 8);
    }, [products, activeTab]);

    const scrollContainerId = `scroll-curated-picks-${sectionIndex}`;

    const scroll = (direction: 'left' | 'right') => {
        const el = document.getElementById(scrollContainerId);
        if (el) {
            const { scrollLeft, clientWidth } = el;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            el.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="mb-24 last:mb-0">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 md:gap-8">
                <div className="flex gap-x-8 items-baseline">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-xl md:text-3xl font-serif transition-colors duration-300 ${activeTab === tab
                                ? 'text-stone-900 border-b-2 border-stone-900'
                                : 'text-stone-300 hover:text-stone-500'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(`/?category=${activeTab.toLowerCase()}`)}
                        className="hidden md:block px-6 py-3 border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all"
                    >
                        View All
                    </button>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-12 h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-12 h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div
                id={scrollContainerId}
                className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-1 snap-x snap-mandatory"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="w-[280px] md:w-[350px] flex-shrink-0 snap-start"
                        >
                            <ProductCard
                                product={product}
                                onAddToCart={onAddToCart}
                                onLogView={onLogView}
                                onToggleWishlist={onToggleWishlist}
                                isWishlisted={isWishlisted(product.id)}
                            />
                        </motion.div>
                    )) : (
                        <div className="w-full py-20 flex flex-col items-center justify-center text-stone-300 opacity-60">
                            <p className="text-2xl font-serif italic">No {activeTab} available currently.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const CuratedPicks: React.FC<CuratedPicksProps> = (props) => {
    return (
        <section className="py-24 bg-stone-50/50 border-t border-stone-100">
            <div className="px-4 sm:px-6 lg:px-12 max-w-[1800px] mx-auto">
                {TAB_GROUPS.map((group, idx) => (
                    <CuratedSection
                        key={idx}
                        tabs={group}
                        sectionIndex={idx}
                        {...props}
                    />
                ))}
            </div>
        </section>
    );
};

export default CuratedPicks;
