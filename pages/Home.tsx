
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
import CuratedPicks from '../components/HomeSections/CuratedPicks';

// Lazy Load Lower Sections
const BoutiqueBanner = React.lazy(() => import('../components/HomeSections/BoutiqueBanner'));
const ManorCollection = React.lazy(() => import('../components/HomeSections/ManorCollection'));
const StylingIdeas = React.lazy(() => import('../components/HomeSections/StylingIdeas'));
const BundlesDeals = React.lazy(() => import('../components/HomeSections/BundlesDeals'));
const LifestyleShowcase = React.lazy(() => import('../components/HomeSections/LifestyleShowcase'));

const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center bg-stone-50">
    <div className="w-8 h-8 border-2 border-stone-300 border-t-[#C5A059] rounded-full animate-spin" />
  </div>
);

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
      {(layoutConfig.showHero ?? true) && (
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
      )}





      {/* Dynamic Sections Architect */}
      <div id="collection-start" className="space-y-12 md:space-y-24 py-12 md:py-24">
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
            <React.Fragment key={section.id}>
              <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="px-4 sm:px-6 lg:px-12 max-w-[1800px] mx-auto">
                  {/* Enhanced Section Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-12 gap-4 md:gap-8 relative z-10">
                    <div className="max-w-xl text-left">
                      <div className="hidden md:flex items-center gap-3 mb-3">
                        <span className="h-px w-8 bg-stone-400"></span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Collection 0{idx + 1}</span>
                      </div>
                      <h2 className="text-lg md:text-2xl font-serif text-stone-900 leading-tight">
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
                          aria-label="Scroll left"
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => scrollSection(section.id, 'right')}
                          aria-label="Scroll right"
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
              {section.title.toUpperCase() === 'NEW ARRIVALS' && (
                <CuratedPicks
                  products={products}
                  onAddToCart={onAddToCart}
                  onLogView={onLogView}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={isWishlisted}
                />
              )}
            </React.Fragment>
          );
        })}



        {/* Signature Features Section */}
        {(layoutConfig.showFeatures ?? true) && (
          <section className="py-24 bg-stone-50 border-y border-stone-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-stone-200">
                <div className="px-4 py-8 md:py-0">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-[#C5A059]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.4a1.6 1.6 0 0 0-2.22 0l-1.62 1.62a8 8 0 1 1-4.08 4.08l1.62-1.62a1.6 1.6 0 0 0 0-2.22l-1.28-1.28a1.6 1.6 0 0 0-2.22 0l-1.28 1.28a1.6 1.6 0 0 0 0 2.22l.72.72a7.89 7.89 0 0 0 0 11.2 7.18 7.18 0 0 0 10.15 0 7.89 7.89 0 0 0 0-11.2l-.72-.72a1.6 1.6 0 0 0-2.22 0L20.38 3.4z" /></svg>
                  </div>
                  <h3 className="text-xl font-serif mb-3">Bespoke Tailoring</h3>
                  <p className="text-sm text-stone-500 leading-relaxed font-light">
                    Every garment is adjusted to your precise measurements by our master tailors in London before dispatch.
                  </p>
                </div>

                <div className="px-4 py-8 md:py-0">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-[#C5A059]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                  </div>
                  <h3 className="text-xl font-serif mb-3">Global Concierge</h3>
                  <p className="text-sm text-stone-500 leading-relaxed font-light">
                    Personalized styling advice and priority sourcing for our exclusive clientele across 3 continents.
                  </p>
                </div>

                <div className="px-4 py-8 md:py-0">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-[#C5A059]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <h3 className="text-xl font-serif mb-3">Authentic Luxury</h3>
                  <p className="text-sm text-stone-500 leading-relaxed font-light">
                    Each piece comes with a certificate of authenticity and a provenance blockchain entry.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Boutique Banner as Archive Replacement */}
        {(layoutConfig.showBoutique ?? true) && (
          <React.Suspense fallback={<SectionLoader />}>
            <BoutiqueBanner image={layoutConfig.boutiqueBannerImage} />
          </React.Suspense>
        )}

        {/* Manor Collection Section */}
        {(layoutConfig.showManor ?? true) && (
          <React.Suspense fallback={<SectionLoader />}>
            <ManorCollection
              products={products}
              onAddToCart={onAddToCart}
              onLogView={onLogView}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={isWishlisted}
              selectedProductIds={layoutConfig.manorProductIds}
            />
          </React.Suspense>
        )}

        {/* Styling Ideas Section */}
        {(layoutConfig.showStyling ?? true) && (
          <React.Suspense fallback={<SectionLoader />}>
            <StylingIdeas
              products={products}
              onAddToCart={onAddToCart}
              onLogView={onLogView}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={isWishlisted}
              selectedProductIds={layoutConfig.stylingProductIds}
            />
          </React.Suspense>
        )}

        {/* Bundles Deals Section */}
        {(layoutConfig.showBundles ?? true) && (
          <React.Suspense fallback={<SectionLoader />}>
            <BundlesDeals
              products={products}
              onAddToCart={onAddToCart}
              onLogView={onLogView}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={isWishlisted}
              selectedProductIds={layoutConfig.bundlesProductIds}
            />
          </React.Suspense>
        )}

        {/* Lifestyle Showcase Section */}
        {(layoutConfig.showLifestyle ?? true) && (
          <React.Suspense fallback={<SectionLoader />}>
            <LifestyleShowcase />
          </React.Suspense>
        )}

      </div>

      <footer className="bg-black pt-32 pb-16 text-white px-6 md:px-12 border-t border-stone-800/50">
        <div className="max-w-[1600px] mx-auto">
          {/* Logo Section */}
          <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
              <Logo size={80} className="text-white brightness-200" />
            </div>
            <div className="flex flex-col items-end">
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
