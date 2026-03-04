import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, BarChart3, BellRing, LayoutGrid, FileText, Lock, Users, DollarSign
} from 'lucide-react';
import { Product, Order, ViewLog, RestockRequest, HomeLayoutConfig, FooterPage, Brand, Review, UserProfile } from '../types';
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
  subscribeToReviews,
  subscribeToUsers
} from '../services/dbUtils';
import { INITIAL_PRODUCTS, INITIAL_FOOTER_PAGES, INITIAL_HOME_LAYOUT } from '../constants';
import { isAdminEmail, getAdminRole } from '../services/adminPermissions';
import { useToast } from '../contexts/ToastContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

// Sub-components
import AdminLogin from '../components/Admin/AdminLogin';
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminMobileHeader from '../components/Admin/AdminMobileHeader';
import ProductsTab from '../components/Admin/ProductsTab';
import OrdersTab from '../components/Admin/OrdersTab';
import RequestsTab from '../components/Admin/RequestsTab';
import LayoutTab from '../components/Admin/LayoutTab';
import PagesTab from '../components/Admin/PagesTab';
import ActivityLogTab from '../components/Admin/ActivityLogTab';
import CustomersTab from '../components/Admin/CustomersTab';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import DashboardTab from '../components/Admin/DashboardTab';
import PricingTab from '../components/Admin/PricingTab';
import { updateProduct } from '../services/dbUtils';

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
  const { showToast } = useToast();

  // Core State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewLogs, setViewLogs] = useState<ViewLog[]>([]);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [footerPages, setFooterPages] = useState<FooterPage[]>(initialFooterPages);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Extra Data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Session Timeout
  const { isWarningVisible, remainingSeconds, extendSession } = useSessionTimeout({
    timeoutMinutes: 15,
    warningMinutes: 1,
    enabled: isLoggedIn,
    onTimeout: () => {
      signOut(auth).then(() => {
        setIsLoggedIn(false);
        navigate('/');
      });
    },
  });

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
    const unsubUsers = subscribeToUsers((data) => setUsers(data as UserProfile[]));
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
      unsubUsers();
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
      .then(() => showToast("Database Repaired Successfully!", { type: 'success' }))
      .catch(err => {
        console.error(err);
        showToast("Database Repair Failed.", { type: 'error' });
      });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'pricing', label: 'Pricing AI', icon: DollarSign }, // New Tab
    { id: 'requests', label: 'Waitlist', icon: BellRing },
    { id: 'pages', label: 'Boutique Pages', icon: FileText },
    { id: 'layout', label: 'Home Layout', icon: LayoutGrid },
    { id: 'activity', label: 'Activity Log', icon: FileText }
  ];

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center text-white">Loading Security Protocols...</div>;
  }

  if (!isLoggedIn) {
    return <AdminLogin />;
  }

  const currentUser = auth.currentUser;
  const adminRole = currentUser ? getAdminRole(currentUser.email) : null;
  const isAuthorized = !!adminRole;

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

      {/* Session Timeout Warning Modal */}
      <AnimatePresence>
        {isWarningVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                  <Clock size={32} className="text-amber-600" />
                </div>
              </div>
              <h2 className="text-xl font-black text-center uppercase tracking-widest text-stone-900 mb-2">
                Session Expiring
              </h2>
              <p className="text-center text-stone-500 text-sm mb-6">
                Your session will expire in <span className="font-bold text-amber-600">{remainingSeconds}</span> seconds due to inactivity.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    signOut(auth).then(() => {
                      setIsLoggedIn(false);
                      navigate('/');
                    });
                  }}
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Logout Now
                </button>
                <button
                  onClick={extendSession}
                  className="flex-1 px-4 py-3 bg-[#C5A059] rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-[#b8944e] transition-colors"
                >
                  Stay Logged In
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <h1 className="text-4xl md:text-6xl font-serif font-black text-stone-900 tracking-tighter uppercase mb-2">
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
            {activeTab === 'dashboard' && (
              <DashboardTab
                orders={orders}
                products={products}
                users={users}
                onNavigate={setActiveTab}
                role={adminRole}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab products={products} brands={brands} orders={orders} />
            )}

            {activeTab === 'customers' && (
              <CustomersTab users={users} orders={orders} />
            )}

            {activeTab === 'orders' && (
              <OrdersTab orders={orders} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard orders={orders} viewLogs={viewLogs} products={products} />
            )}

            {activeTab === 'pricing' && (
              <PricingTab
                products={products}
                orders={orders}
                onUpdatePrice={async (id, price) => {
                  await updateProduct(id, { price });
                  showToast(`Price updated to ₦${price.toLocaleString()}`, { type: 'success' });
                }}
              />
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

            {activeTab === 'activity' && (
              <ActivityLogTab />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;
