import React, { useState } from 'react';
import { Eye, EyeOff, Trash2, CheckCircle2, LayoutTemplate, Plus } from 'lucide-react';
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
