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

// Helper component for cinematic image hovering
const ImageScrubber = ({ images }: { images: string[] }) => {
    const [idx, setIdx] = useState(0);
    return (
        <div 
            className="w-16 h-20 bg-stone-50 rounded-xl overflow-hidden border border-stone-100 relative group/img shrink-0 shadow-inner"
            onMouseLeave={() => setIdx(0)}
        >
            {images && images.length > 0 ? (
                <>
                    <motion.img 
                        key={idx}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        src={images[idx]} 
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover/img:scale-110" 
                    />
                    {images.length > 1 && (
                        <div className="absolute inset-0 flex z-10">
                            <div className="w-1/2 h-full cursor-w-resize" onMouseEnter={() => setIdx((prev) => Math.max(0, prev - 1))} />
                            <div className="w-1/2 h-full cursor-e-resize" onMouseEnter={() => setIdx((prev) => Math.min(images.length - 1, prev + 1))} />
                        </div>
                    )}
                    {images.length > 1 && (
                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-[2px] z-20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                            {images.map((_, i) => (
                                <div key={i} className={`h-[2px] rounded-full transition-all duration-300 ${i === idx ? 'w-2 bg-[#C5A059]' : 'w-1 bg-stone-300'}`} />
                            ))}
                        </div>
                    )}
                </>
            ) : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-stone-300" /></div>}
        </div>
    );
};

interface ProductsTabProps {
    products: Product[];
    brands: Brand[];
    orders: Order[];
    initialFilter?: { type: 'all' | 'category' | 'tag' | 'stock', value: string };
    onFilterChange?: (filter: { type: 'all' | 'category' | 'tag' | 'stock', value: string }) => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products, brands, orders, initialFilter, onFilterChange }) => {
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

    const [priceInput, setPriceInput] = useState('');
    const [costPriceInput, setCostPriceInput] = useState('');
    const [imageInput, setImageInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [sizeInput, setSizeInput] = useState('');
    const [hasSizes, setHasSizes] = useState(false);

    // Toggles
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
    const [adminFilter, setAdminFilter] = useState<{ type: 'all' | 'category' | 'tag' | 'stock', value: string }>(initialFilter || { type: 'all', value: '' });

    // --- Drawer State ---
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        if (initialFilter) {
            setAdminFilter(initialFilter);
        }
    }, [initialFilter]);

    const handleFilterChange = (filter: { type: 'all' | 'category' | 'tag' | 'stock', value: string }) => {
        setAdminFilter(filter);
        if (onFilterChange) onFilterChange(filter);
    };

    // Deduplicated categories for UI selectors
    const uniqueCategories = React.useMemo(() => {
        const seen = new Set();
        return categories.filter(c => {
            const duplicate = seen.has(c.name);
            seen.add(c.name);
            return !duplicate;
        });
    }, [categories]);

    // Derived Categories based on Selected Department
    const filteredCategoriesForDropdown = React.useMemo(() => {
        const MEN_CATS = ['t-shirts', 'shirts', 'boxers', 'shorts', 'jackets', 'underwear', 'chinos', 'pant', 'trousers', 'jeans', 'two piece', 'two-piece', 'jerseys', 'belts', 'headwears', 'sunglasses'];
        const WOMEN_CATS = ['dress', 'top', 'gown', 'trouser'];
        
        let allowedCats = new Set<string>();
        let hasFilter = false;

        if (selectedDepartments.includes('men')) {
            MEN_CATS.forEach(c => allowedCats.add(c));
            hasFilter = true;
        }
        if (selectedDepartments.includes('women')) {
            WOMEN_CATS.forEach(c => allowedCats.add(c));
            hasFilter = true;
        }

        // If no filter applies, show all unique categories. Otherwise, filter them.
        if (!hasFilter) return uniqueCategories;

        // Include any categories that are in the allowed list, PLUS any custom categories that aren't in the hardcoded lists at all (so they aren't lost).
        const ALL_HARDCODED = new Set([...MEN_CATS, ...WOMEN_CATS]);
        
        return uniqueCategories.filter(c => {
            const lowerName = c.name.toLowerCase();
            return allowedCats.has(lowerName) || !ALL_HARDCODED.has(lowerName);
        });
    }, [uniqueCategories, selectedDepartments]);

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
            tags: [...selectedDepartments, ...tagInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t)],
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
        
        const tags = product.tags || [];
        const DEPARTMENTS = ['men', 'women'];
        const depts = tags.filter(t => DEPARTMENTS.includes(t.toLowerCase()));
        if (tags.some(t => t.toLowerCase() === 'unisex')) {
            if (!depts.includes('men')) depts.push('men');
            if (!depts.includes('women')) depts.push('women');
        }
        const otherTags = tags.filter(t => !DEPARTMENTS.includes(t.toLowerCase()) && t.toLowerCase() !== 'unisex');
        
        setSelectedDepartments(depts.map(d => d.toLowerCase()));
        setTagInput(otherTags.join(', '));
        
        setSizeInput(product.sizes?.join(', ') || '');
        setHasSizes(!!product.sizes && product.sizes.length > 0);
        setHasColors(!!product.colors && product.colors.length > 0);

        // Brand check
        const brandExists = brands.some(b => b.name === product.brand);
        setCustomBrand(!brandExists && product.brand !== 'ASHLUXE' ? product.brand : '');

        setIsDrawerOpen(true);
    };

    useEffect(() => {
        if (!products || products.length === 0) return;
        const queryParams = new URLSearchParams(window.location.search);
        const editId = queryParams.get('edit');
        if (editId) {
            const productToEdit = products.find(p => p.id === editId);
            if (productToEdit && editingId !== editId) {
                setTimeout(() => {
                    startEdit(productToEdit);
                }, 200);
            }
        }
    }, [products, editingId]);

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
        setIsDrawerOpen(false);
        setSelectedDepartments([]);
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
        if (adminFilter.type === 'stock' && adminFilter.value === 'out_of_stock') return p.stock <= 0;
        return true;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="relative">
            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-serif italic text-stone-900 tracking-tight">Product Catalog</h2>
                    <p className="text-xs text-stone-500 mt-1">Manage inventory, prices, and stock.</p>
                </div>
                <button
                    onClick={() => { cancelEdit(); setIsDrawerOpen(true); }}
                    className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_15px_rgb(0,0,0,0.1)] hover:bg-[#C5A059] hover:shadow-[0_4px_20px_rgb(197,160,89,0.3)] transition-all duration-300"
                >
                    <Plus size={16} /> Add Artifact
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8 items-start">
                
                {/* --- DRAWER SECTION --- */}
                <AnimatePresence>
                    {isDrawerOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={cancelEdit}
                                className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
                            />
                            
                            {/* Slide-out Panel */}
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-[#fcfcfc] shadow-[0_0_40px_rgba(0,0,0,0.1)] z-50 overflow-y-auto custom-scrollbar border-l border-stone-200"
                            >
                                <div id="product-form-container" className="p-8 pb-32">
                                    <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#fcfcfc]/90 backdrop-blur-md py-4 z-10 border-b border-stone-100">
                                        <h2 className="text-2xl font-bold font-serif italic text-stone-900 tracking-tight">
                                            {editingId ? 'Edit Artifact' : 'New Artifact'}
                                        </h2>
                                        <button onClick={cancelEdit} className="p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Brand & Visibility */}
                    <div className="bg-stone-50/50 p-5 rounded-2xl space-y-5 border border-stone-100/50 shadow-inner">
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
                    <div className="space-y-5">
                        <div className="relative group">
                            <label className="absolute -top-2 left-4 px-1 bg-white text-[8px] font-black text-[#C5A059] uppercase tracking-widest z-10 transition-all group-focus-within:text-[#C5A059]">Designation (Name)</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all shadow-sm" placeholder="e.g. 'Oversized Silk Shirt'" />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="relative group">
                                <label className="absolute -top-2 left-4 px-1 bg-white text-[8px] font-black text-stone-400 uppercase tracking-widest z-10 group-focus-within:text-[#C5A059] transition-colors">Price (NGN)</label>
                                <input type="text" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="w-full px-5 py-4 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all shadow-sm" placeholder="0.00" />
                            </div>
                            <div className="relative group">
                                <label className="absolute -top-2 left-4 px-1 bg-white text-[8px] font-black text-stone-400 uppercase tracking-widest z-10 group-focus-within:text-[#C5A059] transition-colors">Cost Price (NGN)</label>
                                <input type="text" value={costPriceInput} onChange={(e) => setCostPriceInput(e.target.value)} className="w-full px-5 py-4 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all shadow-sm" placeholder="0.00" />
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

                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all"
                                >
                                    <option value="" disabled>SELECT CATEGORY</option>
                                    {filteredCategoriesForDropdown.map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Structured Tags Section */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Department (Navbar Link)</label>
                                    <div className="flex gap-2">
                                        {['men', 'women'].map(dept => (
                                            <button
                                                key={dept}
                                                type="button"
                                                onClick={() => {
                                                    if (selectedDepartments.includes(dept)) {
                                                        setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                                                    } else {
                                                        setSelectedDepartments([...selectedDepartments, dept]);
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    selectedDepartments.includes(dept) 
                                                    ? 'bg-stone-900 text-white shadow-md' 
                                                    : 'bg-stone-50 border border-stone-100 text-stone-500 hover:border-stone-300'
                                                }`}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Additional Tags</label>
                                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. summer, trending, new arrival..." className="w-full px-5 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-bold focus:outline-none focus:bg-white focus:border-[#C5A059]" />
                                </div>
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

                    <button type="submit" className="relative w-full overflow-hidden bg-stone-900 text-white py-5 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(197,160,89,0.25)] hover:bg-[#1a1a1a] transition-all duration-300 active:scale-[0.98] group">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {editingId ? "Save Changes" : "Create Product"} <CheckCircle2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    </button>
                </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            {/* --- LIST SECTION --- */}
            < div className="w-full space-y-6 min-w-0" >
                {/* Filters */}
                < div className="flex overflow-x-auto gap-2 pb-4 border-b border-stone-100 sticky top-0 bg-[#fcfcfc]/90 backdrop-blur-xl z-20 py-2 [&::-webkit-scrollbar]:hidden" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }} >
                    <button onClick={() => handleFilterChange({ type: 'all', value: '' })} className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all shrink-0 ${adminFilter.type === 'all' ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-400 border-stone-200 hover:border-stone-400 hover:text-stone-900'}`}>All</button>
                    {
                        uniqueCategories.map(c => (
                            <button key={c.name} onClick={() => handleFilterChange({ type: 'category', value: c.name })} className={`px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all shrink-0 ${adminFilter.type === 'category' && adminFilter.value === c.name ? 'bg-[#C5A059] text-white border-[#C5A059]' : 'bg-white text-stone-400 border-stone-100 hover:text-[#C5A059]'}`}>
                                {c.name}
                            </button>
                        ))
                    }
                    <button onClick={() => handleFilterChange({ type: 'stock', value: 'out_of_stock' })} className={`px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all shrink-0 ${adminFilter.type === 'stock' && adminFilter.value === 'out_of_stock' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-400 border-red-100 hover:text-red-500'}`}>Out of Stock</button>
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

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                    {filteredProducts.map(p => (
                        <motion.div
                            variants={itemVariants}
                            layout
                            key={p.id}
                            className="bg-white p-5 rounded-[2rem] border border-stone-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#C5A059]/30 transition-all duration-300 relative"
                        >
                            {/* Bulk Selection Checkbox */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelect(p.id);
                                }}
                                className="absolute top-4 left-4 z-10 text-stone-300 hover:text-[#C5A059] transition-colors"
                            >
                                {selectedIds.has(p.id) ? (
                                    <CheckSquare size={20} className="text-[#C5A059] bg-white rounded-md" />
                                ) : (
                                    <Square size={20} className="bg-white rounded-md" />
                                )}
                            </button>
                            
                            <div className="w-full h-48 mb-4">
                                <div 
                                    className="w-full h-full bg-stone-50 rounded-2xl overflow-hidden border border-stone-100/50 relative group/img shadow-inner"
                                    onMouseLeave={() => { /* Handled inside ImageScrubber if extracted, but we'll adapt it here */ }}
                                >
                                    {p.images && p.images.length > 0 ? (
                                        <img src={p.images[0]} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover/img:scale-110" />
                                    ) : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-stone-300" /></div>}
                                </div>
                            </div>

                            <div className="flex flex-col flex-1">
                                <h3 className="text-sm font-bold text-stone-900 leading-tight group-hover:text-[#C5A059] transition-colors duration-300 line-clamp-1" title={p.name}>{p.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest">₦{p.price.toLocaleString()}</span>
                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{p.brand}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider ${p.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {p.stock > 0 ? `In Stock (${p.stock})` : 'Sold Out'}
                                    </span>
                                    {p.isVisible === false && <span className="px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500">Hidden</span>}
                                    {(() => {
                                        const risk = getStockoutRisk(p);
                                        return (
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider ${risk.bg} ${risk.color}`}>
                                                {risk.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 z-10">
                                <button onClick={() => startEdit(p)} className="p-2 rounded-xl bg-white/80 backdrop-blur-md text-stone-500 hover:bg-stone-900 hover:text-[#C5A059] transition-colors shadow-sm border border-stone-100">
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
                                                alert(`Delete failed!\nError: ${err.message}`);
                                            }
                                        }
                                    }}
                                    className="p-2 rounded-xl bg-white/80 backdrop-blur-md text-stone-500 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-stone-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="py-32 text-center bg-white/50 border border-stone-100 border-dashed rounded-[2rem]">
                            <p className="text-stone-400 font-serif italic text-lg">No artifacts found in this category.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    </div>
    );
};

export default ProductsTab;
