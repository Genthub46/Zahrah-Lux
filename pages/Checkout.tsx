import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Trash2, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Star, Send, Download, X, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem, Order, Review, Product } from '../types';
import { REVIEWS_STORAGE_KEY } from '../constants';
import { saveReview, saveAbandonedCheckout, deleteAbandonedCheckout } from '../services/dbUtils';
import { exportCustomerInvoiceToPDF } from '../services/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

import { usePaystackPayment } from 'react-paystack';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { sendAutomatedEmail } from '../services/emailUtils';
import { getOrderConfirmationTemplate, getAbandonedCartTemplate } from '../services/emailTemplates';

const VisaIcon = () => (
  <div className="w-9 h-6 bg-white border border-stone-200 rounded flex items-center justify-center p-0.5 shadow-sm">
    <svg viewBox="0 0 38 24" className="w-full h-full object-contain" xmlns="http://www.w3.org/2000/svg" aria-labelledby="pi-visa"><title id="pi-visa">Visa</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/><path d="M28.3 10.1c-1.6-.7-2.5-1.1-2.5-1.8 0-.6.7-1.2 2.1-1.2 1.3 0 2.2.3 3 .7l.5.2.4-2.7c-.8-.4-2-.7-3.4-.7-2.9 0-4.9 1.5-4.9 3.7 0 1.6 1.5 2.6 2.6 3.1 1.2.5 1.6.9 1.6 1.4 0 .8-1 1.2-2 1.2-1.6 0-2.5-.3-3.4-.8l-.5-.2-.5 2.8c.8.4 2.3.8 3.8.8 3.1 0 5-1.5 5-3.8 0-1.2-.7-2.2-2.2-2.9m-11.8 4l-1-3.6c-.1-.5-.2-.7-.6-.9L11 8.3v-.2h4.5c.6 0 1.1.4 1.3 1.1l1.5 6.2 2.3-7.1h3l-4.7 10.1h-2.4l-1.9-4.3zm6.6-8.9h-2.7L18.7 19h2.8l1.7-13.8z" fill="#1434CB"/><path d="M12.8 5.2h-4L5.6 19h2.9l.6-1.5h3.6l.3 1.5h2.6l-2.8-13.8zm-2.2 10l1.3-3.5 1.5 3.5h-2.8z" fill="#F6A01A"/></svg>
  </div>
);

const MastercardIcon = () => (
  <div className="w-9 h-6 bg-white border border-stone-200 rounded flex items-center justify-center p-0.5 shadow-sm">
    <svg viewBox="0 0 38 24" className="w-full h-full object-contain" xmlns="http://www.w3.org/2000/svg" aria-labelledby="pi-master"><title id="pi-master">Mastercard</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/><circle fill="#EB001B" cx="15" cy="12" r="7"/><circle fill="#F79E1B" cx="23" cy="12" r="7"/><path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"/></svg>
  </div>
);

const VerveIcon = () => (
  <div className="w-9 h-6 bg-white border border-stone-200 rounded flex items-center justify-center p-0.5 shadow-sm">
    <svg viewBox="0 0 38 24" className="w-full h-full object-contain" xmlns="http://www.w3.org/2000/svg"><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/><text x="19" y="16" fontFamily="sans-serif" fontSize="10" fontWeight="bold" fill="#E21C2B" textAnchor="middle">Verve</text></svg>
  </div>
);

