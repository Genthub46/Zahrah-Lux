import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Product, CartItem, Order, ViewLog, RestockRequest, HomeLayoutConfig, SectionConfig, FooterPage } from './types';
import {
  APP_STORAGE_KEY,
  WISHLIST_STORAGE_KEY,
  PRODUCTS_STORAGE_KEY,
  ORDERS_STORAGE_KEY,
  REVIEWS_STORAGE_KEY,
  RESTOCK_REQUESTS_STORAGE_KEY,
  ANALYTICS_STORAGE_KEY,
  FOOTER_PAGES_STORAGE_KEY,
  INITIAL_PRODUCTS as initialProducts,
  INITIAL_FOOTER_PAGES as footerPages,
  INITIAL_HOME_LAYOUT as initialLayoutConfig,
} from './constants';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ErrorBoundary from './components/ErrorBoundary';
// Lazy load pages for performance
const Admin = React.lazy(() => import('./pages/Admin'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const InfoPage = React.lazy(() => import('./pages/InfoPage'));
const Lookbook = React.lazy(() => import('./pages/Lookbook'));
const Orders = React.lazy(() => import('./pages/Orders'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Helper to wrap lazy components with Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Loading Experience...</span>
      </div>
    </div>
  }>
    {children}
  </Suspense>
);

import WhatsAppBot from './components/WhatsAppBot';
import CookieConsent from './components/CookieConsent';
import LuxuryLoader from './components/LuxuryLoader';
import AdminFloatingPill from './components/AdminFloatingPill';
import LiveNotifications from './components/LiveNotifications';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebaseConfig';

const LAYOUT_CONFIG_KEY = 'ZARHRAH_LAYOUT_CONFIG';

import {
  subscribeToProducts,
  subscribeToOrders,
  subscribeToLogs,
  subscribeToRequests,
  subscribeToPages,
  subscribeToLayout,
  seedInitialData,
  saveOrder,
  placeOrderWithStockCheck,
  addRestockRequest,
  logView as dbLogView,
  updateProduct,
  saveUserData,
  subscribeToUserData,
  getUserData
} from './services/dbUtils';

import { useToast } from './contexts/ToastContext';
import { getStaffRole } from './services/staffService';

const FloatingFeatures = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <WhatsAppBot />}
      <CookieConsent />
      <AdminFloatingPill />
      <LiveNotifications isAdmin={isAdmin} />
    </>
  );
};

const normalizeAndConsolidateCart = (items: CartItem[], onCapped?: (itemName: string, maxStock: number) => void): CartItem[] => {
  const consolidated: CartItem[] = [];
  let cappedAny = false;
  let cappedItemName = '';
  let cappedMaxStock = 0;

  items.forEach(item => {
    const selectedColor = item.selectedColor && item.selectedColor.trim() !== '' ? item.selectedColor.trim() : undefined;
    const selectedSize = item.selectedSize && item.selectedSize.trim() !== '' ? item.selectedSize.trim() : undefined;

    const finalColor = selectedColor || (item.colors && item.colors.length > 0 ? item.colors[0].name : undefined);
    const finalSize = selectedSize || (item.sizes && item.sizes.length > 0 ? item.sizes[0] : undefined);

    const existingIdx = consolidated.findIndex(c =>
      c.id === item.id &&
      c.selectedColor === finalColor &&
      c.selectedSize === finalSize
    );

    if (existingIdx > -1) {
      const currentQty = consolidated[existingIdx].quantity;
      const newQty = currentQty + item.quantity;
      const maxStock = item.stock;

      if (newQty > maxStock) {
        consolidated[existingIdx] = {
          ...consolidated[existingIdx],
          quantity: maxStock
        };
        cappedAny = true;
        cappedItemName = item.name;
        cappedMaxStock = maxStock;
      } else {
        consolidated[existingIdx] = {
          ...consolidated[existingIdx],
          quantity: newQty
        };
      }
    } else {
      if (item.quantity > item.stock) {
        consolidated.push({
          ...item,
          selectedColor: finalColor,
          selectedSize: finalSize,
          quantity: item.stock
        });
        cappedAny = true;
        cappedItemName = item.name;
        cappedMaxStock = item.stock;
      } else {
        consolidated.push({
          ...item,
          selectedColor: finalColor,
          selectedSize: finalSize,
          quantity: item.quantity
        });
      }
    }
  });

  if (cappedAny && onCapped) {
    onCapped(cappedItemName, cappedMaxStock);
  }

  return consolidated;
};

