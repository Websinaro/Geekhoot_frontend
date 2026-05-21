import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/src/types/index';
import api from '@/src/services/api';
import { useAuthStore } from './authStore';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      fetchWishlist: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        set({ isLoading: true });
        try {
          const { data } = await api.get('/wishlist');
          const products = data.map((item: any) => item.product);
          set({ items: products });
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      toggleWishlist: async (product) => {
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);
        
        // Optimistic update
        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }

        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            await api.post('/wishlist/toggle', { productId: product.id });
          } catch (error) {
            console.error("Failed to toggle wishlist item in database:", error);
            // Revert state on failure
            set({ items });
          }
        }
      },
      removeFromWishlist: async (id) => {
        const items = get().items;
        set({ items: items.filter((item) => item.id !== id) });

        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            await api.delete(`/wishlist/${id}`);
          } catch (error) {
            console.error("Failed to remove item from database wishlist:", error);
            // Revert state on failure
            set({ items });
          }
        }
      },
      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id);
      },
      clearWishlist: async () => {
        const items = get().items;
        set({ items: [] });

        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            await api.delete('/wishlist');
          } catch (error) {
            console.error("Failed to clear wishlist in database:", error);
            set({ items });
          }
        }
      },
    }),
    {
      name: 'wishlist-storage',
      // Only persist the product list locally for instant UI rendering
      partialize: (state) => ({ items: state.items }),
    }
  )
);
