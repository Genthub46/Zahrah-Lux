
import React, { useState, useMemo } from 'react';
import { Trash2, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Star, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem, Order, Review } from '../types';
import { REVIEWS_STORAGE_KEY } from '../constants';
import { saveReview } from '../services/dbUtils';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

interface CheckoutProps {
  cart: CartItem[];
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

declare const PaystackPop: any;

const Checkout: React.FC<CheckoutProps> = ({ cart, onRemoveFromCart, onClearCart, onOrderPlaced }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [touched, setTouched] = useState({ email: false, phone: false });

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const isPhoneValid = useMemo(() => /^[0-9+]{10,15}$/.test(phone.replace(/\s/g, '')), [phone]);
  const isFormValid = name.trim() !== '' && address.trim() !== '' && isEmailValid && isPhoneValid;

  const handlePaystackPayment = () => {
    if (!isFormValid) {
      setTouched({ email: true, phone: true });
      return;
    }

    if (cart.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }

    setIsProcessing(true);

    const completeOrder = () => {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerAddress: address,
        items: [...cart],
        total: total,
        date: new Date().toISOString(),
        status: 'Pending'
      };
      onOrderPlaced(newOrder);
      setPaymentSuccess(true);
      onClearCart();
    };

    const PAYSTACK_KEY = 'pk_test_YOUR_KEY';

    if (PAYSTACK_KEY === 'pk_test_YOUR_KEY') {
      setTimeout(() => {
        completeOrder();
      }, 2500);
    } else {
      try {
        const handler = PaystackPop.setup({
          key: PAYSTACK_KEY,
          email: email,
          amount: total * 100,
          currency: 'NGN',
          callback: function (response: any) {
            completeOrder();
          },
          onClose: function () {
            setIsProcessing(false);
          }
        });
        handler.openIframe();
      } catch (e) {
        setTimeout(completeOrder, 1500);
      }
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

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
              {cart.map((item) => (
                <div key={item.id} className="flex space-x-6 py-8 border-b border-stone-100 animate-in fade-in duration-500">
                  <div className="w-28 h-36 flex-shrink-0">
                    <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover rounded-sm shadow-sm grayscale hover:grayscale-0 transition-all" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-stone-900">{item.name}</h3>
                        <p className="text-stone-500 text-[10px] mt-1 uppercase tracking-widest">{item.category} • AUTHENTIC ZARA UK</p>
                      </div>
                      <p className="font-bold">N{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xs text-stone-400 tracking-widest uppercase">
                        Units: <span className="text-stone-900 font-bold ml-2">{item.quantity}</span>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-stone-300 hover:text-red-500 transition-colors p-2"
                        title="Remove Item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default Checkout;