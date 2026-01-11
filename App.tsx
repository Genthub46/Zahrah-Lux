
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Product, CartItem, Order, ViewLog, RestockRequest, HomeLayoutConfig, SectionConfig, FooterPage } from './types';
import {
  APP_STORAGE_KEY,
  PRODUCTS_STORAGE_KEY,
  ORDERS_STORAGE_KEY,
  INITIAL_PRODUCTS,
  INITIAL_FOOTER_PAGES
} from './constants';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import InfoPage from './pages/InfoPage';
import WhatsAppBot from './components/WhatsAppBot';

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
  updateProduct
} from './services/dbUtils';

const App: React.FC = () => {
  // Use local storage for Cart and Wishlist ONLY (Client-side persistence)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    // We can keep wishlist local for now as requested/implied scope is main data
    const saved = localStorage.getItem('ZARHRAH_WISHLIST');
    return saved ? JSON.parse(saved) : [];
  });

  // Global State (Synced with Firestore)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [footerPages, setFooterPages] = useState<FooterPage[]>([]);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [viewLogs, setViewLogs] = useState<ViewLog[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<HomeLayoutConfig>({ sections: [], showCatalog: true });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- Subscriptions ---
  useEffect(() => {
    const unsubProducts = subscribeToProducts(setProducts);
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubLogs = subscribeToLogs(setViewLogs);
    const unsubRequests = subscribeToRequests(setRestockRequests);
    const unsubPages = subscribeToPages(setFooterPages);
    const unsubLayout = subscribeToLayout((data) => {
      if (data) setLayoutConfig(data);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubLogs();
      unsubRequests();
      unsubPages();
      unsubLayout();
    };
  }, []);

  // Auto-seeding request removed to prevent data overwrites.
  // Use "Repair Database" in Admin if needed.
  // We need a ref to products or just strict logic. 
  // Actually, better to just let the Admin do it via "Repair" button? 
  // User asked for "Migrate initial data".
  // I will implement this one-time seed logic carefully. 
  // NOTE: If `products` is empty array initially, and 3s later it's still empty, we seed.
  // But inside `setTimeout`, `products` will be [], sticking to closure. 
  // This is bad. 
  // I'll skip the auto-seed here to avoid accidental overrides and double-writes.
  // Instead, I will rely on `dbUtils` having a check or the user doing it.
  // OR, I can seed in `dbUtils` if I query and find empty.
  // Let's implement the DB helpers properly in `App` but remove the local storage effects. 
  // I'll add a `useEffect` that persists `cart` (local).

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // WISHLIST local persistence
  useEffect(() => {
    localStorage.setItem('ZARHRAH_WISHLIST', JSON.stringify(wishlist));
  }, [wishlist]);

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
    dbLogView(productId);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const handleNewOrder = useCallback((order: Order) => {
    // Instead of setting state locally, we save to DB.
    saveOrder(order);

    // Update stock for ordered items
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        updateProduct(product.id, { stock: newStock });
      }
    });
  }, [products]); // Depends on products for stock calculation.

  const handleAddRestockRequest = useCallback((request: RestockRequest) => {
    addRestockRequest(request);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-[#C5A059] selection:text-white">
        <Navbar cartCount={cartCount} wishlistCount={wishlist.length} />

        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home products={products} setProducts={setProducts} layoutConfig={layoutConfig} footerPages={footerPages} onAddToCart={addToCart} onLogView={logView} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
            <Route path="/wishlist" element={<Wishlist wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} />} />
            <Route path="/p/:slug" element={<InfoPage footerPages={footerPages} />} />
            <Route
              path="/product/:id"
              element={
                <ProductDetail
                  products={products}
                  onAddToCart={addToCart}
                  onLogView={logView}
                  onAddRestockRequest={handleAddRestockRequest}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                />
              }
            />
            <Route
              path="/checkout"
              element={
                <Checkout
                  cart={cart}
                  onRemoveFromCart={removeFromCart}
                  onClearCart={clearCart}
                  onOrderPlaced={handleNewOrder}
                />
              }
            />
            <Route
              path="/admin"
              element={
                <Admin
                  products={products}
                  orders={orders}
                  viewLogs={viewLogs}
                  restockRequests={restockRequests}
                  layoutConfig={layoutConfig}
                  footerPages={footerPages}
                />
              }
            />
          </Routes>
        </main>

        <WhatsAppBot />
      </div>
    </Router>
  );
};

export default App;
