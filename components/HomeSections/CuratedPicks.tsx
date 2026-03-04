import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, HomeLayoutConfig } from '../../types';
import ProductCard from '../ProductCard';
import { useNavigate } from 'react-router-dom';

interface CuratedPicksProps {
    products: Product[];
    onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
    onLogView: (id: string) => void;
    onToggleWishlist: (product: Product) => void;
    isWishlisted: (id: string) => boolean;
    layoutConfig?: HomeLayoutConfig;
}

interface CuratedSectionProps extends CuratedPicksProps {
    tabs: { id: string; label: string }[];
    sectionIndex: number;
}

const CuratedSection: React.FC<CuratedSectionProps> = ({
    tabs,
    sectionIndex,
    products,
    onAddToCart,
    onLogView,
    onToggleWishlist,
    isWishlisted,
    layoutConfig
}) => {
    // If no tabs are visible in this group, don't render the section at all
    if (tabs.length === 0) return null;

    const [activeTabId, setActiveTabId] = useState(tabs[0].id);
    const navigate = useNavigate();

    // Ensure we have a valid active tab if tabs change props
    React.useEffect(() => {
        if (!tabs.find(t => t.id === activeTabId)) {
            setActiveTabId(tabs[0].id);
        }
    }, [tabs, activeTabId]);

    const activeTabLabel = tabs.find(t => t.id === activeTabId)?.label || '';

    const filteredProducts = useMemo(() => {
        // 1. Check for manual override using the CATEGORY ID (stable key) or Label (legacy fallback)
        const curatedPicks = layoutConfig?.curatedPicks || {};

        // Try precise ID match first, then label match for backward compatibility
        const manualIds = curatedPicks[activeTabId] || curatedPicks[activeTabLabel];

        if (manualIds && manualIds.length > 0) {
            return products.filter(p => manualIds.includes(p.id));
        }

        // 2. Fallback to Tag/Category matching
        const search = activeTabLabel.toLowerCase().replace('-', '');
        return products.filter(p => {
            const tags = p.tags.map(t => t.toLowerCase());
            const category = p.category.toLowerCase();

            if (search === 'tshirts') return tags.includes('t-shirts') || tags.includes('tees') || category.includes('t-shirt');
            return tags.includes(search) || category.includes(search) || p.name.toLowerCase().includes(search);
        }).slice(0, 8);
    }, [products, activeTabId, activeTabLabel, layoutConfig]);

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
                <div className="flex gap-x-8 items-baseline overflow-x-auto no-scrollbar w-full md:w-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`text-xl md:text-3xl font-serif transition-colors duration-300 whitespace-nowrap ${activeTabId === tab.id
                                ? 'text-stone-900 border-b-2 border-stone-900'
                                : 'text-stone-300 hover:text-stone-500'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6 shrink-0">
                    <button
                        onClick={() => navigate(`/?category=${activeTabLabel.toLowerCase()}`)}
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
                            <p className="text-2xl font-serif italic">No {activeTabLabel} available currently.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const DEFAULT_CATEGORIES = [
    { id: 't-shirts', label: 'T-Shirts', isVisible: true },
    { id: 'pants', label: 'Pants', isVisible: true },
    { id: 'jackets', label: 'Jackets', isVisible: true },
    { id: 'shorts', label: 'Shorts', isVisible: true },
    { id: 'slides', label: 'Slides', isVisible: true },
    { id: 'bags', label: 'Bags', isVisible: true }
];

const CuratedPicks: React.FC<CuratedPicksProps> = (props) => {
    // 1. Get Categories from config or fallback
    const allCategories = props.layoutConfig?.curatedCategories || DEFAULT_CATEGORIES;

    // 2. Filter visible only
    const visibleCategories = allCategories.filter(c => c.isVisible !== false);

    // 3. Chunk into groups of 3 for the layout (replicating original design)
    const categoryGroups = [];
    for (let i = 0; i < visibleCategories.length; i += 3) {
        categoryGroups.push(visibleCategories.slice(i, i + 3));
    }

    return (
        <section className="py-24 bg-stone-50/50 border-t border-stone-100">
            <div className="px-4 sm:px-6 lg:px-12 max-w-[1800px] mx-auto">
                {categoryGroups.map((group, idx) => (
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
