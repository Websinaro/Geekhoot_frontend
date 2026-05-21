import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  MessageSquare, 
  Truck,
  MapPin,
  MapPinned
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/src/store/cartStore';
import { useAuthStore } from '@/src/store/authStore';
import api from '@/src/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function Cart() {
  const { 
    items: cart, 
    updateQuantity, 
    removeItem: removeFromCart, 
    totalPrice: getTotalPrice, 
    totalItems: getTotalItems, 
    clearCart 
  } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  React.useEffect(() => {
    const validateCartItems = async () => {
      if (cart.length === 0) return;
      
      const updatedItems = [];
      let changed = false;
      
      for (const item of cart) {
        try {
          const { data } = await api.get(`/products/${item.productId}`);
          if (data && data.id) {
            updatedItems.push({
              ...item,
              product: {
                id: data.id,
                name: data.name,
                price: data.price,
                images: data.images,
                stock: data.stock,
                category: data.category,
              }
            });
            if (
              item.product.name !== data.name ||
              item.product.price !== data.price ||
              item.product.stock !== data.stock ||
              JSON.stringify(item.product.images) !== JSON.stringify(data.images)
            ) {
              changed = true;
            }
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            changed = true;
          } else {
            updatedItems.push(item);
          }
        }
      }
      
      if (changed) {
        useCartStore.getState().setItems(updatedItems);
        toast.info("Your cart has been updated with current shop availability.");
      }
    };
    
    validateCartItems();
  }, [cart.length]);

  const handleCheckout = () => {
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

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLocationDialogOpen(true);
  };

  const processCheckoutWithLocation = async (useCurrent: boolean) => {
    setIsLocationDialogOpen(false);
    setIsOrdering(true);
    
    const adminNumber = (import.meta as any).env.VITE_WHATSAPP_ADMIN_NUMBER || "918138872364";

    if (useCurrent) {
      if (navigator.geolocation) {
        toast.info('Capturing precise location...');
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            await finalizeCheckout(adminNumber, locationUrl);
          },
          async () => {
            toast.error("Location access denied. Using profile location.");
            await finalizeCheckout(adminNumber, (user as any).locationUrl);
          },
          { timeout: 10000 }
        );
      } else {
        await finalizeCheckout(adminNumber, (user as any).locationUrl);
      }
    } else {
      await finalizeCheckout(adminNumber, (user as any).locationUrl);
    }
  };

  const finalizeCheckout = async (adminNumber: string, locationUrl?: string) => {
    try {
      const successfulOrders: string[] = [];
      const invalidCartItems: string[] = [];
      let hadMissingProduct = false;

      for (const item of cart) {
        const uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase();
        try {
          const res = await api.post('/orders', {
            userId: user.id,
            productId: item.productId,
            quantity: item.quantity,
            totalAmount: item.product.price * item.quantity,
            orderCode: uniqueId,
            locationUrl: locationUrl
          });
          successfulOrders.push(res.data.orderCode);
        } catch (err: any) {
          if (err.response?.status === 404 && err.response?.data?.message?.includes('Product not found')) {
            hadMissingProduct = true;
            invalidCartItems.push(item.id);
          } else {
            throw err;
          }
        }
      }

      if (hadMissingProduct) {
        invalidCartItems.forEach(id => removeFromCart(id));
        toast.error("Some items in your cart are no longer available on our shelves and have been removed.");
        return;
      }
      
      sendWhatsAppMessage(adminNumber, successfulOrders, locationUrl);
      clearCart();
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast.error(error.response?.data?.message || 'Order sync failed, but redirecting to WhatsApp...');
      sendWhatsAppMessage(adminNumber, [], locationUrl);
    } finally {
      setIsOrdering(false);
    }
  };

  const sendWhatsAppMessage = (adminNumber: string, orderCodes: string[], locationUrl?: string) => {
    let productDetails = cart.map(item => `- ${item.product.name} (Qty: ${item.quantity})`).join('\n');
    const codesString = orderCodes.length > 0 ? `*Order IDs:* ${orderCodes.map(c => `#${c}`).join(', ')}` : '';

    const message = `Hello Geekhoot Admin,

*New Multi-Product Order Request*
*Customer:* ${user.name}
*Phone:* ${user.phone}

*Delivery Address:*
- House/Flat No: ${user.houseNo || 'N/A'}
- Street / Near: ${user.streetNear || 'N/A'}
- Road / Area: ${user.road || 'N/A'}
- District: ${user.district || 'N/A'}
- State: ${user.state || 'N/A'}
- Pincode: ${user.pincode || 'N/A'}
- Full Address: ${user.address || 'N/A'}
${locationUrl ? `*Precise Location:* ${locationUrl}` : '*Location:* Using profile address'}

*Products:*
${productDetails}

*Total Amount:* ₹${totalPrice.toLocaleString()}
${codesString}

Please confirm the order. Admin, you can search for these IDs in your dashboard.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminNumber}?text=${encodedMessage}`, '_blank');
    toast.success('Opening WhatsApp to place your order');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-white text-black">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-40 h-40 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-10 border border-gray-100 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[#ff5200]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <ShoppingBag className="w-16 h-16 text-gray-300 group-hover:text-[#ff5200] transition-colors relative z-10" />
        </motion.div>
        <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic mb-6">Cart Empty</h2>
        <p className="text-gray-400 mb-12 text-center max-w-sm font-bold uppercase tracking-tight text-lg leading-relaxed">
          Looks like you haven't added anything to your cart yet. 
        </p>
        <Button 
          onClick={() => navigate('/products')} 
          className="rounded-[2rem] h-20 px-12 text-xs font-black uppercase tracking-[0.4em] bg-[#ff5200] hover:bg-black text-white transition-all shadow-xl shadow-orange-100 group"
        >
          Shop Now <Plus className="ml-4 w-5 h-5 group-hover:rotate-90 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f3f6] min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">My Cart ({totalItems})</h1>
                </div>
                <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-600 font-bold text-sm h-9 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
                </Button>
              </div>

              <div className="divide-y divide-gray-50">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded border border-gray-100 bg-gray-50 overflow-hidden shrink-0 mx-auto md:mx-0">
                          <img 
                            src={(Array.isArray(item.product.images) && item.product.images.length > 0) ? item.product.images[0] : ''} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <Link to={`/product/${item.product.id}`} className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                              {item.product.name}
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-red-500 h-8 w-8"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">{item.product.category}</p>
                          
                          <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border border-gray-200 rounded-sm">
                                <button 
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
                                  disabled={item.quantity <= 1}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                <button 
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
                                  disabled={item.quantity >= (item.product.stock ?? 9999)}
                                  onClick={() => {
                                    if (item.quantity >= (item.product.stock ?? 9999)) {
                                      toast.error(`Only ${item.product.stock} items left in stock`);
                                      return;
                                    }
                                    updateQuantity(item.id, item.quantity + 1);
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="font-bold text-xl text-gray-900">
                              ₹{(item.product.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex justify-end p-6 bg-white rounded-lg shadow-sm border border-gray-100">
               <Button 
                onClick={handleCheckout} 
                className="bg-[#fb641b] hover:bg-[#ff5200] text-white font-bold h-12 px-12 rounded-sm shadow-md border-none uppercase text-sm"
               >
                 Place Order
               </Button>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Price Details</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Price ({totalItems} items)</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                </div>
                <Separator className="bg-gray-50" />
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2">
                  <span>Total Amount</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <p className="text-green-600 font-bold text-xs">You will save ₹{(totalPrice * 0.1).toLocaleString()} on this order</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <span>Safe and Secure Payments. 100% Authentic products.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Selection Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-md rounded-lg p-6 bg-white border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-gray-900">Delivery Location</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2">
              Please choose how you'd like to provide your delivery location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <button 
              onClick={() => processCheckoutWithLocation(true)}
              className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <MapPinned className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-900 text-sm">Use Live Location</p>
                <p className="text-xs text-blue-700">Perfect for pinpoint accuracy</p>
              </div>
            </button>

            <button 
              onClick={() => processCheckoutWithLocation(false)}
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all text-left"
            >
              <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Use Profile Address</p>
                <p className="text-xs text-gray-500">Shipping to your saved address</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isOrdering && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
           <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-bold text-gray-900">Redirecting to WhatsApp...</p>
           </div>
        </div>
      )}
    </div>
  );
}
