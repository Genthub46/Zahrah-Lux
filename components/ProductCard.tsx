import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onLogView?: (id: string) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onLogView,
  onToggleWishlist,
  isWishlisted
}) => {
  const navigate = useNavigate();
  const isSoldOut = product.stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group cursor-pointer relative"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-[4/5] bg-[#F5F5F4] rounded-lg overflow-hidden flex items-center justify-center p-6 relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105 ${isSoldOut ? 'grayscale' : ''}`}
        />

        {/* Floating Heart Icon */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform z-10"
          >
            <Heart
              size={16}
              className={`transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-stone-400'}`}
            />
          </button>
        )}

        {isSoldOut && (
          <div className="absolute top-4 left-4">
            <span className="bg-stone-900 text-white px-3 py-1 text-[7px] font-bold tracking-widest uppercase rounded">Sold Out</span>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-1.5 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-[8px] font-black gold-text uppercase tracking-[0.3em]">{product.brand}</span>
          <span className="w-1 h-1 bg-stone-300 rounded-full" />
          <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">{product.category}</span>
        </div>

        <h3 className="text-sm font-bold text-stone-900 leading-tight tracking-tight">
          {product.name}
        </h3>

        {/* Color Swatches - Reflectable on the Card */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex space-x-1.5 py-1">
            {product.colors.slice(0, 5).map((c, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-stone-200 shadow-sm"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[8px] text-stone-400 font-bold">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        <p className="text-sm font-bold text-stone-900">
          N{product.price.toLocaleString()}
        </p>

        {!isSoldOut && (
          <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-1">
            {product.stock} Units Remaining
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;