import React, { useState } from 'react';
import { FileText, Edit3, Trash2, Save, Layout } from 'lucide-react';
import { FooterPage } from '../../types';
import { saveFooterPage, deleteFooterPage } from '../../services/dbUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface PagesTabProps {
    footerPages: FooterPage[];
}

const PagesTab: React.FC<PagesTabProps> = ({ footerPages }) => {
    const [editingPageSlug, setEditingPageSlug] = useState<string | null>(null);
    const [pageFormData, setPageFormData] = useState<Partial<FooterPage>>({
        title: '',
        slug: '',
        content: '',
        category: 'Customer Services'
    });

    const handlePageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pageFormData.slug || !pageFormData.title) return;
        try {
            await saveFooterPage(pageFormData as FooterPage);
            setEditingPageSlug(null);
            setPageFormData({ title: '', slug: '', content: '', category: 'Customer Services' });
        } catch (err) {
            console.error(err);
            alert("Failed to save page.");
        }
    };

    const startEdit = (page: FooterPage) => {
        setEditingPageSlug(page.slug);
        setPageFormData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (slug: string) => {
        if (confirm('Permanently delete this page?')) {
            try {
                await deleteFooterPage(slug);
            } catch (err) {
                console.error(err);
                alert("Failed to delete page.");
            }
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-12 gap-12 items-start">

                {/* --- FORM SECTION --- */}
                <div className="lg:col-span-12 xl:col-span-5">
                    <div className="bg-white border border-stone-100 p-8 lg:p-10 rounded-[2.5rem] shadow-xl shadow-stone-200/50 relative overflow-hidden xl:sticky xl:top-32">
                        <h3 className="text-xl font-bold font-serif italic text-stone-900 mb-8 flex items-center gap-3">
                            <Layout size={20} className="text-[#C5A059]" />
                            {editingPageSlug ? 'Edit Content' : 'New Page Artifact'}
                        </h3>

                        <form onSubmit={handlePageSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Archive Category</label>
                                <div className="relative">
                                    <select
                                        value={pageFormData.category}
                                        onChange={(e) => setPageFormData({ ...pageFormData, category: e.target.value as any })}
                                        className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none focus:border-[#C5A059] appearance-none"
                                    >
                                        <option value="Customer Services">Customer Services</option>
                                        <option value="Company">Company</option>
                                        <option value="Policies">Policies</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Layout size={14} className="text-stone-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Page Title</label>
                                <input
                                    type="text"
                                    value={pageFormData.title}
                                    onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
                                    placeholder="e.g. SHIPPING POLICY"
                                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none focus:bg-white focus:border-[#C5A059] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">URL Slug</label>
                                <div className="flex gap-2 items-center px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                    <span className="text-[10px] font-mono text-stone-400">/pages/</span>
                                    <input
                                        type="text"
                                        value={pageFormData.slug}
                                        onChange={(e) => setPageFormData({ ...pageFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="shipping-policy"
                                        className="flex-1 bg-transparent text-[10px] font-bold tracking-widest focus:outline-none text-stone-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Body Content</label>
                                <textarea
                                    rows={12}
                                    value={pageFormData.content}
                                    onChange={(e) => setPageFormData({ ...pageFormData, content: e.target.value })}
                                    placeholder="Enter detailed policy text..."
                                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[11px] font-medium leading-relaxed focus:outline-none focus:bg-white focus:border-[#C5A059] transition-all resize-none custom-scrollbar"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-stone-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#C5A059] hover:shadow-[#C5A059]/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                >
                                    <Save size={16} />
                                    <span>{editingPageSlug ? 'Update Page' : 'Publish Page'}</span>
                                </button>
                                {editingPageSlug && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingPageSlug(null);
                                            setPageFormData({ title: '', slug: '', content: '', category: 'Customer Services' });
                                        }}
                                        className="w-full mt-3 py-3 text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-800"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- LIST SECTION --- */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-4">
                    {['Customer Services', 'Company', 'Policies'].map(cat => (
                        <div key={cat} className="space-y-4 mb-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 pl-4">{cat}</h4>
                            {footerPages.filter(p => p.category === cat).map(page => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={page.slug}
                                    className="bg-white p-6 border border-stone-100 rounded-[1.5rem] flex items-center justify-between group hover:shadow-lg hover:border-stone-200 transition-all hover:translate-x-1"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:bg-[#C5A059] group-hover:text-white transition-all shadow-sm">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-stone-900 tracking-tight">{page.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-1 h-1 rounded-full bg-stone-300" />
                                                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">/{page.slug}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(page)}
                                            className="p-3 rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-900 hover:text-white transition-all"
                                            title="Edit"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(page.slug)}
                                            className="p-3 rounded-xl bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {footerPages.filter(p => p.category === cat).length === 0 && (
                                <div className="py-4 pl-4 text-stone-300 italic text-xs">No pages in this category.</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PagesTab;
