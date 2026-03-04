import React, { useState } from 'react';
import { uploadImageToCloudinary } from '../../services/cloudinary';
import { Eye, EyeOff, Trash2, CheckCircle2, LayoutTemplate, Plus, Upload, Loader2, Image as ImageIcon, ArrowUp, ArrowDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { HomeLayoutConfig, SectionConfig, Product } from '../../types';
import { saveLayoutConfig, logAdminAction } from '../../services/dbUtils';
import { auth } from '../../services/firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

// --- Shared Types ---
interface EditorProps {
    layoutConfig: HomeLayoutConfig;
    products: Product[];
    onUpdate: (updates: Partial<HomeLayoutConfig>, logDetail?: string) => Promise<void>;
}

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

        return (
            <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleVisibility}
                            className={`p-2 rounded-full transition-all duration-300 ${isVisible ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-400'}`}
                        >
                            {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <div>
                            <h4 className="font-bold text-stone-900 text-sm">{title}</h4>
                            {productKey && (
                                <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest mt-0.5">
                                    {selectedIds.length} Products Selected
                                </p>
                            )}
                        </div>
                    </div>

                    {bannerImageKey && isVisible && (
                        <div className="flex-1 ml-6 flex items-center gap-2">
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

                            <label className={`flex items-center justify-center p-2 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                {isUploading ? <Loader2 size={16} className="animate-spin text-[#C5A059]" /> : <Upload size={16} className="text-stone-500" />}
                            </label>
                        </div>
                    )}

                    {textInputKey && isVisible && (
                        <div className="flex-1 ml-4">
                            <input
                                type="text"
                                placeholder="BANNER TITLE"
                                value={bannerTitle as string}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="w-full px-4 py-2 text-[10px] bg-stone-50 border border-stone-100 rounded-lg focus:outline-none focus:border-[#C5A059] font-bold tracking-widest uppercase"
                            />
                        </div>
                    )}

                    {productKey && isVisible && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isExpanded ? 'bg-stone-50 border-stone-200 text-stone-900' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300'}`}
                        >
                            {isExpanded ? 'Close Selector' : 'Select Products'}
                        </button>
                    )}
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
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {products.map(p => {
                                        const isActive = selectedIds.includes(p.id);
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => toggleProduct(p.id)}
                                                className={`relative group aspect-[3/4] rounded-xl border transition-all duration-300 p-1 overflow-hidden
                                                ${isActive
                                                        ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                                                        : 'border-stone-100 opacity-60 hover:opacity-100 hover:border-stone-300'
                                                    }`}
                                            >
                                                <div className="w-full h-full rounded-lg overflow-hidden relative">
                                                    {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1">
                                                        <p className="text-[6px] text-white font-bold truncate">{p.name}</p>
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <div className="absolute top-2 right-2 bg-stone-900 text-white p-0.5 rounded-full shadow-lg z-10">
                                                        <CheckCircle2 size={8} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
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
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => onUpdate({ showLifestyle: !isVisible }, `Toggled visibility of Lifestyle Showcase`)} className="p-2 rounded-full bg-stone-900 text-white shadow-md">
                        <Eye size={16} />
                    </button>
                    <h4 className="font-bold text-stone-900 text-sm">Lifestyle Showcase</h4>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isExpanded ? 'bg-stone-50 border-stone-200 text-stone-900' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300'}`}>
                    {isExpanded ? 'Close Editor' : 'Edit Muses'}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-6 border-t border-stone-100 mt-6 grid grid-cols-2 gap-4">
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
    const categories = layoutConfig.curatedCategories || [
        { id: 't-shirts', label: 'T-Shirts', isVisible: true },
        { id: 'pants', label: 'Pants', isVisible: true },
        { id: 'jackets', label: 'Jackets', isVisible: true },
        { id: 'shorts', label: 'Shorts', isVisible: true },
        { id: 'slides', label: 'Slides', isVisible: true },
        { id: 'bags', label: 'Bags', isVisible: true }
    ];
    // Default active to first visible or just first
    const [activeTabId, setActiveTabId] = useState(categories[0].id);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isManagingCats, setIsManagingCats] = useState(false);

    const activeCategory = categories.find(c => c.id === activeTabId) || categories[0];
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
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-stone-900 text-sm">Curated Categories</h4>
                    <p className="text-[10px] text-stone-400">Manage tabs and assign products</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsManagingCats(!isManagingCats)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isManagingCats ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300'}`}>
                        {isManagingCats ? 'Done' : 'Edit Tabs'}
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isExpanded ? 'bg-stone-50 border-stone-200 text-stone-900' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300'}`}>
                        {isExpanded ? 'Close' : 'Products'}
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

                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                {products.map(p => {
                                    const isActive = currentIds.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => toggleProduct(p.id)}
                                            className={`relative group aspect-[3/4] rounded-lg border p-1 overflow-hidden ${isActive ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' : 'border-stone-100 opacity-60'}`}
                                        >
                                            {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover rounded-md" />}
                                            {isActive && <div className="absolute top-1 right-1 bg-stone-900 text-white p-0.5 rounded-full"><CheckCircle2 size={8} /></div>}
                                            <div className="absolute bottom-0 inset-x-0 bg-white/90 p-1 text-[8px] truncate font-bold text-center">{p.name}</div>
                                        </button>
                                    );
                                })}
                            </div>
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
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => onUpdate({ showStyling: !isVisible }, `Toggled visibility of Styling Ideas`)} className="p-2 rounded-full bg-stone-900 text-white shadow-md"><Eye size={16} /></button>
                    <h4 className="font-bold text-stone-900 text-sm">Styling Ideas ({looks.length} Looks)</h4>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isExpanded ? 'bg-stone-50 border-stone-200 text-stone-900' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300'}`}>
                    {isExpanded ? 'Close Editor' : 'Manage Looks'}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-6 border-t border-stone-100 mt-6 space-y-6">
                            {looks.map((look, idx) => (
                                <div key={look.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                                    <div className="flex gap-4 items-start">
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
                                            <input type="text" value={look.title} onChange={e => updateLook(look.id, { title: e.target.value })} className="w-full bg-white px-3 py-2 rounded-lg text-xs font-serif font-bold border border-stone-200" placeholder="Look Title" />
                                            <input type="text" value={look.price || ''} onChange={e => updateLook(look.id, { price: e.target.value })} className="w-full bg-white px-3 py-2 rounded-lg text-xs border border-stone-200" placeholder="Total Price" />

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

                                                <p className="text-[9px] uppercase font-bold text-stone-300 mb-2">Add Products</p>
                                                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 border border-stone-100 rounded-lg bg-stone-50/50">
                                                    {products.map(p => {
                                                        const isActive = look.productIds.includes(p.id);
                                                        if (isActive) return null;
                                                        return (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => toggleProductInLook(look.id, p.id)}
                                                                className="aspect-[3/4] w-full rounded border border-stone-200 overflow-hidden opacity-80 hover:opacity-100 hover:border-[#C5A059] transition-all relative group"
                                                                title={p.name}
                                                            >
                                                                <img src={p.images[0]} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-x-0 bottom-0 bg-white/90 p-0.5 text-[6px] truncate">{p.name}</div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
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

interface LayoutTabProps {
    layoutConfig: HomeLayoutConfig;
    setLayoutConfig: React.Dispatch<React.SetStateAction<HomeLayoutConfig>>;
    products: Product[];
}

const LayoutTab: React.FC<LayoutTabProps> = ({ layoutConfig, setLayoutConfig, products }) => {
    const { showToast } = useToast();
    const [newSectionTitle, setNewSectionTitle] = useState('');

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
        <div className="space-y-12 animate-in fade-in duration-500">

            {/* --- CONTROL PANEL --- */}
            <div className="space-y-6">
                {/* Global Settings */}
                <div className="bg-white border border-stone-100 p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-lg font-serif font-bold text-stone-900 tracking-tight">Home Page Configuration</h3>
                        <p className="text-xs text-stone-400 mt-1">Manage global settings for the landing page.</p>
                    </div>

                    <button
                        onClick={toggleShowCatalog}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 ${showCatalog ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-400 border-stone-200'}`}
                    >
                        <div className={`w-3 h-3 rounded-full ${showCatalog ? 'bg-[#C5A059]' : 'bg-stone-300'}`} />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {showCatalog ? 'Catalog Visible' : 'Catalog Hidden'}
                        </span>
                    </button>
                </div>

                {/* Core Sections Visibility Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StaticSectionControl
                        title="Hero Banner"
                        visibilityKey="showHero"
                        bannerImageKey="heroImage"
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

                    {/* With Product Selection */}
                    <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-stone-200 border-dashed">
                        <StaticSectionControl
                            title="Manor Collection"
                            visibilityKey="showManor"
                            productKey="manorProductIds"
                            layoutConfig={layoutConfig}
                            products={products}
                            onUpdate={handleUpdate}
                        />
                        <StylingLooksEditor layoutConfig={layoutConfig} products={products} onUpdate={handleUpdate} />
                        <StaticSectionControl
                            title="Bundles & Deals"
                            visibilityKey="showBundles"
                            productKey="bundlesProductIds"
                            layoutConfig={layoutConfig}
                            products={products}
                            onUpdate={handleUpdate}
                        />
                        <div className="lg:col-span-2">
                            <CuratedPicksEditor layoutConfig={layoutConfig} products={products} onUpdate={handleUpdate} />
                        </div>
                    </div>
                </div>

                {/* Add Section */}
                <div className="bg-white border border-stone-100 p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 flex flex-col md:flex-row gap-6 items-center">
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
            <div className="space-y-8">
                <AnimatePresence>
                    {sections.map((section, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={section.id}
                            className="bg-white border border-stone-100 rounded-[3rem] shadow-sm overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-8 bg-stone-50/50 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-stone-100 gap-4">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => toggleSectionVisibility(section.id)}
                                        className={`p-3 rounded-full transition-all duration-300 ${section.isVisible ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-200 text-stone-400 opacity-60'}`}
                                        title={section.isVisible ? 'Visible' : 'Hidden'}
                                    >
                                        {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <div>
                                        <h4 className="text-xl font-bold text-stone-900 tracking-tight">{section.title}</h4>
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
                            <div className="p-8 bg-white">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                    {products.map(p => {
                                        const currentIds = section.productIds || []; // Defensive
                                        const isActive = currentIds.includes(p.id);
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => toggleProductInSection(section.id, p.id)}
                                                className={`relative group aspect-[3/4] rounded-2xl border-2 transition-all duration-300 p-2 overflow-hidden
                          ${isActive
                                                        ? 'border-stone-900 bg-stone-50 shadow-md ring-2 ring-stone-900/10'
                                                        : 'border-stone-100 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 hover:border-stone-300'
                                                    }`}
                                            >
                                                <div className="w-full h-full rounded-lg overflow-hidden relative">
                                                    {p.images[0] ? (
                                                        <img src={p.images[0]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-stone-200" />
                                                    )}
                                                    {/* Overlay Name */}
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <p className="text-[7px] text-white font-bold truncate">{p.name}</p>
                                                    </div>
                                                </div>

                                                {isActive && (
                                                    <div className="absolute top-3 right-3 bg-stone-900 text-white p-1 rounded-full shadow-lg z-10">
                                                        <CheckCircle2 size={10} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
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
