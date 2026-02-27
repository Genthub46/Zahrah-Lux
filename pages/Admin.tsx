import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, BarChart3, BellRing, LayoutGrid, FileText, Lock
} from 'lucide-react';
import { Product, Order, ViewLog, RestockRequest, HomeLayoutConfig, FooterPage, Brand, Review } from '../types';
import { auth } from '../services/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  seedInitialData,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToLogs,
  subscribeToRequests,
  subscribeToPages,
  subscribeToBrands,
  subscribeToReviews
} from '../services/dbUtils';
import { INITIAL_PRODUCTS, INITIAL_FOOTER_PAGES, INITIAL_HOME_LAYOUT, ADMIN_EMAILS } from '../constants';

import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import AdminLogin from '../components/Admin/AdminLogin';
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminMobileHeader from '../components/Admin/AdminMobileHeader';
import ProductsTab from '../components/Admin/ProductsTab';
import OrdersTab from '../components/Admin/OrdersTab';
import RequestsTab from '../components/Admin/RequestsTab';
import LayoutTab from '../components/Admin/LayoutTab';
import PagesTab from '../components/Admin/PagesTab';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';

interface AdminProps {
  products: Product[];
  layoutConfig: HomeLayoutConfig;
  footerPages: FooterPage[];
  setLayoutConfig: React.Dispatch<React.SetStateAction<HomeLayoutConfig>>;
  setFooterPages: React.Dispatch<React.SetStateAction<FooterPage[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Admin: React.FC<AdminProps> = ({
  products: initialProducts = [],
  layoutConfig,
  footerPages: initialFooterPages = [],
  setLayoutConfig,
  setFooterPages: setPropsFooterPages,
  setProducts: setPropsProducts,
}) => {
  const navigate = useNavigate();

  // Core State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewLogs, setViewLogs] = useState<ViewLog[]>([]);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [footerPages, setFooterPages] = useState<FooterPage[]>(initialFooterPages);

  // Extra Data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Subscriptions ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsAuthChecking(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return; // Only subscribe if logged in

    const unsubProducts = subscribeToProducts(setProducts);
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubLogs = subscribeToLogs(setViewLogs);
    const unsubRequests = subscribeToRequests(setRestockRequests);
    const unsubPages = subscribeToPages(setFooterPages);
    const unsubBrands = subscribeToBrands((data) => {
      setBrands(data.sort((a, b) => a.name.localeCompare(b.name)));
    });
    const unsubReviews = subscribeToReviews(setReviews);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubLogs();
      unsubRequests();
      unsubPages();
      unsubBrands();
      unsubReviews();
    };
  }, [isLoggedIn]);

  const handleLogout = useCallback(() => {
    signOut(auth).then(() => {
      setIsLoggedIn(false);
      navigate('/');
    });
  }, [navigate]);

  const handleRepairDatabase = () => {
    if (!window.confirm("CAUTION: This will RESET all products, orders, and layout settings to their initial defaults. Are you sure you want to proceed?")) {
      return;
    }

    seedInitialData(INITIAL_PRODUCTS, INITIAL_HOME_LAYOUT, INITIAL_FOOTER_PAGES)
      .then(() => alert("Database Repaired Successfully!"))
      .catch(err => {
        console.error(err);
        alert("Database Repair Failed.");
      });
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'requests', label: 'Waitlist', icon: BellRing },
    { id: 'pages', label: 'Boutique Pages', icon: FileText },
    { id: 'layout', label: 'Home Layout', icon: LayoutGrid }
  ];

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center text-white">Loading Security Protocols...</div>;
  }

  if (!isLoggedIn) {
    return <AdminLogin />;
  }

  const currentUser = auth.currentUser;
  const isAuthorized = currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-red-500/10 p-4 rounded-full mb-6">
          <Lock size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest mb-4">Access Denied</h1>
        <p className="text-stone-400 max-w-md mb-8">
          The account <strong>{currentUser?.email}</strong> is not authorized to access the Zarhrah Executive Panel.
          This incident has been logged.
        </p>
        <button onClick={() => { signOut(auth).then(() => navigate('/')); }} className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
          Return to Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col lg:flex-row font-sans selection:bg-[#C5A059] selection:text-white">

      <AdminMobileHeader
        activeTab={activeTab}
        onMenuClick={() => setIsSidebarOpen(true)}
        userEmail={currentUser?.email || ''}
      />

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        onLogout={handleLogout}
        onRepairDatabase={handleRepairDatabase}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 lg:ml-72 p-6 lg:p-20 pt-[100px] lg:pt-32">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tighter uppercase mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[3px] bg-[#C5A059]" />
              <p className="text-[10px] text-stone-400 uppercase tracking-[0.4em] font-bold">Zarhrah Executive Panel</p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'products' && (
              <ProductsTab products={products} brands={brands} />
            )}

            {activeTab === 'orders' && (
              <OrdersTab orders={orders} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard orders={orders} viewLogs={viewLogs} products={products} />
            )}

            {activeTab === 'requests' && (
              <RequestsTab restockRequests={restockRequests} products={products} reviews={reviews} />
            )}

            {activeTab === 'layout' && (
              <LayoutTab layoutConfig={layoutConfig} setLayoutConfig={setLayoutConfig} products={products} />
            )}

            {activeTab === 'pages' && (
              <PagesTab footerPages={footerPages} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;
