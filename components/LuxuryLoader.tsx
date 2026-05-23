import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const LuxuryLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to show the beautiful loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[99999] bg-[#0c0a09] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle animated background gradient */}
          <motion.div 
            className="absolute inset-0 opacity-30"
            animate={{ 
              background: [
                'radial-gradient(circle at 50% 50%, rgba(197, 160, 89, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(197, 160, 89, 0.2) 0%, transparent 70%)',
                'radial-gradient(circle at 50% 50%, rgba(197, 160, 89, 0.1) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            <Logo size={120} className="mb-6 drop-shadow-2xl" />
            <motion.div 
              className="h-[1px] bg-[#C5A059]"
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LuxuryLoader;
