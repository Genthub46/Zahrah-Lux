import React, { useState } from 'react';
import { uploadImageToCloudinary } from '../../services/cloudinary';
import { Eye, EyeOff, Trash2, CheckCircle2, LayoutTemplate, Plus, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { HomeLayoutConfig, SectionConfig, Product } from '../../types';
import { saveLayoutConfig } from '../../services/dbUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutTabProps {
    layoutConfig: HomeLayoutConfig;
    setLayoutConfig: React.Dispatch<React.SetStateAction<HomeLayoutConfig>>;
    products: Product[];
}

const LayoutTab: React.FC<LayoutTabProps> = ({ layoutConfig, setLayoutConfig, products }) => {
    const [newSectionTitle, setNewSectionTitle] = useState('');

    const sections = layoutConfig?.sections || [];
    const showCatalog = layoutConfig?.showCatalog ?? true;

    const withErrorHandling = async (fn: () => Promise<void>) => {
        try {
            await fn();
        } catch (error) {
            console.error(error);
            alert("Failed to save changes. Please try again.");
        }
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
        setNewSectionTitle('');
    });

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
        await saveLayoutConfig({ showCatalog: !showCatalog });
    });

    // --- Helper for Static Sections ---
    const toggleStaticVisibility = (key: keyof HomeLayoutConfig) => withErrorHandling(async () => {
        await saveLayoutConfig({ [key]: !(layoutConfig[key] ?? true) });
    });

    const toggleStaticProduct = (key: 'manorProductIds' | 'stylingProductIds' | 'bundlesProductIds', productId: string) => withErrorHandling(async () => {
        const currentIds = layoutConfig[key] || [];
        const exists = currentIds.includes(productId);
        const newIds = exists ? currentIds.filter(id => id !== productId) : [...currentIds, productId];
        await saveLayoutConfig({ [key]: newIds });
    });

    const StaticSectionControl = ({
        title,
        visibilityKey,
        productKey,
        bannerImageKey,
        limit
    }: {
        title: string;
        visibilityKey: keyof HomeLayoutConfig;
        productKey?: 'manorProductIds' | 'stylingProductIds' | 'bundlesProductIds';
        bannerImageKey?: 'boutiqueBannerImage';
        limit?: number;
    }) => {
        const isVisible = layoutConfig[visibilityKey] ?? true;
        const [isExpanded, setIsExpanded] = useState(false);
        const [isUploading, setIsUploading] = useState(false);
        const selectedIds = productKey ? (layoutConfig[productKey] || []) : [];
        const bannerImage = bannerImageKey ? (layoutConfig[bannerImageKey] || '') : '';

        const handleBannerChange = async (url: string) => {
            if (bannerImageKey) await saveLayoutConfig({ [bannerImageKey]: url });
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
                            onClick={() => toggleStaticVisibility(visibilityKey)}
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
                                    // Make sure input updates if the upload changes the config globally, 
                                    // ideally this component would be fully controlled, but for now defaultValue works with the re-render from layoutConfig prop
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
                                                onClick={() => toggleStaticProduct(productKey, p.id)}
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
            </div>
        );
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500">

            {/* --- CONTROL PANEL --- */}
            <div className="space-y-6">
                {/* Global Settings */}
                <div className="bg-white border border-stone-100 p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-stone-900 tracking-tight">Home Page Configuration</h3>
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
                    <StaticSectionControl title="Hero Banner" visibilityKey="showHero" />
                    <StaticSectionControl title="Features" visibilityKey="showFeatures" />
                    <StaticSectionControl title="Boutique Banner" visibilityKey="showBoutique" bannerImageKey="boutiqueBannerImage" />
                    <StaticSectionControl title="Lifestyle Showcase" visibilityKey="showLifestyle" />

                    {/* With Product Selection */}
                    <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-stone-200 border-dashed">
                        <StaticSectionControl title="Manor Collection" visibilityKey="showManor" productKey="manorProductIds" />
                        <StaticSectionControl title="Styling Ideas" visibilityKey="showStyling" productKey="stylingProductIds" />
                        <StaticSectionControl title="Bundles & Deals" visibilityKey="showBundles" productKey="bundlesProductIds" />
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
