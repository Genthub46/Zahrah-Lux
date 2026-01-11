
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowRight, ChevronLeft, ChevronRight, MessageCircle,
  ChevronDown, Quote, Star, ShieldCheck, X, Settings2,
  Plus, Edit3, Save, Trash2, LayoutGrid, Search,
  Facebook, Instagram, Twitter, Music, FilterX
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Product, Review, HomeLayoutConfig, SectionConfig, FooterPage } from '../types';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';
import { REVIEWS_STORAGE_KEY } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  layoutConfig: HomeLayoutConfig;
  footerPages: FooterPage[];
  onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onLogView: (id: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

const Home: React.FC<HomeProps> = ({ products, setProducts, layoutConfig, footerPages = [], onAddToCart, onLogView, onToggleWishlist, wishlist }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const brandFilter = searchParams.get('brand');
  const tagFilter = searchParams.get('tag');

  useEffect(() => {
    const savedSession = localStorage.getItem('ZARHRAH_ADMIN_SESSION');
    if (savedSession) {
      const { expiry } = JSON.parse(savedSession);
      if (Date.now() < expiry) setIsAdmin(true);
    }
  }, []);

  // Scroll to catalog when filters change
  useEffect(() => {
    if (brandFilter || tagFilter) {
      const el = document.getElementById('catalog');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [brandFilter, tagFilter]);

  const filteredCatalog = useMemo(() => {
    return products.filter(p => {
      // Show if visible OR if user is admin (optional, but usually admins want to see everything? 
      // User request implied 'displayed on the homepage or not', implies for customers. 
      // Let's stick to strict filter for now, or maybe only filter for customers? 
      // The prompt says "ENABLE THE FUNCTION TO BE SHOWN WHETHER THE PRODUCT IS TO BE DISPLAYED ON TE HOMEPAGE OR NOT"
      // So if I set it to false, it shouldn't show.
      if (p.isVisible === false) return false;

      const matchesBrand = !brandFilter || p.brand.toLowerCase() === brandFilter.toLowerCase();
      const matchesTag = !tagFilter || p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase());
      return matchesBrand && matchesTag;
    });
  }, [products, brandFilter, tagFilter]);

  const scrollSection = (id: string, direction: 'left' | 'right') => {
    const el = document.getElementById(`scroll-${id}`);
    if (el) {
      const { scrollLeft, clientWidth } = el;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      el.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const isWishlisted = (id: string) => wishlist.some(p => p.id === id);

  // Group footer pages by category (excluding 'Categories' as we handle it separately now)
  const groupedFooterPages = useMemo(() => {
    return footerPages.reduce((acc, page) => {
      if (page.category === 'Categories') return acc; // Skip categories for text links
      if (!acc[page.category]) acc[page.category] = [];
      acc[page.category].push(page);
      return acc;
    }, {} as Record<string, FooterPage[]>);
  }, [footerPages]);

  return (
    <div className="pt-0 bg-[#F9F9F9]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1549037173-e3b717902c57?auto=format&fit=crop&w=1920&q=80"
            alt="ZARA UK Luxury"
            className="w-full h-full object-cover animate-kenburns scale-110"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center px-4 max-w-6xl flex flex-col items-center"
        >
          <motion.span
            // Fix: Changed 'tracking' to 'letterSpacing' as 'tracking' is not a valid CSS property for Framer Motion.
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.6em' }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-white font-bold text-[11px] uppercase block mb-8 tracking-[0.6em]"
          >
            LONDON • LAGOS • GLOBAL EXCELLENCE
          </motion.span>

          <h1 className="flex flex-col mb-16 select-none">
            <span className="text-6xl md:text-[140px] text-white font-bold tracking-tight leading-none serif">
              Elite Style
            </span>
            <span className="text-5xl md:text-[110px] text-white font-light serif italic leading-none -mt-4 opacity-90">
              Curated Daily
            </span>
          </h1>

          <a
            href="#boutique"
            className="inline-flex items-center justify-between min-w-[320px] md:min-w-[440px] bg-white text-stone-900 px-10 md:px-14 py-6 md:py-8 text-[11px] font-black tracking-[0.4em] transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-[0.98] group"
          >
            <span className="uppercase">DISCOVER BOUTIQUE</span>
            <ArrowRight className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-3" strokeWidth={1.5} />
          </a>
        </motion.div>
      </section>

      {/* Dynamic Sections Architect */}
      <div id="boutique" className="space-y-32 py-32">
        {layoutConfig.sections.filter(s => s.isVisible).map((section) => {
          const sectionProducts = products.filter(p => section.productIds.includes(p.id));

          return (
            <section key={section.id} className="px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto overflow-hidden">
              <div className="flex justify-between items-end mb-12">
                <div className="relative group">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900 mb-2 serif italic">
                    {section.title}
                  </h2>
                  <div className="w-full h-[3px] bg-stone-900" />
                </div>

                <div className="flex items-center space-x-4">
                  {isAdmin && (
                    <button onClick={() => navigate('/admin')} className="hidden md:flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 border-r border-stone-200 pr-6 mr-2">
                      <LayoutGrid size={14} />
                      <span>Manage Architecture</span>
                    </button>
                  )}
                  <div className="flex space-x-2">
                    <button onClick={() => scrollSection(section.id, 'left')} className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white transition-all shadow-sm"><ChevronLeft size={18} /></button>
                    <button onClick={() => scrollSection(section.id, 'right')} className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white transition-all shadow-sm"><ChevronRight size={18} /></button>
                  </div>
                </div>
              </div>

              <div id={`scroll-${section.id}`} className="flex space-x-8 overflow-x-auto no-scrollbar scroll-smooth pb-8">
                {sectionProducts.length === 0 ? (
                  <div className="w-full py-12 text-center text-stone-300 italic serif">Collection empty • Replenishing soon</div>
                ) : (
                  sectionProducts.map((product) => (
                    <div key={product.id} className="w-[300px] md:w-[380px] flex-shrink-0">
                      <ProductCard product={product} onAddToCart={onAddToCart} onLogView={onLogView} onToggleWishlist={onToggleWishlist} isWishlisted={isWishlisted(product.id)} />
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}

        {/* Catalog Section */}
        {layoutConfig.showCatalog && (
          <section id="catalog" className="py-32 bg-white px-4 sm:px-6 lg:px-12 border-t border-stone-100">
            <div className="text-center mb-16 space-y-4">
              <span className="text-stone-400 font-bold text-[9px] uppercase tracking-[0.6em] block mb-4">Complete Selection</span>
              <h2 className="text-6xl font-bold tracking-tighter uppercase serif italic">
                {tagFilter ? `${tagFilter} Collection` : brandFilter ? `${brandFilter} Archive` : 'Boutique Archive'}
              </h2>

              {(tagFilter || brandFilter) && (
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center space-x-2 text-[10px] font-black gold-text uppercase tracking-widest border border-[#C5A059] px-6 py-2 rounded-full hover:bg-[#C5A059] hover:text-white transition-all"
                >
                  <FilterX size={12} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
              {filteredCatalog.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onLogView={onLogView} onToggleWishlist={onToggleWishlist} isWishlisted={isWishlisted(product.id)} />
              ))}
              {filteredCatalog.length === 0 && (
                <div className="col-span-full py-32 text-center">
                  <Logo size={60} className="mx-auto opacity-10 mb-8" />
                  <p className="text-xl serif italic text-stone-300">No artifacts found matching this selection.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <footer className="bg-[#000000] pt-32 pb-20 text-white px-8 md:px-16 border-t border-stone-900">
        <div className="max-w-[1600px] mx-auto">
          {/* Logo Section */}
          <div className="mb-24 flex flex-col items-center md:items-start">
            <Logo size={120} className="opacity-80 grayscale brightness-125 hover:grayscale-0 transition-all duration-700 cursor-pointer" />
            <div className="mt-4 flex items-center space-x-4">
              <span className="w-8 h-px bg-stone-800" />
              <p className="text-[10px] font-black tracking-[0.6em] text-stone-500 uppercase">Executive Concierge</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-20 gap-x-12 text-left">
            {/* Standard Pages Columns */}
            {(['Customer Services', 'Company', 'Policies'] as const).map((cat) => (
              <div key={cat} className="space-y-8">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">{cat}</h4>
                <ul className="space-y-5 text-stone-400 text-[11px] font-bold tracking-widest uppercase">
                  {(groupedFooterPages[cat] || []).map((page) => (
                    <li key={page.slug}>
                      <Link to={`/p/${page.slug}`} className="hover:text-white transition-colors">{page.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Specialized Categories Column (Store Filtering) */}
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Categories</h4>
              <ul className="space-y-5 text-stone-400 text-[11px] font-bold tracking-widest uppercase">
                <li><Link to="/?tag=new" className="hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link to="/?tag=men" className="hover:text-white transition-colors">Men</Link></li>
                <li><Link to="/?tag=women" className="hover:text-white transition-colors">Women</Link></li>
                <li><Link to="/?tag=t-shirts" className="hover:text-white transition-colors">T-shirts</Link></li>
                <li><Link to="/?tag=pants" className="hover:text-white transition-colors">Pants</Link></li>
              </ul>
            </div>

            {/* Column 5: Join Our List */}
            <div className="col-span-2 lg:col-span-1 space-y-10">
              <div className="space-y-6">
                <h4 className="text-xl font-bold tracking-tight text-white serif italic">Join Our List</h4>
                <p className="text-stone-500 text-[11px] font-bold tracking-wider leading-relaxed">
                  Receive updates on our latest products, releases and exclusive partnerships.
                </p>
              </div>

              <div className="flex space-x-8">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="radio" name="gender-footer" className="w-3.5 h-3.5 accent-white bg-transparent border-2 border-stone-800 rounded-full" />
                  <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest group-hover:text-white transition-colors">Men</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="radio" name="gender-footer" className="w-3.5 h-3.5 accent-white bg-transparent border-2 border-stone-800 rounded-full" />
                  <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest group-hover:text-white transition-colors">Women</span>
                </label>
              </div>

              <div className="relative group max-w-sm">
                <input
                  type="email"
                  placeholder="ENTER EMAIL"
                  className="w-full bg-transparent border border-stone-800 px-8 py-5 text-[11px] font-black tracking-[0.3em] uppercase focus:outline-none focus:border-stone-500 transition-all rounded-sm placeholder:text-stone-700"
                />
                <button className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-600 hover:text-white transition-all transform hover:scale-125">
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-6 border-t border-stone-900">
                <Facebook size={18} className="text-stone-500 hover:text-white cursor-pointer transition-all hover:-translate-y-1" />
                <Instagram size={18} className="text-stone-500 hover:text-white cursor-pointer transition-all hover:-translate-y-1" />
                <Twitter size={18} className="text-stone-500 hover:text-white cursor-pointer transition-all hover:-translate-y-1" />
                <Music size={18} className="text-stone-500 hover:text-white cursor-pointer transition-all hover:-translate-y-1" />
              </div>
            </div>
          </div>

          <div className="mt-32 pt-12 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[9px] text-stone-700 font-black uppercase tracking-[0.6em]">© 2024 Zarhrah Luxury • London • Lagos</p>
            <div className="flex space-x-12 opacity-30 grayscale brightness-150">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
