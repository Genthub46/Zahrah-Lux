
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, RestockRequest } from '../types';
import {
  ArrowLeft, Share2, Check, ShoppingBag, Ban,
  Mail, Bell, Truck, Globe, Award, Sparkles, Send,
  Plus, Minus, Heart, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight, Maximize2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import RestockModal from '../components/RestockModal';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

// Accordion Component for Product Information
interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, isOpen, onToggle }) => (
  <div className="border-b border-stone-100">
    <button
      onClick={onToggle}
      className="w-full py-6 flex justify-between items-center group"
    >
      <span className="text-xl font-bold tracking-tight text-stone-900 serif">{title}</span>
      {isOpen ? <ChevronUp className="text-stone-400 group-hover:text-stone-900 transition-colors" /> : <ChevronDown className="text-stone-400 group-hover:text-stone-900 transition-colors" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden pb-8"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface ProductDetailProps {
  products: Product[];
  user?: any; // Using any for brevity, or imported User type
  onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onLogView: (id: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  products,
  user,
  onAddToCart,
  onLogView,
  onToggleWishlist,
  wishlist
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeSection, setActiveSection] = useState<string | null>('description');
  const [copied, setCopied] = useState(false);
  const [restockEmail, setRestockEmail] = useState('');
  const [isRestockSubmitted, setIsRestockSubmitted] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Lightbox & Gesture State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const dragX = useMotionValue(0);

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  const isSoldOut = product ? product.stock <= 0 : false;
  const isWishlisted = product ? wishlist.some(p => p.id === product.id) : false;

  const needsColor = product?.colors && product.colors.length > 0;
  const needsSize = product?.sizes && product.sizes.length > 0;
  const isSelectionComplete = (!needsColor || selectedColor) && (!needsSize || selectedSize);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveImgIdx(0); // Reset index on product change
  }, [id]);

  useEffect(() => {
    if (product) {
      onLogView(product.id);
    }
  }, [id, product, onLogView]);

  const handleNextImage = useCallback(() => {
    if (product) {
      setActiveImgIdx((prev) => (prev + 1) % product.images.length);
    }
  }, [product]);

  const handlePrevImage = useCallback(() => {
    if (product) {
      setActiveImgIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  }, [product]);

  const onDragEnd = () => {
    const x = dragX.get();
    if (x <= -50) {
      handleNextImage();
    } else if (x >= 50) {
      handlePrevImage();
    }
    dragX.set(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (isLightboxOpen && e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNextImage, handlePrevImage]);

  if (!product) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedProducts = useMemo(() => {
    return products
      .filter(p => p.id !== product.id && p.category === product.category)
      .sort((a, b) => {
        // Prioritize in-stock items
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        // Then by creation (id descending assumption or random)
        return b.id.localeCompare(a.id);
      })
      .slice(0, 4);
  }, [products, product]);

  return (
    <div className="pt-4 pb-32 md:pt-24 md:pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back */}
        <div className="hidden md:block mb-12">
          <Link to="/" className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-[0.4em] text-stone-400 hover:text-stone-900 transition-colors">
            <ArrowLeft size={12} />
            <span>Return to Boutique</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16">
          {/* Gallery Sidebar - Desktop only */}
          <div className="lg:col-span-1 hidden lg:flex flex-col space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar py-2 pr-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIdx(idx)}
                className={`w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all p-1 bg-stone-50 flex-shrink-0 ${activeImgIdx === idx ? 'border-[#C5A059] shadow-md scale-105' : 'border-transparent opacity-40 hover:opacity-80'}`}
              >
                <img src={getOptimizedImageUrl(img)} width="150" height="200" className="w-full h-full object-contain" alt={`Thumbnail ${idx}`} />
              </button>
            ))}
          </div>

          {/* Main Visual Display Area */}
          <div className="lg:col-span-6 space-y-4 md:space-y-8">
            <div className="relative group">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                style={{ x: dragX }}
                onDragEnd={onDragEnd}
                onClick={() => setIsLightboxOpen(true)}
                className="aspect-[4/5] bg-stone-50 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden flex items-center justify-center p-0 md:p-8 cursor-zoom-in relative select-none touch-pan-y"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImgIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    src={getOptimizedImageUrl(product.images[activeImgIdx])}
                    alt={product.name}
                    width="600"
                    height="750"
                    className={`max-h-full max-w-full object-contain pointer-events-none ${isSoldOut ? 'grayscale' : ''}`}
                  />
                </AnimatePresence>

                {/* Visual Feedback Overlays */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                  <Maximize2 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-xl" />
                </div>

                {/* Progress Indicator (Badge) */}
                <div className="absolute bottom-8 right-10 px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/40 text-xs font-black tracking-widest text-stone-900 shadow-sm">
                  {String(activeImgIdx + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
                </div>

                {/* Navigation Arrows (Desktop Only) */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur-lg rounded-full shadow-2xl text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hidden lg:block"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur-lg rounded-full shadow-2xl text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hidden lg:block"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </motion.div>

              {isSoldOut && (
                <div className="absolute top-10 left-10">
                  <span className="bg-stone-900 text-white px-6 py-2.5 text-[10px] font-black tracking-widest uppercase rounded-full shadow-2xl border border-white/20">Sold Out</span>
                </div>
              )}
            </div>

            {/* Pagination / Filmstrip Dots */}
            {product.images.length > 1 && (
              <div className="flex justify-center items-center space-x-3 md:hidden">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${activeImgIdx === idx ? 'w-10 bg-[#C5A059]' : 'w-2 bg-stone-200 hover:bg-stone-300'}`}
                  />
                ))}
              </div>
            )}

            <p className="text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest md:hidden">Swipe to browse artifacts</p>
          </div>

          {/* Product Commercial Area */}
          <div className="lg:col-span-5 space-y-4 md:space-y-5">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-black gold-text uppercase tracking-[0.5em]">{product.brand}</span>
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
                <span className="text-xs text-stone-400 font-bold uppercase tracking-[0.3em]">{product.category}</span>
              </div>
              <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1] serif italic">
                {product.name}
              </h1>
              <div className="flex flex-col md:flex-row md:items-baseline md:space-x-3 space-y-1 md:space-y-0">
                <p className="text-3xl font-black text-stone-900">
                  ₦{product.price.toLocaleString()}
                </p>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Global Sourcing • London VAT Incl.</span>
              </div>
            </div>

            {/* Selections */}
            {(needsColor || needsSize) && (
              <div className="space-y-5 py-5 md:py-6 md:space-y-6 border-y border-stone-50">
                {needsColor && (
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-400">Artifact Colour Palette</span>
                      {selectedColor && <span className="text-[10px] font-black gold-text uppercase tracking-widest">{selectedColor}</span>}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {product.colors?.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => {
                            setSelectedColor(c.name);
                            if (c.image) {
                              const imgIdx = product.images.indexOf(c.image);
                              if (imgIdx !== -1) setActiveImgIdx(imgIdx);
                            }
                          }}
                          className={`w-12 h-12 rounded-full border-2 p-1 transition-all flex items-center justify-center ${selectedColor === c.name ? 'border-stone-900 scale-110 shadow-lg' : 'border-transparent hover:border-stone-100'}`}
                        >
                          <div className="w-full h-full rounded-full border border-stone-100" style={{ backgroundColor: c.hex }} title={c.name} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {needsSize && (
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-400">Dimensions / Sizing</span>
                      <button className="text-[10px] font-black text-[#C5A059] border-b border-[#C5A059] uppercase tracking-widest">Sizing Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes?.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-[4rem] px-4 py-4 text-[10px] font-black uppercase tracking-widest border-2 transition-all rounded-2xl flex-grow-0 text-center ${selectedSize === s ? 'border-stone-900 bg-stone-900 text-white shadow-xl' : 'border-stone-100 text-stone-400 hover:border-stone-300'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interaction Suite */}
            <div className="space-y-6 pt-4">
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-stone-100 z-50 md:static md:p-0 md:bg-transparent md:border-none flex items-center space-x-4 md:space-x-6 safe-bottom">
                {!isSoldOut && (
                  <div className="flex items-center justify-between bg-stone-50 border border-stone-100 p-2 md:p-4 rounded-xl md:rounded-2xl w-32 md:w-40">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-stone-400 hover:text-stone-900 p-2"><Minus size={14} /></button>
                    <span className="text-sm font-black text-stone-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className={`p-2 transition-colors ${quantity >= product.stock ? 'text-stone-200 cursor-not-allowed' : 'text-stone-400 hover:text-stone-900'}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                <div className="flex-1 relative group">
                  <button
                    onClick={() => {
                      if (isSoldOut) {
                        setIsRestockModalOpen(true);
                      } else if (!isSelectionComplete) {
                        setShowNotification(true);
                      } else {
                        onAddToCart(product, quantity, selectedColor, selectedSize);
                      }
                    }}

                    className={`w-full py-4 md:py-6 text-xs md:text-sm font-black tracking-[0.2em] md:tracking-[0.4em] uppercase rounded-xl md:rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-3 md:space-x-4 ${isSoldOut
                      ? 'bg-stone-900 text-white hover:scale-[1.02] shadow-2xl ring-2 md:ring-4 ring-stone-50'
                      : 'bg-stone-900 text-white hover:scale-[1.02] active:scale-95'
                      }`}
                  >
                    {isSoldOut ? <Bell size={16} /> : <ShoppingBag size={16} />}
                    <span>{isSoldOut ? 'Notify Me' : 'Add to Cart'}</span>
                  </button>

                  {/* Hover Notice for incomplete selection */}
                  {!isSoldOut && !isSelectionComplete && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-max px-4 py-2 bg-stone-900/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-20 hidden md:block">
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900/90 rotate-45" />
                      Please select {needsColor && !selectedColor && needsSize && !selectedSize ? 'Size & Color' : needsSize && !selectedSize ? 'Size' : 'Color'}
                    </div>
                  )}
                </div>
              </div>


              {quantity >= product.stock && !isSoldOut && (
                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest text-center animate-pulse">Maximum studio stock reached</p>
              )}
              {!isSoldOut && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <p className={`text-[9px] font-bold uppercase tracking-widest text-center ${product.stock < 5 ? 'text-red-500' : 'text-stone-400'}`}>
                    {product.stock < 5 ? `Hurry! Only ${product.stock} Item${product.stock === 1 ? '' : 's'} Left` : `${product.stock} Units Available`}
                  </p>
                  {product.stock < 5 && (
                    <div className="w-full max-w-[200px] h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: `${(product.stock / 10) * 100}%` }} />
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`flex-1 py-5 border-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500 shadow-lg' : 'border-stone-100 text-stone-900 hover:bg-stone-50'}`}
                >
                  <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="px-8 py-5 border-2 border-stone-100 rounded-2xl text-stone-900 hover:bg-stone-50 transition-all"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
                </button>
              </div>
            </div>

            {/* Accordion Suite */}
            <div className="pt-10 space-y-0">
              <Accordion
                title="Sourcing & Authenticity"
                isOpen={activeSection === 'description'}
                onToggle={() => setActiveSection(activeSection === 'description' ? null : 'description')}
              >
                <div className="space-y-6">
                  {product.brand && (
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-50">
                      <span className="text-xs font-black text-[#C5A059] uppercase tracking-widest">Brand Authority</span>
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-widest">{product.brand}</span>
                    </div>
                  )}
                  <p className="text-stone-500 leading-relaxed font-light text-[15px]">{product.description}</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest flex items-center"><Sparkles size={12} className="mr-2 gold-text" /> Highlights</h4>
                      <ul className="space-y-3">
                        {product.features?.map((f, i) => (
                          <li key={i} className="text-stone-400 text-xs flex items-start">
                            <span className="mr-3 gold-text">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-widest flex items-center"><Truck size={12} className="mr-2 gold-text" /> Logistics</h4>
                      <p className="text-stone-400 text-xs leading-relaxed">Global express delivery from our Lagos hub. Standard delivery 2-5 business days.</p>
                    </div>
                  </div>
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Similar Curations */}
        <section className="mt-20 pt-12 border-t border-stone-50">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-xs font-black gold-text uppercase tracking-[0.6em] block mb-3">Discovery Suite</span>
              <h2 className="text-4xl font-bold tracking-tight text-stone-900 serif italic">Curated Similarities</h2>
            </div>
            <Link to="/" className="text-xs font-black uppercase tracking-widest border-b-2 border-stone-900 pb-2">View Archive</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.some(wi => wi.id === p.id)} />
            ))}
          </div>
        </section>
      </div>

      {/* Luxury Immersive Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-white/90 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header UI */}
              <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black gold-text uppercase tracking-[0.5em]">{product.brand}</span>
                  <h2 className="text-xl font-bold serif italic text-stone-900">{product.name}</h2>
                </div>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-4 bg-stone-900 text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Interaction UI */}
              <div className="absolute top-1/2 left-8 -translate-y-1/2 hidden md:block">
                <button onClick={handlePrevImage} className="p-6 text-stone-300 hover:text-stone-900 transition-colors"><ChevronLeft size={48} strokeWidth={1} /></button>
              </div>
              <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden md:block">
                <button onClick={handleNextImage} className="p-6 text-stone-300 hover:text-stone-900 transition-colors"><ChevronRight size={48} strokeWidth={1} /></button>
              </div>

              {/* Main Image View */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={onDragEnd}
                className="w-full h-full flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImgIdx}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    src={getOptimizedImageUrl(product.images[activeImgIdx])}
                    alt={product.name}
                    className="max-w-full max-h-[70vh] object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.1)] pointer-events-none"
                  />
                </AnimatePresence>
              </motion.div>

              {/* Bottom Filmstrip UI */}
              <div className="absolute bottom-12 flex flex-col items-center space-y-8">
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.6em]">
                  {String(activeImgIdx + 1).padStart(2, '0')} — {String(product.images.length).padStart(2, '0')}
                </div>
                <div className="flex space-x-3">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIdx(idx)}
                      className={`w-3 h-3 rounded-full border-2 transition-all ${activeImgIdx === idx ? 'border-[#C5A059] bg-[#C5A059] scale-125' : 'border-stone-200 hover:border-stone-400'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        productName={product?.name || ''}
        productId={product?.id || ''}
        user={user}
      />
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-2xl whitespace-nowrap"
          >
            Please select {needsColor && !selectedColor && needsSize && !selectedSize ? 'Size & Color' : needsSize && !selectedSize ? 'Size' : 'Color'}
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default ProductDetail;
