import React, { useState, useRef, useEffect } from 'react';
import {
    Plus, Trash2, Edit3, X, Loader2, Upload, ImageIcon,
    Search, Filter, CheckCircle2, AlertCircle, Square, CheckSquare
} from 'lucide-react';
import { Product, Brand, Order } from '../../types';
import { calculateInventoryVelocity } from '../../services/analyticsUtils';
// import { storage } from '../../services/firebaseConfig';
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth } from '../../services/firebaseConfig';
import { uploadImageToCloudinary } from '../../services/cloudinary';
import { saveProduct, deleteProduct, saveBrand, deleteBrand, logAdminAction, subscribeToCategories, saveCategory, deleteCategory } from '../../services/dbUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductsTabProps {
    products: Product[];
    brands: Brand[];
    orders: Order[];
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products, brands, orders }) => {
    // --- Data State ---
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const unsub = subscribeToCategories(setCategories);
        return () => unsub();
    }, []);
    // --- Form State ---
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Inputs
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        brand: 'ASHLUXE',
        description: '',
        category: 'Clothing',
        stock: 0,
        images: [],
        tags: [],
        colors: [],
        sizes: [],
        isVisible: true
    });

    const [priceInput, setPriceInput] = useState<string>('');
    const [costPriceInput, setCostPriceInput] = useState<string>('');
    const [imageInput, setImageInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [sizeInput, setSizeInput] = useState('');

    // Toggles
    const [hasSizes, setHasSizes] = useState(false);
    const [hasColors, setHasColors] = useState(false);
    const [showBrandManager, setShowBrandManager] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Brand / Color / Custom Inputs
    const [newBrandName, setNewBrandName] = useState('');
    const [customBrand, setCustomBrand] = useState('');
    const [colorInputName, setColorInputName] = useState('');
    const [colorInputHex, setColorInputHex] = useState('#000000');
    const [colorInputImage, setColorInputImage] = useState('');

    const [newCategoryName, setNewCategoryName] = useState('');

    // --- Filter State ---
    const [adminFilter, setAdminFilter] = useState<{ type: 'all' | 'category' | 'tag', value: string }>({ type: 'all', value: '' });

    // Deduplicated categories for UI selectors
    const uniqueCategories = React.useMemo(() => {
        const seen = new Set();
        return categories.filter(c => {
            const duplicate = seen.has(c.name);
            seen.add(c.name);
            return !duplicate;
        });
    }, [categories]);

    // --- Bulk Selection State ---
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // --- Actions ---

    const velocityMap = React.useMemo(() => calculateInventoryVelocity(orders), [orders]);

    const getStockoutRisk = (product: Product) => {
        if (product.stock <= 0) return { label: 'Sold Out', color: 'text-stone-400', bg: 'bg-stone-100' };

        const velocity = velocityMap.get(product.id) || 0;
        if (velocity === 0) return { label: 'Stagnant', color: 'text-stone-400', bg: 'bg-stone-100' };

        const daysRemaining = product.stock / velocity;

        if (daysRemaining < 7) return { label: `< ${Math.ceil(daysRemaining)} Days Left`, color: 'text-red-600', bg: 'bg-red-50' };
        if (daysRemaining < 14) return { label: `~${Math.ceil(daysRemaining)} Days Left`, color: 'text-amber-600', bg: 'bg-amber-50' };
        return { label: '> 2 Weeks', color: 'text-green-600', bg: 'bg-green-50' };
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            // Parallel Uploads to Cloudinary
            const uploadPromises = Array.from(files).map(file => uploadImageToCloudinary(file));
            const urls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...urls]
            }));
        } catch (error: any) {
            console.error("Error uploading images:", error);
            alert(`Upload Failed: ${error.message}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const addImageFromUrl = () => {
        if (!imageInput) return;
        const urlMatch = imageInput.match(/(https?:\/\/[^\s\]"']+)/);
        const cleanUrl = urlMatch ? urlMatch[0] : imageInput;
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), cleanUrl] }));
        setImageInput('');
    };

    const removeImage = (idx: number) => {
        setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericPrice = parseFloat(priceInput);
        const numericCost = parseFloat(costPriceInput) || 0;
        if (!formData.name || isNaN(numericPrice) || !formData.images?.length) {
            alert("Required: Name, Price, and at least one Image.");
            return;
        }
        const finalProduct = {
            ...formData,
            price: numericPrice,
            costPrice: numericCost,
            id: editingId || `p-${Date.now()}`,
            brand: formData.brand === 'CUSTOM' ? customBrand.toUpperCase() : formData.brand,
            tags: tagInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
            sizes: sizeInput.split(',').map(s => s.trim()).filter(s => s),
        } as Product;

        console.log("Saving Product:", finalProduct); // Debug log
        saveProduct(finalProduct).then(() => {
            logAdminAction(
                editingId ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
                `${editingId ? 'Updated' : 'Created'} product: ${finalProduct.name} (${finalProduct.brand}) - Price: ${finalProduct.price}, Cost: ${finalProduct.costPrice}`,
                auth.currentUser?.email || 'Unknown',
                {
                    resourceType: 'product',
                    resourceId: finalProduct.id,
                    afterState: finalProduct
                }
            );
            cancelEdit();
            alert(editingId ? "Product updated." : "Product added.");
        }).catch(err => {
            console.error(err);
            alert("Failed to save product.");
        });
    };

    const startEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData(product);
        setPriceInput(product.price.toString());
        setCostPriceInput(product.costPrice?.toString() || '');
        setTagInput(product.tags.join(', '));
        setSizeInput(product.sizes?.join(', ') || '');
        setHasSizes(!!product.sizes && product.sizes.length > 0);
        setHasColors(!!product.colors && product.colors.length > 0);

        // Brand check
        const brandExists = brands.some(b => b.name === product.brand);
        setCustomBrand(!brandExists && product.brand !== 'ASHLUXE' ? product.brand : '');

        // Scroll to top content
        const formElement = document.getElementById('product-form-container');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setPriceInput('');
        setCostPriceInput('');
        setTagInput('');
        setSizeInput('');
        setCustomBrand('');
        setHasSizes(false);
        setHasColors(false);
        setColorInputName('');
        setColorInputHex('#000000');
        setColorInputImage('');
        setFormData({ name: '', brand: 'ASHLUXE', price: 0, costPrice: 0, images: [], description: '', category: 'Clothing', stock: 0, tags: [], colors: [], sizes: [], isVisible: true });
    };

    const handleAddBrand = async (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Stop bubbling to form

        if (!newBrandName.trim()) return;

        const cleanName = newBrandName.trim().toUpperCase();

        // Duplicate Check
        if (brands.some(b => b.name === cleanName)) {
            alert("Brand already exists.");
            return;
        }

        try {
            await saveBrand(cleanName);
            setFormData(prev => ({ ...prev, brand: cleanName })); // Auto-select
            setNewBrandName('');
        } catch (err) {
            console.error(err);
            alert("Failed to save brand. Please try again.");
        }
    };

    const handleDeleteBrand = async (id: string) => {
        if (confirm('Permanently delete this brand?')) {
            try {
                await deleteBrand(id);
            } catch (err) {
                console.error(err);
                alert("Failed to delete brand.");
            }
        }
    };

    const handleConfirmDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            logAdminAction(
                'DELETE_PRODUCT',
                `Deleted product: ${id}`,
                auth.currentUser?.email || 'Unknown',
                { resourceType: 'product', resourceId: id }
            );
            setDeleteConfirmId(null);
        } catch (error) {
            console.error(error);
            alert("Delete failed. See console.");
        }
    };

    const handleAddCategory = async (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!newCategoryName.trim()) return;
        const cleanName = newCategoryName.trim();

        if (categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
            alert("Category already exists.");
            return;
        }

        try {
            await saveCategory(cleanName);
            setFormData(prev => ({ ...prev, category: cleanName })); // Auto-select
            setNewCategoryName('');
        } catch (err) {
            console.error(err);
            alert("Failed to save category.");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (confirm('Permanently delete this category?')) {
            try {
                await deleteCategory(id);
            } catch (err) {
                console.error(err);
                alert("Failed to delete category.");
            }
        }
    };

    const handleSeedCategories = async () => {
        if (!confirm('This will add the new specific Navbar categories (T-shirts, Dresses, etc.) to your database. Proceed?')) return;

        const newCats = [
            'Clothing', 'T-shirts', 'Shirts', 'Boxers', 'Shorts', 'Jackets',
            'Underwear', 'Chinos', 'Pant', 'Trousers', 'Jeans', 'Two Piece',
            'Jerseys', 'Accessories', 'Belts', 'Headwear', 'Sunglasses',
            'Dress', 'Top', 'Gown', 'Trouser'
        ];

        try {
            for (const cat of newCats) {
                if (!categories.some(c => c.name.toLowerCase() === cat.toLowerCase())) {
                    await saveCategory(cat);
                }
            }
            alert("Categories seeded successfully!");
        } catch (err) {
            console.error("Error seeding categories:", err);
            alert("Failed to seed some categories.");
        }
    };

    const handleSeedBrands = async () => {
        if (!confirm('This will add the signature collections (Zara, Bershka, Pull & Bear, Boohooman) to your database. Proceed?')) return;

        const sigBrands = ['Zara', 'Boohooman', 'Pull & Bear', 'Bershka'];

        try {
            for (const b of sigBrands) {
                if (!brands.some(existing => existing.name.toLowerCase() === b.toLowerCase())) {
                    await saveBrand(b);
                }
            }
            alert("Signature Brands seeded successfully!");
            setShowBrandManager(false);
        } catch (err) {
            console.error("Error seeding brands:", err);
            alert("Failed to seed some brands.");
        }
    };

    // --- Bulk Actions ---
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Delete ${selectedIds.size} products permanently?`)) return;

        setIsBulkDeleting(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => deleteProduct(id)));
            logAdminAction(
                'BULK_DELETE_PRODUCT',
                `Deleted ${selectedIds.size} products`,
                auth.currentUser?.email || 'Unknown',
                { resourceType: 'product' }
            );
            setSelectedIds(new Set());
            alert(`${selectedIds.size} products deleted successfully.`);
        } catch (error) {
            console.error(error);
            alert("Some deletes failed. Check console.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const filteredProducts = products.filter(p => {
        if (adminFilter.type === 'all') return true;
        if (adminFilter.type === 'category') return p.category === adminFilter.value;
        if (adminFilter.type === 'tag') return (p.tags || []).includes(adminFilter.value);
        return true;
    });

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* --- FORM SECTION --- */}
            <div id="product-form-container" className="lg:col-span-5 bg-white border border-stone-100 shadow-xl rounded-[2rem] p-8 lg:sticky lg:top-32 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-serif italic text-stone-900">
                        {editingId ? 'Edit Artifact' : 'New Artifact'}
                    </h2>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900">Cancel</button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Brand & Visibility */}
                    <div className="bg-stone-50/50 p-4 rounded-2xl space-y-4 border border-stone-100">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Brand Strategy</label>
                            <button type="button" onClick={() => setShowBrandManager(!showBrandManager)} className="text-[8px] font-bold text-[#C5A059] uppercase tracking-widest hover:underline">
                                {showBrandManager ? 'Close Manager' : 'Manage Brands'}
                            </button>
                        </div>

                        {showBrandManager && (
                            <div className="p-3 bg-white rounded-xl border border-stone-100 space-y-3 mb-2 animate-in slide-in-from-top-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newBrandName}
                                        onChange={e => setNewBrandName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddBrand(e);
                                            }
                                        }}
                                        placeholder="NEW BRAND"
                                        className="flex-1 px-3 py-2 text-[10px] border border-stone-200 rounded-lg focus:outline-none focus:border-[#C5A059]"
                                    />
                                    <button type="button" onClick={handleAddBrand} className="bg-stone-900 text-white px-3 rounded-lg"><Plus size={12} /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {brands.map(b => (
                                        <span key={b.id} className="bg-stone-50 border border-stone-100 px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1">
                                            {b.name} <button type="button" onClick={() => handleDeleteBrand(b.id)} className="text-stone-400 hover:text-red-500"><X size={8} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="pt-2 border-t border-stone-100">
                                    <button
                                        type="button"
                                        onClick={handleSeedBrands}
                                        className="w-full py-2 bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059] hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={12} /> Auto-Seed Signature Collections
                                    </button>
                                </div>
                            </div>
                        )}

                        <select
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-[10px] font-bold tracking-widest focus:outline-none focus:border-[#C5A059]"
                        >
                            <option value="">SELECT BRAND</option>
                            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            <option value="CUSTOM">CUSTOM / OTHER</option>
                        </select>

                        {formData.brand === 'CUSTOM' && (
                            <input type="text" placeholder="ENTER CUSTOM BRAND" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-[10px] font-bold tracking-widest focus:outline-none" />
                        )}


                    </div>

                    {/* Core Info */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Designation (Name)</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-bold focus:outline-none focus:bg-white focus:border-[#C5A059] transition-all" placeholder="e.g. 'Oversized Silk Shirt'" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Price (NGN)</label>
                                <input type="text" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="w-full px-5 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-bold focus:outline-none focus:bg-white focus:border-[#C5A059] transition-all" placeholder="0.00" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Cost Price (NGN)</label>
                                <input type="text" value={costPriceInput} onChange={(e) => setCostPriceInput(e.target.value)} className="w-full px-5 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-bold focus:outline-none focus:bg-white focus:border-[#C5A059] transition-all" placeholder="0.00" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Stock Level</label>
                                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full px-5 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-bold focus:outline-none focus:bg-white focus:border-[#C5A059] transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Category</label>
                                    <button type="button" onClick={() => setShowCategoryManager(!showCategoryManager)} className="text-[8px] font-bold text-[#C5A059] uppercase tracking-widest hover:underline">
                                        {showCategoryManager ? 'Close Manager' : 'Manage Categories'}
                                    </button>
                                </div>

                                {showCategoryManager && (
                                    <div className="p-3 bg-white rounded-xl border border-stone-100 space-y-3 mb-4 animate-in slide-in-from-top-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newCategoryName}
                                                onChange={e => setNewCategoryName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddCategory(e);
                                                    }
                                                }}
                                                placeholder="NEW CATEGORY"
                                                className="flex-1 px-3 py-2 text-[10px] border border-stone-200 rounded-lg focus:outline-none focus:border-[#C5A059]"
                                            />
                                            <button type="button" onClick={handleAddCategory} className="bg-stone-900 text-white px-3 rounded-lg"><Plus size={12} /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(c => (
                                                <span key={c.id} className="bg-stone-50 border border-stone-100 px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1">
                                                    {c.name} <button type="button" onClick={() => handleDeleteCategory(c.id)} className="text-stone-400 hover:text-red-500"><X size={8} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="pt-2 border-t border-stone-100">
                                            <button
                                                type="button"
                                                onClick={handleSeedCategories}
                                                className="w-full py-2 bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059] hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus size={12} /> Auto-Seed Navbar Categories
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {uniqueCategories.map(c => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: c.name })}
                                            className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${formData.category === c.name ? 'bg-[#C5A059] text-white border-[#C5A059] shadow-md' : 'bg-white text-stone-400 border-stone-100 hover:border-[#C5A059]/50'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Search Tags</label>
                                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Comma separated..." className="w-full px-5 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-bold focus:outline-none focus:bg-white focus:border-[#C5A059]" />
                            </div>
                        </div>
                    </div>

                    {/* Variants (Size & Color) */}
                    <div className="space-y-4 pt-4 border-t border-stone-100">
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setHasSizes(!hasSizes)} className={`w-8 h-4 rounded-full flex items-center px-1 transition-all ${hasSizes ? 'bg-stone-900 justify-end' : 'bg-stone-200 justify-start'}`}><div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" /></button>
                                <span className="text-[9px] font-bold text-stone-500 uppercase">Sizing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setHasColors(!hasColors)} className={`w-8 h-4 rounded-full flex items-center px-1 transition-all ${hasColors ? 'bg-stone-900 justify-end' : 'bg-stone-200 justify-start'}`}><div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" /></button>
                                <span className="text-[9px] font-bold text-stone-500 uppercase">Colors</span>
                            </div>
                        </div>

                        {hasSizes && (
                            <div className="animate-in slide-in-from-top-2">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block">Size Range</label>
                                <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="S, M, L, XL" className="w-full px-5 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-bold focus:outline-none focus:border-[#C5A059]" />
                            </div>
                        )}

                        {hasColors && (
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 animate-in slide-in-from-top-2 space-y-3">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[8px] font-bold text-stone-400 uppercase">Name</label>
                                        <input type="text" value={colorInputName} onChange={e => setColorInputName(e.target.value)} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-[10px] font-bold focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-bold text-stone-400 uppercase">Hex</label>
                                        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1">
                                            <input type="color" value={colorInputHex} onChange={e => setColorInputHex(e.target.value)} className="w-6 h-6 rounded border-none cursor-pointer" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => {
                                        if (!colorInputName) return;
                                        const newColor = { name: colorInputName, hex: colorInputHex, image: colorInputImage || null };
                                        setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), newColor] }));
                                        setColorInputName(''); setColorInputImage('');
                                    }} className="bg-stone-900 text-white h-9 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest">Add</button>
                                </div>

                                {/* Color List */}
                                <div className="space-y-1">
                                    {formData.colors?.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white p-2 border border-stone-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full border border-stone-100" style={{ backgroundColor: c.hex }} />
                                                <span className="text-[9px] font-bold text-stone-700 uppercase">{c.name}</span>
                                            </div>
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, colors: p.colors?.filter((_, idx) => idx !== i) }))} className="text-stone-300 hover:text-red-500"><X size={10} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Gallery */}
                    <div className="pt-4 border-t border-stone-100 space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={12} className="text-[#C5A059]" /> Visual Assets
                            </label>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, images: [] }))} className="text-[8px] font-bold text-red-300 hover:text-red-500 uppercase tracking-widest">Clear</button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {formData.images?.map((img, i) => (
                                <div key={i} className="relative group aspect-square rounded-xl bg-white border border-stone-200 overflow-hidden">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Trash2 size={14} /></button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-[#C5A059] hover:border-[#C5A059] transition-all bg-stone-50 hover:bg-[#C5A059]/5"
                            >
                                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                <span className="text-[7px] font-black uppercase tracking-widest text-center px-1">
                                    {isUploading ? "Uploading..." : "Add Image"}
                                </span>
                            </button>
                        </div>
                        <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

                        <div className="flex gap-2">
                            <input type="text" placeholder="Or paste image URL" value={imageInput} onChange={e => setImageInput(e.target.value)} className="flex-1 px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl text-[10px] focus:outline-none" />
                            <button type="button" onClick={addImageFromUrl} className="bg-stone-200 text-stone-600 px-3 rounded-xl hover:bg-stone-300"><Plus size={14} /></button>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-[#1c1917] text-white py-5 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-98">
                        {editingId ? "Save Changes" : "Create Product"}
                    </button>
                </form>
            </div >

            {/* --- LIST SECTION --- */}
            < div className="lg:col-span-7 space-y-6" >
                {/* Filters */}
                < div className="flex flex-wrap gap-2 pb-4 border-b border-stone-100" >
                    <button onClick={() => setAdminFilter({ type: 'all', value: '' })} className={`px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${adminFilter.type === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100'}`}>All</button>
                    {
                        uniqueCategories.map(c => (
                            <button key={c.name} onClick={() => setAdminFilter({ type: 'category', value: c.name })} className={`px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${adminFilter.type === 'category' && adminFilter.value === c.name ? 'bg-[#C5A059] text-white border-[#C5A059]' : 'bg-white text-stone-400 border-stone-100 hover:text-[#C5A059]'}`}>
                                {c.name}
                            </button>
                        ))
                    }
                </div >

                {/* Bulk Actions Toolbar */}
                {filteredProducts.length > 0 && (
                    <div className="flex items-center justify-between py-3 px-4 bg-stone-50 rounded-xl border border-stone-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSelectAll}
                                className="flex items-center gap-2 text-[10px] font-bold text-stone-600 hover:text-stone-900 transition-colors"
                            >
                                {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                                    <CheckSquare size={16} className="text-[#C5A059]" />
                                ) : (
                                    <Square size={16} />
                                )}
                                <span>{selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? 'Deselect All' : 'Select All'}</span>
                            </button>
                            {selectedIds.size > 0 && (
                                <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">
                                    {selectedIds.size} selected
                                </span>
                            )}
                        </div>
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isBulkDeleting}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={14} />
                                    <span>{isBulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid gap-4">
                    {filteredProducts.map(p => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={p.id}
                            className="bg-white p-4 pr-6 rounded-[1.5rem] border border-stone-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-5">
                                {/* Bulk Selection Checkbox */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelect(p.id);
                                    }}
                                    className="flex-shrink-0 text-stone-400 hover:text-[#C5A059] transition-colors"
                                >
                                    {selectedIds.has(p.id) ? (
                                        <CheckSquare size={18} className="text-[#C5A059]" />
                                    ) : (
                                        <Square size={18} />
                                    )}
                                </button>
                                <div className="w-16 h-20 bg-stone-50 rounded-xl flex items-center justify-center p-2 border border-stone-100">
                                    {p.images[0] ? <img src={p.images[0]} className="max-h-full max-w-full object-contain mix-blend-multiply" /> : <ImageIcon size={20} className="text-stone-300" />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-stone-900 leading-tight">{p.name}</h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest">₦{p.price.toLocaleString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-stone-300" />
                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{p.brand}</span>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${p.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {p.stock > 0 ? `In Stock (${p.stock})` : 'Sold Out'}
                                        </span>
                                        {p.isVisible === false && <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500">Hidden</span>}
                                        {(() => {
                                            const risk = getStockoutRisk(p);
                                            return (
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${risk.bg} ${risk.color}`}>
                                                    {risk.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:translate-x-4 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 transition-all duration-300">
                                <button onClick={() => startEdit(p)} className="p-2.5 rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-900 hover:text-white transition-colors">
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm("Permanently delete this product?")) {
                                            try {
                                                await deleteProduct(p.id);
                                            } catch (err: any) {
                                                console.error(err);
                                                alert(`Delete failed!\nError: ${err.message}\nUser: ${auth.currentUser?.email}\nRequired: admin@zahrah.com`);
                                            }
                                        }
                                    }}
                                    className="p-2.5 rounded-xl bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-stone-300 font-serif italic text-lg">No artifacts found in this category.</p>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default ProductsTab;
