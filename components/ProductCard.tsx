import React from 'react';
import { Product } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onLogView?: (id: string) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  dark?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onLogView,
  onToggleWishlist,
  isWishlisted,
  dark = false
}) => {
  const navigate = useNavigate();
  const isSoldOut = product.stock <= 0;
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Reset index when product changes
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  const hasMultipleImages = product.images.length > 1;

  const toggleImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? 1 : 0);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group/card cursor-pointer relative block"
    >
      <div
        className={`aspect-[4/5] rounded-sm overflow-hidden flex items-center justify-center p-6 relative ${dark ? 'bg-stone-800' : 'bg-[#F9F9F8]'}`}
      >
        <img
          src={getOptimizedImageUrl(product.images[currentImageIndex] || product.images[0])}
          alt={product.name}
          width="500"
          height="625"
          loading="lazy"
          className={`max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover/card:scale-105 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
        />

        {/* Manual Image Swap Button - Minimalist */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
            {product.images.slice(0, 3).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === idx ? 'bg-stone-800 scale-125' : 'bg-stone-300 hover:bg-stone-500'}`}
              />
            ))}
          </div>
        )}

        {/* Quick Add Button */}
        {!isSoldOut && onAddToCart && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product, 1);
            }}
            className="absolute bottom-0 inset-x-0 bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest py-3 translate-y-full group-hover/card:translate-y-0 transition-transform duration-300 ease-in-out z-20 flex items-center justify-center gap-2 hover:bg-[#b08d4b]"
          >
            <span>Quick Add</span>
          </button>
        )}

        {/* Floating Heart Icon - Premium Minimal */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="group/btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/90 transition-all z-10"
          >
            <Heart
              size={18}
              strokeWidth={1.5}
              className={`transition-colors duration-300 ${isWishlisted ? 'text-[#C5A059] fill-[#C5A059]' : 'text-stone-400 hover:text-stone-900'}`}
            />
          </button>
        )}

        {isSoldOut && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="px-4 py-2 border border-stone-900 bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] font-bold uppercase tracking-[0.2em]">
              Sold Out
            </div>
          </div>
        )}

        {!isSoldOut && product.stock < 5 && (
          <div className="absolute top-3 left-3 z-20">
            <div className="px-3 py-1 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
              Low Stock
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 px-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">{product.brand}</span>
          {product.colors && product.colors.length > 0 && (
            <div className="flex justify-center md:justify-end gap-1">
              {product.colors.slice(0, 3).map((c, i) => (
                <div key={i} className={`w-2 h-2 rounded-full border ${dark ? 'border-stone-600' : 'border-stone-200'}`} style={{ backgroundColor: c.hex }} />
              ))}
              {product.colors.length > 3 && <span className="text-[9px] text-stone-400">+</span>}
            </div>
          )}
        </div>

        <h3
          className={`text-base font-serif leading-snug tracking-wide group-hover/card:text-[#C5A059] transition-colors duration-300 ${dark ? 'text-white' : 'text-stone-900'}`}
        >
          {product.name}
        </h3>

        <div className="mt-2 flex items-center justify-center md:justify-start gap-3">
          <p className={`text-sm font-medium tracking-wide ${dark ? 'text-stone-300' : 'text-stone-900'}`}>
            ₦{product.price.toLocaleString()}
          </p>
          {!isSoldOut && product.stock < 5 && (
            <span className="text-[9px] text-[#C5A059] font-bold uppercase tracking-wider">
              Low Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;