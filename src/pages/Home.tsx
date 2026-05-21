import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Zap, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/src/services/api';
import ProductCard from '@/src/components/product/ProductCard';
import { cn } from '@/lib/utils';
import { Product } from '@/src/types';

const FEATURED_CATEGORIES = [
  { name: 'Custom T-Shirts', icon: '👕' },
  { name: 'Name Slips', icon: '🏷️' },
  { name: 'Printed Bottles', icon: '🍼' },
  { name: 'Custom Cups', icon: '☕' },
  { name: 'Photo Frames', icon: '🖼️' },
  { name: 'Keychain', icon: '🔑' },
  { name: 'Stationery', icon: '✏️' },
  { name: 'Tech Gadgets', icon: '⌚' },
];

export default function Home() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=8');
      return data.products as Product[];
    },
  });

  const featuredProducts = data || [];

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen transition-colors duration-200">
      {/* Category Navigation Bar */}
      <section className="bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-900 py-4 shadow-sm overflow-x-auto scrollbar-hide transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 gap-8 min-w-max">
          {FEATURED_CATEGORIES.map((cat, i) => (
            <div
              key={i}
              onClick={() => navigate(`/products?category=${cat.name}`)}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-3xl transition-transform group-hover:scale-110">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-[#ff5200] dark:group-hover:text-[#ff5200]">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Simple Hero Banner */}
        <section className="relative h-[300px] md:h-[450px] w-full rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 mb-12 shadow-md">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative h-full flex items-center px-8 md:px-16 text-white z-10">
            <div className="max-w-xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Quality Custom Prints for Your Lifestyle</h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">Personalized gifts, apparel, and gadgets delivered with precision.</p>
              <Button 
                size="lg" 
                className="bg-[#fb641b] hover:bg-[#ff5200] text-white font-bold h-12 px-8 rounded-sm shadow-lg border-none" 
                onClick={() => navigate('/products')}
              >
                Shop Now
              </Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 hidden lg:block">
            <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
          </div>
        </section>

        {/* Featured Products List */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm mb-12 transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white underline decoration-[#ff5200] underline-offset-8">Featured Product Arrivals</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')} 
              className="rounded-sm border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-zinc-800 font-bold"
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-50 dark:bg-zinc-800 rounded animate-pulse"></div>
              ))
            ) : (
              featuredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>

        {/* Brand Promises */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="flex items-center gap-4 p-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100/65 dark:border-blue-900/30 transition-colors">
             <Truck className="w-8 h-8 text-blue-600" />
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Fast Shipping</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Express delivery within 48-72 hours</p>
             </div>
           </div>
           <div className="flex items-center gap-4 p-6 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-100/65 dark:border-green-900/30 transition-colors">
             <ShieldCheck className="w-8 h-8 text-green-600" />
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Quality Assured</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Every product goes through multi-level QC</p>
             </div>
           </div>
           <div className="flex items-center gap-4 p-6 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-100/65 dark:border-orange-900/30 transition-colors">
             <Zap className="w-8 h-8 text-[#ff5200]" />
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Easy Support</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Direct WhatsApp support for orders</p>
             </div>
           </div>
        </div>

        {/* Trending Section Overlay */}
        <section className="bg-gray-900 rounded-xl overflow-hidden relative p-12 md:p-24 text-center">
           <div className="absolute inset-0 bg-gradient-to-br from-[#ff5200]/20 to-blue-500/20 opacity-50"></div>
           <div className="relative z-10 max-w-2xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight italic">Unleash Your Creativity</h2>
             <p className="text-gray-400 mb-10 text-lg">Join thousands of customers who trust Geekhoot for their custom printing needs. High quality, zero compromises.</p>
             <Button 
                onClick={() => navigate('/products')} 
                className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-10 h-14 rounded-sm text-lg"
              >
                Explore Full Collection
             </Button>
           </div>
        </section>
      </div>
    </div>
  );
}
