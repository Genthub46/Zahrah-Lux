
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, Plus, LogOut, Trash2,
  Search, BarChart3, Edit3, X, BellRing,
  Loader2, Lock, Eye, Calendar, Mail, Palette,
  CheckCircle2, Layers, PenTool, Sparkles, LayoutGrid, ToggleLeft, ToggleRight, EyeOff, Image as ImageIcon, AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign, Target, Award, ArrowUp, ArrowDown, GripVertical, User, MapPin, Phone, ExternalLink, Clock, Send, FileText, Info, ChevronRight, ChevronLeft, Menu, ExternalLink as LinkIcon, Upload, Check, AlertCircle as AlertIcon, MessageCircle, Star
} from 'lucide-react';
import { Product, Order, ViewLog, RestockRequest, HomeLayoutConfig, SectionConfig, FooterPage, Brand, Review } from '../types';
import Logo from '../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, auth } from '../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  saveProduct,
  deleteProduct,
  saveOrder,
  deleteRestockRequest,
  saveFooterPage,
  deleteFooterPage,
  saveLayoutConfig,
  seedInitialData,
  subscribeToBrands,
  saveBrand,
  deleteBrand,
  updateRestockRequestStatus,
  subscribeToReviews,
  deleteReview,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToLogs,
  subscribeToRequests,
  subscribeToPages
} from '../services/dbUtils';
import { INITIAL_PRODUCTS, INITIAL_FOOTER_PAGES, INITIAL_HOME_LAYOUT } from '../constants';
import { exportOrdersToCSV, exportOrdersToPDF, exportWaitlistToPDF } from '../services/exportUtils';
import { FileSpreadsheet } from 'lucide-react';

interface AdminProps {
  products: Product[];
  orders: Order[];
  viewLogs: ViewLog[];
  restockRequests: RestockRequest[];
  layoutConfig: HomeLayoutConfig;
  footerPages: FooterPage[];
}

import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';

