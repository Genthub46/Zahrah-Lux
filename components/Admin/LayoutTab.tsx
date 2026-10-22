import React, { useState, useMemo } from 'react';
import { uploadImageToCloudinary } from '../../services/cloudinary';
import { Eye, EyeOff, Trash2, CheckCircle2, LayoutTemplate, Plus, Upload, Loader2, Image as ImageIcon, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronDown, Search, X, List, LayoutGrid, Sparkles, ShieldCheck, RefreshCw, UploadCloud } from 'lucide-react';
import { HomeLayoutConfig, SectionConfig, Product } from '../../types';
import { saveLayoutConfig, logAdminAction, isSandboxMode, setSandboxMode, resetSandboxFromLive, publishSandboxToLive } from '../../services/dbUtils';
import { auth } from '../../services/firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

// --- Shared Types ---
interface EditorProps {
    layoutConfig: HomeLayoutConfig;
    products: Product[];
    onUpdate: (updates: Partial<HomeLayoutConfig>, logDetail?: string) => Promise<void>;
}

// --- Reusable Searchable Product Selector ---
interface SearchableProductSelectorProps {
    products: Product[];
    selectedIds: string[];
    onToggle: (productId: string) => void;
    placeholder?: string;
    compact?: boolean;
    defaultView?: 'list' | 'grid';
}

