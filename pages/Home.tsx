
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowRight, ChevronLeft, ChevronRight,
  LayoutGrid, FilterX, Instagram, Ghost,
  Scissors, Globe, Award
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Product, HomeLayoutConfig, FooterPage } from '../types';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';
import WhatsAppBot from '../components/WhatsAppBot';
import { subscribeToNewsletter } from '../services/dbUtils';
import { motion, useScroll, useTransform } from 'framer-motion';
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

  // Parallax Logic
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

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
      const matchesBrand = !brandFilter || (p.brand && p.brand.toLowerCase() === brandFilter.toLowerCase());
      const matchesTag = !tagFilter || (p.tags && p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase()));
      const matchesCategory = !categoryFilter || (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());
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
    <div className="pt-0 bg-[#FCFCFC] selection:bg-[#C5A059] selection:text-white overflow-hidden">
      {/* Hero Section */}
      {(layoutConfig.showHero ?? true) && (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
          <motion.div className="absolute inset-0 z-0" style={{ y: y1 }}>
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              className="w-full h-full opacity-80"
            >
              <img
                src={layoutConfig.heroImage || "https://images.unsplash.com/photo-1549037173-e3b717902c57?auto=format&fit=crop&w=1920&q=80"}
                alt="ZARA UK Luxury"
                className="w-full h-full object-cover grayscale-[20%]"
                loading="eager"
              />
            </motion.div>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ y: y2 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center px-6 max-w-7xl flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex flex-col items-center mb-10"
            >
              <span className="text-[#C5A059] font-medium text-[9px] md:text-[10px] uppercase tracking-macro drop-shadow-sm">
                London • Lagos • Global
              </span>
            </motion.div>

            <span className="text-3xl md:text-5xl lg:text-7xl text-white font-serif font-medium tracking-wide leading-tight drop-shadow-lg mb-2">
              Elite Status
            </span>
            <span className="text-2xl md:text-3xl lg:text-5xl text-white/90 font-serif italic font-light leading-none drop-shadow-lg">
              Curated Daily
            </span>

            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              href="#collection-start"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('collection-start')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative inline-flex flex-col items-center justify-center gap-6 text-white hover:text-[#C5A059] transition-colors duration-700 mt-20"
            >
              <span className="text-[10px] font-medium uppercase tracking-macro">Enter Boutique</span>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] transition-all duration-700 group-hover:scale-110">
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </div>
            </motion.a>
          </motion.div>
        </section>
      )}





      {/* Dynamic Sections or Filtered Catalog */}
      <div id="catalog" className="min-h-screen">
        {(brandFilter || tagFilter || categoryFilter) ? (
          <div className="py-24 px-6 md:px-12 max-w-[1920px] mx-auto">
            <div className="mb-16 md:mb-24 text-center">
              <span className="text-[#C5A059] text-[10px] uppercase tracking-macro mb-6 block font-medium">
                {brandFilter ? 'Brand Collection' : tagFilter ? 'Curated Selection' : 'Category'}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-8 capitalize font-light tracking-wide">
                {brandFilter || tagFilter || categoryFilter}
              </h2>
              <p className="text-stone-500 text-xs md:text-sm max-w-xl mx-auto font-light leading-relaxed tracking-wide">
                Browsing our exclusive collection of {(brandFilter || tagFilter || categoryFilter)?.toLowerCase()}.
                Each piece represents the pinnacle of luxury and craftsmanship.
              </p>
              <button
                onClick={() => {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-12 inline-flex items-center gap-2 text-[10px] uppercase tracking-macro text-stone-900 border-b border-stone-200 pb-1 hover:text-[#C5A059] hover:border-[#C5A059] transition-all"
              >
                <FilterX size={12} strokeWidth={1.5} /> Clear Filters
              </button>
            </div>

            {filteredCatalog.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
                {filteredCatalog.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onLogView={onLogView}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={isWishlisted(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border border-dashed border-stone-200 rounded-xl bg-stone-50">
                <Ghost size={48} className="mx-auto text-stone-300 mb-6" />
                <h3 className="text-xl font-serif text-stone-900 mb-2">No Artifacts Found</h3>
                <p className="text-stone-500 text-xs uppercase tracking-widest">
                  Try adjusting your filters or explore our <Link to="/" className="text-[#C5A059] underline">latest arrivals</Link>.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div id="collection-start" className="space-y-12 md:space-y-32 py-12 md:py-24">
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
                    <div className="px-4 sm:px-6 lg:px-12 max-w-[1920px] mx-auto">
                      {/* Enhanced Section Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-4 md:gap-8 relative z-10">
                        <div className="max-w-xl text-left">
                          <div className="hidden md:flex items-center gap-3 mb-6">
                            <span className="h-px w-8 bg-stone-300"></span>
                            <span className="text-[9px] font-medium uppercase tracking-macro text-[#C5A059]">Collection 0{idx + 1}</span>
                          </div>
                          <h2 className="text-2xl md:text-4xl font-serif text-stone-900 leading-tight font-light tracking-wide">
                            <span className="block mb-2">{section.title}</span>
                          </h2>
                          <p className="hidden md:block text-stone-500 text-xs font-light max-w-sm leading-relaxed tracking-wide">
                            Discover our exclusively curated selection, designed for the modern connoisseur of luxury.
                          </p>
                        </div>


                        <div className="flex items-center gap-6">
                          {isAdmin && (
                            <button onClick={() => navigate('/admin')} className="hidden md:flex items-center space-x-2 text-[9px] font-medium uppercase tracking-macro text-stone-400 border border-stone-200 px-4 py-2 hover:border-stone-900 hover:text-stone-900 transition-all">
                              <LayoutGrid size={12} />
                              <span>Edit</span>
                            </button>
                          )}
                          <div className="flex space-x-4">
                            <button
                              onClick={() => scrollSection(section.id, 'left')}
                              aria-label="Scroll left"
                              className="text-stone-400 hover:text-stone-900 transition-colors duration-300"
                            >
                              <ChevronLeft size={24} strokeWidth={1} />
                            </button>
                            <button
                              onClick={() => scrollSection(section.id, 'right')}
                              aria-label="Scroll right"
                              className="text-stone-400 hover:text-stone-900 transition-colors duration-300"
                            >
                              <ChevronRight size={24} strokeWidth={1} />
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
                      layoutConfig={layoutConfig}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Signature Features Section */}
      {(layoutConfig.showFeatures ?? true) && !brandFilter && !tagFilter && !categoryFilter && (
        <section className="py-32 bg-white border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 text-center">
              {([
                { icon: 'scissors', title: 'Bespoke Tailoring', description: 'Every garment is adjusted to your measurements by our master tailors.' },
                { icon: 'globe', title: 'Global Concierge', description: 'Personalized styling advice for our exclusive clientele globally.' },
                { icon: 'award', title: 'Authentic Luxury', description: 'Each piece comes with a verified certificate of authenticity.' }
              ]).map((feature, idx) => (
                <div key={idx} className="px-4 flex flex-col items-center group">
                  <div className="mb-8 text-stone-300 group-hover:text-[#C5A059] transition-colors duration-500">
                    {feature.icon === 'scissors' && <Scissors size={32} strokeWidth={1} />}
                    {feature.icon === 'globe' && <Globe size={32} strokeWidth={1} />}
                    {feature.icon === 'award' && <Award size={32} strokeWidth={1} />}
                    {!['scissors', 'globe', 'award'].includes(feature.icon) && <Award size={32} strokeWidth={1} />}
                  </div>
                  <h3 className="text-lg font-serif mb-4 tracking-wide text-stone-900">{feature.title}</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed font-light tracking-wide max-w-[200px]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Boutique Banner as Archive Replacement */}
      {(layoutConfig.showBoutique ?? true) && !brandFilter && !tagFilter && !categoryFilter && (
        <React.Suspense fallback={<SectionLoader />}>
          <BoutiqueBanner
            image={layoutConfig.boutiqueBannerImage}
            title={layoutConfig.boutiqueBannerTitle}
          />
        </React.Suspense>
      )}

      {/* Manor Collection Section */}
      {(layoutConfig.showManor ?? true) && !brandFilter && !tagFilter && !categoryFilter && (
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
      {(layoutConfig.showStyling ?? true) && !brandFilter && !tagFilter && !categoryFilter && (
        <React.Suspense fallback={<SectionLoader />}>
          <StylingIdeas
            products={products}
            onAddToCart={onAddToCart}
            onLogView={onLogView}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={isWishlisted}
            selectedProductIds={layoutConfig.stylingProductIds}
            looks={layoutConfig.stylingLooks}
          />
        </React.Suspense>
      )}

      {/* Bundles Deals Section */}
      {(layoutConfig.showBundles ?? true) && !brandFilter && !tagFilter && !categoryFilter && (
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
      {(layoutConfig.showLifestyle ?? true) && !brandFilter && !tagFilter && !categoryFilter && (
        <React.Suspense fallback={<SectionLoader />}>
          <LifestyleShowcase images={layoutConfig.lifestyleImages} />
        </React.Suspense>
      )}

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
                <h4 className="text-[9px] font-medium uppercase tracking-macro text-stone-500">{cat}</h4>
                <ul className="space-y-4 text-stone-300 text-[10px] font-medium tracking-wide uppercase">
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
              <h4 className="text-[9px] font-medium uppercase tracking-macro text-stone-500">Categories</h4>
              <ul className="space-y-4 text-stone-300 text-[10px] font-medium tracking-wide uppercase">
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
              <p className="text-[8px] text-stone-500 font-medium uppercase tracking-macro">© 2024 Zarhrah Luxury • All Rights Reserved</p>
              <span className="hidden md:block text-[8px] text-stone-800">•</span>
              <a href="https://gentree-studio.web.app/" target="_blank" rel="noopener noreferrer" className="text-[8px] text-stone-500 font-medium uppercase tracking-macro hover:text-white transition-colors">
                Built by Gentree Studio
              </a>
            </div>
            <div className="flex space-x-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 items-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Paystack_Logo.png" className="h-6 object-contain" alt="Paystack" />
            </div>
          </div>
        </div >
      </footer >
    </div >
  );
};

export default Home;