const App: React.FC = () => {
  const { showToast } = useToast();

  // Use local storage for Cart and Wishlist ONLY (Client-side persistence)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (!saved) return [];
    try {
      return normalizeAndConsolidateCart(JSON.parse(saved));
    } catch (e) {
      return [];
    }
  });

  const cartStateRef = React.useRef<CartItem[]>(cart);
  useEffect(() => {
    cartStateRef.current = cart;
  }, [cart]);

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ZARHRAH_WISHLIST');
    return saved ? JSON.parse(saved) : [];
  });

  // Global State (Synced with Firestore)
  // Global State (Synced with Firestore)
  const [products, setProducts] = useState<Product[]>([]);
  const [footerPages, setFooterPages] = useState<FooterPage[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<HomeLayoutConfig>({ sections: [], showCatalog: true });

  const [user, setUser] = useState<User | null>(null);

  // --- Subscriptions ---
  useEffect(() => {
    const unsubProducts = subscribeToProducts(setProducts);
    const unsubPages = subscribeToPages(setFooterPages);
    const unsubLayout = subscribeToLayout((data) => {
      if (data) setLayoutConfig(data);
    });

    return () => {
      unsubProducts();
      unsubPages();
      unsubLayout();
    };
  }, []);

  // Auth Handling with Merge/Clear Logic
  // We need to track if we *were* logged in, so we only clear data on explicit logout,
  // not on initial load (where user is null).
  const wasLoggedIn = React.useRef(false);
  const isFirstAuthRef = React.useRef(true);
  const [isDataSynced, setIsDataSynced] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        wasLoggedIn.current = true;



        if (isFirstAuthRef.current) {
          // --- Page Reload / Initial Session Restore ---
          isFirstAuthRef.current = false;
          setIsDataSynced(false);
          const serverData = await getUserData(currentUser.uid);
          if (serverData) {
            const serverCart = serverData.cart || [];
            const serverWishlist = serverData.wishlist || [];
            const normalizedCart = normalizeAndConsolidateCart(serverCart);
            setCart(normalizedCart);
            setWishlist(serverWishlist);
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(normalizedCart));
            localStorage.setItem('ZARHRAH_WISHLIST', JSON.stringify(serverWishlist));
          }
          setIsDataSynced(true);
        } else {
          // --- Explicit Login Merge ---
          setIsDataSynced(false);
          const serverData = await getUserData(currentUser.uid);
          let finalCart = [...cart];
          let finalWishlist = [...wishlist];

          if (serverData) {
            const serverCart = serverData.cart || [];
            const combined = [...serverCart, ...cart];
            finalCart = normalizeAndConsolidateCart(combined);

            const serverWishlist = serverData.wishlist || [];
            const newWishlistItems = wishlist.filter(localItem =>
              !serverWishlist.some((serverItem) => serverItem.id === localItem.id)
            );
            finalWishlist = [...serverWishlist, ...newWishlistItems];
          }

          await saveUserData(currentUser.uid, { cart: finalCart, wishlist: finalWishlist });
          setCart(finalCart);
          setWishlist(finalWishlist);
          localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(finalCart));
          localStorage.setItem('ZARHRAH_WISHLIST', JSON.stringify(finalWishlist));
          setIsDataSynced(true);
        }
      } else {
        setUser(null);
        isFirstAuthRef.current = false;

        if (wasLoggedIn.current) {
          setCart([]);
          setWishlist([]);
          localStorage.removeItem(APP_STORAGE_KEY);
          localStorage.removeItem('ZARHRAH_WISHLIST');
          wasLoggedIn.current = false;
        }
        setIsDataSynced(true); // Instant sync ready for Guest
      }
    });

    return () => unsubAuth();
  }, []);

  // --- Real-time Realized Synchronization ---
  useEffect(() => {
    if (!user || !isDataSynced) return;

    const unsub = subscribeToUserData(user.uid, (data) => {
      if (data) {
        if (data.cart) {
          setCart((prev) => {
            const hasChanged = JSON.stringify(prev) !== JSON.stringify(data.cart);
            if (hasChanged) {
              localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data.cart));
              return data.cart;
            }
            return prev;
          });
        }
        if (data.wishlist) {
          setWishlist((prev) => {
            const hasChanged = JSON.stringify(prev) !== JSON.stringify(data.wishlist);
            if (hasChanged) {
              localStorage.setItem('ZARHRAH_WISHLIST', JSON.stringify(data.wishlist));
              return data.wishlist;
            }
            return prev;
          });
        }
      }
    });

    return () => unsub();
  }, [user, isDataSynced]);

  // --- Auto-Save Persistence & Admin Role Enforcement ---
  useEffect(() => {
    if (!isDataSynced) return;

    // 1. Mirror state to local storage immediately
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(cart));
    localStorage.setItem('ZARHRAH_WISHLIST', JSON.stringify(wishlist));

    // 2. Mirror state to Firestore if logged in
    if (user) {
      saveUserData(user.uid, { cart, wishlist });
    }

    // 3. Auto-Grant Admin Role
    // (Handled asynchronously via getStaffRole elsewhere)
    if (!user) {
      if (localStorage.getItem('ZARHRAH_ADMIN_SESSION')) {
        localStorage.removeItem('ZARHRAH_ADMIN_SESSION');
      }
    }
  }, [cart, wishlist, user, isDataSynced]);

  // --- Pure Cart Mutations ---
  const addToCart = useCallback((product: Product, quantity: number = 1, color?: string, size?: string) => {
    // Normalise incoming variants
    const normColor = color && color.trim() !== '' ? color.trim() : undefined;
    const normSize = size && size.trim() !== '' ? size.trim() : undefined;

    const finalColor = normColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);
    const finalSize = normSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    // Calculate total quantity of this product + variant currently in the cart from the synchronous ref
    const currentQtyInCart = cartStateRef.current.reduce((sum, item) => {
      const itemColor = item.selectedColor && item.selectedColor.trim() !== '' ? item.selectedColor.trim() : undefined;
      const itemSize = item.selectedSize && item.selectedSize.trim() !== '' ? item.selectedSize.trim() : undefined;
      const finalItemColor = itemColor || (item.colors && item.colors.length > 0 ? item.colors[0].name : undefined);
      const finalItemSize = itemSize || (item.sizes && item.sizes.length > 0 ? item.sizes[0] : undefined);

      return (item.id === product.id && finalItemColor === finalColor && finalItemSize === finalSize)
        ? sum + item.quantity
        : sum;
    }, 0);

    const remainingStock = Math.max(0, product.stock - currentQtyInCart);

    if (remainingStock <= 0) {
      showToast(`Maximum Limit Reached`, {
        type: 'warning',
        description: `All available stock (${product.stock} units) of "${product.name}" for selection (${finalColor || 'Default'}${finalSize ? ` / ${finalSize}` : ''}) is already in your cart.`
      });
      return;
    }

    let addedQty = quantity;
    if (quantity > remainingStock) {
      addedQty = remainingStock;
      showToast(`Cart Quantity Capped`, {
        type: 'info',
        description: `Only ${product.stock} units of "${product.name}" are available. Capped quantity in cart.`
      });
    } else {
      showToast(`Added to Bag`, {
        type: 'success',
        description: `Successfully added ${quantity} unit${quantity > 1 ? 's' : ''} of "${product.name}" to your bag.`
      });
    }

    setCart((prev) => {
      const newItems = [...prev, { ...product, quantity: addedQty, selectedColor: finalColor, selectedSize: finalSize }];
      const consolidated = normalizeAndConsolidateCart(newItems);
      // Update synchronous ref instantly to prevent race conditions on spammed clicks
      cartStateRef.current = consolidated;
      return consolidated;
    });
  }, [showToast]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const isExist = prev.some(p => p.id === product.id);
      return isExist ? prev.filter(p => p.id !== product.id) : [...prev, product];
    });
  }, []);

  const logView = useCallback((productId: string) => {
    dbLogView(productId, user?.uid);
  }, [user]);

  const updateCartItem = useCallback((index: number, quantity: number, color?: string, size?: string) => {
    const currentCart = cartStateRef.current;
    if (!currentCart[index]) return;

    // 1. Create a tentative updated cart list
    const newCart = [...currentCart];
    newCart[index] = { ...newCart[index], quantity, selectedColor: color, selectedSize: size };

    // 2. Consolidate variations
    const consolidated = normalizeAndConsolidateCart(newCart, (cappedName, cappedStock) => {
      showToast(`Selections Merged & Capped`, {
        type: 'warning',
        description: `Merging your selections for "${cappedName}" would exceed available stock. Capped at ${cappedStock} unit${cappedStock > 1 ? 's' : ''}.`
      });
    });

    // Update synchronous ref instantly
    cartStateRef.current = consolidated;
    setCart(consolidated);
  }, [showToast]);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => {
      const newCart = prev.filter((_, i) => i !== index);
      cartStateRef.current = newCart;
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    cartStateRef.current = [];
  }, []);

  const handleNewOrder = useCallback(async (order: Order) => {
    try {
      // Stock deduction is now securely handled by the Firebase Cloud Function webhook
      await saveOrder(order);
    } catch (err: any) {
      console.error("Failed to save pending order:", err);
    }
  }, []);



  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <LuxuryLoader />
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-[#C5A059] selection:text-white">
        <Navbar cartCount={cartCount} wishlistCount={wishlist.length} user={user} />

        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home products={products} setProducts={setProducts} layoutConfig={layoutConfig} footerPages={footerPages} onAddToCart={addToCart} onLogView={logView} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
            <Route path="/wishlist" element={<SuspenseWrapper><Wishlist wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} /></SuspenseWrapper>} />
            <Route path="/p/privacy-policy" element={<SuspenseWrapper><PrivacyPolicy /></SuspenseWrapper>} />
            <Route path="/p/:slug" element={<SuspenseWrapper><InfoPage footerPages={footerPages} /></SuspenseWrapper>} />
            <Route path="/signup" element={<SuspenseWrapper><Signup /></SuspenseWrapper>} />
            <Route path="/login" element={<SuspenseWrapper><Login /></SuspenseWrapper>} />
            <Route path="/forgot-password" element={<SuspenseWrapper><ForgotPassword /></SuspenseWrapper>} />

            <Route path="/orders" element={<SuspenseWrapper><Orders /></SuspenseWrapper>} />
            <Route
              path="/product/:id"
              element={
                <SuspenseWrapper>
                  <ProductDetail
                    products={products}
                    user={user}
                    onAddToCart={addToCart}
                    onLogView={logView}
                    onToggleWishlist={toggleWishlist}
                    wishlist={wishlist}
                  />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/checkout"
              element={
                <Checkout
                  cart={cart}
                  onRemoveFromCart={removeFromCart}
                  onUpdateCartItem={updateCartItem}
                  onClearCart={clearCart}
                  onOrderPlaced={handleNewOrder}
                  user={user}
                />
              }
            />
            <Route path="/admin"
              element={
                <React.Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400 text-xs uppercase tracking-widest">Loading Executive Panel...</div>}>
                  <ErrorBoundary>
                    <Admin
                      products={products}
                      layoutConfig={layoutConfig}
                      footerPages={footerPages}
                      setProducts={setProducts}
                      setLayoutConfig={setLayoutConfig}
                      setFooterPages={setFooterPages}
                    />
                  </ErrorBoundary>
                </React.Suspense>
              }
            />
            <Route path="/lookbook" element={<SuspenseWrapper><Lookbook onAddToCart={addToCart} /></SuspenseWrapper>} />
            <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
          </Routes>
        </main>

        <FloatingFeatures />
      </div>
    </Router>
  );
};

export default App;
