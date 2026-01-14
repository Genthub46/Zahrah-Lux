import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group/card cursor-pointer relative"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div
        className={`aspect-[4/5] rounded-lg overflow-hidden flex items-center justify-center p-6 relative ${dark ? 'bg-stone-800' : 'bg-[#F5F5F4]'}`}
      >
        <img
          src={getOptimizedImageUrl(product.images[currentImageIndex] || product.images[0])}
          alt={product.name}
          width="500"
          height="625"
          className={`max-h-full max-w-full object-contain transition-transform duration-700 group-hover/card:scale-105 ${isSoldOut ? 'grayscale' : ''}`}
        />

        {/* Manual Image Swap Button */}
        {hasMultipleImages && (
          <button
            onClick={toggleImage}
            className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-stone-600 hover:text-stone-900 hover:scale-110 transition-all z-20"
            title="Switch View"
          >
            <div className="flex gap-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${currentImageIndex === 0 ? 'bg-stone-800' : 'bg-stone-300'}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${currentImageIndex === 1 ? 'bg-stone-800' : 'bg-stone-300'}`} />
            </div>
          </button>
        )}

        {/* Floating Heart Icon */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="group/btn absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform z-10"
          >
            <Heart
              size={16}
              className={`transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-stone-400'}`}
            />
            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </span>
          </button>
        )}

        {isSoldOut && (
          <div className="absolute top-4 left-4">
            <span className="bg-stone-900 text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded">Sold Out</span>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-1.5 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black gold-text uppercase tracking-[0.3em]">{product.brand}</span>
          <span className="w-1 h-1 bg-stone-300 rounded-full" />
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.category}</span>
        </div>

        <h3 className={`text-sm font-bold leading-tight tracking-tight ${dark ? 'text-white' : 'text-stone-900'}`}>
          {product.name}
        </h3>

        {/* Color Swatches - Reflectable on the Card */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex space-x-1.5 py-1">
            {product.colors.slice(0, 5).map((c, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full border shadow-sm ${dark ? 'border-stone-600' : 'border-stone-200'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[8px] text-stone-400 font-bold">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        <p className={`text-sm font-bold ${dark ? 'text-stone-300' : 'text-stone-900'}`}>
          N{product.price.toLocaleString()}
        </p>

        {!isSoldOut && (
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
            {product.stock} Units Remaining
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;