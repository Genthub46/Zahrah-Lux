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
  addRestockRequest,
  logView as dbLogView,
  updateProduct,
  saveUserData,
  subscribeToUserData,
  getUserData
} from './services/dbUtils';

import { ToastProvider } from './contexts/ToastContext';
import { isAdminEmail } from './services/adminPermissions';

const App: React.FC = () => {
  // ... existing state/effects ...
  // (leaving internal logic unchanged as we just wrap the return)

  // Use local storage for Cart and Wishlist ONLY (Client-side persistence)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    let unsubUserData: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        wasLoggedIn.current = true;
      } else {
        setUser(null);
        // Only clear if we were previously logged in (Logout Action)
        // This prevents wiping Guest cart on initial load/refresh.
        // Also removed clear logic for now to check if it helps keep cart
        // But reverting to original safety:
        if (wasLoggedIn.current) {
          // We might want to keep cart for UX? No, clear for privacy.
          setCart([]);
          setWishlist([]);
          localStorage.removeItem(APP_STORAGE_KEY);
          localStorage.removeItem('ZARHRAH_WISHLIST');
          wasLoggedIn.current = false;
        }
        if (unsubUserData) unsubUserData();
      }
    });

    return () => {
      unsubAuth();
      if (unsubUserData) unsubUserData();
    };
  }, []);
  // Wait, if I add wasLoggedIn to dependency, the effect re-runs.
  // Re-running onAuthStateChanged is fine, it just returns an unsub.
  // BUT `onAuthStateChanged` fires immediately on re-subscription.
  // Better to use a Ref for `wasLoggedIn` to avoid re-subscribing.

  // Sync Logic
  const [isDataSynced, setIsDataSynced] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsDataSynced(false);
      return;
    }

    // When user logs in, we subscribe.
    // But we also want to merge ONCE.

    let unsubUserData: (() => void) | undefined;

    const merger = async () => {
      // Merge Local to Server (happens once on mount/login)
      const serverData = await getUserData(user.uid);

      let finalCart = [...cart]; // Start with local cart
      let finalWishlist = [...wishlist];

      if (serverData) {
        // --- Merge Carts (Sum Quantities) ---
        const serverCart: CartItem[] = serverData.cart || [];

        // We want to merge local items INTO server items
        // 1. Create a map or just iterate? Iteration is fine for small carts.
        // Base is Server Cart
        const mergedCart = [...serverCart];

        cart.forEach(localItem => {
          const existingIdx = mergedCart.findIndex(serverItem =>
            serverItem.id === localItem.id &&
            serverItem.selectedSize === localItem.selectedSize &&
            serverItem.selectedColor === localItem.selectedColor
          );

          if (existingIdx > -1) {
            // Item exists in server cart: Sum quantity
            mergedCart[existingIdx] = {
              ...mergedCart[existingIdx],
              quantity: mergedCart[existingIdx].quantity + localItem.quantity
            };
          } else {
            // Item is new to server cart: Add it
            mergedCart.push(localItem);
          }
        });
        finalCart = mergedCart;

        // --- Merge Wishlist (Dedup) ---
        const serverWishlist: Product[] = serverData.wishlist || [];
        const newWishlistItems = wishlist.filter(localItem =>
          !serverWishlist.some((serverItem) => serverItem.id === localItem.id)
        );
        finalWishlist = [...serverWishlist, ...newWishlistItems];
      }

      // Save merged state to Server
      // We only strictly need to save if we actually merged something differently?
      // But safety first: ensure server has the master state.
      await saveUserData(user.uid, { cart: finalCart, wishlist: finalWishlist });

      // Update local state to match the merged result immediately
      // This prevents the "flash" before the subscription callback hits
      setCart(finalCart);
      setWishlist(finalWishlist);
      setIsDataSynced(true); // Mark sync as complete
    };

    // Run merge then subscribe
    merger().then(() => {
      // Subscription handles updates from other devices
      const unsub = subscribeToUserData(user.uid, (data) => {
        if (data) {
          if (data.cart) setCart(data.cart);
          if (data.wishlist) setWishlist(data.wishlist);
        }
      });
      unsubUserData = unsub;
    });

    return () => {
      if (unsubUserData) unsubUserData();
    };
  }, [user]);

  // --- Persistence Effect (Local & Server key-stroke updates) ---
  useEffect(() => {
    // 1. Guest Persistence (LocalStorage)
    if (!user) {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(cart));
      localStorage.setItem('ZARHRAH_WISHLIST', JSON.stringify(wishlist));
      return;
    }

    // Auto-Grant Admin Role
    if (user.email && isAdminEmail(user.email)) {
      const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      const session = { authenticated: true, expiry };
      localStorage.setItem('ZARHRAH_ADMIN_SESSION', JSON.stringify(session));
    } else {
      // If logged in as non-admin, ensure they don't have admin access from a previous session
      if (localStorage.getItem('ZARHRAH_ADMIN_SESSION')) {
        // Optional: Check if the session is valid? 
        // For now, let's enforce strict role based on email if they are logged in.
        // But if they accessed via passcode, they might be using a personal account?
        // Let's stick to: If admin@zarah.com, GRANT. If specific non-admins need to be restricted, we can add that later.
        // User asked "Change from customer to admin and others to customer".
        // So strict enforcement seems requested.
        localStorage.removeItem('ZARHRAH_ADMIN_SESSION');
      }
    }

    // 2. User Persistence (Firestore) - Auto-save changes
    // Debounce reduced to 500ms to minimize data loss on quick logout
    const timeoutId = setTimeout(() => {
      // ONLY save if we have finished initial sync!
      if (wasLoggedIn.current && isDataSynced) {
        saveUserData(user.uid, { cart, wishlist });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cart, wishlist, user, isDataSynced]);


  const addToCart = useCallback((product: Product, quantity: number = 1, color?: string, size?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) =>
        item.id === product.id &&
        item.selectedColor === color &&
        item.selectedSize === size
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity
        };
        return newCart;
      }

      return [...prev, { ...product, quantity, selectedColor: color, selectedSize: size }];
    });
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const isExist = prev.some(p => p.id === product.id);
      if (isExist) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const logView = useCallback((productId: string) => {
    dbLogView(productId, user?.uid);
  }, [user]);

  const updateCartItem = useCallback((index: number, quantity: number, color?: string, size?: string) => {
    setCart((prev) => {
      const newCart = [...prev];
      if (newCart[index]) {
        newCart[index] = { ...newCart[index], quantity, selectedColor: color, selectedSize: size };
        const consolidated: CartItem[] = [];
        newCart.forEach((item) => {
          const existingIdx = consolidated.findIndex(c =>
            c.id === item.id &&
            c.selectedColor === item.selectedColor &&
            c.selectedSize === item.selectedSize
          );
          if (existingIdx > -1) {
            consolidated[existingIdx] = {
              ...consolidated[existingIdx],
              quantity: consolidated[existingIdx].quantity + item.quantity
            };
          } else {
            consolidated.push(item);
          }
        });
        return consolidated;
      }
      return prev;
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const handleNewOrder = useCallback((order: Order) => {
    saveOrder(order);

    order.items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        updateProduct(product.id, { stock: newStock });
      }
    });
  }, [products]);



  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-[#C5A059] selection:text-white">
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
            </Routes>
          </main>

          <WhatsAppBot />
          <CookieConsent />
        </div>
      </ToastProvider>
    </Router>
  );
};

export default App;
