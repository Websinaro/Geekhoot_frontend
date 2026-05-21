import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Check, 
  X, 
  Info, 
  TrendingUp, 
  Archive, 
  FolderSync, 
  AlertTriangle,
  History,
  CornerDownRight,
  User,
  Tags,
  BadgeAlert,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/src/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState<'levels' | 'history'>('levels');
  const [products, setProducts] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stock Adjustment State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustType, setAdjustType] = useState<'restock' | 'deduct'>('restock');
  const [adjustQuantity, setAdjustQuantity] = useState('10');
  const [adjustReason, setAdjustReason] = useState('Manual Restock');
  const [saving, setSaving] = useState(false);

  // Edit threshold State
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [tempThreshold, setTempThreshold] = useState<string>('');

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const pRes = await api.get('/products?limit=100');
      setProducts(pRes.data.products);

      const hRes = await api.get('/admin/inventory/history');
      setHistoryLogs(hRes.data);
    } catch (error) {
      toast.error('Failed to load inventory details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qtyVal = parseInt(adjustQuantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }

    setSaving(true);
    try {
      const currentStock = selectedProduct.stock;
      const targetStock = adjustType === 'restock' 
        ? currentStock + qtyVal 
        : Math.max(0, currentStock - qtyVal);

      // Prepare request payload
      const payload = {
        stock: targetStock,
        // Send custom status or direct reason if needed, update endpoint handles stock change
      };

      await api.put(`/products/${selectedProduct.id}`, payload);
      toast.success(`Inventory successfully updated to ${targetStock}`);
      
      setSelectedProduct(null);
      fetchInventoryData();
    } catch (err: any) {
      toast.error('Failed to record stock movement');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveThreshold = async (product: any) => {
    const thresholdVal = parseInt(tempThreshold);
    if (isNaN(thresholdVal) || thresholdVal < 0) {
      toast.error('Please enter a valid threshold');
      return;
    }

    try {
      await api.put(`/products/${product.id}`, {
        lowStockThreshold: thresholdVal
      });
      toast.success(`Threshold updated to ${thresholdVal} for ${product.name}`);
      setEditingThresholdId(null);
      fetchInventoryData();
    } catch (err) {
      toast.error('Failed to save threshold adjustment');
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter logs based on search
  const filteredLogs = historyLogs.filter(log => 
    log.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats counting
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const healthyCount = products.filter(p => p.stock > p.lowStockThreshold).length;

  return (
    <div className="space-y-8" id="admin-inventory-page">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Archive className="w-7 h-7 text-blue-600" />
            Inventory & Stock Control
          </h1>
          <p className="text-sm text-gray-500 font-medium">Auto stock reduction on sale, live history audit trials, and customized alert alerts</p>
        </div>

        {/* Sync Button */}
        <Button 
          variant="outline" 
          onClick={fetchInventoryData}
          className="border-gray-200 hover:bg-gray-50 shrink-0 font-bold text-xs"
          id="btn-refresh-inventory"
        >
          <FolderSync className="w-4 h-4 mr-1.5 animate-pulse text-blue-500" /> Pull Analytics
        </Button>
      </div>

      {/* Metrics Banner Cards (Healthy, Low Stock, Out of Stock) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-lg shadow-sm border border-gray-100 bg-white" id="stat-healthy-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-green-500 tracking-widest block">Healthy Stock</span>
              <p className="text-3xl font-extrabold text-gray-900">{loading ? '...' : healthyCount}</p>
              <p className="text-[11px] text-gray-400">Products above watch thresholds</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Check className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm border border-orange-100 bg-orange-50/20" id="stat-low-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-orange-600 tracking-widest block font-sans">Low stock items</span>
              <p className="text-3xl font-extrabold text-orange-700">{loading ? '...' : lowStockCount}</p>
              <p className="text-[11px] text-orange-500 font-medium">Reaching threshold limit levels</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm border border-red-150 bg-red-50/10" id="stat-empty-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-red-600 tracking-widest block font-mono">Out of stock status</span>
              <p className="text-3xl font-extrabold text-red-700">{loading ? '...' : outOfStockCount}</p>
              <p className="text-[11px] text-red-500 font-semibold">Zero units available on store shelf</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <BadgeAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation and Search Utilities */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex border border-gray-200 rounded-md p-1 bg-gray-50/50 shrink-0 select-none">
          <button
            onClick={() => setActiveTab('levels')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded transiton-all cursor-pointer flex items-center gap-1.5 border-none",
              activeTab === 'levels' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            )}
            id="tab-stock-levels"
          >
            <Archive className="w-3.5 h-3.5" /> Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded transiton-all cursor-pointer flex items-center gap-1.5 border-none",
              activeTab === 'history' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            )}
            id="tab-stock-logs"
          >
            <History className="w-3.5 h-3.5" /> Audit History Trail
          </button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'levels' ? 'Search items, categories...' : 'Search logs, orders, actor...'}
            className="pl-10 h-10 border-gray-200 rounded-md bg-gray-50/30 text-sm focus:bg-white"
            id="inventory-search-input"
          />
        </div>
      </div>

      {/* Tab Panel Renderings */}
      <AnimatePresence mode="wait">
        {activeTab === 'levels' ? (
          /* TAB 1: STOCK LEVELS & THRESHOLDS */
          <motion.div
            key="levels"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="table-stock-levels">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Product Details</th>
                    <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                    <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Alert Threshold</th>
                    <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center animate-pulse">Current Stock</th>
                    <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Audited Health Status</th>
                    <th className="p-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center text-gray-400 font-medium text-sm">Synchronizing live stock parameters...</td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center text-gray-400 font-medium text-sm">No matched inventory instances found.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isOutOfStock = product.stock === 0;
                      const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;
                      const isHealthy = product.stock > product.lowStockThreshold;

                      return (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          {/* Name & Photo */}
                          <td className="p-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                                <img
                                  src={product.images?.[0] || ''}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-bold text-gray-900 text-sm">{product.name}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-4 px-6">
                            <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                              {product.category}
                            </span>
                          </td>

                          {/* Low Stock Threshold Setting */}
                          <td className="p-4 px-6 text-center">
                            {editingThresholdId === product.id ? (
                              <div className="flex items-center justify-center gap-1.5 w-32 mx-auto">
                                <Input
                                  type="number"
                                  value={tempThreshold}
                                  onChange={(e) => setTempThreshold(e.target.value)}
                                  className="w-14 h-8 text-center text-xs border-blue-200 focus:border-blue-500 p-0"
                                  id={`input-threshold-${product.id}`}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 bg-green-50"
                                  onClick={() => handleSaveThreshold(product)}
                                  title="Save Alert Threshold"
                                  id={`btn-save-threshold-${product.id}`}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 bg-red-50"
                                  onClick={() => setEditingThresholdId(null)}
                                  id={`btn-cancel-threshold-${product.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 group/threshold text-gray-600 hover:text-blue-600">
                                <span className="font-mono text-sm font-semibold">{product.lowStockThreshold} units</span>
                                <button
                                  onClick={() => {
                                    setEditingThresholdId(product.id);
                                    setTempThreshold(String(product.lowStockThreshold));
                                  }}
                                  className="opacity-0 group-hover/threshold:opacity-100 p-1 flex items-center justify-center rounded hover:bg-gray-100 transition-all cursor-pointer border-none"
                                  id={`btn-edit-threshold-${product.id}`}
                                >
                                  <Edit className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Stock Counter */}
                          <td className="p-4 px-6 text-center font-bold">
                            <span 
                              className={cn(
                                "text-sm font-mono px-3 py-1 rounded inline-block min-w-[50px] text-center",
                                isOutOfStock ? "bg-red-100 text-red-800" :
                                isLowStock ? "bg-orange-100 text-orange-850" : "bg-gray-100 text-gray-900"
                              )}
                            >
                              {product.stock}
                            </span>
                          </td>

                          {/* Inventory Label */}
                          <td className="p-4 px-6">
                            {isOutOfStock && (
                              <Badge className="bg-red-50 hover:bg-red-50 text-red-650 border border-red-200 py-1 font-bold text-[9px] uppercase tracking-wider rounded-sm shadow-none">
                                Sold Out
                              </Badge>
                            )}
                            {isLowStock && (
                              <Badge className="bg-orange-50 hover:bg-orange-50 text-orange-650 border border-orange-200 py-1 font-bold text-[9px] uppercase tracking-wider rounded-sm shadow-none">
                                Low Stock Watch Alert
                              </Badge>
                            )}
                            {isHealthy && (
                              <Badge className="bg-green-50 hover:bg-green-50 text-green-700 border border-green-200 py-1 font-bold text-[9px] uppercase tracking-wider rounded-sm shadow-none">
                                Stock Level Healthy
                              </Badge>
                            )}
                          </td>

                          {/* Adjust Action Trigger Button */}
                          <td className="p-4 px-6 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProduct(product);
                                setAdjustType('restock');
                                setAdjustQuantity('10');
                                setAdjustReason('Manual Restock');
                              }}
                              className="text-xs h-8 font-bold border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded cursor-pointer"
                              id={`btn-launch-adjust-${product.id}`}
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> Adjust Stock
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          /* TAB 2: AUDIT HISTORY MOVEMENTS TRAIL */
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="table-inventory-history">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
                      <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Product Affected</th>
                      <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Movement Change</th>
                      <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Reconciliation Delta</th>
                      <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Adjustment Reason</th>
                      <th className="p-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Authorized By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-20 text-center text-gray-400 font-medium text-sm">Decoding audit trails from DB...</td>
                      </tr>
                    ) : filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-20 text-center text-gray-400 font-medium text-sm">No transaction movements fit filters.</td>
                      </tr>
                    ) : (
                      filteredLogs.map((log: any) => {
                        const isGain = log.quantity > 0;
                        return (
                          <tr key={log.id} className="hover:bg-gray-50/50 transition-all text-xs font-medium">
                            {/* Timestamp */}
                            <td className="p-4 px-6 text-gray-400 whitespace-nowrap font-mono">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>

                            {/* Product Name & thumbnail */}
                            <td className="p-4 px-6">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-800 tracking-tight max-w-[180px] truncate">
                                  {log.product?.name || "Deleted Product"}
                                </span>
                              </div>
                            </td>

                            {/* Quantity Badged Directional Alert */}
                            <td className="p-4 px-6 text-center whitespace-nowrap font-mono">
                              {isGain ? (
                                <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded font-extrabold text-xs">
                                  +{log.quantity} units
                                </span>
                              ) : (
                                <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded font-extrabold text-xs">
                                  {log.quantity} units
                                </span>
                              )}
                            </td>

                            {/* Pre vs Post stock balance */}
                            <td className="p-4 px-6 text-center text-gray-650 font-mono">
                              {log.prevStock} <span className="text-gray-300">→</span> <span className="font-bold text-gray-800">{log.newStock}</span>
                            </td>

                            {/* Adjustment Reason */}
                            <td className="p-4 px-6 text-gray-700">
                              <span className="flex items-center gap-1">
                                <CornerDownRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span className="font-semibold">{log.reason}</span>
                              </span>
                            </td>

                            {/* Authorized Actor */}
                            <td className="p-4 px-6 text-gray-400 text-xs flex items-center gap-1.5 whitespace-nowrap mt-2">
                              <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                              <span className="font-bold text-gray-600 bg-gray-50 pl-1 pr-2 py-0.5 border border-gray-100 rounded">
                                {log.actor || 'System'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DIALOG: RESTOCK / DEDUCT FOR PRODUCTS */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}>
        <DialogContent className="max-w-md rounded-lg p-6 bg-white border-none shadow-2xl modal-inventory-adjustment">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <CornerDownRight className="w-5 h-5 text-blue-600 block" />
              Adjust stock for: <span className="text-blue-600">{selectedProduct?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustStock} className="space-y-6 pt-4">
            <div className="space-y-4">
              {/* Type selector (Restock / Deduct) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">Adjustment Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('restock');
                      setAdjustReason('Manual Restock');
                    }}
                    className={cn(
                      "py-2 px-4 rounded-md text-xs font-bold border transition-all cursor-pointer",
                      adjustType === 'restock' 
                        ? "bg-green-500 text-white border-green-500 shadow-sm" 
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    🚀 Restock (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('deduct');
                      setAdjustReason('Inventory Correction');
                    }}
                    className={cn(
                      "py-2 px-4 rounded-md text-xs font-bold border transition-all cursor-pointer",
                      adjustType === 'deduct' 
                        ? "bg-red-500 text-white border-red-500 shadow-sm" 
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    ⚠️ Deduct (Subtract)
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Quantity (Units count)</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="rounded-md h-10 border-gray-200 text-sm focus:border-blue-500"
                  id="adjust-quantity-input"
                />
              </div>

              {/* Custom Reason Log */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Audit Notification Log Reason</Label>
                <Input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Replenished shipment, audit discrepancy adjustment"
                  className="rounded-md h-10 border-gray-200 text-sm focus:border-blue-500"
                  id="adjust-reason-input"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setSelectedProduct(null)} 
                className="flex-1 rounded-md h-10 border-gray-250 text-sm font-semibold cursor-pointer"
              >
                Dismiss
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className={cn(
                  "flex-1 h-10 rounded-md text-white border-none font-bold text-sm",
                  adjustType === 'restock' ? "bg-green-600 hover:bg-green-700" : "bg-red-650 hover:bg-red-750"
                )}
                id="btn-confirm-adjust"
              >
                {saving ? 'Recording changes...' : 'Publish Adjustments'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
