import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LogOut, Package, LayoutDashboard, Bell, Sun, Moon, Laptop, Sparkles, Check, Heart } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { useTheme } from '@/src/components/common/ThemeProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import api from '@/src/services/api';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  productId?: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const totalItems = useCartStore((state) => state.totalItems());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  // Fetch product & store notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get('/notifications');
      return data;
    },
    enabled: !!user,
    refetchInterval: 15000, // refresh notifications every 15s to catch new products
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await markAsReadMutation.mutateAsync(notif.id);
    }
    if (notif.productId) {
      navigate(`/product/${notif.productId}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-950 text-black dark:text-white border-b border-gray-100 dark:border-zinc-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-6">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex flex-col leading-none group">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white group-hover:text-[#ff5200] transition-colors">Geekhoot</span>
              <span className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">Premium Printing Store</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full group">
              <Input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full h-10 pl-10 pr-4 bg-[#f0f5ff] dark:bg-zinc-900 border-none focus-visible:ring-1 focus-visible:ring-orange-500 text-sm text-gray-900 dark:text-white rounded shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Theme Selector Widget */}
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-0">
                {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
                {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-400" />}
                {theme === 'system' && <Laptop className="w-5 h-5 text-gray-400" />}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 shadow-xl rounded-md">
                <DropdownMenuLabel className="text-xs font-bold text-gray-400">Theme Preference</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-900" />
                <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer text-sm font-semibold flex items-center justify-between dark:hover:bg-zinc-900 focus:bg-gray-50 dark:focus:bg-zinc-900">
                  <span className="flex items-center gap-2"><Sun className="w-4 h-4 text-amber-500" /> Light</span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer text-sm font-semibold flex items-center justify-between dark:hover:bg-zinc-900 focus:bg-gray-50 dark:focus:bg-zinc-900">
                  <span className="flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-400" /> Dark</span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer text-sm font-semibold flex items-center justify-between dark:hover:bg-zinc-900 focus:bg-gray-50 dark:focus:bg-zinc-900">
                  <span className="flex items-center gap-2"><Laptop className="w-4 h-4 text-gray-400" /> System</span>
                  {theme === 'system' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications / Product Arrivals Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-0">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white min-w-[15px] h-[15px] px-1 flex items-center justify-center text-[9px] font-bold rounded-full animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[360px] max-h-[480px] overflow-y-auto bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 shadow-xl rounded-md p-0">
                  <div className="p-4 border-b border-gray-100 dark:border-zinc-900 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Store Notifications</h3>
                    <span className="text-[11px] bg-orange-50 dark:bg-orange-950/40 text-[#ff5200] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {unreadCount} New
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-zinc-900/60 max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors relative flex gap-3 ${!notif.read ? 'bg-orange-50/20 dark:bg-zinc-900/30' : ''}`}
                        >
                          <div className="shrink-0 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-[#ff5200]" />
                          </div>
                          <div className="space-y-1 w-full pr-4">
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notif.read && (
                            <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#ff5200]" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-gray-400 dark:text-gray-500 space-y-2">
                        <Bell className="w-8 h-8 mx-auto stroke-1" />
                        <p className="text-xs italic">No announcements yet</p>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Account Settings */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 font-semibold text-sm hover:text-[#ff5200] dark:text-white dark:hover:text-[#ff5200] transition-all focus:outline-none">
                  <span>{user.name}</span>
                  <Menu className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 shadow-xl rounded-md p-1">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded h-10 cursor-pointer text-sm font-semibold flex items-center gap-2 px-3 hover:bg-gray-50 dark:hover:bg-zinc-900">
                    <User className="h-4 w-4 text-gray-400" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')} className="rounded h-10 cursor-pointer text-sm font-semibold flex items-center gap-2 px-3 hover:bg-gray-50 dark:hover:bg-zinc-900">
                    <Package className="h-4 w-4 text-gray-400" /> My Orders
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded h-10 cursor-pointer text-sm font-bold flex items-center gap-2 px-3 text-[#ff5200] hover:bg-orange-50 dark:hover:bg-zinc-900">
                      <LayoutDashboard className="h-4 w-4" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-900" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded h-10 cursor-pointer text-sm font-semibold flex items-center gap-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/login')} 
                className="bg-[#2874f0] text-white hover:bg-blue-600 rounded-sm px-8 h-9 font-bold text-sm shadow-sm border-none cursor-pointer"
              >
                Login
              </Button>
            )}

            {/* Wishlist Button */}
            <Link 
              to="/wishlist" 
              className="flex items-center gap-2 hover:text-[#ff5200] transition-colors"
            >
               <div className="relative">
                 <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                 {wishlistCount > 0 && (
                   <span className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full">
                     {wishlistCount}
                   </span>
                 )}
               </div>
               <span className="text-sm font-bold text-gray-700 dark:text-gray-300 justify-center">Wishlist</span>
            </Link>

            {/* Cart Button */}
            <Link 
              to="/cart" 
              className="flex items-center gap-2 hover:text-[#ff5200] transition-colors"
            >
               <div className="relative">
                 <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                 {totalItems > 0 && (
                   <span className="absolute -top-2 -right-2 bg-[#ff5200] text-white min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full">
                     {totalItems}
                   </span>
                 )}
               </div>
               <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Cart</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-4">
            
            {/* Theme Switcher for mobile - simple toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            <Link to="/wishlist" className="relative w-8 h-8 flex items-center justify-center">
              <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white min-w-[16px] h-[16px] flex items-center justify-center text-[10px] font-bold rounded-full animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative w-8 h-8 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff5200] text-white min-w-[16px] h-[16px] flex items-center justify-center text-[10px] font-bold rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <Sheet>
              <SheetTrigger className="p-1">
                <Menu className="w-7 h-7 text-gray-700 dark:text-gray-300" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] p-0 border-none bg-white dark:bg-zinc-950 text-black dark:text-white">
                <div className="p-6 space-y-8 h-full flex flex-col">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-black dark:text-white animate-fade-in">Geekhoot</span>
                    <span className="text-xs text-gray-500">Premium Printing Store</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {[
                      { to: '/', icon: LayoutDashboard, label: 'Home' },
                      { to: '/products', icon: Search, label: 'All Categories' },
                      { to: '/wishlist', icon: Heart, label: 'Wishlist' },
                      { to: '/profile', icon: User, label: 'Account' },
                      { to: '/orders', icon: Package, label: 'Orders' },
                    ].map((item) => (
                      <Link 
                        key={item.label} 
                        to={item.to} 
                        className="flex items-center gap-4 p-3.5 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-md transition-all group"
                      >
                         <item.icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                         <span className="font-semibold text-sm text-gray-800 dark:text-gray-200"> {item.label}</span>
                      </Link>
                    ))}
                  </div>

                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-md flex items-center gap-4 text-[#ff5200]">
                       <LayoutDashboard className="w-5 h-5" />
                       <span className="font-bold text-sm">Admin Panel</span>
                    </Link>
                  )}

                  {/* Mobile Announcements Block */}
                  {user && notifications.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-zinc-900 pt-4 space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3">Recent Announcements ({unreadCount})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 px-1">
                        {notifications.slice(0, 3).map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className="p-2.5 rounded bg-gray-50 dark:bg-zinc-900/60 border border-transparent text-xs hover:border-[#ff5200]/30 transition-colors cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-gray-800 dark:text-white line-clamp-1">{notif.title}</span>
                              {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />}
                            </div>
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{notif.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-900">
                    {user ? (
                      <Button 
                        onClick={handleLogout} 
                        variant="ghost" 
                        className="w-full h-12 rounded-md font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-none"
                      >
                        Logout
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate('/login')} 
                        className="w-full h-12 rounded-md bg-[#2874f0] text-white font-bold text-sm border-none"
                      >
                        Login / Sign Up
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
