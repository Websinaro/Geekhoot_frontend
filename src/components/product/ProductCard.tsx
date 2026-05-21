import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { toast } from 'sonner';
import { Product } from '@/src/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWish = isInWishlist(product.id);

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full relative"
    >
      <Link to={`/product/${product.id}`} className="block flex-1">
        <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
           <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-[#ff5200] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm border-none shadow-sm">Hot Deal</Badge>
           </div>
           
           <button
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               toggleWishlist(product);
               if (isWish) {
                 toast.success(`${product.name} removed from wishlist`);
               } else {
                 toast.success(`${product.name} added to wishlist`);
               }
             }}
             className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 text-gray-400 hover:text-red-500 dark:hover:text-red-500 shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer border-none"
             title={isWish ? "Remove from wishlist" : "Add to wishlist"}
           >
             <Heart className={cn("w-4 h-4 transition-colors", isWish ? "fill-red-500 text-red-500" : "text-gray-400")} />
           </button>

          <img
            src={(Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : ''}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-gray-400 font-medium mb-1">{product.category}</p>
          <h3 className="font-semibold text-base text-gray-900 group-hover:text-[#ff5200] transition-colors line-clamp-2 mb-2">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold items-center gap-1">
              {Number(product.rating || 0).toFixed(1)} <Star className="w-2.5 h-2.5 fill-white" />
            </div>
            <span className="text-xs text-gray-400 font-medium">({product._count?.reviews || 0})</span>
          </div>

          <div className="mt-auto">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-lg font-extrabold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex">
                  <span className="text-[10px] bg-green-50/80 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200/35">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4 pt-0">
        <button 
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart(e);
          }}
          disabled={product.stock === 0}
          className="w-full h-10 bg-black text-white hover:bg-[#ff5200] rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 border-none shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" /> Add To Cart
        </button>
      </div>
    </motion.div>
  );
}
