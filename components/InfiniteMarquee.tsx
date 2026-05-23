import React from 'react';
import { motion } from 'framer-motion';

const InfiniteMarquee: React.FC = () => {
  const text = "ZARHRAH LUXURY COLLECTIONS • NEW ARRIVALS • WORLDWIDE SHIPPING • EXCLUSIVE PIECES • ";

  return (
    <div className="bg-[#C5A059] text-white py-1.5 overflow-hidden flex whitespace-nowrap">
      <motion.div
        className="flex min-w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30
        }}
      >
        <div className="flex px-2">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase pr-2">{text}</span>
          <span className="text-[9px] font-black tracking-[0.3em] uppercase pr-2">{text}</span>
          <span className="text-[9px] font-black tracking-[0.3em] uppercase pr-2">{text}</span>
        </div>
        <div className="flex px-2">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase pr-2">{text}</span>
          <span className="text-[9px] font-black tracking-[0.3em] uppercase pr-2">{text}</span>
          <span className="text-[9px] font-black tracking-[0.3em] uppercase pr-2">{text}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default InfiniteMarquee;