interface CheckoutProps {
  cart: CartItem[];
  onRemoveFromCart: (index: number) => void;
  onUpdateCartItem: (index: number, quantity: number, color?: string, size?: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => Promise<void> | void;
  user: User | null;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, onRemoveFromCart, onUpdateCartItem, onClearCart, onOrderPlaced, user }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.displayName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.displayName?.split(' ').slice(1).join(' ') || '');
  const [country, setCountry] = useState('Nigeria');
  const [addressLine1, setAddressLine1] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'Ship' | 'Pickup'>('Ship');
  const [saveInfo, setSaveInfo] = useState(false);
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  // Load saved info on mount
  useEffect(() => {
    const savedInfo = localStorage.getItem('zahrah_checkout_info');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.lastName) setLastName(parsed.lastName);
        if (parsed.addressLine1) setAddressLine1(parsed.addressLine1);
        if (parsed.apartment) setApartment(parsed.apartment);
        if (parsed.city) setCity(parsed.city);
        if (parsed.deliveryState) setDeliveryState(parsed.deliveryState);
        if (parsed.postalCode) setPostalCode(parsed.postalCode);
        if (parsed.phone) setPhone(parsed.phone);
        setSaveInfo(true);
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  }, []);

  // Save info when checkbox is checked and form is submitted/valid
  const handleSaveInfo = () => {
    if (saveInfo) {
      localStorage.setItem('zahrah_checkout_info', JSON.stringify({
        email, firstName, lastName, addressLine1, apartment, city, deliveryState, postalCode, phone
      }));
    } else {
      localStorage.removeItem('zahrah_checkout_info');
    }
  };

  // Abandoned checkout session tracking
  const sessionId = useRef(`session_${Date.now()}_${Math.floor(Math.random() * 1000000)}`).current;
  const abandonedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!email || cart.length === 0) return;

    // Debounce: wait 3 seconds of inactivity before saving draft
    if (abandonedTimer.current) clearTimeout(abandonedTimer.current);
    abandonedTimer.current = setTimeout(() => {
      const name = `${firstName} ${lastName}`.trim();
      saveAbandonedCheckout({
        email: email.toLowerCase(),
        name: name || email,
        cart,
        total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
        timestamp: Date.now(),
        sessionId,
      }).catch(() => {}); // Silently fail to not disrupt UX
    }, 3000);

    return () => {
      if (abandonedTimer.current) clearTimeout(abandonedTimer.current);
    };
  }, [email, firstName, lastName, cart, sessionId]);

  // Calculate Total First
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);


  // --- Coupon State & Logic ---
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed' | 'freeship';
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (code === 'WELCOME10') {
      setAppliedCoupon({ code, discountType: 'percentage', discountValue: 10 });
      setCouponSuccess('Welcome Coupon Applied! 10% discount has been deducted.');
    } else if (code === 'LUXURY5') {
      setAppliedCoupon({ code, discountType: 'percentage', discountValue: 5 });
      setCouponSuccess('Luxury Coupon Applied! 5% discount has been deducted.');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code, discountType: 'freeship', discountValue: 0 });
      setCouponSuccess('Complimentary Shipping Activated!');
    } else if (code === 'ZAHRAH50K') {
      if (total < 250000) {
        setCouponError('This coupon is only valid for purchases above ₦250,000.');
        return;
      }
      setAppliedCoupon({ code, discountType: 'fixed', discountValue: 50000 });
      setCouponSuccess('Elite Coupon Applied! ₦50,000 has been deducted from your total.');
    } else {
      setCouponError('The coupon code entered is invalid or has expired.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (total * appliedCoupon.discountValue) / 100;
    }
    if (appliedCoupon.discountType === 'fixed') {
      return appliedCoupon.discountValue;
    }
    return 0;
  }, [appliedCoupon, total]);

  const calculateShippingFee = () => {
    if (deliveryMethod === 'Pickup') return 0;
    if (total >= 500000) return 0; // Free shipping threshold for luxury orders
    
    switch (deliveryState) {
      case 'Lagos':
        return 5000;
      case 'Ogun':
      case 'Oyo':
      case 'Osun':
      case 'Ondo':
      case 'Ekiti':
        return 8000;
      case '':
        return 0; // Don't charge until state is selected
      default:
        return 15000; // Rest of Nigeria
    }
  };

  const shippingFee = calculateShippingFee();

  const finalShippingFee = useMemo(() => {
    if (appliedCoupon && appliedCoupon.discountType === 'freeship') return 0;
    return shippingFee;
  }, [appliedCoupon, shippingFee]);

  const finalTotal = useMemo(() => {
    return Math.max(0, total - discountAmount + finalShippingFee);
  }, [total, discountAmount, finalShippingFee]);

  // Derived fields for order saving
  const name = `${firstName} ${lastName}`.trim();
  const address = deliveryMethod === 'Ship' 
    ? `${addressLine1}${apartment ? ', ' + apartment : ''}, ${city}, ${deliveryState} ${postalCode}, ${country}`
    : 'Pickup: ASHLUXURY, 22b Admiralty Way, Lekki.';

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [touched, setTouched] = useState({ email: false, phone: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [fallbackEmailSent, setFallbackEmailSent] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [paystackReference, setPaystackReference] = useState(() => `ref_${Date.now()}_${Math.floor(Math.random() * 1000000)}`);

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
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

  const getItemsToEdit = () => {
    if (editingItemIndex !== null) {
      const item = cart[editingItemIndex];
      const needsColor = item.colors && item.colors.length > 0;
      const needsSize = item.sizes && item.sizes.length > 0;
      if (needsColor || needsSize) {
        return [{ index: editingItemIndex, item, needsColor, needsSize }];
      }
      return [];
    }
    return getItemsNeedingVariants();
  };

  const handleVariantSelect = (index: number, type: 'color' | 'size', value: string) => {
    setVariantSelections(prev => ({
      ...prev,
      [index]: { ...prev[index], [type]: value }
    }));
  };

  const confirmVariants = () => {
    const items = getItemsToEdit();
    let allValid = true;

    items.forEach((v) => {
      const sel = variantSelections[v.index];
      if (v.needsColor && !sel?.color) allValid = false;
      if (v.needsSize && !sel?.size) allValid = false;
    });

    if (!allValid) {
      alert("Please select all required sizes and colors before continuing.");
      return;
    }

    items.forEach(v => {
      const sel = variantSelections[v.index];
      onUpdateCartItem(v.index, v.item.quantity, sel?.color || v.item.selectedColor, sel?.size || v.item.selectedSize);
    });

    setShowVariantModal(false);
    setEditingItemIndex(null);
  };

  const handleProceedToCheckout = () => {
    const missingVariants = getItemsNeedingVariants();
    if (missingVariants.length > 0) {
      setEditingItemIndex(null);
      setShowVariantModal(true);
      return;
    }
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update state if user prop changes (e.g. strict refresh)
  React.useEffect(() => {
    if (user) {
      if (!email) setEmail(user.email || '');
      if (!firstName && !lastName) {
         setFirstName(user.displayName?.split(' ')[0] || '');
         setLastName(user.displayName?.split(' ').slice(1).join(' ') || '');
      }
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

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const isPhoneValid = useMemo(() => /^[0-9+]{10,15}$/.test(phone.replace(/[\s\(\)\-\.]/g, '')), [phone]);
  const isFormValid = useMemo(() => {
    const baseValid = firstName.trim() !== '' && lastName.trim() !== '' && isEmailValid && isPhoneValid;
    if (deliveryMethod === 'Ship') {
      return baseValid && addressLine1.trim() !== '' && city.trim() !== '' && deliveryState !== '';
    }
    return baseValid;
  }, [firstName, lastName, isEmailValid, isPhoneValid, deliveryMethod, addressLine1, city, deliveryState]);

  // Paystack Configuration
  const paystackConfig = {
    // @ts-ignore
    reference: paystackReference,
    email: email,
    amount: Math.round(finalTotal * 100), // Add shipping conditionally and ensure integer (kobo)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_PLACEHOLDER_KEY',
  };

  const onSuccess = async (reference: any) => {
    console.log(`[Email Service Trigger] Sending order confirmation email to ${email} for order ${reference.reference}`);

    const newOrder: Order & { couponApplied?: string } = {
      id: `ORD-${Date.now()}`,
      customerName: name,
      customerEmail: email.toLowerCase(),
      customerPhone: phone,
      customerAddress: address,
      items: [...cart],
      total: finalTotal,
      date: new Date().toISOString(),
      status: 'Pending',
      paymentMethod: 'Paystack',
      paymentStatus: 'Paid',
      paymentReference: reference.reference,
      couponApplied: appliedCoupon?.code || undefined,
    };
    
    if (user?.uid) {
      newOrder.userId = user.uid;
    }

    const emailHtml = getOrderConfirmationTemplate(newOrder, name);
    sendAutomatedEmail(email, "Your Zahrah Luxury Order Confirmation", emailHtml).catch(err => console.error("Email failed", err));

    // We no longer call onOrderPlaced here because the order was already saved as 'Pending' 
    // before the payment modal opened, and the backend webhook will mark it 'Paid'.

    // Clean up abandoned checkout draft on success
    deleteAbandonedCheckout(sessionId).catch(() => {});
    
    // We no longer call createPublicNotification to maintain a premium feel
    
    setCompletedOrder(newOrder);
    setPaymentSuccess(true);
    onClearCart();
    setIsProcessing(false);
  };

  const onClose = () => {
    setIsProcessing(false);
    // 3. Payment Failed/Closed -> Show decline message
    setPaymentError('Payment was cancelled or failed. Please try again.');
    
    // Regenerate reference for the next attempt
    setPaystackReference(`ref_${Date.now()}_${Math.floor(Math.random() * 1000000)}`);
    
    console.log(`[Email Service Trigger] Sending abandoned checkout email to ${email}`);
    
    const fallbackHtml = getAbandonedCartTemplate(name);
    sendAutomatedEmail(email, "Need help with your order?", fallbackHtml).catch(err => console.error("Email failed", err));

    setFallbackEmailSent(true);
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackPayment = async () => {
    setPaymentError('');
    setSubmitAttempted(true);
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
      setEditingItemIndex(null);
      setShowVariantModal(true);
      return;
    }

    handleSaveInfo(); // Save info to localStorage if checkbox is checked
    setIsProcessing(true);

    try {
      // 1. Backend Validates Stock & Price (Serverless Firestore check)
      let calculatedTotal = 0;
      for (const item of cart) {
        const productDoc = await getDoc(doc(db, 'products', item.id));
        if (!productDoc.exists()) {
          setPaymentError(`Item ${item.name} is no longer available.`);
          setIsProcessing(false);
          return;
        }
        const productData = productDoc.data() as Product;
        if (productData.stock < item.quantity) {
          setPaymentError(`Only ${productData.stock} units left for ${item.name}. Please adjust your cart.`);
          setIsProcessing(false);
          return;
        }
        calculatedTotal += productData.price * item.quantity;
      }

      if (Math.abs(calculatedTotal - total) > 0.01) {
        setPaymentError("Price mismatch detected. Please refresh the page to get the latest prices.");
        setIsProcessing(false);
        return;
      }
    } catch (error) {
       console.error("Validation error:", error);
       setPaymentError("Failed to validate stock. Please try again.");
       setIsProcessing(false);
       return;
    }

    // 2. Save the order as 'Pending' before redirecting to Paystack
    const pendingOrder: Order & { couponApplied?: string } = {
      id: `ORD-${Date.now()}`,
      customerName: name,
      customerEmail: email.toLowerCase(),
      customerPhone: phone,
      customerAddress: address,
      items: [...cart],
      total: finalTotal,
      date: new Date().toISOString(),
      status: 'Pending',
      paymentMethod: 'Paystack',
      paymentStatus: 'Pending',
      paymentReference: paystackReference,
      couponApplied: appliedCoupon?.code || undefined,
    };
    
    if (user?.uid) {
      pendingOrder.userId = user.uid;
    }

    try {
      await onOrderPlaced(pendingOrder);
    } catch (err) {
      console.error("Failed to save pending order:", err);
      setPaymentError("Failed to initiate order. Please try again.");
      setIsProcessing(false);
      return;
    }

    // 3. Payment Gateway Processes Charge
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
        customerEmail: email.toLowerCase(),
        date: new Date().toISOString()
      };
      await saveReview(newReview);
      setReviewSubmitted(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  if (paymentSuccess) {
    return (
      <div className="pt-32 pb-24 px-4 max-w-2xl mx-auto text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-4 tracking-tight">Order Confirmed</h2>
        <p className="text-stone-500 mb-8 font-light italic serif text-lg">Your curated pieces are reserved.</p>

        {completedOrder && (
          <div className="mb-12">
             <button
               onClick={() => exportCustomerInvoiceToPDF(completedOrder)}
               className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#C5A059] border border-[#C5A059] px-6 py-3 hover:bg-[#C5A059] hover:text-white transition-colors rounded-xl"
             >
               <Download size={14} />
               <span>Download Official Receipt</span>
             </button>
          </div>
        )}

        {!user && (
          <div className="mb-12 bg-stone-50 p-8 rounded-xl border border-stone-100 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-2">Track Your Order</h4>
            <p className="text-xs text-stone-500 mb-6 font-serif italic">Create an account or log in to track this order.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                state={{ email }}
                className="px-8 py-3 bg-stone-900 text-white text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#C5A059] transition-colors rounded-xl"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                state={{ email }}
                className="px-8 py-3 bg-white border border-stone-200 text-stone-900 text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-stone-50 transition-colors rounded-xl"
              >
                Log In
              </Link>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!reviewSubmitted ? (
            <motion.div
              key="review-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <form onSubmit={submitReview} className="bg-white p-12 border border-stone-100 shadow-2xl space-y-8">
                <p className="text-stone-500 mb-2 font-light italic serif text-sm">We'd value your feedback on the shopping experience.</p>
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
                    onClick={() => setReviewSubmitted(true)}
                    className="text-[9px] font-bold tracking-[0.4em] text-stone-300 hover:text-stone-900 transition-colors uppercase"
                  >
                    Skip Review
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



              <div className="mt-12">
                <Link to="/" className="text-[9px] font-bold tracking-[0.4em] text-stone-900 border-b border-[#C5A059] pb-1 uppercase hover:text-[#C5A059] transition-colors">
                  Return to Boutique
                </Link>
              </div>
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

      {cart.length === 0 && !paymentSuccess ? (
        <div className="pt-40 pb-32 px-4 max-w-xl mx-auto text-center animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center relative shadow-inner">
              <ShoppingBag className="w-8 h-8 text-[#C5A059] stroke-[1.2]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C5A059] rounded-full text-white text-[8px] font-bold flex items-center justify-center">0</span>
            </div>
          </div>
          <h2 className="text-3xl font-serif italic text-stone-900 mb-4 tracking-tight">Your Shopping Bag is Empty</h2>
          <p className="text-stone-400 text-xs uppercase tracking-widest font-light leading-relaxed mb-10 max-w-sm mx-auto">
            Explore our curated selections and discover premium luxury couture.
          </p>
          <Link
            to="/"
            className="inline-block bg-stone-900 text-white px-10 py-4.5 rounded-xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-[#C5A059] transition-all duration-500 shadow-md hover:shadow-lg"
          >
            Discover Boutique
          </Link>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {step === 'cart' ? (
            <motion.div
              key="cart-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row gap-12 lg:gap-16 min-h-[60vh]"
            >
              {/* Left Cart Items List */}
              <div className="w-full lg:w-[58%] space-y-6">
                <div>
                  <h2 className="text-3xl font-serif italic text-stone-900 tracking-tight mb-2">Your Cart</h2>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'} in your curation
                  </p>
                </div>

                <div className="space-y-6">
                  {cart.map((item, index) => {
                    const itemSubtotal = item.price * item.quantity;
                    return (
                      <div 
                        key={`${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${index}`}
                        className="bg-white rounded-2xl p-6 border border-stone-100/80 flex items-center gap-6 relative shadow-sm hover:shadow-md transition-all duration-300 group"
                      >
                        {/* Remove button (X) on top-right */}
                        <button
                          onClick={() => onRemoveFromCart(index)}
                          className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-stone-50"
                          title="Remove item"
                        >
                          <X size={14} className="stroke-[2]" />
                        </button>

                        {/* Product image */}
                        <div className="w-20 h-24 bg-stone-50 border border-stone-100 rounded-xl overflow-hidden shrink-0 shadow-inner flex items-center justify-center p-1">
                          <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                          <div>
                            <p className="text-sm font-bold text-stone-900 tracking-wide uppercase truncate mb-1 leading-none">{item.name}</p>
                            <p className="text-xs font-bold text-[#C5A059] tracking-wider mb-2.5">₦{item.price.toLocaleString()}</p>
                            
                            {/* Variant summary */}
                            {(item.selectedColor || item.selectedSize) && (
                              <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                                {item.selectedColor}{item.selectedColor && item.selectedSize ? ' / ' : ''}{item.selectedSize}
                              </p>
                            )}
                            
                            {/* Modify selections button */}
                            {(item.colors?.length || item.sizes?.length) && (
                              <button 
                                onClick={() => {
                                  setEditingItemIndex(index);
                                  setVariantSelections(prev => ({
                                    ...prev,
                                    [index]: { color: item.selectedColor, size: item.selectedSize }
                                  }));
                                  setShowVariantModal(true);
                                }} 
                                className="text-[9px] text-[#C5A059] uppercase tracking-widest hover:text-stone-950 font-bold border-b border-transparent hover:border-[#C5A059] transition-all pb-0.5 mt-1"
                              >
                                Modify selections
                              </button>
                            )}
                          </div>

                          {/* Quantity selector & Line subtotal */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-full px-3 py-1 gap-4 shadow-sm">
                              <button 
                                type="button" 
                                onClick={() => item.quantity > 1 && onUpdateCartItem(index, item.quantity - 1, item.selectedColor, item.selectedSize)}
                                className="text-stone-400 hover:text-stone-900 transition-colors px-1 text-sm font-bold focus:outline-none"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="text-[10px] font-bold text-stone-800 w-4 text-center">{item.quantity}</span>
                              <button 
                                type="button" 
                                onClick={() => onUpdateCartItem(index, item.quantity + 1, item.selectedColor, item.selectedSize)}
                                className="text-stone-400 hover:text-stone-900 transition-colors px-1 text-sm font-bold focus:outline-none"
                              >
                                +
                              </button>
                            </div>
                            <div className="text-xs font-bold text-stone-950 tracking-wider">
                              ₦{itemSubtotal.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Order Summary Column */}
              <div className="w-full lg:w-[42%] bg-[#FAF9F6] border border-stone-200/50 rounded-2xl p-8 shadow-sm h-fit space-y-8">
                <h3 className="text-lg font-bold tracking-tight text-stone-900 serif italic">Order Summary</h3>

                <div className="flex justify-between text-xs text-stone-500 uppercase tracking-widest font-medium border-b border-stone-100 pb-4">
                  <span>Curations Subtotal</span>
                  <span className="font-bold text-stone-950">₦{total.toLocaleString()}</span>
                </div>

                {/* Complimentary Delivery Tracker */}
                <div className="bg-white border border-stone-100 rounded-xl p-5 shadow-sm space-y-3">
                  <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider leading-relaxed flex items-center gap-1.5">
                    {total >= 500000 ? (
                      <span>Your order qualifies for free delivery! 🎁</span>
                    ) : (
                      <span>Add ₦{(500000 - total).toLocaleString()} more for free delivery 🎁</span>
                    )}
                  </p>
                  <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#C5A059] rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${Math.min(100, (total / 500000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Coupon Discount */}
                <div className="space-y-3">
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Promo Code"
                        className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-xs bg-white uppercase tracking-wider transition-all"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-5 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors duration-300 whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{appliedCoupon.code}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-[9px] text-stone-400 hover:text-red-500 font-bold uppercase tracking-wider transition-colors">Remove</button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in duration-300">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in duration-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {couponSuccess}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-6 border-t border-stone-200/60 text-xs">
                  <div className="flex justify-between text-stone-500 uppercase tracking-widest font-medium">
                    <span>Shipping</span>
                    <span className="font-bold text-stone-400 italic text-[10px]">Calculated next step</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 uppercase tracking-widest font-medium">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span className="font-bold">-₦{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-6 border-t border-stone-200 text-stone-950">
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Grand Total</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[9px] text-[#C5A059] font-bold tracking-widest uppercase">NGN</span>
                      <span className="text-xl font-bold tracking-tight">₦{(total - discountAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-stone-900 text-white py-5 rounded-xl text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-[#C5A059] focus:bg-[#C5A059] focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                </button>

                <div className="border-t border-stone-100 pt-6 flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-bold uppercase tracking-wider text-stone-400">
                   <Link to="/p/refund-policy" className="hover:text-stone-900 transition-colors">Refund policy</Link>
                   <Link to="/p/shipping-policy" className="hover:text-stone-900 transition-colors">Shipping policy</Link>
                   <Link to="/p/privacy-policy" className="hover:text-stone-900 transition-colors">Privacy policy</Link>
                   <Link to="/p/terms-of-service" className="hover:text-stone-900 transition-colors">Terms of service</Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="checkout-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row gap-12 lg:gap-16 min-h-[60vh]"
            >
              {/* Left Billing/Shipping Information Form */}
              <div className="w-full lg:w-[58%] pt-2 pb-24">
                <button 
                  onClick={() => { setStep('cart'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition-colors mb-8 uppercase tracking-widest text-[9px] font-bold group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Return to Shopping Bag</span>
                </button>

                <div className="space-y-12">
                  
                  {/* Contact Section */}
                  <section className="bg-white p-6 sm:p-8 border border-stone-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold tracking-tight text-stone-900 serif italic">Contact Information</h2>
                      {!user && (
                        <Link 
                          to="/login" 
                          className="text-xs uppercase tracking-wider text-[#C5A059] hover:text-stone-950 font-bold border-b border-[#C5A059] pb-0.5 transition-colors"
                        >
                          Sign in
                        </Link>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className={`w-full px-4 py-3.5 bg-white border ${
                              submitAttempted && email.trim() === '' 
                                ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                                : touched.email && !isEmailValid 
                                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                                  : 'border-stone-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]'
                            } rounded-xl focus:outline-none transition-all duration-300 text-sm`}
                          />
                        </div>
                        <div className="relative">
                          <input 
                            type="tel" 
                            value={phone} 
                            onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                            onChange={(e) => setPhone(e.target.value)} 
                            placeholder="Phone number" 
                            className={`w-full px-4 py-3.5 bg-white border ${
                              submitAttempted && phone.trim() === '' 
                                ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                                : touched.phone && !isPhoneValid 
                                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                                  : 'border-stone-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]'
                            } rounded-xl focus:outline-none transition-all duration-300 text-sm`} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                          className={`w-full px-4 py-3.5 bg-white border ${
                            submitAttempted && firstName.trim() === '' 
                              ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                              : 'border-stone-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]'
                          } rounded-xl focus:outline-none transition-all duration-300 text-sm`}
                        />
                        <input 
                          type="text" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                          placeholder="Last Name" 
                          className={`w-full px-4 py-3.5 bg-white border ${
                            submitAttempted && lastName.trim() === '' 
                              ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                              : 'border-stone-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]'
                          } rounded-xl focus:outline-none transition-all duration-300 text-sm`} 
                        />
                      </div>

                      <label className="flex items-center space-x-2.5 cursor-pointer mt-4 group select-none">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded-sm border-stone-200 text-[#C5A059] focus:ring-[#C5A059] accent-[#C5A059] cursor-pointer" 
                          defaultChecked 
                        />
                        <span className="text-[11px] text-stone-400 group-hover:text-stone-700 transition-colors">
                          Email me with exclusive updates and bespoke collections
                        </span>
                      </label>
                    </div>
                  </section>

                  {/* Delivery Section */}
                  <section className="bg-white p-6 sm:p-8 border border-stone-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <h2 className="text-lg font-bold tracking-tight text-stone-900 serif italic mb-6">Delivery Method</h2>
                    
                    {/* Ship vs Pickup Custom Luxury Switcher */}
                    <div className="grid grid-cols-2 gap-3 mb-6 bg-stone-50 p-1.5 rounded-xl border border-stone-100">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('Ship')}
                        className={`py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                          deliveryMethod === 'Ship'
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/50'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                        <span>Ship to Address</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('Pickup')}
                        className={`py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                          deliveryMethod === 'Pickup'
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/50'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                          <path d="M2 12h20"/>
                        </svg>
                        <span>Store Pickup</span>
                      </button>
                    </div>

                    {deliveryMethod === 'Pickup' ? (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[11px] uppercase tracking-widest text-stone-400 font-bold">Selected boutique location</span>
                          <span className="text-xs flex items-center gap-1 font-bold text-stone-950 uppercase tracking-widest">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> 
                            Nigeria
                          </span>
                        </div>
                        <div className="border border-[#C5A059] rounded-xl p-5 bg-[#FAF9F6] relative shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-sm text-stone-900 tracking-tight">ASHLUXURY</h3>
                            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">FREE</span>
                          </div>
                          <p className="text-xs text-stone-500 mb-4 font-light leading-relaxed">22b Admiralty Way, Lekki Phase 1, Lagos, Nigeria</p>
                          <p className="text-[10px] text-stone-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#C5A059]"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Usually ready in 24 hours
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <select 
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-4 pt-5 pb-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] appearance-none text-sm bg-white cursor-pointer transition-all"
                          >
                            <option>Nigeria</option>
                          </select>
                          <label className="absolute top-1.5 left-4 text-[9px] font-bold uppercase tracking-widest text-stone-400">Country/Region</label>
                          <div className="absolute right-4 top-4 text-stone-400 pointer-events-none">
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                        </div>

                        <input 
                          type="text" 
                          placeholder="Street Address" 
                          value={addressLine1} 
                          onChange={(e) => setAddressLine1(e.target.value)} 
                          className={`w-full px-4 py-3.5 bg-white border ${
                            submitAttempted && addressLine1.trim() === '' 
                              ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                              : 'border-stone-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]'
                          } rounded-xl focus:outline-none transition-all duration-300 text-sm`} 
                        />
                        
                        <input 
                          type="text" 
                          placeholder="Apartment, suite, etc. (optional)" 
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value)}
                          className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm transition-all" 
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <input 
                            type="text" 
                            placeholder="City" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={`w-full px-4 py-3.5 bg-white border ${
                              submitAttempted && city.trim() === '' 
                                ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                                : 'border-stone-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]'
                            } rounded-xl focus:outline-none transition-all duration-300 text-sm`} 
                          />
                          
                          <div className="relative">
                            <select 
                              value={deliveryState}
                              onChange={(e) => setDeliveryState(e.target.value)}
                              className={`w-full px-4 pt-5 pb-2 border ${
                                submitAttempted && deliveryState === '' 
                                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                                  : 'border-stone-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]'
                              } rounded-xl focus:outline-none appearance-none text-sm bg-white cursor-pointer transition-all`}
                            >
                              <option value="">Select state...</option>
                              <option value="Lagos">Lagos</option>
                              <option value="Abuja">Abuja</option>
                              <option value="Rivers">Rivers</option>
                              <option value="Ogun">Ogun</option>
                              <option value="Oyo">Oyo</option>
                              <option value="Osun">Osun</option>
                              <option value="Ondo">Ondo</option>
                              <option value="Ekiti">Ekiti</option>
                              <option value="Kano">Kano</option>
                              <option value="Kaduna">Kaduna</option>
                              <option value="Edo">Edo</option>
                              <option value="Delta">Delta</option>
                              <option value="Enugu">Enugu</option>
                              <option value="Other">Other State</option>
                            </select>
                            <label className="absolute top-1.5 left-4 text-[9px] font-bold uppercase tracking-widest text-stone-400">State</label>
                            <div className="absolute right-3 top-4 text-stone-400 pointer-events-none">
                               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                          </div>
                          
                          <input 
                            type="text" 
                            placeholder="Postal code" 
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm transition-all" 
                          />
                        </div>

                        <label className="flex items-center space-x-2.5 mt-4 cursor-pointer group select-none">
                          <input 
                            type="checkbox" 
                            checked={saveInfo}
                            onChange={(e) => setSaveInfo(e.target.checked)}
                            className="w-4 h-4 text-[#C5A059] border-stone-200 focus:ring-[#C5A059] accent-[#C5A059] cursor-pointer rounded-sm" 
                          />
                          <span className="text-[11px] text-stone-400 group-hover:text-stone-700 transition-colors">
                            Save this information for next time
                          </span>
                        </label>
                      </div>
                    )}
                  </section>

                  {/* Shipping Method Section */}
                  {deliveryMethod === 'Ship' && (
                    <section className="bg-white p-6 sm:p-8 border border-stone-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                      <h2 className="text-lg font-bold tracking-tight text-stone-900 serif italic mb-2">Shipping Method</h2>
                      <p className="text-[11px] text-stone-400 mb-6 uppercase tracking-wider leading-relaxed">
                        White-glove private source delivery
                      </p>

                      {deliveryState === '' ? (
                        <div className="border border-stone-100 rounded-xl p-5 bg-stone-50 flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Standard secure Delivery</span>
                          <span className="text-[10px] italic text-stone-400 uppercase tracking-widest">Select a state above to calculate</span>
                        </div>
                      ) : (
                        <div className="border border-[#C5A059] rounded-xl p-5 bg-[#FAF9F6] flex justify-between items-center transition-all duration-300 shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 rounded-full border border-[#C5A059] flex items-center justify-center p-0.5">
                              <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold uppercase tracking-widest text-stone-950">Standard Secure Delivery</span>
                              <span className="text-[9px] text-stone-400 uppercase tracking-wider mt-0.5">White-glove shipping to your doorstep</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-stone-900">
                            {finalShippingFee === 0 ? 'COMPLIMENTARY' : `₦${finalShippingFee.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </section>
                  )}

                  {/* Payment Section */}
                  <section className="bg-white p-6 sm:p-8 border border-stone-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <h2 className="text-lg font-bold tracking-tight text-stone-900 serif italic mb-2">Payment</h2>
                    <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-6">All transactions are encrypted and secure.</p>
                    
                    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                      <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <div className="w-4 h-4 rounded-full border border-[#C5A059] flex items-center justify-center p-0.5">
                            <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-900">Paystack Secure Checkout</span>
                        </div>
                        <div className="flex space-x-1.5">
                          <MastercardIcon />
                          <VisaIcon />
                          <VerveIcon />
                        </div>
                      </div>
                      <div className="p-8 text-center bg-stone-50/50 border-b border-stone-200 text-xs text-stone-500 flex flex-col items-center">
                        <svg className="w-8 h-8 text-stone-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="2" y="5" width="20" height="14" rx="2"/>
                          <line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                        <p className="max-w-xs leading-relaxed font-serif italic text-stone-400 text-sm">
                          Upon clicking "Complete Purchase", you will be securely redirected to Paystack to complete your luxury acquisition.
                        </p>
                      </div>
                      
                      <div className="p-5 bg-white flex items-center justify-between cursor-pointer opacity-30 select-none">
                        <div className="flex items-center space-x-4">
                          <div className="w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center p-0.5" />
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Flutterwave Checkout (Inactive)</span>
                        </div>
                        <div className="flex space-x-1.5">
                          <VisaIcon />
                          <MastercardIcon />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Error Message */}
                  <AnimatePresence>
                    {paymentError && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className="p-5 bg-red-50 border border-red-100 rounded-sm"
                      >
                         <div className="flex items-start gap-3">
                           <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                           <div>
                             <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest">{paymentError}</p>
                             {fallbackEmailSent && (
                               <p className="text-[10px] text-red-600 mt-2 font-serif italic">
                                 A support email has been sent to help you complete your purchase.
                               </p>
                             )}
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pay Now Button */}
                  <div className="pt-4">
                    <button
                      onClick={handlePaystackPayment}
                      disabled={isProcessing || cart.length === 0 || (!isFormValid && touched.email)}
                      className="w-full bg-stone-900 text-white py-5 rounded-xl text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-[#C5A059] focus:bg-[#C5A059] focus:outline-none transition-all duration-300 disabled:opacity-30 shadow-lg hover:shadow-xl"
                    >
                      {isProcessing ? 'Authenticating Order...' : 'Complete Purchase'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sticky Checkout Summary Column */}
              <div className="w-full lg:w-[42%] bg-[#FAF9F6] border-t lg:border-t-0 lg:border-l border-stone-200/60">
                <div className="lg:sticky lg:top-24 pt-12 pb-24 px-4 sm:px-8 lg:px-12 w-full lg:h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar">
                  <div className="max-w-md mx-auto lg:mx-0 w-full space-y-8">
                    
                    <div className="flex justify-between items-center pb-4 border-b border-stone-200/50">
                      <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">Bag Curations</h3>
                      <button 
                        onClick={() => { setStep('cart'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold border-b border-transparent hover:border-[#C5A059] transition-all"
                      >
                        Edit Bag
                      </button>
                    </div>

                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <div key={`${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${index}`} className="flex items-center gap-4 py-3 border-b border-stone-200/30 last:border-0">
                          <div className="relative shrink-0">
                            <div className="w-12 h-16 border border-stone-200 rounded-sm overflow-hidden bg-white">
                              <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C5A059] rounded-full text-white text-[8px] font-bold flex items-center justify-center font-shadow shadow-sm">
                               {item.quantity}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-stone-900 uppercase tracking-wider truncate mb-0.5">{item.name}</p>
                            {(item.selectedColor || item.selectedSize) && (
                              <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                                {item.selectedColor}{item.selectedColor && item.selectedSize ? ' / ' : ''}{item.selectedSize}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-xs font-bold text-stone-950 shrink-0">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Discount Coupon Panel */}
                    <div className="pt-6 border-t border-stone-200/60 space-y-3">
                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                            placeholder="Coupon or Promo Code"
                            className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-xs bg-white uppercase tracking-wider transition-all"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            className="px-5 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors duration-300 whitespace-nowrap"
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{appliedCoupon.code}</span>
                          </div>
                          <button onClick={handleRemoveCoupon} className="text-[9px] text-stone-400 hover:text-red-500 font-bold uppercase tracking-wider transition-colors">Remove</button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          {couponError}
                        </p>
                      )}
                      {couponSuccess && (
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {couponSuccess}
                        </p>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="space-y-4 pt-6 border-t border-stone-200/60 text-xs">
                      <div className="flex justify-between text-stone-500 uppercase tracking-widest font-medium">
                        <span>Curations Subtotal</span>
                        <span className="font-bold text-stone-950">₦{total.toLocaleString()}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 uppercase tracking-widest font-medium">
                          <span>Coupon Discount ({appliedCoupon?.code})</span>
                          <span className="font-bold">-₦{discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-stone-500 uppercase tracking-widest font-medium">
                        <span className="flex items-center gap-1 cursor-help group">
                           Secure Shipping
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-stone-400 group-hover:text-stone-700 transition-colors"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </span>
                        <span className="font-bold text-stone-950">
                          {deliveryMethod === 'Pickup' ? 'FREE' : (
                            appliedCoupon?.discountType === 'freeship' ? (
                              <span className="text-emerald-600">COMPLIMENTARY</span>
                            ) : total >= 500000 ? 'COMPLIMENTARY' : (
                              deliveryState ? `₦${shippingFee.toLocaleString()}` : 'CALCULATED NEXT STEP'
                            )
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-6 border-t border-stone-200 text-stone-950">
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">Grand Total</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[9px] text-[#C5A059] font-bold tracking-widest uppercase">NGN</span>
                        <span className="text-xl font-bold tracking-tight">₦{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
                {getItemsToEdit().map((v) => (
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