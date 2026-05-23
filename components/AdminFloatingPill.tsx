import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LayoutGrid, Package, ShoppingCart, BellRing, Eye, Settings } from 'lucide-react';

const AdminFloatingPill: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = () => {
      const savedSession = localStorage.getItem('ZARHRAH_ADMIN_SESSION');
      if (savedSession) {
        const { expiry } = JSON.parse(savedSession);
        if (Date.now() < expiry) {
          setIsAdmin(true);
          return;
        }
      }
      setIsAdmin(false);
    };

    checkSession();
    // Verify periodically
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  if (!isAdmin || location.pathname.startsWith('/admin')) return null;

  const menuItems = [
    { label: 'Executive Dashboard', tab: 'dashboard', icon: LayoutGrid },
    { label: 'Products Inventory', tab: 'products', icon: Package },
    { label: 'Home Layouts', tab: 'layout', icon: Settings },
    { label: 'Pending Orders', tab: 'orders', icon: ShoppingCart },
    { label: 'Waitlist Requests', tab: 'requests', icon: BellRing },
  ];

  const handleNavigate = (tab: string) => {
    navigate(`/admin?tab=${tab}`);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[70] flex flex-col items-start font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mb-4 bg-stone-900/95 backdrop-blur-xl border border-[#C5A059]/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-w-[240px]"
          >
            <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
              <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#C5A059]" /> Executive Console
              </span>
              <span className="text-[8px] bg-[#C5A059]/20 text-[#C5A059] px-2 py-0.5 rounded font-black tracking-widest uppercase animate-pulse">
                Session Active
              </span>
            </div>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => handleNavigate(item.tab)}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-300 hover:text-white hover:bg-[#C5A059]/10 hover:border hover:border-[#C5A059]/20 border border-transparent transition-all group"
                  >
                    <Icon size={13} className="text-stone-400 group-hover:text-[#C5A059] transition-colors" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-3 bg-stone-900/95 backdrop-blur-md border border-[#C5A059]/30 text-white px-5 py-3.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-[#C5A059] transition-all group"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#C5A059]/20 rounded-full animate-ping opacity-75" />
          <ShieldCheck size={16} className="text-[#C5A059] relative z-10" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.25em]">Admin Console</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <span className="text-[8px] text-[#C5A059]">▲</span>
        </motion.div>
      </motion.button>
    </div>
  );
};

export default AdminFloatingPill;
