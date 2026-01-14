
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowRight, ChevronLeft, ChevronRight,
  LayoutGrid, FilterX, Instagram, Ghost
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Product, HomeLayoutConfig, FooterPage } from '../types';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';
import WhatsAppBot from '../components/WhatsAppBot';
import { subscribeToNewsletter } from '../services/dbUtils';
import { motion } from 'framer-motion';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      await subscribeToNewsletter(email);
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      {status === 'success' ? (
        <span className="text-[#C5A059] text-xs uppercase tracking-widest font-bold py-2">
          Welcome to the Inner Circle.
        </span>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={status === 'error' ? "Please try again" : "ENTER YOUR EMAIL"}
            className="bg-transparent border-b border-stone-700 pb-2 text-xs uppercase tracking-widest min-w-[250px] focus:outline-none focus:border-[#C5A059] text-white placeholder-stone-600 transition-colors"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="text-xs font-black uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Joining...' : 'Subscribe'}
          </button>
        </>
      )}
    </form>
  );
};

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
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const savedSession = localStorage.getItem('ZARHRAH_ADMIN_SESSION');
    if (savedSession) {
      const { expiry } = JSON.parse(savedSession);
      if (Date.now() < expiry) setIsAdmin(true);
    }
  }, []);

  // Scroll to catalog when filters change
  useEffect(() => {
    if (brandFilter || tagFilter || categoryFilter) {
      const el = document.getElementById('catalog');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [brandFilter, tagFilter, categoryFilter]);

  const filteredCatalog = useMemo(() => {
    return products.filter(p => {
      if (p.isVisible === false) return false;
      const matchesBrand = !brandFilter || p.brand.toLowerCase() === brandFilter.toLowerCase();
      const matchesTag = !tagFilter || p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase());
      const matchesCategory = !categoryFilter || p.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesBrand && matchesTag && matchesCategory;
    });
  }, [products, brandFilter, tagFilter, categoryFilter]);

  const scrollSection = (id: string, direction: 'left' | 'right') => {
    const el = document.getElementById(`scroll-${id}`);
    if (el) {
      const { scrollLeft, clientWidth } = el;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      el.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const isWishlisted = (id: string) => wishlist.some(p => p.id === id);

  const groupedFooterPages = useMemo(() => {
    return footerPages.reduce((acc, page) => {
      if (page.category === 'Categories') return acc;
      if (!acc[page.category]) acc[page.category] = [];
      acc[page.category].push(page);
      return acc;
    }, {} as Record<string, FooterPage[]>);
  }, [footerPages]);

  return (
    <div className="pt-0 bg-[#FCFCFC] selection:bg-[#C5A059] selection:text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1549037173-e3b717902c57?auto=format&fit=crop&w=1920&q=80"
              alt="ZARA UK Luxury"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center px-6 max-w-7xl flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col items-center mb-6"
          >
            <span className="w-px h-16 bg-gradient-to-b from-transparent to-[#C5A059] mb-6"></span>
            <span className="text-[#C5A059] font-bold text-xs md:text-sm uppercase tracking-[0.4em]">
              London • Lagos • Global
            </span>
          </motion.div>

          <span className="text-5xl md:text-[80px] lg:text-[140px] text-white font-serif font-medium tracking-tight leading-[0.9] mix-blend-overlay opacity-90">
            Elite Status
          </span>
          <span className="text-4xl md:text-[60px] lg:text-[100px] text-white font-serif italic font-light leading-none -mt-2 md:-mt-4 opacity-90">
            Curated Daily
          </span>

          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            href="#boutique"
            className="group relative inline-flex flex-col items-center justify-center gap-4 text-white hover:text-[#C5A059] transition-colors duration-500"
          >
            <span className="text-xs font-black uppercase tracking-[0.3em]">Enter Boutique</span>
            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059]/10 transition-all duration-500">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>
        </motion.div>
      </section>

      {/* Dynamic Sections Architect */}
      <div id="boutique" className="space-y-12 md:space-y-24 py-12 md:py-24">
        {layoutConfig.sections.filter(s => s.isVisible).map((section, idx) => {
          let sectionProducts: Product[] = [];

          if (section.title.toUpperCase() === 'NEW ARRIVALS') {
            sectionProducts = products
              .filter(p => p.isVisible !== false)
              .sort((a, b) => b.id.localeCompare(a.id))
              .slice(0, 12);
          } else {
            sectionProducts = products.filter(p => section.productIds.includes(p.id));
          }

          return (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              key={section.id}
              className="relative"
            >
              <div className="px-4 sm:px-6 lg:px-12 max-w-[1800px] mx-auto">
                {/* Enhanced Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-12 gap-4 md:gap-8 relative z-10">
                  <div className="max-w-xl text-right md:text-left">
                    <div className="hidden md:flex items-center gap-3 mb-3">
                      <span className="h-px w-8 bg-stone-400"></span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Collection 0{idx + 1}</span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-serif text-stone-900 leading-tight">
                      <span className="block font-medium tracking-tight mb-1">{section.title}</span>
                      <span className="hidden md:block italic font-light text-stone-400 text-base">Explore the latest arrivals</span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-6">
                    {isAdmin && (
                      <button onClick={() => navigate('/admin')} className="hidden md:flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-[#C5A059] border border-[#C5A059] px-4 py-2 rounded-full hover:bg-[#C5A059] hover:text-white transition-all">
                        <LayoutGrid size={12} />
                        <span>Edit Section</span>
                      </button>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => scrollSection(section.id, 'left')}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => scrollSection(section.id, 'right')}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  id={`scroll-${section.id}`}
                  className="flex space-x-3 md:space-x-10 overflow-x-auto no-scrollbar scroll-smooth pb-8 md:pb-12 px-1 snap-x snap-mandatory"
                >
                  {sectionProducts.length === 0 ? (
                    <div className="w-full py-20 text-center opacity-40">
                      <div className="text-4xl font-serif italic text-stone-300 mb-4">Coming Soon</div>
                      <p className="text-xs uppercase tracking-widest text-stone-400">This collection is currently being curated</p>
                    </div>
                  ) : (
                    sectionProducts.map((product) => (
                      <div key={product.id} className="w-[160px] md:w-[400px] flex-shrink-0 snap-start">
                        <ProductCard
                          product={product}
                          onAddToCart={onAddToCart}
                          onLogView={onLogView}
                          onToggleWishlist={onToggleWishlist}
                          isWishlisted={isWishlisted(product.id)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.section>
          );
        })}

        {/* Catalog Section */}
        {layoutConfig.showCatalog && (
          <section id="catalog" className="py-20 md:py-32 bg-stone-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C5A059] rounded-full blur-[200px] opacity-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <div className="px-4 sm:px-6 lg:px-12 max-w-[1800px] mx-auto relative z-10">
              <div className="flex flex-col items-center text-center mb-12 space-y-4 md:space-y-6">
                <span className="text-[#C5A059] font-bold text-[10px] uppercase tracking-[0.6em] border border-[#C5A059] px-4 py-2 rounded-full hover:bg-[#C5A059] hover:text-stone-900 transition-colors cursor-default">
                  The Archive
                </span>
                <h2 className="text-4xl md:text-8xl font-serif font-medium tracking-tight">
                  {tagFilter ? `${tagFilter} Collection` : brandFilter ? `${brandFilter}` : 'Full Inventory'}
                </h2>
                <p className="text-stone-400 max-w-xl font-serif italic text-sm md:text-xl px-4">
                  Explore the complete collection of curated luxury artifacts available for immediate acquisition.
                </p>

                {(tagFilter || brandFilter) && (
                  <button
                    onClick={() => navigate('/')}
                    className="mt-6 md:mt-8 inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-white hover:text-[#C5A059] transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#C5A059] group-hover:text-stone-900 transition-colors">
                      <FilterX size={12} />
                    </div>
                    <span>Clear Active Filters</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-8 md:gap-y-16">
                {filteredCatalog.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onLogView={onLogView} onToggleWishlist={onToggleWishlist} isWishlisted={isWishlisted(product.id)} dark />
                ))}
                {filteredCatalog.length === 0 && (
                  <div className="col-span-full py-40 text-center opacity-40">
                    <Logo size={80} className="mx-auto mb-8 invert" />
                    <p className="text-2xl font-serif italic">No artifacts match your specific criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="bg-black pt-32 pb-16 text-white px-6 md:px-12 border-t border-stone-800/50">
        <div className="max-w-[1600px] mx-auto">
          {/* Logo Section */}
          <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
              <Logo size={100} className="text-white brightness-200" />
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-stone-500 font-bold max-w-sm leading-relaxed">
                Start where you are. Use what you have.<br />Do what you can.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <h4 className="text-2xl font-serif italic text-white mb-2">Join the inner circle</h4>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-16 gap-x-12 text-left mb-32">
            {/* Standard Pages Columns */}
            {(['Customer Services', 'Company', 'Policies'] as const).map((cat) => (
              <div key={cat} className="space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#C5A059] opacity-80">{cat}</h4>
                <ul className="space-y-4 text-stone-400 text-xs font-medium tracking-widest uppercase">
                  {(groupedFooterPages[cat] || []).map((page) => (
                    <li key={page.slug}>
                      <Link to={`/p/${page.slug}`} className="hover:text-white hover:pl-2 transition-all duration-300 block">{page.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Specialized Categories Column */}
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#C5A059] opacity-80">Categories</h4>
              <ul className="space-y-4 text-stone-400 text-xs font-medium tracking-widest uppercase">
                <li><Link to="/?tag=new" className="hover:text-white hover:pl-2 transition-all duration-300 block">New Arrivals</Link></li>
                <li><Link to="/?tag=men" className="hover:text-white hover:pl-2 transition-all duration-300 block">Men</Link></li>
                <li><Link to="/?tag=women" className="hover:text-white hover:pl-2 transition-all duration-300 block">Women</Link></li>
                <li><Link to="/?tag=t-shirts" className="hover:text-white hover:pl-2 transition-all duration-300 block">T-shirts</Link></li>
                <li><Link to="/?tag=pants" className="hover:text-white hover:pl-2 transition-all duration-300 block">Pants</Link></li>
              </ul>
            </div>

            {/* Social & Chat */}
            <div className="md:col-span-4 lg:col-span-1 flex flex-col justify-between h-full items-start lg:items-end">
              <div className="flex gap-6 mb-8 lg:mb-0">
                <a href="#" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-stone-400 hover:bg-[#C5A059] hover:text-stone-900 transition-all">
                  <Instagram size={16} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-stone-400 hover:bg-[#C5A059] hover:text-stone-900 transition-all">
                  <Ghost size={16} />
                </a>
              </div>
              <WhatsAppBot isStatic className="!mb-0" />
            </div>
          </div>

          <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <p className="text-[9px] text-stone-600 font-bold uppercase tracking-[0.2em]">© 2024 Zarhrah Luxury • All Rights Reserved</p>
              <span className="hidden md:block text-[9px] text-stone-800">•</span>
              <a href="https://gentree-studio.web.app/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-stone-600 font-bold uppercase tracking-[0.2em] hover:text-[#C5A059] transition-colors">
                Built by Gentree Studio
              </a>
            </div>
            <div className="flex space-x-6 opacity-20 grayscale hover:grayscale-0 transition-all duration-500">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="Paypal" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-8" alt="Mastercard" />
            </div>
          </div>
        </div >
      </footer >
    </div >
  );
};

export default Home;

