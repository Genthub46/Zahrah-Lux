
import React, { useState, useMemo } from 'react';
import { Trash2, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Star, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem, Order, Review } from '../types';
import { REVIEWS_STORAGE_KEY } from '../constants';
import { saveReview } from '../services/dbUtils';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

import { usePaystackPayment } from 'react-paystack';
import { User } from 'firebase/auth';

interface CheckoutProps {
  cart: CartItem[];
  onRemoveFromCart: (index: number) => void;
  onUpdateCartItem: (index: number, quantity: number, color?: string, size?: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
  user: User | null;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, onRemoveFromCart, onUpdateCartItem, onClearCart, onOrderPlaced, user }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [touched, setTouched] = useState({ email: false, phone: false });

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantSelections, setVariantSelections] = useState<Record<number, { color?: string; size?: string }>>({});

  const getItemsNeedingVariants = () => {
    return cart.map((item, index) => {
      const needsColor = item.colors && item.colors.length > 0 && !item.selectedColor;
      const needsSize = item.sizes && item.sizes.length > 0 && !item.selectedSize;
      if (needsColor || needsSize) {
        return { index, item, needsColor, needsSize };
      }
      return null;
    }).filter(Boolean) as { index: number; item: CartItem; needsColor: boolean | undefined; needsSize: boolean | undefined }[];
  };

  const handleVariantSelect = (index: number, type: 'color' | 'size', value: string) => {
    setVariantSelections(prev => ({
      ...prev,
      [index]: { ...prev[index], [type]: value }
    }));
  };

  const confirmVariants = () => {
    const missing = getItemsNeedingVariants();
    let allValid = true;

    missing.forEach((v) => {
      const sel = variantSelections[v.index];
      if (v.needsColor && !sel?.color) allValid = false;
      if (v.needsSize && !sel?.size) allValid = false;
    });

    if (!allValid) {
      alert("Please select all required sizes and colors before checking out.");
      return;
    }

    missing.forEach(v => {
      const sel = variantSelections[v.index];
      onUpdateCartItem(v.index, v.item.quantity, sel?.color || v.item.selectedColor, sel?.size || v.item.selectedSize);
    });

    setShowVariantModal(false);
  };

  // Update state if user prop changes (e.g. strict refresh)
  React.useEffect(() => {
    if (user) {
      if (!email) setEmail(user.email || '');
      if (!name) setName(user.displayName || '');
    }
  }, [user]);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const navigate = useNavigate();

  // Scroll to top when payment is successful
  React.useEffect(() => {
    if (paymentSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [paymentSuccess]);

  // Calculate Total First
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const isPhoneValid = useMemo(() => /^[0-9+]{10,15}$/.test(phone.replace(/\s/g, '')), [phone]);
  const isFormValid = name.trim() !== '' && address.trim() !== '' && isEmailValid && isPhoneValid;

  // Paystack Configuration
  const paystackConfig = {
    // @ts-ignore
    reference: (new Date()).getTime().toString(),
    email: email,
    amount: total * 100, // Amount is in kobo
    publicKey: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_PLACEHOLDER_KEY',
  };

  const onSuccess = (reference: any) => {
    // Implementation for whatever you want to do with reference and after success call.
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerName: name,
      customerEmail: email.toLowerCase(),
      customerPhone: phone,
      customerAddress: address,
      items: [...cart],
      total: total,
      date: new Date().toISOString(),
      status: 'Pending',
      paymentMethod: 'Paystack',
      paymentStatus: 'Paid',
      paymentReference: reference.reference,
      userId: user?.uid
    };
    onOrderPlaced(newOrder);
    setPaymentSuccess(true);
    onClearCart();
    setIsProcessing(false);
  };

  const onClose = () => {
    setIsProcessing(false);
  }

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackPayment = () => {
    if (!isFormValid) {
      setTouched({ email: true, phone: true });
      return;
    }

    if (cart.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }

    const missingVariants = getItemsNeedingVariants();
    if (missingVariants.length > 0) {
      setShowVariantModal(true);
      return;
    }

    setIsProcessing(true);
    initializePayment({ onSuccess, onClose });
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    try {
      const newReview: Review = {
        // Removing ID to let Firestore generate it if desired, or keep as is.
        // saveReview handles ID generation if missing.
        id: `rev-${Date.now()}`,
        rating,
        comment,
        customerName: name || 'Anonymous',
        date: new Date().toISOString()
      };
      await saveReview(newReview);
      setReviewSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  if (paymentSuccess) {
    return (
      <div className="pt-32 pb-24 px-4 max-w-2xl mx-auto text-center animate-in fade-in zoom-in duration-500">
        <AnimatePresence mode="wait">
          {!reviewSubmitted ? (
            <motion.div
              key="review-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Order Confirmed</h2>
              <p className="text-stone-500 mb-12 font-light italic serif text-lg">Your curated pieces are reserved. We'd value your feedback on the shopping experience.</p>

              <form onSubmit={submitReview} className="bg-white p-12 border border-stone-100 shadow-2xl space-y-8">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.4em] uppercase text-stone-400 mb-6">Rate Your Experience</label>
                  <div className="flex justify-center space-x-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          size={32}
                          fill={star <= (hoverRating || rating) ? "#C5A059" : "none"}
                          className={star <= (hoverRating || rating) ? "text-[#C5A059]" : "text-stone-200"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.4em] uppercase text-stone-400 mb-4">Notes (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full p-6 bg-stone-50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-sm resize-none h-32"
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    disabled={rating === 0}
                    className="w-full bg-stone-900 text-white py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-stone-800 transition-all disabled:opacity-20 uppercase flex items-center justify-center space-x-3"
                  >
                    <Send size={14} />
                    <span>Submit Review</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-[9px] font-bold tracking-[0.4em] text-stone-300 hover:text-stone-900 transition-colors uppercase"
                  >
                    Skip & Return to Boutique
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="review-thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20"
            >
              <Logo size={100} className="mx-auto mb-10 opacity-20" />
              <h3 className="text-2xl font-bold mb-4 serif italic tracking-tight uppercase tracking-widest">Thank you, {name}.</h3>
              <p className="text-stone-400 text-[10px] tracking-[0.4em] uppercase">Your feedback has been curated.</p>



              <p className="text-[9px] text-stone-300 mt-12 animate-pulse tracking-widest uppercase">Redirecting to boutique...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!user && (
          <div className="mt-12 bg-stone-50 p-8 rounded-sm border border-stone-100 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-2">Track Your Order</h4>
            <p className="text-xs text-stone-500 mb-6 font-serif italic">Create an account or log in to track this order.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                state={{ email }}
                className="px-8 py-3 bg-stone-900 text-white text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#C5A059] transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                state={{ email }}
                className="px-8 py-3 bg-white border border-stone-200 text-stone-900 text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-stone-50 transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {isProcessing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
          <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-stone-900">Connecting to Secure Gateway</p>
          <p className="text-[9px] text-stone-400 uppercase tracking-widest">Verifying transaction details...</p>
        </div>
      )}

      <Link to="/" className="inline-flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Return to Boutique</span>
      </Link>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <h2 className="text-3xl font-bold mb-10 tracking-tight uppercase tracking-[0.1em]">Your Selection</h2>

          {cart.length === 0 ? (
            <div className="bg-stone-100 p-16 text-center rounded-sm border border-stone-200">
              <p className="text-stone-500 italic mb-8 font-serif">Your shopping bag is empty.</p>
              <Link to="/" className="text-[10px] font-bold gold-text border-b border-[#C5A059] pb-2 tracking-[0.3em]">SHOP LATEST COLLECTIONS</Link>
            </div>
          ) : (
            <div className="space-y-8">
              {cart.map((item, index) => {
                const needsColor = item.colors && item.colors.length > 0 && !item.selectedColor;
                const needsSize = item.sizes && item.sizes.length > 0 && !item.selectedSize;

                return (
                  <div key={`${item.id}-${index}`} className="flex space-x-6 py-8 border-b border-stone-100 animate-in fade-in duration-500">
                    <div className="w-28 h-36 flex-shrink-0">
                      <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover rounded-sm shadow-sm grayscale hover:grayscale-0 transition-all" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-stone-900">{item.name}</h3>
                          <p className="text-stone-500 text-[10px] mt-1 uppercase tracking-widest">{item.category} • AUTHENTIC ZARA UK</p>

                          {(item.selectedColor || item.selectedSize) && (
                            <div className="mt-2 text-[10px] text-stone-600 uppercase tracking-widest">
                              {item.selectedSize && <span className="mr-3">Size: <span className="font-bold text-stone-900">{item.selectedSize}</span></span>}
                              {item.selectedColor && <span>Color: <span className="font-bold text-stone-900">{item.selectedColor}</span></span>}
                            </div>
                          )}
                          {(needsColor || needsSize) && (
                            <div className="mt-3">
                              <div className="text-[10px] text-amber-600 uppercase tracking-widest font-bold flex items-center gap-1 mb-2">
                                <AlertCircle className="w-3 h-3" />
                                <span>Requires variant selection</span>
                              </div>
                              <button
                                onClick={() => setShowVariantModal(true)}
                                className="text-[9px] font-bold tracking-[0.2em] uppercase bg-stone-100 hover:bg-stone-200 text-stone-900 py-1.5 px-3 rounded-sm transition-colors"
                              >
                                Choose Variant
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="font-bold">N{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-stone-400 tracking-widest uppercase">
                          Units: <span className="text-stone-900 font-bold ml-2">{item.quantity}</span>
                        </div>
                        <button
                          onClick={() => onRemoveFromCart(index)}
                          className="text-stone-300 hover:text-red-500 transition-colors p-2"
                          title="Remove Item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-stone-50 p-10 rounded-sm sticky top-32 border border-stone-100 shadow-sm">
            <h3 className="text-xl font-bold mb-10 tracking-tight uppercase tracking-[0.1em]">Checkout Details</h3>

            <div className="space-y-4 mb-10">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full px-5 py-4 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all text-xs"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={email}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className={`w-full px-5 py-4 bg-white border ${touched.email && !isEmailValid ? 'border-red-400 focus:ring-red-400' : 'border-stone-200 focus:ring-[#C5A059]'} focus:outline-none transition-all text-xs`}
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={phone}
                  onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className={`w-full px-5 py-4 bg-white border ${touched.phone && !isPhoneValid ? 'border-red-400 focus:ring-red-400' : 'border-stone-200 focus:ring-[#C5A059]'} focus:outline-none transition-all text-xs`}
                />
              </div>

              <div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Detailed Delivery Address"
                  rows={3}
                  className="w-full px-5 py-4 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all text-xs resize-none"
                />
              </div>
            </div>

            <div className="space-y-6 mb-10 pt-6 border-t border-stone-200">
              <div className="flex justify-between text-stone-600 text-xs uppercase tracking-widest font-bold">
                <span>Subtotal</span>
                <span>N{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600 text-xs uppercase tracking-widest font-bold">
                <span>Logistic Fees</span>
                <span className="text-green-600 font-bold uppercase">Included</span>
              </div>
              <div className="pt-4 flex justify-between items-baseline">
                <span className="text-lg font-bold uppercase tracking-widest">Grand Total</span>
                <div className="text-right">
                  <span className="text-3xl font-bold block">N{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePaystackPayment}
              disabled={isProcessing || cart.length === 0 || (!isFormValid && touched.email)}
              className="w-full bg-stone-900 text-white py-6 text-[10px] font-bold tracking-[0.4em] hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-3 mb-6 shadow-xl uppercase"
            >
              <span>{isProcessing ? 'Authenticating...' : 'Secure Checkout'}</span>
            </button>

            <div className="flex items-center justify-center space-x-3 text-stone-300 text-[9px] uppercase tracking-widest font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Encrypted Transaction • ZL LUXURY</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showVariantModal && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg p-8 rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
                <AlertCircle className="w-6 h-6 text-[#C5A059]" />
                <h3 className="text-xl font-bold uppercase tracking-widest">Select Variants</h3>
              </div>

              <p className="text-stone-500 text-xs mb-8">Please complete your product selections before securely checking out.</p>

              <div className="space-y-8">
                {getItemsNeedingVariants().map((v) => (
                  <div key={v.index} className="flex gap-4 border border-stone-100 p-4 rounded-sm bg-stone-50">
                    <img src={v.item.images[0]} alt={v.item.name} className="w-16 h-20 object-cover rounded-sm" />
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <p className="font-bold text-sm">{v.item.name}</p>
                        <p className="text-[9px] uppercase tracking-widest text-stone-400 mb-1">N{v.item.price.toLocaleString()}</p>
                      </div>

                      {v.needsSize && (
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Size</label>
                          <select
                            className="w-full text-xs p-2 border border-stone-200 outline-none focus:border-[#C5A059] bg-white"
                            value={variantSelections[v.index]?.size || ''}
                            onChange={(e) => handleVariantSelect(v.index, 'size', e.target.value)}
                          >
                            <option value="" disabled>Select a size...</option>
                            {v.item.sizes!.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )}

                      {v.needsColor && (
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Color</label>
                          <select
                            className="w-full text-xs p-2 border border-stone-200 outline-none focus:border-[#C5A059] bg-white"
                            value={variantSelections[v.index]?.color || ''}
                            onChange={(e) => handleVariantSelect(v.index, 'color', e.target.value)}
                          >
                            <option value="" disabled>Select a color...</option>
                            {v.item.colors!.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="flex-1 py-4 border border-stone-200 text-stone-900 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmVariants}
                  className="flex-1 py-4 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors"
                >
                  Confirm & Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;