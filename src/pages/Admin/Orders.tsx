import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Search, 
  Edit, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Box, 
  Ship,
  MapPin,
  Filter,
  Phone,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/src/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { color: string, icon: any, label: string }> = {
  PENDING: { color: 'bg-yellow-50 text-yellow-600 border border-yellow-200', icon: Clock, label: 'Pending' },
  CONFIRMED: { color: 'bg-blue-50 text-blue-600 border border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
  PACKED: { color: 'bg-purple-50 text-purple-600 border border-purple-200', icon: Box, label: 'Packed' },
  SHIPPED: { color: 'bg-indigo-50 text-indigo-600 border border-indigo-200', icon: Ship, label: 'Shipped' },
  DELIVERED: { color: 'bg-green-50 text-green-600 border border-green-200', icon: Truck, label: 'Delivered' },
  CANCELLED: { color: 'bg-red-50 text-red-600 border border-red-200', icon: X, label: 'Cancelled' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      status: formData.get('status'),
      trackingId: formData.get('trackingId'),
      courier: formData.get('courier'),
      notes: formData.get('notes'),
    };

    try {
      await api.put(`/orders/${selectedOrder.id}`, data);
      toast.success('Order updated successfully');
      setIsDialogOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const cleanSearch = searchQuery.trim().startsWith('#') ? searchQuery.trim().slice(1) : searchQuery.trim();
    const searchLower = cleanSearch.toLowerCase();
    
    return (
      order.user.name.toLowerCase().includes(searchLower) ||
      order.user.phone.includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower) ||
      (order.orderCode && order.orderCode.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-500 font-medium">Track and update customer orders</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Input 
            placeholder="Search Order ID, Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-md border-gray-200 bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
             <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-500 font-medium text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Info</th>
                  <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order: any) => {
                  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 px-6">
                        <p className="font-bold text-blue-600 text-sm">#{order.orderCode || order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4 px-6">
                        <p className="font-bold text-gray-900 text-sm">{order.user.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{order.user.phone}</p>
                      </td>
                      <td className="p-4 px-6">
                        <p className="font-medium text-gray-900 text-sm truncate max-w-[150px]">{order.product.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Qty: {order.quantity}</p>
                      </td>
                      <td className="p-4 px-6">
                        <p className="font-bold text-gray-900 text-sm">₹{order.totalAmount.toLocaleString()}</p>
                      </td>
                      <td className="p-4 px-6">
                        <Badge className={`${status.color} font-bold text-[10px] uppercase tracking-wider rounded-sm px-2.5 py-1 leading-none border-none`}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4 px-6">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="font-bold text-xs h-8 px-4 rounded-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDialogOpen(true);
                          }}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-lg p-6 bg-white border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-gray-900">Update Order Status</DialogTitle>
            <p className="text-xs text-gray-500 mt-2">Managing Order #{selectedOrder?.orderCode || selectedOrder?.id?.slice(-8).toUpperCase()}</p>
          </DialogHeader>
          
          {selectedOrder && (
            <form key={selectedOrder?.id} onSubmit={handleUpdateStatus} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">Status</Label>
                <Select name="status" defaultValue={selectedOrder.status}>
                  <SelectTrigger className="rounded-md h-10 border-gray-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-100">
                    {Object.keys(STATUS_CONFIG).map(s => (
                      <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Carrier</Label>
                  <Select name="courier" defaultValue={selectedOrder.courier || "Ekart"}>
                    <SelectTrigger className="rounded-md h-10 border-gray-200 bg-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100">
                      <SelectItem value="Ekart">Ekart Logistics</SelectItem>
                      <SelectItem value="Delhivery">Delhivery</SelectItem>
                      <SelectItem value="BlueDart">BlueDart</SelectItem>
                      <SelectItem value="IndiaPost">IndiaPost</SelectItem>
                      <SelectItem value="FedEx">FedEx</SelectItem>
                      <SelectItem value="DTDC">DTDC Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Tracking ID</Label>
                  <Input name="trackingId" defaultValue={selectedOrder.trackingId} placeholder="e.g. DEL-7789, OUT-1243" className="rounded-md h-10 border-gray-200 bg-white text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">Notes</Label>
                <Input name="notes" defaultValue={selectedOrder.notes} placeholder="Optional delivery instructions or notes" className="rounded-md h-10 border-gray-200 bg-white text-sm" />
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-[11px] text-blue-800 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1">✨ Dynamic Tracking Engine Activated:</p>
                <ul className="list-disc pl-3.5 space-y-0.5">
                  <li>Starting with <span className="font-semibold">BD / DX / FX / FMP</span> automatically autodetects Courier Partner.</li>
                  <li>Includings keyword <span className="font-semibold">'OUT' / 'OOD'</span> simulates <span className="font-semibold">Out for Delivery</span> to customers.</li>
                  <li>Including keyword <span className="font-semibold">'DEL' / 'DONE'</span> or ending with <span className="font-semibold">9</span> simulates <span className="font-semibold">Delivered</span>.</li>
                </ul>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-md h-10 font-bold border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-bold border-none">
                   Save Update
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