const Admin: React.FC<AdminProps> = ({
  products = [],
  orders = [],
  viewLogs = [],
  restockRequests = [],
  layoutConfig,
  footerPages = [],
}) => {
  const navigate = useNavigate();

  // Core State
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewLogs, setViewLogs] = useState<ViewLog[]>([]);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [footerPages, setFooterPages] = useState<FooterPage[]>([]);

  // Auth State
  const [isAuthenticated, setIsLoggedIn] = useState(false); // Using setIsLoggedIn to match usage
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'requests' | 'layout' | 'pages'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Pages State
  const [editingPageSlug, setEditingPageSlug] = useState<string | null>(null);
  const [pageFormData, setPageFormData] = useState<Partial<FooterPage>>({
    title: '',
    slug: '',
    content: '',
    category: 'Customer Services'
  });

  // Layout Management State
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Dynamic Brands State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [showBrandManager, setShowBrandManager] = useState(false);

  // States for product form handling
  const [priceInput, setPriceInput] = useState<string>('');
  const [imageInput, setImageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [hasSizes, setHasSizes] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: 'ASHLUXE',
    description: '',
    category: 'Apparel',
    stock: 0,
    images: [],
    tags: [],
    colors: [],
    sizes: [],
    features: [],
    composition: [],
    specifications: [],
    isVisible: true
  });

  const [reviews, setReviews] = useState<Review[]>([]);



  // Week Navigation State
  const [weekOffset, setWeekOffset] = useState(0);

  const filteredOrders = useMemo(() => {
    // 1. Calculate Date Range for the selected week
    const now = new Date();
    // Adjust to start of current week (Sunday)
    const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfWeek = new Date(currentWeekStart);
    startOfWeek.setDate(currentWeekStart.getDate() + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let result = orders.filter(o => {
      const oDate = new Date(o.date);
      return oDate >= startOfWeek && oDate <= endOfWeek;
    });

    // 2. Text Search
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      result = result.filter(o =>
        (o.id || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerEmail || '').toLowerCase().includes(q)
      );
    }

    // 3. Sort Descending (Newest First)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [orders, orderSearchQuery, weekOffset]);

  const handleLogout = useCallback(() => {
    signOut(auth).then(() => {
      setIsLoggedIn(false);
      navigate('/');
    });
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubProducts = subscribeToProducts((data) => setProducts(data));
    const unsubOrders = subscribeToOrders((data) => setOrders(data));
    const unsubLogs = subscribeToLogs((data) => setViewLogs(data));
    const unsubRequests = subscribeToRequests((data) => setRestockRequests(data));
    const unsubPages = subscribeToPages((data) => setFooterPages(data));
    const unsubBrands = subscribeToBrands((data) => {
      setBrands(data.sort((a, b) => a.name.localeCompare(b.name)));
    });
    const unsubReviews = subscribeToReviews((data) => setReviews(data));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubLogs();
      unsubRequests();
      unsubPages();
      unsubBrands();
      unsubReviews();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle the rest
    } catch (err: any) {
      console.error("Login failed", err);
      setLoginError('Authentication Failed: Invalid ID or Password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- Image Handling ---
  // --- Image Handling ---
  // --- Image Handling ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Create a promise that rejects after 60 seconds (extended timeout)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload Timeout (60s): Check your internet connection or Firewall")), 60000)
      );

      const uploadWrapper = async (file: File) => {
        return new Promise<string>((resolve, reject) => {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          // Use uploadBytesResumable for better diagnostics
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            (error) => {
              console.error("Upload failure:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      };

      const uploadPromises = Array.from(files).map(file => uploadWrapper(file));

      // Race against timeout
      const urls = await Promise.race([
        Promise.all(uploadPromises),
        timeoutPromise
      ]) as string[];

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
    } catch (error: any) {
      console.error("Error uploading images:", error);
      alert(`Upload Failed: ${error.message || error.code || 'Unknown Error'}`);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addImageFromUrl = () => {
    if (!imageInput) return;
    // Smart extraction: finds the first http/https link in the text (handling BBCode/[img] tags)
    const urlMatch = imageInput.match(/(https?:\/\/[^\s\]"']+)/);
    const cleanUrl = urlMatch ? urlMatch[0] : imageInput;

    setFormData(prev => ({ ...prev, images: [...(prev.images || []), cleanUrl] }));
    setImageInput('');
  };

  const removeImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }));
  };

  const clearGallery = () => {
    if (confirm('Wipe all assets from this gallery?')) {
      setFormData(prev => ({ ...prev, images: [] }));
    }
  };

  // --- Products Handling ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(priceInput);
    if (!formData.name || isNaN(numericPrice) || !formData.images?.length) {
      alert("Missing Required Fields: Product Name, Price, and at least one Image are required.");
      return;
    }
    const finalProduct = {
      ...formData,
      price: numericPrice,
      id: editingId || `p-${Date.now()}`,
      brand: formData.brand === 'CUSTOM' ? customBrand.toUpperCase() : formData.brand,
      tags: tagInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
      sizes: sizeInput.split(',').map(s => s.trim()).filter(s => s),
    } as Product;

    // Save to Firestore (replaces local setProducts)
    saveProduct(finalProduct).then(() => {
      cancelEdit();
      alert(editingId ? "Product updated successfully." : "Product added successfully.");
    }).catch(err => {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    });
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    saveBrand(newBrandName.toUpperCase()).then(() => setNewBrandName(''));
  };

  const handleDeleteBrand = (id: string) => {
    if (confirm('Permanently delete this brand?')) deleteBrand(id);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setPriceInput(product.price.toString());
    setTagInput(product.tags.join(', '));
    setSizeInput(product.sizes?.join(', ') || '');
    setHasSizes(!!product.sizes && product.sizes.length > 0);
    setFormData({ ...product, isVisible: product.isVisible !== false }); // Default to true if undefined

    // Check if brand is in our list
    const brandExists = brands.some(b => b.name === product.brand);
    setCustomBrand(!brandExists && product.brand !== 'ASHLUXE' ? product.brand : '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPriceInput('');
    setTagInput('');
    setSizeInput('');
    setCustomBrand('');
    setHasSizes(false);
    setHasSizes(false);
    setFormData({ name: '', brand: 'ASHLUXE', price: 0, images: [], description: '', category: 'Apparel', stock: 0, tags: [], colors: [], sizes: [], isVisible: true });
  };

  // --- Orders Handling ---
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      saveOrder({ ...order, status });
    }
  };

  // --- Pages Management ---
  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageFormData.slug || !pageFormData.title) return;
    saveFooterPage(pageFormData as FooterPage).then(() => {
      setEditingPageSlug(null);
      setPageFormData({ title: '', slug: '', content: '', category: 'Customer Services' });
    });
  };

  // --- Layout Operations ---
  const addSection = () => {
    if (!newSectionTitle) return;
    const newSection: SectionConfig = {
      id: `sec-${Date.now()}`,
      title: newSectionTitle,
      type: 'carousel',
      productIds: [],
      isVisible: true
    };
    saveLayoutConfig({ ...layoutConfig, sections: [...layoutConfig.sections, newSection] });
    setNewSectionTitle('');
  };

  const toggleProductInSection = (sectionId: string, productId: string) => {
    const newSections = layoutConfig.sections.map(s => {
      if (s.id === sectionId) {
        const exists = s.productIds.includes(productId);
        return { ...s, productIds: exists ? s.productIds.filter(id => id !== productId) : [...s.productIds, productId] };
      }
      return s;
    });
    saveLayoutConfig({ ...layoutConfig, sections: newSections });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const newSections = layoutConfig.sections.map(s => s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s);
    saveLayoutConfig({ ...layoutConfig, sections: newSections });
  };

  // --- Analytics & Waitlist Helpers ---
  const analyticsData = useMemo(() => {
    // Fix: Added explicit types to prevent arithmetic operation errors on unknown types
    const totalRevenue = (orders || []).reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
    const viewsByProduct = (viewLogs || []).reduce((acc: Record<string, number>, log: ViewLog) => {
      acc[log.productId] = (acc[log.productId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(viewsByProduct)
      .map(([id, views]) => ({ product: products.find(p => p.id === id), views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return { totalRevenue, topProducts };
  }, [orders, viewLogs, products]);

  const groupedRequests = useMemo(() => {
    // Fix: Explicitly typed the accumulator to ensure the result matches Record<string, RestockRequest[]>
    return (restockRequests || []).reduce((acc: Record<string, RestockRequest[]>, req: RestockRequest) => {
      if (!acc[req.productId]) {
        acc[req.productId] = [];
      }
      acc[req.productId].push(req);
      return acc;
    }, {} as Record<string, RestockRequest[]>);
  }, [restockRequests]);

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'requests', label: 'Waitlist', icon: BellRing },
    { id: 'pages', label: 'Boutique Pages', icon: FileText },
    { id: 'layout', label: 'Home Layout', icon: LayoutGrid }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="bg-[#141211] p-12 border border-stone-800 shadow-2xl rounded-sm flex flex-col items-center">
            <Logo size={120} className="mb-12" />
            <form onSubmit={handleLogin} className="w-full space-y-6">

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EXECUTIVE ID (EMAIL)"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-stone-900 border border-stone-800 focus:border-[#C5A059] focus:outline-none text-white text-[10px] font-bold tracking-[0.2em]"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="SECURE ACCESS KEY"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-stone-900 border border-stone-800 focus:border-[#C5A059] focus:outline-none text-white text-[10px] font-bold tracking-[0.2em]"
                />
              </div>

              {loginError && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">{loginError}</p>
              )}

              <button disabled={isLoggingIn} className="w-full bg-[#C5A059] text-white py-4 text-[10px] font-bold tracking-[0.4em] uppercase shadow-xl hover:bg-[#B38E46] transition-all">
                {isLoggingIn ? <Loader2 className="animate-spin" size={16} /> : "Authenticate"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col lg:flex-row font-sans">
      {/* Tab Navigation (Sticky Top Bar) */}
      <div className="lg:hidden fixed top-[70px] left-0 right-0 z-[9000] glass border-b border-stone-200 shadow-xl overflow-x-auto no-scrollbar py-3">
        <div className="flex px-4 space-x-3 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 flex items-center space-x-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-xl scale-105' : 'text-stone-400 bg-white border border-stone-100'}`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-stone-100 fixed h-full flex-col z-[100] pt-40">
        <div className="p-8">
          <nav className="space-y-4">
            {tabs.map((tab) => (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-4 w-full px-6 py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-lg scale-105' : 'text-stone-400 hover:text-stone-900'}`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-stone-50 space-y-4">
          <button onClick={() => {
            if (confirm("This will reset/populate the database with initial products. Continue?")) {
              seedInitialData(INITIAL_PRODUCTS, INITIAL_HOME_LAYOUT, INITIAL_FOOTER_PAGES).then(() => alert("Database Repaired!"));
            }
          }} className="text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:text-[#C5A059] flex items-center space-x-2">
            <Activity size={16} />
            <span>Repair Database</span>
          </button>
          <button onClick={handleLogout} className="text-[10px] font-bold tracking-widest uppercase text-red-500 flex items-center space-x-2">
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 p-8 lg:p-20 pt-48 lg:pt-44">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold serif text-stone-900 tracking-tight italic">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <div className="flex items-center mt-3 space-x-3">
              <span className="w-6 h-[2px] bg-[#C5A059]" />
              <p className="text-[10px] text-stone-400 uppercase tracking-[0.4em] font-bold">ZARHRAH EXECUTIVE PANEL</p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div key="products-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-12 gap-16">
              {/* Product Form Side */}
              <div className="lg:col-span-5 bg-white p-10 border border-stone-100 shadow-xl rounded-[3rem] h-fit lg:sticky lg:top-44 overflow-y-auto no-scrollbar max-h-[85vh]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Brand Identity</label>
                      <button type="button" onClick={() => setShowBrandManager(!showBrandManager)} className="text-[8px] font-bold text-[#C5A059] uppercase tracking-widest hover:underline">
                        {showBrandManager ? 'Hide Manager' : 'Manage Brands'}
                      </button>
                    </div>

                    {showBrandManager && (
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 mb-4 space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBrandName}
                            onChange={e => setNewBrandName(e.target.value)}
                            placeholder="NEW BRAND NAME"
                            className="flex-1 px-4 py-2 text-[10px] border border-stone-200 rounded-xl focus:outline-none"
                          />
                          <button type="button" onClick={handleAddBrand} className="bg-stone-900 text-white px-4 rounded-xl text-[10px] font-bold"><Plus size={14} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {brands.map(b => (
                            <span key={b.id} className="bg-white border border-stone-200 px-3 py-1 rounded-full text-[9px] font-bold flex items-center gap-2">
                              {b.name}
                              <button type="button" onClick={() => handleDeleteBrand(b.id)} className="text-red-400 hover:text-red-600"><X size={10} /></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none">
                      <option value="">SELECT BRAND</option>
                      {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                      <option value="CUSTOM">CUSTOM / OTHER</option>
                    </select>
                    {formData.brand === 'CUSTOM' && (
                      <input type="text" placeholder="ENTER BRAND NAME" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none mt-2" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setHasSizes(!hasSizes);
                            if (hasSizes) setSizeInput('');
                          }}
                          className={`w-10 h-6 rounded-full flex items-center transition-all px-1 ${hasSizes ? 'bg-stone-900 justify-end' : 'bg-stone-200 justify-start'}`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Enable Sizing</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, isVisible: !p.isVisible }))}
                          className={`w-10 h-6 rounded-full flex items-center transition-all px-1 ${formData.isVisible ? 'bg-stone-900 justify-end' : 'bg-stone-200 justify-start'}`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{formData.isVisible ? 'Visible' : 'Hidden'}</span>
                      </div>
                    </div>

                    {hasSizes && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Available Sizes (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="S, M, L, XL, XXL"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Product Designation</label>
                    <input type="text" placeholder="NAME OF ARTIFACT" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Price (NGN)</label>
                      <input type="text" placeholder="190000" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Studio Stock</label>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, stock: 0 }))}
                          className="text-[8px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                        >
                          Mark Out of Stock
                        </button>
                      </div>
                      <input type="number" placeholder="20" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-50">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center">
                        <ImageIcon size={14} className="mr-2 text-[#C5A059]" /> Asset Gallery
                      </label>
                      <button type="button" onClick={clearGallery} className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Clear All</button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 bg-stone-50/50 p-3 rounded-2xl border border-stone-100 min-h-[60px]">
                      {formData.images?.map((img, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl bg-white border border-stone-200 overflow-hidden shadow-sm">
                          <img src={img} className="w-full h-full object-contain" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input type="text" placeholder="IMAGE URL..." value={imageInput} onChange={(e) => setImageInput(e.target.value)} className="flex-1 px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-bold focus:outline-none" />
                        <button type="button" onClick={addImageFromUrl} className="bg-stone-900 text-white px-5 rounded-xl"><Plus size={18} /></button>
                      </div>
                      <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                      <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center space-x-3 py-3 border-2 border-dashed border-stone-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-[#C5A059] transition-all">
                        {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                        <span>{isUploading ? "Uploading Assets..." : "Upload Multi-Images"}</span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[#1c1917] text-white py-6 rounded-2xl text-[11px] font-bold tracking-[0.3em] uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                    {editingId ? "Update Portfolio" : "Deploy Artifact"}
                  </button>
                </form>
              </div>

              {/* Product List Side */}
              <div className="lg:col-span-7 space-y-6">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-6 border border-stone-100 rounded-[2rem] flex items-center justify-between group hover:shadow-lg transition-all">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-20 bg-stone-50 rounded-xl border border-stone-100 p-2 flex items-center justify-center"><img src={p.images[0]} className="max-h-full max-w-full object-contain" /></div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">{p.name}</h3>
                        <p className="text-[8px] font-black gold-text uppercase tracking-widest">{p.brand} • N{p.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => startEdit(p)} className="p-3 text-stone-300 hover:text-stone-900 transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteProduct(p.id) }} className="p-3 text-stone-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="bg-white border border-stone-100 rounded-[3rem] shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-10 border-b border-stone-50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 tracking-tight">Executive Order Log</h3>
                    {/* Records Count */}
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">{filteredOrders.length} Records Found</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 w-full md:w-auto">

                    {/* Week Navigation */}
                    <div className="flex items-center bg-stone-50 rounded-xl p-1 border border-stone-100">
                      <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-stone-500 hover:text-stone-900"><ChevronLeft size={14} /></button>
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-widest text-stone-900 w-32 text-center">
                        {weekOffset === 0 ? 'Current Week' : weekOffset === -1 ? 'Last Week' : weekOffset === 1 ? 'Next Week' : `${Math.abs(weekOffset)} Weeks ${weekOffset < 0 ? 'Ago' : 'Ahead'}`}
                      </div>
                      <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-stone-500 hover:text-stone-900"><ChevronRight size={14} /></button>
                    </div>

                    {/* Search Input */}
                    <div className="relative group flex-1 md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#C5A059] transition-colors" size={14} />
                      <input
                        type="text"
                        placeholder="Search ID, Name, Email..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all"
                      />
                    </div>

                    {/* Export Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportOrdersToCSV(filteredOrders)}
                        title="Export CSV"
                        className="p-3 bg-stone-50 text-stone-400 hover:bg-stone-900 hover:text-white rounded-xl transition-all border border-stone-100"
                      >
                        <FileSpreadsheet size={16} />
                      </button>
                      <button
                        onClick={() => exportOrdersToPDF(filteredOrders)}
                        title="Download Manifest (PDF)"
                        className="flex items-center space-x-2 px-4 py-3 bg-stone-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors shadow-lg"
                      >
                        <FileText size={14} />
                        <span>Pdf Manifest</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-[9px] font-black uppercase text-stone-400 tracking-[0.4em]">
                      <tr>
                        <th className="px-10 py-6">ID</th>
                        <th className="px-10 py-6">Recipient</th>
                        <th className="px-10 py-6">Artifacts</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Yield</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-stone-50/30 transition-all group">
                          <td className="px-10 py-8 text-[9px] font-black uppercase tracking-widest">{(order.id || '???').slice(-8)}</td>
                          <td className="px-10 py-8">
                            <p className="text-sm font-bold text-stone-900">{order.customerName || 'Guest'}</p>
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">{order.customerPhone || 'N/A'}</p>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex -space-x-3 overflow-hidden">
                              {(order.items || []).slice(0, 3).map((it, i) => (
                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-white border border-stone-100">
                                  {it && it.images && it.images[0] ? (
                                    <img src={it.images[0]} className="h-full w-full object-contain" />
                                  ) : (
                                    <div className="w-full h-full bg-stone-200" />
                                  )}
                                </div>
                              ))}
                              {(order.items || []).length > 3 && (
                                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-stone-100 text-[8px] font-bold text-stone-400">+{order.items.length - 3}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center space-x-2">
                              <select
                                value={order.status || 'Pending'}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest focus:outline-none cursor-pointer ${order.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                                  order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                  }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right text-sm font-black text-stone-900">₦{(order.total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={5} className="px-10 py-20 text-center text-stone-300 italic serif text-xl">Order log empty.</td></tr>
                      )}
                      {orders.length > 0 && filteredOrders.length === 0 && (
                        <tr><td colSpan={5} className="px-10 py-20 text-center text-stone-300 italic serif text-xl">No matching orders found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalyticsDashboard orders={orders} viewLogs={viewLogs} products={products} />
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div key="requests-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="bg-white border border-stone-100 rounded-[3rem] shadow-sm overflow-hidden">
                <div className="p-10 border-b border-stone-50 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-stone-900 tracking-tight">Requests & Reviews</h3>
                  <div className="flex space-x-4">
                    <button onClick={() => exportWaitlistToPDF(restockRequests, products)} className="text-[9px] font-bold text-stone-900 uppercase tracking-widest hover:text-[#C5A059] transition-colors flex items-center space-x-2">
                      <FileText size={14} />
                      <span>Download Report</span>
                    </button>
                    <div className="w-px h-4 bg-stone-200"></div>
                    <button onClick={() => { if (confirm('Clear all requests?')) restockRequests.forEach(r => deleteRestockRequest(r.id)) }} className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600">Flush Requests</button>
                  </div>
                </div>
                <div className="p-10 space-y-12">
                  {(Object.entries(
                    restockRequests.reduce((acc, req) => {
                      (acc[req.productId] = acc[req.productId] || []).push(req);
                      return acc;
                    }, {} as Record<string, RestockRequest[]>)
                  ) as [string, RestockRequest[]][]).map(([pid, reqs]) => {
                    const p = products.find(prod => prod.id === pid);
                    return (
                      <div key={pid} className="flex gap-8 group">
                        <div className="w-24 h-32 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                          {p?.images[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h4 className="font-bold text-stone-900">{p?.name || 'Unknown Product'}</h4>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest">{reqs.length} Waiting</p>
                          </div>
                          <div className="grid gap-3">
                            {reqs.map(req => (
                              <div key={req.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${req.status === 'Notified' ? 'bg-green-50/50 border-green-100' : 'bg-white border-stone-100'}`}>
                                <div className="flex items-center space-x-4">
                                  <div className={`w-2 h-2 rounded-full ${req.status === 'Notified' ? 'bg-green-500' : 'bg-amber-400'}`} />
                                  <div>
                                    <div className="text-sm font-bold text-stone-900">{req.customerName}</div>
                                    <div className="text-[10px] text-stone-400 font-mono">{req.customerEmail}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <select
                                    value={req.status || 'Pending'}
                                    onChange={(e) => updateRestockRequestStatus(req.id, e.target.value as any)}
                                    className="text-[9px] font-bold uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer hover:text-[#C5A059]"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Notified">Notified</option>
                                  </select>

                                  <div className="flex items-center space-x-2">
                                    <a
                                      href={`mailto:${req.customerEmail}?subject=Back in Stock: ${p?.name}&body=Good news! The ${p?.name} is back in stock at Zarhrah Luxury.`}
                                      target="_blank" rel="noreferrer"
                                      className="p-2 bg-stone-100 rounded-lg text-stone-400 hover:bg-stone-900 hover:text-white transition-all"
                                      title="Send Email"
                                    >
                                      <Mail size={12} />
                                    </a>

                                    {req.customerWhatsapp && (
                                      <a
                                        href={`https://wa.me/${req.customerWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Good news! The ${p?.name} is back in stock at Zarhrah Luxury.`)}`}
                                        target="_blank" rel="noreferrer"
                                        className="p-2 bg-green-50 rounded-lg text-green-600 hover:bg-green-500 hover:text-white transition-all"
                                        title="Open WhatsApp"
                                      >
                                        <MessageCircle size={12} />
                                      </a>
                                    )}

                                    <button
                                      onClick={() => { if (confirm('Delete request?')) deleteRestockRequest(req.id) }}
                                      className="p-2 bg-stone-50 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                      title="Delete Request"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {restockRequests.length === 0 && (
                    <div className="py-20 text-center text-stone-300 italic serif text-xl">The boutique waitlist is currently clear.</div>
                  )}
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div className="bg-white border border-stone-100 rounded-[3rem] shadow-sm overflow-hidden">
                <div className="p-10 border-b border-stone-50">
                  <h3 className="text-xl font-bold text-stone-900 tracking-tight">Customer Reviews</h3>
                </div>
                <div className="p-10">
                  <div className="grid gap-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-stone-50 p-6 rounded-2xl flex justify-between items-start group">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={12} className={s <= review.rating ? "text-[#C5A059] fill-[#C5A059]" : "text-stone-200"} />
                              ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">{review.customerName}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-medium text-stone-600 serif italic">"{review.comment}"</p>
                        </div>
                        <button
                          onClick={() => { if (confirm('Delete this review?')) deleteReview(review.id) }}
                          className="p-2 bg-white rounded-xl text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="text-center text-stone-300 italic serif text-lg py-10">No reviews collected yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'layout' && (
            <motion.div key="layout-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="bg-white border border-stone-100 p-10 rounded-[2.5rem] shadow-sm">
                <h3 className="text-xl font-bold text-stone-900 mb-6 serif italic">Architecture Lab</h3>
                <div className="flex gap-4">
                  <input type="text" placeholder="NEW SECTION TITLE" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} className="flex-1 px-8 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                  <button onClick={addSection} className="bg-stone-900 text-white px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Deploy Section</button>
                </div>
              </div>

              <div className="space-y-8">
                {layoutConfig.sections.map(section => (
                  <div key={section.id} className="bg-white border border-stone-100 rounded-[3rem] shadow-sm overflow-hidden">
                    <div className="p-8 bg-stone-50 flex items-center justify-between border-b border-stone-100">
                      <div className="flex items-center space-x-6">
                        <button onClick={() => toggleSectionVisibility(section.id)} className={`p-3 rounded-full transition-all ${section.isVisible ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}>
                          {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <div>
                          <h4 className="text-xl font-bold text-stone-900 tracking-tight">{section.title}</h4>
                          <p className="text-[9px] font-black gold-text uppercase tracking-widest mt-1">{section.productIds.length} Linked Artifacts</p>
                        </div>
                      </div>
                      <button onClick={() => saveLayoutConfig({ ...layoutConfig, sections: layoutConfig.sections.filter(s => s.id !== section.id) })} className="p-4 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {products.map(p => {
                          const isActive = section.productIds.includes(p.id);
                          return (
                            <button key={p.id} onClick={() => toggleProductInSection(section.id, p.id)} className={`relative group aspect-square rounded-2xl border-2 transition-all p-2 ${isActive ? 'border-stone-900 bg-stone-50 shadow-md scale-105' : 'border-stone-100 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                              <img src={p.images[0]} className="w-full h-full object-contain" />
                              {isActive && <div className="absolute top-2 right-2 bg-stone-900 text-white p-1 rounded-full"><CheckCircle2 size={10} /></div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'pages' && (
            <motion.div key="pages-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="grid lg:grid-cols-12 gap-12">
                {/* Page Creation Form */}
                <div className="lg:col-span-5">
                  <div className="bg-white border border-stone-100 p-10 rounded-[2.5rem] shadow-sm lg:sticky lg:top-44">
                    <h3 className="text-xl font-bold text-stone-900 mb-8 serif italic">{editingPageSlug ? 'Modify Content' : 'Create Boutique Page'}</h3>
                    <form onSubmit={handlePageSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Category</label>
                        <select value={pageFormData.category} onChange={(e) => setPageFormData({ ...pageFormData, category: e.target.value as any })} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none"><option value="Customer Services">Customer Services</option><option value="Company">Company</option><option value="Policies">Policies</option></select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Title</label>
                        <input type="text" value={pageFormData.title} onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })} placeholder="e.g. SHIPPING POLICY" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Slug</label>
                        <input type="text" value={pageFormData.slug} onChange={(e) => setPageFormData({ ...pageFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="shipping-policy" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Content</label>
                        <textarea rows={8} value={pageFormData.content} onChange={(e) => setPageFormData({ ...pageFormData, content: e.target.value })} placeholder="Detailed text content..." className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[11px] font-medium leading-relaxed focus:outline-none resize-none" />
                      </div>
                      <button type="submit" className="w-full bg-stone-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-stone-800 transition-all">Save Page</button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {footerPages.map((page) => (
                    <div key={page.slug} className="bg-white p-6 border border-stone-100 rounded-[1.5rem] flex items-center justify-between group hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-300 group-hover:bg-[#C5A059] group-hover:text-white transition-all"><FileText size={18} /></div>
                        <div><h4 className="text-sm font-bold text-stone-900 tracking-tight">{page.title}</h4><p className="text-[9px] font-black gold-text uppercase tracking-widest mt-1">/{page.slug}</p></div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingPageSlug(page.slug); setPageFormData(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="p-3 text-stone-300 hover:text-stone-900 transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => { if (confirm('Delete?')) deleteFooterPage(page.slug) }} className="p-3 text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Fallback Message */}
          {!tabs.some(t => t.id === activeTab) && (
            <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-stone-300 italic serif text-xl">
              This module is active and receiving live data updates.
            </motion.div>
          )}
        </AnimatePresence>
      </main >
    </div >
  );
};

export default Admin;
