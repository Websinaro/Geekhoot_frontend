import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  Minus, 
  Plus, 
  Share2,
  PackageCheck,
  MapPin,
  MapPinned,
  ArrowRight,
  Zap,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/src/services/api';
import { useAuthStore } from '@/src/store/authStore';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Product } from '@/src/types';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!id || id === 'undefined' || id === 'null') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f3f6] px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-150">
          <div className="w-16 h-16 bg-red-50 text-[#ff5200] rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-950 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The product you are trying to view does not exist or has been removed.
          </p>
          <Button onClick={() => navigate('/products')} className="bg-[#ff5200] hover:bg-[#e04800] text-white font-bold w-full rounded-sm h-11 border-none">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return <ProductDetailContent key={id} id={id} />;
}

function ProductDetailContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem, items: cart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  React.useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setShowReviewForm(false);
    setReviewData({ rating: 5, comment: '' });
  }, [id]);

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid product ID');
      }
      const { data } = await api.get(`/products/${id}`);
      return data as Product & { reviews: any[], bookings: number };
    },
    enabled: !!id && id !== 'undefined' && id !== 'null',
  });

  const { data: canReviewData } = useQuery({
    queryKey: ['can-review', id],
    queryFn: async () => {
      if (!id || id === 'undefined' || id === 'null') {
        return false;
      }
      const { data } = await api.get(`/products/${id}/can-review`);
      return data.canReview as boolean;
    },
    enabled: !!id && id !== 'undefined' && id !== 'null' && isAuthenticated && !!product,
  });

  const canReview = canReviewData || false;

  const handleWhatsAppOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    const isAddressDetailed = user.houseNo?.trim() && user.streetNear?.trim() && user.road?.trim();
    if (!isAddressDetailed) {
      toast.error('Please complete your detailed shipping address (House No, Street Near, Road) in your profile to place an order.');
      navigate('/profile');
      return;
    }

    if (product.stock === 0) {
      toast.error('This product is out of stock!');
      return;
    }
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items left in stock`);
      return;
    }
    setIsLocationDialogOpen(true);
  };

  const processOrderWithLocation = async (useCurrent: boolean) => {
    setIsLocationDialogOpen(false);
    setIsOrdering(true);
    
    const uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const adminNumber = (import.meta as any).env.VITE_WHATSAPP_ADMIN_NUMBER || "918138872364";

    if (useCurrent) {
      if (navigator.geolocation) {
        toast.info('Capturing location...');
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            await finalizeOrder(uniqueId, adminNumber, locationUrl);
          },
          async () => {
            toast.error("Location access denied. Using profile location.");
            await finalizeOrder(uniqueId, adminNumber, (user as any).locationUrl);
          },
          { timeout: 10000 }
        );
      } else {
        await finalizeOrder(uniqueId, adminNumber, (user as any).locationUrl);
      }
    } else {
      await finalizeOrder(uniqueId, adminNumber, (user as any).locationUrl);
    }
  };

  const finalizeOrder = async (uniqueId: string, adminNumber: string, locationUrl?: string) => {
    try {
      await api.post('/orders', {
        userId: user.id,
        productId: product.id,
        quantity: quantity,
        totalAmount: product.price * quantity,
        orderCode: uniqueId,
        locationUrl: locationUrl
      });
      
      sendWhatsAppMessage(uniqueId, adminNumber, locationUrl);
    } catch (error: any) {
      console.error('Order failed:', error);
      toast.error(error.response?.data?.message || 'Order failed, redirecting to WhatsApp...');
      sendWhatsAppMessage(uniqueId, adminNumber, locationUrl);
    } finally {
      setIsOrdering(false);
    }
  };

  const sendWhatsAppMessage = (uniqueId: string, adminNumber: string, locationUrl?: string) => {
    const message = `Hello Geekhoot,
I want to order:
*Product:* ${product.name}
*Qty:* ${quantity}
*Total:* ₹${(product.price * quantity).toLocaleString()}
*Order ID:* #${uniqueId}

