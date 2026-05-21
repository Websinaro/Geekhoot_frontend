import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from './providers/QueryProvider';
import { useAuthStore } from './store/authStore';
import { useWishlistStore } from './store/wishlistStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SplashScreen from './components/common/SplashScreen';
import { ThemeProvider } from './components/common/ThemeProvider';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Signup = React.lazy(() => import('./pages/Auth/Signup'));
const ProductList = React.lazy(() => import('./pages/Product/ProductList'));
const ProductDetail = React.lazy(() => import('./pages/Product/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart/Cart'));
const Wishlist = React.lazy(() => import('./pages/User/Wishlist'));
const Profile = React.lazy(() => import('./pages/User/Profile'));
const Orders = React.lazy(() => import('./pages/User/Orders'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'));

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/" />;

  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#ff5200]/20 selection:text-[#ff5200] transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        <React.Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            
            <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </React.Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <ThemeProvider>
      <QueryProvider>
        <Router>
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
          <AppRoutes />
          <Toaster richColors position="top-center" />
        </Router>
      </QueryProvider>
    </ThemeProvider>
  );
}
