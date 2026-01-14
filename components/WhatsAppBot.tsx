
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface WhatsAppBotProps {
  isStatic?: boolean;
  className?: string;
}

const WhatsAppBot: React.FC<WhatsAppBotProps> = ({ isStatic = false, className = '' }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const location = useLocation();
  const whatsappUrl = "https://wa.me/2348186626350";

  // Hide on mobile product pages OR on Home page if not static (managed by Home footer)
  const isProductPage = location.pathname.startsWith('/product/');
  const isHomePage = location.pathname === '/';

  if (!isStatic && isHomePage) return null; // Let Home footer handle it

  const containerClasses = isStatic
    ? `flex flex-col items-end ${className}`
    : `fixed bottom-8 right-8 z-[60] flex flex-col items-end ${isProductPage ? 'hidden md:flex' : 'flex'} ${className}`;

  return (
    <div className={containerClasses}>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="bg-stone-900 text-white px-4 py-2 rounded-sm text-[10px] font-bold tracking-[0.2em] uppercase mb-3 shadow-2xl border border-white/10 whitespace-nowrap"
          >
            Boutique Support
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-stone-100 group"
      >
        <div className="absolute inset-0 rounded-full border border-[#C5A059]/20 animate-ping opacity-30" />
        <div className="absolute inset-0 rounded-full border border-[#C5A059]/10 animate-pulse" />
        <MessageCircle className="w-7 h-7 text-stone-900 group-hover:text-[#C5A059] transition-colors" />

        {/* Active Dot */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </motion.a>
    </div>
  );
};

export default WhatsAppBot;