*Customer Details:*
- Name: ${user.name}
- Phone: ${user.phone}

*Delivery Address:*
- House/Flat No: ${user.houseNo || 'N/A'}
- Street / Near: ${user.streetNear || 'N/A'}
- Road / Area: ${user.road || 'N/A'}
- District: ${user.district || 'N/A'}
- State: ${user.state || 'N/A'}
- Pincode: ${user.pincode || 'N/A'}
- Full Address: ${user.address || 'N/A'}
${locationUrl ? `*Location:* ${locationUrl}` : ''}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('This product is out of stock!');
      return;
    }
    const existingItem = cart.find(item => item.productId === product.id);
    const existingQty = existingItem ? existingItem.quantity : 0;
    if (existingQty + quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock. You have ${existingQty} in your cart.`);
      return;
    }
    addItem(product, quantity);
    toast.success('Added to cart');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/reviews`, reviewData);
      toast.success('Review submitted');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['can-review', id] });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMsg);
    }
  };

  if (isLoading || (!product && !isError)) return (
    <div className="h-screen flex items-center justify-center bg-white">
       <div className="w-10 h-10 border-4 border-[#ff5200] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f3f6] px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-150">
          <div className="w-16 h-16 bg-red-50 text-[#ff5200] rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-950 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The product you are trying to view does not exist or has been removed.
          </p>
          <Button onClick={() => navigate('/products')} className="bg-[#ff5200] hover:bg-[#e04800] text-white font-bold w-full rounded-sm h-11 border-none">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const isCorrectProduct = product && String(product.id) === String(id);

  if (!isCorrectProduct) return (
    <div className="h-screen flex items-center justify-center bg-white">
       <div className="w-10 h-10 border-4 border-[#ff5200] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const mainImage = (Array.isArray(product.images) && product.images.length > activeImage) 
    ? product.images[activeImage] 
    : '';

  return (
    <div className="bg-[#f1f3f6] min-h-screen pb-20">
      <div className="max-w-[1440px] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-white p-3 rounded shadow-sm">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-blue-600">Collection</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Image Section */}
          <div className="lg:w-[40%] space-y-4">
            <div className="bg-white p-4 rounded shadow-sm sticky top-24">
              <div className="aspect-square relative overflow-hidden flex items-center justify-center border border-gray-100 rounded-sm">
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {Array.isArray(product.images) && product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 shrink-0 rounded border-2 transition-all p-1 flex items-center justify-center ${activeImage === i ? 'border-[#ff5200]' : 'border-gray-100'}`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <Button 
                  variant="outline"
                  className="h-14 rounded-sm border-gray-300 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 text-[#ff5200]" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button 
                  className="h-14 rounded-sm bg-[#fb641b] hover:bg-[#ff5200] text-white font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed border-none"
                  onClick={handleWhatsAppOrder}
                  disabled={product.stock === 0}
                >
                  <Zap className="w-5 h-5 fill-white" /> {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </Button>
              </div>

              {/* Wishlist Toggle Action Button */}
              {(() => {
                const isWish = isInWishlist(product.id);
                return (
                  <Button 
                    variant="outline"
                    className={cn(
                      "w-full mt-2 h-12 rounded-sm font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all border shadow-sm cursor-pointer",
                      isWish 
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    )}
                    onClick={() => {
                      toggleWishlist(product);
                      if (isWish) {
                        toast.success(`${product.name} removed from wishlist`);
                      } else {
                        toast.success(`${product.name} added to wishlist`);
                      }
                    }}
                  >
                    <Heart className={cn("w-4 h-4", isWish ? "fill-red-500 text-red-500" : "text-gray-400")} /> 
                    {isWish ? 'Wishlisted' : 'Add to Wishlist'}
                  </Button>
                );
              })()}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:w-[60%] flex flex-col gap-4">
            <div className="bg-white p-6 rounded shadow-sm min-h-full">
              <div className="mb-6">
                <p className="text-gray-400 text-sm font-medium mb-1">{product.category}</p>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold gap-1">
                    {Number(product.rating || 0).toFixed(1)} <Star className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">
                    {product.reviews?.length || 0} Ratings & Reviews
                  </span>
                  {product.bookings > 0 && (
                    <span className="text-sm font-bold text-green-600">
                      {product.bookings} people ordered this
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      <span className="text-lg text-green-600 font-bold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </span>
                    </>
                  )}
                </div>

                {product.stock <= 5 && product.stock > 0 && (
                  <p className="text-red-500 text-sm font-bold mb-4 italic">Only {product.stock} left in stock - order soon!</p>
                )}
                {product.stock === 0 && (
                  <p className="text-red-500 text-sm font-bold mb-4">Currently Out of Stock</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Product Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>

                <div className="flex items-center gap-6 border-y border-gray-50 py-4">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
                     <div className="flex items-center border border-gray-200 rounded">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                          className="p-2 border-r hover:bg-gray-50 disabled:opacity-30"
                          disabled={product.stock === 0 || quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold">{product.stock === 0 ? 0 : quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)} 
                          className="p-2 border-l hover:bg-gray-50 disabled:opacity-30"
                          disabled={product.stock === 0 || quantity >= product.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-bold">Free Delivery</p>
                      <p className="text-xs text-gray-500">Usually ships in 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-bold">7 Days Replacement</p>
                      <p className="text-xs text-gray-500">Quality checking before dispatch</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews within Right Column or below? Standard e-commerce often puts it below */}
            <div id="reviews" className="bg-white p-6 rounded shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Ratings & Reviews</h2>
                    {canReview && !showReviewForm && (
                        <Button variant="outline" onClick={() => setShowReviewForm(true)}>Rate Product</Button>
                    )}
                </div>

                <AnimatePresence>
                    {showReviewForm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8 border-b pb-8">
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold">Rate:</span>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(i => (
                                            <button key={i} type="button" onClick={() => setReviewData({ ...reviewData, rating: i })}>
                                                <Star className={`w-6 h-6 ${reviewData.rating >= i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    className="w-full border rounded-md p-4 text-sm focus:ring-1 focus:ring-[#ff5200] outline-none"
                                    placeholder="Write your review here..."
                                    rows={4}
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-black text-white px-8">Submit</Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6">
                    {product.reviews?.length > 0 ? product.reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold gap-1">
                                    {Number(review.rating || 0).toFixed(1)} <Star className="w-2.5 h-2.5 fill-white" />
                                </div>
                                <span className="text-sm font-bold text-gray-900">{review.user.name}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2 leading-relaxed">{review.comment}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Published on {new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                    )) : (
                        <div className="text-center py-10">
                            <MessageSquare className="w-10 h-10 text-gray-100 mx-auto mb-4" />
                            <p className="text-sm text-gray-400 italic">No reviews yet. Be the first to review!</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Dialog remains similar but cleaner UI */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-md rounded-lg p-6 bg-white border-none shadow-2xl ring-0">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-xl font-bold">Select Delivery Location</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              We need your location to process the order correctly on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <button 
              onClick={() => processOrderWithLocation(true)}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors text-left"
            >
              <MapPinned className="w-6 h-6 text-[#ff5200]" />
              <div>
                <p className="font-bold text-gray-900">Current Location</p>
                <p className="text-xs text-gray-500">Detected via GPS for precision</p>
              </div>
            </button>

            <button 
              onClick={() => processOrderWithLocation(false)}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left"
            >
              <MapPin className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-bold text-gray-900">Profile Address</p>
                <p className="text-xs text-gray-500">Use address saved in your account</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isOrdering && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#ff5200] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-bold text-gray-600">Processing Order...</p>
            </div>
        </div>
      )}
    </div>
  );
}
