import React, { useState } from 'react';
import { Filter, X, Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
    value: string;
    label: string;
}

interface AdvancedFiltersProps {
    // Category/Status multi-select
    categoryOptions?: FilterOption[];
    selectedCategories?: string[];
    onCategoryChange?: (categories: string[]) => void;
    categoryLabel?: string;

    // Status multi-select
    statusOptions?: FilterOption[];
    selectedStatuses?: string[];
    onStatusChange?: (statuses: string[]) => void;
    statusLabel?: string;

    // Date range
    showDateRange?: boolean;
    dateFrom?: string;
    dateTo?: string;
    onDateChange?: (from: string, to: string) => void;

    // Price range
    showPriceRange?: boolean;
    priceMin?: number;
    priceMax?: number;
    onPriceChange?: (min: number, max: number) => void;

    // Stock range
    showStockRange?: boolean;
    stockMin?: number;
    stockMax?: number;
    onStockChange?: (min: number, max: number) => void;

    // Clear all
    onClearAll?: () => void;
    hasActiveFilters?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    categoryOptions = [],
    selectedCategories = [],
    onCategoryChange,
    categoryLabel = 'Category',

    statusOptions = [],
    selectedStatuses = [],
    onStatusChange,
    statusLabel = 'Status',

    showDateRange = false,
    dateFrom = '',
    dateTo = '',
    onDateChange,

    showPriceRange = false,
    priceMin = 0,
    priceMax = 0,
    onPriceChange,

    showStockRange = false,
    stockMin = 0,
    stockMax = 0,
    onStockChange,

    onClearAll,
    hasActiveFilters = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleCategory = (value: string) => {
        if (!onCategoryChange) return;
        if (selectedCategories.includes(value)) {
            onCategoryChange(selectedCategories.filter(c => c !== value));
        } else {
            onCategoryChange([...selectedCategories, value]);
        }
    };

    const toggleStatus = (value: string) => {
        if (!onStatusChange) return;
        if (selectedStatuses.includes(value)) {
            onStatusChange(selectedStatuses.filter(s => s !== value));
        } else {
            onStatusChange([...selectedStatuses, value]);
        }
    };

    const activeFilterCount =
        selectedCategories.length +
        selectedStatuses.length +
        (dateFrom || dateTo ? 1 : 0) +
        (priceMin > 0 || priceMax > 0 ? 1 : 0) +
        (stockMin > 0 || stockMax > 0 ? 1 : 0);

    return (
        <div className="relative">
            {/* Filter Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${hasActiveFilters || activeFilterCount > 0
                        ? 'bg-[#C5A059] text-white border-[#C5A059]'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
            >
                <Filter size={14} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[9px]">
                        {activeFilterCount}
                    </span>
                )}
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-4 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <h4 className="text-xs font-black uppercase tracking-widest text-stone-900">Advanced Filters</h4>
                            <div className="flex items-center gap-2">
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={() => {
                                            onClearAll?.();
                                            onCategoryChange?.([]);
                                            onStatusChange?.([]);
                                            onDateChange?.('', '');
                                            onPriceChange?.(0, 0);
                                            onStockChange?.(0, 0);
                                        }}
                                        className="text-[9px] font-bold text-red-500 hover:underline uppercase tracking-widest"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Category Multi-Select */}
                        {categoryOptions.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{categoryLabel}</label>
                                <div className="flex flex-wrap gap-2">
                                    {categoryOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => toggleCategory(opt.value)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${selectedCategories.includes(opt.value)
                                                    ? 'bg-[#C5A059] text-white border-[#C5A059]'
                                                    : 'bg-stone-50 text-stone-600 border-stone-100 hover:border-stone-300'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Multi-Select */}
                        {statusOptions.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{statusLabel}</label>
                                <div className="flex flex-wrap gap-2">
                                    {statusOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => toggleStatus(opt.value)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${selectedStatuses.includes(opt.value)
                                                    ? 'bg-[#C5A059] text-white border-[#C5A059]'
                                                    : 'bg-stone-50 text-stone-600 border-stone-100 hover:border-stone-300'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Date Range */}
                        {showDateRange && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar size={10} /> Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => onDateChange?.(e.target.value, dateTo)}
                                        className="px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold focus:outline-none focus:border-[#C5A059]"
                                        placeholder="From"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => onDateChange?.(dateFrom, e.target.value)}
                                        className="px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold focus:outline-none focus:border-[#C5A059]"
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Price Range */}
                        {showPriceRange && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Price Range (₦)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        value={priceMin || ''}
                                        onChange={(e) => onPriceChange?.(parseInt(e.target.value) || 0, priceMax)}
                                        placeholder="Min"
                                        className="px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold focus:outline-none focus:border-[#C5A059]"
                                    />
                                    <input
                                        type="number"
                                        value={priceMax || ''}
                                        onChange={(e) => onPriceChange?.(priceMin, parseInt(e.target.value) || 0)}
                                        placeholder="Max"
                                        className="px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold focus:outline-none focus:border-[#C5A059]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Stock Range */}
                        {showStockRange && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Stock Level</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        value={stockMin || ''}
                                        onChange={(e) => onStockChange?.(parseInt(e.target.value) || 0, stockMax)}
                                        placeholder="Min"
                                        className="px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold focus:outline-none focus:border-[#C5A059]"
                                    />
                                    <input
                                        type="number"
                                        value={stockMax || ''}
                                        onChange={(e) => onStockChange?.(stockMin, parseInt(e.target.value) || 0)}
                                        placeholder="Max"
                                        className="px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold focus:outline-none focus:border-[#C5A059]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Apply Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedFilters;