const SearchableProductSelector: React.FC<SearchableProductSelectorProps> = ({
    products,
    selectedIds,
    onToggle,
    placeholder = "Search by name, brand, or tag...",
    compact = false,
    defaultView
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(compact ? 'list' : (defaultView || 'list'));

    // Category counts for quick numbers in dropdown
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        products.forEach(p => {
            if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return counts;
    }, [products]);

    // Extract sorted unique categories
    const categories = useMemo(() => {
        const cats = new Set<string>();
        products.forEach(p => {
            if (p.category) cats.add(p.category);
        });
        return ['ALL', ...Array.from(cats).sort()];
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return products.filter(p => {
            if (showSelectedOnly && !selectedIds.includes(p.id)) {
                return false;
            }
            if (selectedCategory !== 'ALL' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
                return false;
            }
            if (query) {
                const matchName = p.name?.toLowerCase().includes(query);
                const matchBrand = p.brand?.toLowerCase().includes(query);
                const matchTags = p.tags?.some(t => t.toLowerCase().includes(query));
                if (!matchName && !matchBrand && !matchTags) return false;
            }
            return true;
        });
    }, [products, searchQuery, selectedCategory, showSelectedOnly, selectedIds]);

    return (
        <div className="space-y-3 w-full">
            {/* Sleek, Single-Tier Control Bar */}
            <div className="bg-stone-50/90 p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 flex flex-wrap sm:flex-nowrap gap-2 items-center">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[160px] w-full sm:w-auto">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-8 pr-7 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Category Dropdown */}
                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="px-2.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:border-stone-900 transition-colors cursor-pointer shrink-0 max-w-[150px] truncate"
                    title="Filter by department"
                >
                    <option value="ALL">All Categories ({products.length})</option>
                    {categories.filter(c => c !== 'ALL').map(cat => (
                        <option key={cat} value={cat}>
                            {cat} ({categoryCounts[cat] || 0})
                        </option>
                    ))}
                </select>

                {/* Show Selected Only Toggle */}
                <button
                    type="button"
                    onClick={() => setShowSelectedOnly(prev => !prev)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                        showSelectedOnly
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                >
                    <CheckCircle2 size={12} className={showSelectedOnly ? 'text-[#C5A059]' : 'text-stone-400'} />
                    <span>Selected ({selectedIds.length})</span>
                </button>

                {/* View Mode Toggle: List vs Grid */}
                <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                        title="Compact List View"
                    >
                        <List size={13} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                        title="Tile Grid View"
                    >
                        <LayoutGrid size={13} />
                    </button>
                </div>
            </div>

            {/* Empty state vs Content */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-6 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                    <p className="text-xs text-stone-500 font-bold">No products match your search or filter.</p>
                    <button
                        type="button"
                        onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setShowSelectedOnly(false); }}
                        className="mt-1.5 text-[10px] text-[#C5A059] font-bold uppercase tracking-widest hover:underline"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : viewMode === 'list' ? (
                /* Compact List View */
                <div className={`overflow-y-auto space-y-1.5 p-1 scrollbar-thin ${compact ? 'max-h-56' : 'max-h-80'}`}>
                    {filteredProducts.map(p => {
                        const isActive = selectedIds.includes(p.id);
                        return (
                            <div
                                key={p.id}
                                onClick={() => onToggle(p.id)}
                                className={`flex items-center gap-3 p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                                    isActive
                                        ? 'bg-stone-900/5 border-[#C5A059]/60 shadow-sm'
                                        : 'bg-white border-stone-100 hover:border-stone-300 hover:bg-stone-50'
                                }`}
                            >
                                {/* Thumbnail */}
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 relative border border-stone-200">
                                    {p.images?.[0] ? (
                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-400">N/A</div>
                                    )}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                                            <CheckCircle2 size={14} className="text-[#C5A059]" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h5 className="text-xs font-bold text-stone-900 truncate">{p.name}</h5>
                                        {p.category && (
                                            <span className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                                                {p.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2.5 mt-0.5">
                                        <span className="text-[10px] font-bold text-[#C5A059]">₦{p.price.toLocaleString()}</span>
                                        {p.brand && <span className="text-[9px] text-stone-400 truncate max-w-[120px]">{p.brand}</span>}
                                        {p.stock !== undefined && (
                                            <span className={`text-[8px] font-semibold ${p.stock > 0 ? 'text-emerald-600' : 'text-stone-400'}`}>
                                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Toggle Action Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggle(p.id);
                                    }}
                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                                        isActive
                                            ? 'bg-stone-900 text-white shadow-sm ring-1 ring-[#C5A059]/50'
                                            : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200 group-hover:text-stone-900'
                                    }`}
                                >
                                    {isActive ? (
                                        <>
                                            <CheckCircle2 size={11} className="text-[#C5A059]" />
                                            <span>Selected</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={11} />
                                            <span>Add</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Compact Mini-Grid View */
                <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 overflow-y-auto p-1 scrollbar-thin ${compact ? 'max-h-56' : 'max-h-80'}`}>
                    {filteredProducts.map(p => {
                        const isActive = selectedIds.includes(p.id);
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => onToggle(p.id)}
                                className={`relative group rounded-xl border-2 transition-all p-1 overflow-hidden flex flex-col text-left ${
                                    isActive
                                        ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10 shadow-sm'
                                        : 'border-stone-100 bg-white opacity-80 hover:opacity-100 hover:border-stone-300'
                                }`}
                                title={p.name}
                            >
                                <div className="w-full h-20 sm:h-24 rounded-lg overflow-hidden relative bg-stone-100">
                                    {p.images?.[0] ? (
                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">No Image</div>
                                    )}

                                    {isActive && (
                                        <div className="absolute top-1 right-1 bg-stone-900 text-white p-1 rounded-full shadow-md z-10">
                                            <CheckCircle2 size={10} className="text-[#C5A059]" />
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/90 via-stone-950/60 to-transparent p-1 pt-3 text-white">
                                        <p className="text-[8px] font-bold truncate leading-tight">{p.name}</p>
                                        <p className="text-[7.5px] text-[#C5A059] font-black">₦{p.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


// --- Extracted Components ---

const StaticSectionControl: React.FC<{
    title: string;
    visibilityKey: keyof HomeLayoutConfig;
    productKey?: 'manorProductIds' | 'stylingProductIds' | 'bundlesProductIds';
    bannerImageKey?: 'boutiqueBannerImage' | 'heroImage';
    textInputKey?: 'boutiqueBannerTitle';
    limit?: number;
} & EditorProps> = ({
    title,
    visibilityKey,
    productKey,
    bannerImageKey,
    textInputKey,
    layoutConfig,
    products,
    onUpdate
}) => {
        const isVisible = layoutConfig[visibilityKey] ?? true;
        const [isExpanded, setIsExpanded] = useState(false);
        const [isUploading, setIsUploading] = useState(false);
        const selectedIds = productKey ? (layoutConfig[productKey] || []) : [];
        const bannerImage = bannerImageKey ? (layoutConfig[bannerImageKey] || '') : '';
        const bannerTitle = textInputKey ? (layoutConfig[textInputKey] || '') : '';

        const toggleVisibility = async () => {
            await onUpdate(
                { [visibilityKey]: !isVisible },
                `Toggled visibility of ${title} to ${!isVisible ? 'Visible' : 'Hidden'}`
            );
        };

        const handleBannerChange = async (url: string) => {
            if (bannerImageKey) await onUpdate(
                { [bannerImageKey]: url },
                `Updated banner image for ${title}`
            );
        };

        const handleTitleChange = async (val: string) => {
            if (textInputKey) await onUpdate(
                { [textInputKey]: val },
                `Updated title for ${title} to '${val}'`
            );
        };

        const toggleProduct = async (productId: string) => {
            if (!productKey) return;
            const currentIds = layoutConfig[productKey] || [];
            const exists = currentIds.includes(productId);
            const newIds = exists ? currentIds.filter(id => id !== productId) : [...currentIds, productId];
            await onUpdate(
                { [productKey]: newIds },
                `Updated products for ${title}. New count: ${newIds.length}`
            );
        };

        const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !bannerImageKey) return;

            try {
                setIsUploading(true);
                const url = await uploadImageToCloudinary(file);
                await handleBannerChange(url);
            } catch (error) {
                console.error("Upload failed", error);
                alert("Failed to upload image.");
            } finally {
                setIsUploading(false);
            }
        };

        const canExpand = Boolean(productKey && isVisible);

        return (
            <div className="bg-white border border-stone-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                <div 
                    onClick={() => {
                        if (canExpand) setIsExpanded(!isExpanded);
                    }}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 ${canExpand ? 'cursor-pointer group select-none' : ''}`}
                >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVisibility();
                                }}
                                className={`p-2.5 sm:p-2 rounded-full transition-all duration-300 shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center ${isVisible ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-400'}`}
                                title={isVisible ? `Hide ${title}` : `Show ${title}`}
                            >
                                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <div className="min-w-0">
                                <h4 className={`font-bold text-stone-900 text-sm truncate ${canExpand ? 'group-hover:text-[#C5A059] transition-colors' : ''}`}>{title}</h4>
                                {productKey && (
                                    <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest mt-0.5 truncate">
                                        {selectedIds.length} Selected {canExpand && `• Click to ${isExpanded ? 'Close' : 'Select'}`}
                                    </p>
                                )}
                            </div>
                        </div>
                        {canExpand && (
                            <div className="sm:hidden text-stone-400 p-1">
                                <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                        )}
                    </div>

                    {/* Action Controls & Inputs */}
                    <div onClick={(e) => e.stopPropagation()} className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                        {bannerImageKey && isVisible && (
                            <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[180px]">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Paste URL..."
                                        defaultValue={bannerImage}
                                        onBlur={(e) => handleBannerChange(e.target.value)}
                                        key={bannerImage as string}
                                        className="w-full pl-9 pr-3 py-2 text-[10px] bg-stone-50 border border-stone-100 rounded-lg focus:outline-none focus:border-[#C5A059]"
                                    />
                                </div>

                                <label className={`flex items-center justify-center p-2 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors shrink-0 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                    {isUploading ? <Loader2 size={16} className="animate-spin text-[#C5A059]" /> : <Upload size={16} className="text-stone-500" />}
                                </label>
                            </div>
                        )}

                        {textInputKey && isVisible && (
                            <div className="min-w-[120px] sm:min-w-[140px]">
                                <input
                                    type="text"
                                    placeholder="BANNER TITLE"
                                    value={bannerTitle as string}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-[10px] bg-stone-50 border border-stone-100 rounded-lg focus:outline-none focus:border-[#C5A059] font-bold tracking-widest uppercase"
                                />
                            </div>
                        )}

                        {productKey && isVisible && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className={`w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 min-h-[40px] sm:min-h-0 ${isExpanded ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-[#C5A059] hover:text-[#C5A059] active:bg-stone-100'}`}
                            >
                                <span>{isExpanded ? 'Close' : 'Select Products'}</span>
                                <ChevronDown size={13} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && productKey && isVisible && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 border-t border-stone-100 mt-6">
                                <p className="text-xs text-stone-400 mb-4 italic">
                                    Select products to feature in {title}. Default logic applies if none selected.
                                </p>
                                <SearchableProductSelector
                                    products={products}
                                    selectedIds={selectedIds}
                                    onToggle={toggleProduct}
                                    placeholder={`Filter products for ${title}...`}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        );
    };

const LifestyleEditor: React.FC<EditorProps> = ({ layoutConfig, onUpdate }) => {
    const isVisible = layoutConfig.showLifestyle ?? true;
    const images = layoutConfig.lifestyleImages || ["", ""];
    const [isExpanded, setIsExpanded] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const updateLifestyleImage = async (index: 0 | 1, url: string) => {
        const currentImages = layoutConfig.lifestyleImages || ["", ""];
        const newImages: [string, string] = [...currentImages] as [string, string];
        newImages[index] = url;
        await onUpdate(
            { lifestyleImages: newImages },
            `Updated Lifestyle Muse image ${index === 0 ? 'Left' : 'Right'}`
        );
    };

    const handleUpload = async (file: File, index: 0 | 1) => {
        try {
            setUploadingIndex(index);
            const url = await uploadImageToCloudinary(file);
            await updateLifestyleImage(index, url);
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploadingIndex(null);
        }
    };

    if (!isVisible) return <StaticSectionControl title="Lifestyle Showcase" visibilityKey="showLifestyle" layoutConfig={layoutConfig} products={[]} onUpdate={onUpdate} />;

    return (
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex flex-wrap justify-between items-center gap-4 cursor-pointer group select-none"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({ showLifestyle: !isVisible }, `Toggled visibility of Lifestyle Showcase`);
                        }} 
                        className="p-2 rounded-full bg-stone-900 text-white shadow-md shrink-0 hover:scale-105 transition-transform"
                        title={isVisible ? "Hide Lifestyle Showcase" : "Show Lifestyle Showcase"}
                    >
                        <Eye size={16} />
                    </button>
                    <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#C5A059] transition-colors truncate">
                            Lifestyle Showcase
                        </h4>
                        <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest mt-0.5">
                            Dual Muse Banners &bull; Click to {isExpanded ? 'Close' : 'Edit'}
                        </p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }} 
                    className={`w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 min-h-[40px] sm:min-h-0 ${
                        isExpanded 
                            ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                            : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-[#C5A059] hover:text-[#C5A059] active:bg-stone-100'
                    }`}
                >
                    <span>{isExpanded ? 'Close Editor' : 'Edit Muses'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-6 border-t border-stone-100 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[0, 1].map((idx) => (
                                <div key={idx} className="space-y-3">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#C5A059]">{idx === 0 ? 'Left: Accessories' : 'Right: Streetwear'}</p>
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 group">
                                        {images[idx] && <img src={images[idx]} className="w-full h-full object-cover" />}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer p-3 bg-white rounded-full hover:scale-110 transition-transform">
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], idx as 0 | 1)} disabled={uploadingIndex !== null} />
                                                {uploadingIndex === idx ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={images[idx]}
                                        onChange={(e) => updateLifestyleImage(idx as 0 | 1, e.target.value)}
                                        className="w-full bg-stone-50 px-3 py-2 rounded-lg text-[10px] border border-stone-100 focus:outline-none focus:border-[#C5A059]"
                                        placeholder="Image URL"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CuratedPicksEditor: React.FC<EditorProps> = ({ layoutConfig, products, onUpdate }) => {
    const categories = (layoutConfig.curatedCategories && layoutConfig.curatedCategories.length > 0) ? layoutConfig.curatedCategories : [
        { id: 't-shirts', label: 'T-Shirts', isVisible: true },
        { id: 'pants', label: 'Pants', isVisible: true },
        { id: 'jackets', label: 'Jackets', isVisible: true },
        { id: 'shorts', label: 'Shorts', isVisible: true },
        { id: 'slides', label: 'Slides', isVisible: true },
        { id: 'bags', label: 'Bags', isVisible: true }
    ];
    // Default active to first visible or just first
    const [activeTabId, setActiveTabId] = useState(categories[0]?.id || "t-shirts");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isManagingCats, setIsManagingCats] = useState(false);

    const activeCategory = categories.find(c => c.id === activeTabId) || categories[0] || { id: "t-shirts", label: "T-Shirts" };
    const currentIds = layoutConfig.curatedPicks?.[activeTabId] || [];

    const toggleProduct = async (productId: string) => {
        const newIds = currentIds.includes(productId)
            ? currentIds.filter(id => id !== productId)
            : [...currentIds, productId];

        const newConfig = { ...(layoutConfig.curatedPicks || {}) };
        newConfig[activeTabId] = newIds;
        await onUpdate(
            { curatedPicks: newConfig },
            `Updated curated picks for ${activeCategory.label}. Count: ${newIds.length}`
        );
    };

    const updateCategory = async (id: string, updates: Partial<{ label: string; isVisible: boolean }>) => {
        const newCategories = categories.map(c => c.id === id ? { ...c, ...updates } : c);
        await onUpdate(
            { curatedCategories: newCategories },
            `Updated category settings for ${id}`
        );
    };

    return (
        <div className="bg-white border border-stone-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 cursor-pointer group select-none"
            >
                <div className="min-w-0">
                    <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#C5A059] transition-colors truncate">
                        Curated Categories
                    </h4>
                    <p className="text-[10px] text-stone-400">
                        {categories.filter(c => c.isVisible !== false).length} Tabs Active &bull; Click to {isExpanded ? 'Close' : 'Assign Products'}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsManagingCats(!isManagingCats);
                        }} 
                        className={`flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all text-center min-h-[40px] sm:min-h-0 ${isManagingCats ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400 active:bg-stone-100'}`}
                    >
                        {isManagingCats ? 'Done' : 'Edit Tabs'}
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }} 
                        className={`flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 min-h-[40px] sm:min-h-0 ${isExpanded ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-[#C5A059] hover:text-[#C5A059] active:bg-stone-100'}`}
                    >
                        <span>{isExpanded ? 'Close' : 'Assign Products'}</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-6 border-t border-stone-100 mt-6">
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                {categories.filter(c => c.isVisible !== false).map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTabId(cat.id)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeTabId === cat.id ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-stone-500 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                                Select products to appear in the <strong>{activeCategory.label}</strong> tab. <br />
                                <span className="opacity-60 text-[10px]">Ensure products are tagged correctly if you don't select any here.</span>
                            </p>

                            <SearchableProductSelector
                                products={products}
                                selectedIds={currentIds}
                                onToggle={toggleProduct}
                                placeholder={`Filter products for ${activeCategory.label}...`}
                            />
                        </div>
                    </motion.div>
                )}

                {isManagingCats && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-6 border-t border-stone-100 mt-6 space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Edit Category Tabs</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                                        <button
                                            onClick={() => updateCategory(cat.id, { isVisible: !cat.isVisible })}
                                            className={`p-2 rounded-full transition-colors ${cat.isVisible !== false ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}
                                        >
                                            {cat.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <input
                                            type="text"
                                            value={cat.label}
                                            onChange={(e) => updateCategory(cat.id, { label: e.target.value })}
                                            className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-bold border border-stone-200 focus:border-[#C5A059] focus:outline-none"
                                        />
                                        <div className="px-2 py-1 bg-stone-200 rounded text-[9px] font-mono text-stone-500">ID: {cat.id}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StylingLooksEditor: React.FC<EditorProps> = ({ layoutConfig, products, onUpdate }) => {
    const isVisible = layoutConfig.showStyling ?? true;
    const looks = layoutConfig.stylingLooks || [];
    const [isExpanded, setIsExpanded] = useState(false);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const addLook = async () => {
        const newLook = {
            id: `look-${Date.now()}`,
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80",
            title: "New Ensemble",
            price: "₦150,000",
            productIds: []
        };
        await onUpdate(
            { stylingLooks: [...looks, newLook] },
            "Added new styling look"
        );
    };

    const updateLook = async (id: string, updates: Partial<typeof looks[0]>) => {
        const newLooks = looks.map(l => l.id === id ? { ...l, ...updates } : l);
        const look = looks.find(l => l.id === id);
        await onUpdate(
            { stylingLooks: newLooks },
            `Updated styling look '${look?.title || id}'`
        );
    };

    const deleteLook = async (id: string) => {
        if (confirm("Delete this look?")) {
            await onUpdate(
                { stylingLooks: looks.filter(l => l.id !== id) },
                "Deleted styling look"
            );
        }
    };

    const handleImageUpload = async (id: string, file: File) => {
        try {
            setUploadingId(id);
            const url = await uploadImageToCloudinary(file);
            await updateLook(id, { image: url });
        } finally { setUploadingId(null); }
    };

    const toggleProductInLook = async (lookId: string, productId: string) => {
        const look = looks.find(l => l.id === lookId);
        if (!look) return;
        const newIds = look.productIds.includes(productId)
            ? look.productIds.filter(id => id !== productId)
            : [...look.productIds, productId];
        await updateLook(lookId, { productIds: newIds });
    };

    const reorderLook = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === looks.length - 1) return;

        const newLooks = [...looks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newLooks[index], newLooks[swapIndex]] = [newLooks[swapIndex], newLooks[index]];
        await onUpdate({ stylingLooks: newLooks }, "Reordered styling looks");
    };

    const reorderProduct = async (lookId: string, productIndex: number, direction: 'left' | 'right') => {
        const look = looks.find(l => l.id === lookId);
        if (!look) return;

        const newIds = [...look.productIds];
        if (direction === 'left' && productIndex === 0) return;
        if (direction === 'right' && productIndex === newIds.length - 1) return;

        const swapIndex = direction === 'left' ? productIndex - 1 : productIndex + 1;
        [newIds[productIndex], newIds[swapIndex]] = [newIds[swapIndex], newIds[productIndex]];

        await updateLook(lookId, { productIds: newIds });
    };

    if (!isVisible) return <StaticSectionControl title="Styling Ideas" visibilityKey="showStyling" layoutConfig={layoutConfig} products={[]} onUpdate={onUpdate} />;

    return (
        <div className="bg-white border border-stone-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
            <div 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 cursor-pointer group select-none"
            >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-3 min-w-0">
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdate({ showStyling: !isVisible }, `Toggled visibility of Styling Ideas`);
                            }} 
                            className="p-2.5 sm:p-2 rounded-full bg-stone-900 text-white shadow-md shrink-0 hover:scale-105 active:scale-95 transition-transform min-h-[38px] min-w-[38px] flex items-center justify-center"
                            title={isVisible ? "Hide Styling Ideas" : "Show Styling Ideas"}
                        >
                            <Eye size={16} />
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#C5A059] transition-colors truncate">
                                    Styling Ideas
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold shrink-0">
                                    {looks.length} {looks.length === 1 ? 'Look' : 'Looks'}
                                </span>
                            </div>
                            <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest mt-0.5 truncate">
                                Curated Outfits & Lookbooks &bull; Click to {isExpanded ? 'Collapse' : 'Manage Looks'}
                            </p>
                        </div>
                    </div>
                    <div className="sm:hidden text-stone-400 p-1">
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }} 
                    className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${
                        isExpanded 
                            ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                            : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-[#C5A059] hover:text-[#C5A059]'
                    }`}
                >
                    <span>{isExpanded ? 'Close Editor' : 'Manage Looks'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-6 border-t border-stone-100 mt-6 space-y-6">
                            {looks.map((look, idx) => (
                                <div key={look.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        {/* Look Order Controls */}
                                        <div className="flex flex-col gap-1 pt-2">
                                            <button
                                                onClick={() => reorderLook(idx, 'up')}
                                                disabled={idx === 0}
                                                className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                onClick={() => reorderLook(idx, 'down')}
                                                disabled={idx === looks.length - 1}
                                                className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                        </div>

                                        {/* Image Upload */}
                                        <div className="relative group w-24 h-32 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                                            <img src={look.image} className="w-full h-full object-cover" />
                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(look.id, e.target.files[0])} />
                                                {uploadingId === look.id ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                                            </label>
                                        </div>

                                        {/* Info Fields */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[10px] font-black text-stone-300 uppercase">Look 0{idx + 1}</span>
                                                <button onClick={() => deleteLook(look.id)} className="text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input type="text" value={look.title} onChange={e => updateLook(look.id, { title: e.target.value })} className="w-full bg-white px-3 py-2 rounded-lg text-xs font-serif font-bold border border-stone-200 focus:outline-none focus:border-[#C5A059]" placeholder="Look Title" />
                                                <input type="text" value={look.price || ''} onChange={e => updateLook(look.id, { price: e.target.value })} className="w-full bg-white px-3 py-2 rounded-lg text-xs border border-stone-200 focus:outline-none focus:border-[#C5A059]" placeholder="Total Price (e.g. ₦150,000)" />
                                            </div>

                                            <div className="pt-2">
                                                <p className="text-[9px] uppercase font-bold text-stone-400 mb-2">Matched Products ({look.productIds.length})</p>

                                                {/* Selected Products (Sortable) */}
                                                {(look.productIds.length > 0) && (
                                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 p-1 bg-white rounded-xl border border-stone-100">
                                                        {look.productIds.map((pid, pIdx) => {
                                                            const product = products.find(p => p.id === pid);
                                                            if (!product) return null;
                                                            return (
                                                                <div key={pid} className="relative group flex-shrink-0 w-12">
                                                                    <div className="aspect-[3/4] rounded-lg overflow-hidden border border-stone-200">
                                                                        <img src={product.images[0]} className="w-full h-full object-cover" />
                                                                    </div>

                                                                    {/* Reorder Overlay */}
                                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                                        <button
                                                                            onClick={() => reorderProduct(look.id, pIdx, 'left')}
                                                                            className="text-white hover:text-[#C5A059] disabled:opacity-30"
                                                                            disabled={pIdx === 0}
                                                                        >
                                                                            <ChevronLeft size={10} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => toggleProductInLook(look.id, pid)}
                                                                            className="text-red-400 hover:text-red-300"
                                                                        >
                                                                            <Trash2 size={10} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => reorderProduct(look.id, pIdx, 'right')}
                                                                            className="text-white hover:text-[#C5A059] disabled:opacity-30"
                                                                            disabled={pIdx === look.productIds.length - 1}
                                                                        >
                                                                            <ChevronRight size={10} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <p className="text-[9px] uppercase font-bold text-stone-400 mb-2">Products in Look</p>
                                                <SearchableProductSelector
                                                    products={products}
                                                    selectedIds={look.productIds}
                                                    onToggle={(pid) => toggleProductInLook(look.id, pid)}
                                                    compact={true}
                                                    placeholder="Search products for this look..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addLook} className="w-full py-3 bg-[#C5A059] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#b59245]">Add New Look</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const HeroCarouselEditor: React.FC<EditorProps> = ({ layoutConfig, onUpdate }) => {
    const isVisible = layoutConfig.showHero ?? true;
    const images = layoutConfig.heroImages || (layoutConfig.heroImage ? [layoutConfig.heroImage] : []);
    const [isExpanded, setIsExpanded] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const updateImages = async (newImages: string[]) => {
        await onUpdate(
            { heroImages: newImages, heroImage: newImages[0] || '' },
            `Updated Hero Carousel images`
        );
    };

    const handleUpload = async (file: File) => {
        try {
            setUploadingIndex(images.length);
            const url = await uploadImageToCloudinary(file);
            await updateImages([...images, url]);
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploadingIndex(null);
        }
    };

    const removeImage = async (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        await updateImages(newImages);
    };

    if (!isVisible) return <StaticSectionControl title="Hero Carousel" visibilityKey="showHero" layoutConfig={layoutConfig} products={[]} onUpdate={onUpdate} />;

    return (
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 cursor-pointer group select-none"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({ showHero: !isVisible }, `Toggled visibility of Hero Carousel`);
                        }} 
                        className="p-2 rounded-full bg-stone-900 text-white shadow-md shrink-0 hover:scale-105 transition-transform"
                        title={isVisible ? "Hide Hero Carousel" : "Show Hero Carousel"}
                    >
                        <Eye size={16} />
                    </button>
                    <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#C5A059] transition-colors truncate">
                            Hero Carousel
                        </h4>
                        <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest mt-0.5">
                            {images.length} {images.length === 1 ? 'Slide' : 'Slides'} &bull; Click to {isExpanded ? 'Close' : 'Edit'}
                        </p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }} 
                    className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${
                        isExpanded 
                            ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                            : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-[#C5A059] hover:text-[#C5A059]'
                    }`}
                >
                    <span>{isExpanded ? 'Close Editor' : 'Edit Slides'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-6 border-t border-stone-100 mt-6 space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Carousel Slides ({images.length})</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-[16/9] md:aspect-auto md:h-32 rounded-xl overflow-hidden bg-stone-100 group border border-stone-200">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm">
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1">
                                            <p className="text-[8px] text-white text-center">Slide {idx + 1}</p>
                                        </div>
                                    </div>
                                ))}
                                
                                <label className="relative aspect-[16/9] md:aspect-auto md:h-32 rounded-xl border-2 border-dashed border-stone-200 hover:border-[#C5A059] flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-50 group">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploadingIndex !== null} />
                                    {uploadingIndex !== null ? (
                                        <Loader2 className="animate-spin text-[#C5A059]" size={20} />
                                    ) : (
                                        <>
                                            <Plus className="text-stone-400 group-hover:text-[#C5A059] mb-2" size={20} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-[#C5A059]">Add Slide</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface LayoutTabProps {
    layoutConfig: HomeLayoutConfig;
    setLayoutConfig: React.Dispatch<React.SetStateAction<HomeLayoutConfig>>;
    products: Product[];
}

const LayoutTab: React.FC<LayoutTabProps> = ({ layoutConfig, setLayoutConfig, products }) => {
    const { showToast } = useToast();
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [isPublishingLive, setIsPublishingLive] = useState(false);
    const [isRefreshingLive, setIsRefreshingLive] = useState(false);
    const sandboxActive = isSandboxMode();

    const handlePublishToLive = async () => {
        const ok = window.confirm(
            "Are you sure you want to PUBLISH this sandbox layout directly to the LIVE boutique?\n\nThis will immediately update the homepage for all customers on zahrah-boutique.web.app."
        );
        if (!ok) return;

        setIsPublishingLive(true);
        try {
            await publishSandboxToLive();
            await logAdminAction(
                "Promote Sandbox to Live",
                "Published sandbox layout configuration live to store",
                auth.currentUser?.email || "Admin"
            );
            showToast("Live Store Updated!", {
                type: "success",
                description: "The sandbox layout is now live on zahrah-boutique.web.app."
            });
        } catch (e) {
            console.error(e);
            showToast("Publish Failed", {
                type: "error",
                description: "Could not publish sandbox layout to live store."
            });
        } finally {
            setIsPublishingLive(false);
        }
    };

    const handleResetFromLive = async () => {
        const ok = window.confirm(
            "Reset sandbox from live store?\n\nThis will replace your current sandbox layout with a fresh copy of what is currently live."
        );
        if (!ok) return;

        setIsRefreshingLive(true);
        try {
            await resetSandboxFromLive();
            showToast("Sandbox Refreshed", {
                type: "info",
                description: "Sandbox now matches the current live store layout."
            });
        } catch (e) {
            console.error(e);
            showToast("Reset Failed", {
                type: "error",
                description: "Could not copy live store layout into sandbox."
            });
        } finally {
            setIsRefreshingLive(false);
        }
    };

    const sections = layoutConfig?.sections || [];
    const showCatalog = layoutConfig?.showCatalog ?? true;

    const withErrorHandling = async (fn: () => Promise<void>, successMsg?: string) => {
        try {
            await fn();
            if (successMsg) showToast(successMsg, { type: 'success' });
        } catch (error) {
            console.error(error);
            showToast("Failed to save changes", { type: 'error', description: "Please check your connection and try again." });
        }
    };

    const handleUpdate = async (updates: Partial<HomeLayoutConfig>, logDetail?: string) => {
        await withErrorHandling(async () => {
            await saveLayoutConfig(updates);
            if (logDetail) {
                await logAdminAction(
                    "Update Layout",
                    logDetail,
                    auth.currentUser?.email || "Unknown"
                );
            }
        }, logDetail ? "Layout updated successfully" : undefined);
    };

    const addSection = () => withErrorHandling(async () => {
        if (!newSectionTitle) return;
        const newSection: SectionConfig = {
            id: `sec-${Date.now()}`,
            title: newSectionTitle,
            type: 'carousel',
            productIds: [],
            isVisible: true
        };
        await saveLayoutConfig({ sections: [...sections, newSection] });
        await logAdminAction(
            "Deployed Section",
            `Created new section '${newSectionTitle}'`,
            auth.currentUser?.email || "Unknown"
        );
        setNewSectionTitle('');
    }, "Section deployed successfully");

    const toggleProductInSection = (sectionId: string, productId: string) => withErrorHandling(async () => {
        const newSections = sections.map(s => {
            if (s.id === sectionId) {
                const currentIds = s.productIds || []; // Defensive
                const exists = currentIds.includes(productId);
                return { ...s, productIds: exists ? currentIds.filter(id => id !== productId) : [...currentIds, productId] };
            }
            return s;
        });
        await saveLayoutConfig({ sections: newSections });
    });

    const toggleSectionVisibility = (sectionId: string) => withErrorHandling(async () => {
        const newSections = sections.map(s => s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s);
        await saveLayoutConfig({ sections: newSections });
    });

    const deleteSection = (sectionId: string) => withErrorHandling(async () => {
        if (confirm('Delete this section permanently?')) {
            await saveLayoutConfig({ sections: sections.filter(s => s.id !== sectionId) });
        }
    });

    const toggleShowCatalog = () => withErrorHandling(async () => {
        const newState = !showCatalog;
        await saveLayoutConfig({ showCatalog: newState });
        await logAdminAction(
            "Update Layout",
            `Changed Catalog Visibility to ${newState ? 'Visible' : 'Hidden'}`,
            auth.currentUser?.email || "Unknown"
        );
    });

    return (
        <div className="space-y-10 sm:space-y-12 w-full min-w-0 max-w-full animate-in fade-in duration-500">

            {/* --- SANDBOX / LIVE STATUS CONTROL BAR --- */}
            <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 ${
                sandboxActive
                    ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-amber-300/80 shadow-md shadow-amber-500/5'
                    : 'bg-stone-50 border-stone-200'
            }`}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                    <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                            sandboxActive ? 'bg-amber-500 text-white shadow-sm' : 'bg-stone-200 text-stone-700'
                        }`}>
                            {sandboxActive ? <Sparkles size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
                                    {sandboxActive ? '🧪 Safe Sandbox Playground' : '🟢 Live Store Mode'}
                                </h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    sandboxActive ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                    {sandboxActive ? 'Sandbox Active • Live Store Safe' : 'Live Mode • Real Shoppers'}
                                </span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                                {sandboxActive
                                    ? 'You can freely test layouts, reorder sections, and adjust lookbooks without affecting the live store. Real customers on zahrah-boutique.web.app will NOT see these changes until you publish them.'
                                    : 'Any layout changes saved here will immediately show up on the live website. Switch to Sandbox Playground to test risk-free.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
                        {sandboxActive ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleResetFromLive}
                                    disabled={isRefreshingLive}
                                    className="px-4 py-2.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 min-h-[44px]"
                                    title="Discard current sandbox edits and copy current live layout into sandbox"
                                >
                                    <RefreshCw size={14} className={isRefreshingLive ? 'animate-spin' : ''} />
                                    <span>Refresh From Live</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePublishToLive}
                                    disabled={isPublishingLive}
                                    className="px-4 py-2.5 bg-stone-900 hover:bg-[#C5A059] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 min-h-[44px]"
                                    title="Apply this sandbox layout directly to the live store"
                                >
                                    <UploadCloud size={14} className={isPublishingLive ? 'animate-spin' : ''} />
                                    <span>Publish to Live Store</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSandboxMode(false)}
                                    className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold tracking-wider uppercase transition-all min-h-[44px]"
                                >
                                    Exit Sandbox
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSandboxMode(true)}
                                className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08e4d] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-[#C5A059]/20 flex items-center gap-2 min-h-[44px] w-full sm:w-auto justify-center"
                            >
                                <Sparkles size={14} />
                                <span>Enter Safe Sandbox Playground</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONTROL PANEL --- */}
            <div className="space-y-6">
                {/* Global Settings */}
                <div className="bg-white border border-stone-100 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                    <div>
                        <h3 className="text-lg font-serif font-bold text-stone-900 tracking-tight">Home Page Configuration</h3>
                        <p className="text-xs text-stone-400 mt-1">Manage global settings for the landing page.</p>
                    </div>

                    <button
                        onClick={toggleShowCatalog}
                        className={`flex items-center gap-3 sm:gap-4 px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl border transition-all duration-300 shrink-0 w-full sm:w-auto justify-between sm:justify-start ${showCatalog ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-400 border-stone-200'}`}
                    >
                        <div className={`w-3 h-3 rounded-full ${showCatalog ? 'bg-[#C5A059]' : 'bg-stone-300'}`} />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {showCatalog ? 'Catalog Visible' : 'Catalog Hidden'}
                        </span>
                    </button>
                </div>

                {/* Core Sections Visibility Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <HeroCarouselEditor
                        layoutConfig={layoutConfig}
                        products={products}
                        onUpdate={handleUpdate}
                    />
                    <StaticSectionControl
                        title="Features"
                        visibilityKey="showFeatures"
                        layoutConfig={layoutConfig}
                        products={products}
                        onUpdate={handleUpdate}
                    />
                    <StaticSectionControl
                        title="Boutique Banner"
                        visibilityKey="showBoutique"
                        bannerImageKey="boutiqueBannerImage"
                        textInputKey="boutiqueBannerTitle"
                        layoutConfig={layoutConfig}
                        products={products}
                        onUpdate={handleUpdate}
                    />
                    <LifestyleEditor layoutConfig={layoutConfig} products={products} onUpdate={handleUpdate} />
                </div>

                {/* Curated Product Collections & Looks */}
                <div className="space-y-6 pt-6 border-t border-stone-200 border-dashed">
                    <div>
                        <h3 className="font-serif font-black text-lg text-stone-900">Curated Collections & Looks</h3>
                        <p className="text-xs text-stone-400">Manage featured collections, lookbook ensembles, and curated category tabs</p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <StaticSectionControl
                            title="Manor Collection"
                            visibilityKey="showManor"
                            productKey="manorProductIds"
                            layoutConfig={layoutConfig}
                            products={products}
                            onUpdate={handleUpdate}
                        />
                        <StaticSectionControl
                            title="Bundles & Deals"
                            visibilityKey="showBundles"
                            productKey="bundlesProductIds"
                            layoutConfig={layoutConfig}
                            products={products}
                            onUpdate={handleUpdate}
                        />
                    </div>

                    {/* Styling Ideas / Lookbooks - Full Width */}
                    <div>
                        <StylingLooksEditor layoutConfig={layoutConfig} products={products} onUpdate={handleUpdate} />
                    </div>

                    {/* Curated Categories - Full Width */}
                    <div>
                        <CuratedPicksEditor layoutConfig={layoutConfig} products={products} onUpdate={handleUpdate} />
                    </div>
                </div>

                {/* Add Section */}
                <div className="bg-white border border-stone-100 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
                    <div className="flex-1 w-full relative">
                        <LayoutTemplate className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                        <input
                            type="text"
                            placeholder="NEW SECTION TITLE (e.g. 'SUMMER EDIT')"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-stone-50 border border-stone-100 rounded-2xl text-[11px] font-bold tracking-widest focus:outline-none focus:bg-white focus:border-[#C5A059] transition-all"
                        />
                    </div>
                    <button
                        onClick={addSection}
                        disabled={!newSectionTitle}
                        className="bg-stone-900 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#C5A059] hover:shadow-[#C5A059]/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:bg-stone-900 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                        <Plus size={16} />
                        <span>Deploy Section</span>
                    </button>
                </div>
            </div>

            {/* --- SECTIONS LIST --- */}
            <div className="space-y-6 sm:space-y-8">
                <AnimatePresence>
                    {sections.map((section, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={section.id}
                            className="bg-white border border-stone-100 rounded-3xl shadow-sm overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-5 sm:p-8 bg-stone-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-100 gap-4">
                                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                    <button
                                        onClick={() => toggleSectionVisibility(section.id)}
                                        className={`p-3 rounded-full transition-all duration-300 ${section.isVisible ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-200 text-stone-400 opacity-60'}`}
                                        title={section.isVisible ? 'Visible' : 'Hidden'}
                                    >
                                        {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <div>
                                        <h4 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight truncate">{section.title}</h4>
                                        <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest mt-1 opacity-80">{(section.productIds || []).length} Linked Artifacts</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteSection(section.id)}
                                    className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Delete Section"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {/* Product Grid Selector */}
                            <div className="p-4 sm:p-8 bg-white border-t border-stone-100">
                                <SearchableProductSelector
                                    products={products}
                                    selectedIds={section.productIds || []}
                                    onToggle={(pid) => toggleProductInSection(section.id, pid)}
                                    placeholder={`Filter products for ${section.title}...`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {sections.length === 0 && (
                    <div className="py-20 text-center text-stone-300 italic serif text-xl opacity-60">
                        No active layout sections. Deploy one above.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LayoutTab;
