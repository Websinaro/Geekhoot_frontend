import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Box, 
  Ship, 
  MapPin,
  ExternalLink,
  Info,
  ArrowRight,
  ClipboardCheck,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/src/services/api';
import { generateTrackingTimeline } from '@/src/utils/trackingEngine';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { color: string, icon: any, label: string, step: number }> = {
  PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending', step: 0 },
  CONFIRMED: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle2, label: 'Confirmed', step: 1 },
  PACKED: { color: 'bg-purple-100 text-purple-700', icon: Box, label: 'Packed', step: 2 },
  SHIPPED: { color: 'bg-indigo-100 text-indigo-700', icon: Ship, label: 'Shipped', step: 3 },
  DELIVERED: { color: 'bg-green-100 text-green-700', icon: Truck, label: 'Delivered', step: 4 },
  CANCELLED: { color: 'bg-red-100 text-red-700', icon: Clock, label: 'Cancelled', step: -1 },
};

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my');
      return data;
    },
  });

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-[#ff5200] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-[#f1f3f6] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and track your recent orders</p>
        </div>
        <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-100 flex items-center gap-2">
          <span className="text-sm font-bold text-blue-600">{orders.length}</span>
          <span className="text-sm text-gray-400">Total Orders</span>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any, i: number) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  onClick={() => setSelectedOrder(order)}
                  className="rounded-lg border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all bg-white overflow-hidden"
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Info */}
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded border border-gray-50 bg-gray-50 overflow-hidden shrink-0 mx-auto md:mx-0">
                        <img 
                          src={(Array.isArray(order.product.images) && order.product.images.length > 0) ? order.product.images[0] : ''} 
                          alt={order.product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={`${status.color} border-none font-bold text-xs rounded-sm px-2.5 py-0.5`}>
                              {status.label}
                            </Badge>
                            <span className="text-xs text-gray-400 font-bold">
                              ID: {order.orderCode || order.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{order.product.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Qty: <span className="font-bold">{order.quantity}</span>
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5">
                             <Calendar className="w-3.5 h-3.5" />
                             Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                           {order.trackingId && (
                            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                               <Truck className="w-3.5 h-3.5" />
                               {order.courier}: {order.trackingId}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6">
                         <Button 
                           variant="ghost" 
                           onClick={(e) => {
                             e.stopPropagation();
                             setSelectedOrder(order);
                           }}
                           className="text-[#ff5200] font-bold hover:bg-orange-50 gap-2 cursor-pointer transition-all"
                         >
                           View Details <ArrowRight className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-100 shadow-sm">
           <Package className="w-16 h-16 text-gray-100 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
           <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto font-medium">Looks like you haven't placed any orders yet. Explore our products and start shopping.</p>
           <Button onClick={() => navigate('/products')} className="bg-[#fb641b] hover:bg-[#ff5200] text-white font-bold h-11 px-8 rounded-sm shadow-sm border-none">Start Shopping</Button>
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl rounded-lg p-0 border-none max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
          {selectedOrder && (
            <div className="relative">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                 <div>
                    <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                    <p className="text-xs text-gray-500 font-medium">ID: {selectedOrder.orderCode || selectedOrder.id.slice(-8).toUpperCase()}</p>
                 </div>
                 <Badge className={`${STATUS_CONFIG[selectedOrder.status]?.color || 'bg-gray-100'} border-none font-bold text-xs px-3 py-1 rounded-sm`}>
                    {selectedOrder.status}
                 </Badge>
              </div>

              <div className="p-6 space-y-8">
                {/* Tracker */}
                <div className="pt-4 pb-8 border-b border-gray-50">
                  <div className="relative flex justify-between">
                    <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full"></div>
                    <div 
                      className="absolute top-5 left-0 h-1 bg-[#ff5200] rounded-full transition-all duration-700"
                      style={{ width: `${(STATUS_CONFIG[selectedOrder.status]?.step || 0) * 25}%` }}
                    ></div>
                    
                    {[
                      { step: 0, icon: Clock, label: 'Placed' },
                      { step: 1, icon: CheckCircle2, label: 'Confirmed' },
                      { step: 2, icon: Box, label: 'Packed' },
                      { step: 3, icon: Ship, label: 'Shipped' },
                      { step: 4, icon: Truck, label: 'Delivered' }
                    ].map((item) => {
                      const isActive = (STATUS_CONFIG[selectedOrder.status]?.step || 0) >= item.step;
                      return (
                        <div key={item.step} className="flex flex-col items-center z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isActive ? 'bg-[#ff5200] border-[#ff5200] text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'}`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <p className={`mt-2 text-[10px] font-bold ${isActive ? 'text-[#ff5200]' : 'text-gray-400'}`}>
                            {item.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Shipment Radar Logs */}
                {selectedOrder.trackingId && (() => {
                  const trackingInfo = generateTrackingTimeline(
                    selectedOrder.trackingId, 
                    selectedOrder.status, 
                    selectedOrder.courier, 
                    selectedOrder.createdAt
                  );
                  return (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                      {/* Carrier Banner Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block font-mono">Verified Logistics Stream</span>
                          <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                            {trackingInfo.carrier}
                          </span>
                        </div>
                        <div className="flex flex-col sm:items-end space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Tracking Code</span>
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs font-mono font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{trackingInfo.trackingId}</code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-slate-50 border-none cursor-pointer"
                              title="Copy Tracking ID"
                              onClick={() => {
                                navigator.clipboard.writeText(trackingInfo.trackingId);
                                toast.success('Tracking ID copied to clipboard!');
                              }}
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic Status Box */}
                      <div className="grid grid-cols-2 gap-4 bg-white p-3.5 rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Live Status Radar</span>
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded border-none ${trackingInfo.statusColor}`}>
                            {trackingInfo.statusLabel}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Estimated Arrival</span>
                          <span className="text-xs font-bold text-gray-800 font-mono block">
                            {trackingInfo.estimatedDelivery}
                          </span>
                        </div>
                      </div>

                      {/* Vertical Tracker Milestones Stepper */}
                      <div className="space-y-4 pt-1 bg-white p-4 h-[220px] overflow-y-auto rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-1.5 sticky top-0 bg-white z-10">
                          <MapPin className="w-4 h-4 text-orange-500" /> Transit Checkpoint Milestones
                        </h4>
                        <div className="relative pl-6 border-l border-blue-105 space-y-6 mt-2">
                            {trackingInfo.milestones.map((log, idx) => {
                              const isLatest = idx === 0;
                              return (
                                <div key={idx} className="relative">
                                  {/* Milestone Pin dot */}
                                  <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${isLatest ? 'border-[#ff5200]' : 'border-blue-400'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-[#ff5200] animate-pulse' : 'bg-blue-400'}`}></div>
                                  </div>

                                  {/* Label and Content */}
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                                      <span className={`text-[11px] font-bold ${isLatest ? 'text-[#ff5200]' : 'text-gray-800'}`}>
                                        {log.location}
                                      </span>
                                      <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">
                                        {log.timestamp}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                      {log.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Help/Hotline Footer */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-[11px] text-gray-400 font-medium border-t border-slate-100">
                        <span>Need route support? Courier Helpline: <span className="font-bold text-gray-700 font-mono">{trackingInfo.carrierSupportPhone}</span></span>
                        <span className="text-[9px] uppercase tracking-widest bg-orange-50 text-[#ff5200] px-2 py-0.5 rounded font-bold">Autodetected {trackingInfo.carrier}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Tracking & Product */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Address</h4>
                      <div className="bg-gray-50 p-4 rounded border border-gray-100">
                         <p className="font-bold text-gray-900 text-sm mb-1">{selectedOrder.user?.name}</p>
                         <p className="text-sm text-gray-600 leading-relaxed mb-2">{selectedOrder.user?.address}</p>
                         <p className="text-xs font-bold text-gray-400">Mobile: {selectedOrder.user?.phone}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Details</h4>
                      <div className="bg-gray-50 p-4 rounded border border-gray-100 space-y-2">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">List Price</span>
                            <span className="text-gray-900 font-medium">₹{(selectedOrder.totalAmount * 1.2).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Discount</span>
                            <span className="text-green-600 font-medium">-₹{(selectedOrder.totalAmount * 0.2).toLocaleString()}</span>
                         </div>
                         <Separator className="bg-gray-200" />
                         <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-900">Total Amount</span>
                            <span className="text-gray-900">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="border-t border-gray-50 pt-8">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Item Details</h4>
                   <div className="flex gap-6 p-4 rounded-lg border border-gray-100">
                      <div className="w-20 h-20 rounded bg-gray-50 border border-gray-50 overflow-hidden shrink-0">
                         <img src={(Array.isArray(selectedOrder.product.images) && selectedOrder.product.images.length > 0) ? selectedOrder.product.images[0] : ''} 
                            alt={selectedOrder.product.name} 
                            className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <h5 className="font-bold text-gray-900 mb-1">{selectedOrder.product.name}</h5>
                         <p className="text-xs text-gray-500 mb-2">Category: {selectedOrder.product.category}</p>
                         <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-900">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                            <span className="text-xs text-gray-400">Qty: {selectedOrder.quantity}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 font-sans">
                  <Button 
                    variant="outline"
                    className="h-9 px-4 border-[#ff5200] text-[#ff5200] hover:bg-orange-50 hover:text-[#e04800] text-xs font-bold cursor-pointer transition-all active:scale-[0.98] rounded-md shadow-sm border-2"
                    onClick={() => {
                      setSelectedOrder(null);
                      navigate(`/product/${selectedOrder.product.id}`);
                    }}
                  >
                    Buy Again
                  </Button>
                  <Button 
                    className="h-9 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all active:scale-[0.98] border-none rounded-md shadow-sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
