import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Image as ImageIcon,
  Check,
  X,
  Info
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("T-Shirts");

  useEffect(() => {
    if (editingProduct) {
      setSelectedCategory(editingProduct.category);
    } else {
      setSelectedCategory("T-Shirts");
    }
  }, [editingProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product added to collection');
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = (id: string) => {
    toast('Terminate this product?', {
      description: 'This action will permanently remove it from inventory.',
      action: {
        label: 'Yes, Kill it',
        onClick: async () => {
          try {
            await api.delete(`/products/${id}`);
            toast.success('Product purged from vault');
            setIsDialogOpen(false);
            setEditingProduct(null);
            fetchProducts();
          } catch (error: any) {
            console.error('Delete failed:', error);
            toast.error(error.response?.data?.message || 'Purge failed');
          }
        },
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-sm text-gray-500 font-medium">Add, update, or remove items from your catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}>
          <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded shadow-sm border-none" />}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-lg p-6 bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form key={editingProduct?.id || 'new'} onSubmit={handleCreateOrUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Product Name</Label>
                  <Input name="name" defaultValue={editingProduct?.name} required placeholder="e.g. Classic White T-Shirt" className="rounded-md h-10 border-gray-200 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Category</Label>
                  <input type="hidden" name="category" value={selectedCategory} />
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="rounded-md h-10 border-gray-200 bg-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100">
                      <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                      <SelectItem value="Name Slips">Name Slips</SelectItem>
                      <SelectItem value="Bottles">Bottles</SelectItem>
                      <SelectItem value="Cups">Cups</SelectItem>
                      <SelectItem value="Custom Printed">Custom Printed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-orange-50/70 border border-orange-100 rounded-lg p-3.5 space-y-1 md:col-span-2">
                  <p className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#ff5200]" /> Real Price & Discount Calculation Notice
                  </p>
                  <p className="text-[11px] text-gray-600 leading-normal">
                    Please provide the <strong>real, current Selling Price</strong> and the <strong>Original Price (MRP)</strong> for discount calculation. 
                    The storefront will display the percentage off based on these current values.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Selling Price (₹)</Label>
                  <Input name="price" type="number" step="any" defaultValue={editingProduct?.price} required className="rounded-md h-10 border-gray-200 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Original Price (₹)</Label>
                  <Input name="originalPrice" type="number" step="any" defaultValue={editingProduct?.originalPrice} placeholder="Optional for discount %" className="rounded-md h-10 border-gray-200 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Stock Quantity</Label>
                  <Input name="stock" type="number" defaultValue={editingProduct?.stock} required className="rounded-md h-10 border-gray-200 bg-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">Description</Label>
                <Textarea name="description" defaultValue={editingProduct?.description} required placeholder="Product details and specifications..." className="rounded-md min-h-[100px] border-gray-200 bg-white" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Product Image Upload (Auto-Saved Permanently)</Label>
                  <Input 
                    name="image" 
                    type="file" 
                    accept="image/*" 
                    className="rounded-md h-10 border-gray-200 bg-white cursor-pointer" 
                  />
                </div>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-150"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
                  <div className="flex-grow border-t border-gray-150"></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Direct Product Image URL (Internet Link)</Label>
                  <Input 
                    name="imageUrl" 
                    defaultValue={editingProduct?.images?.[0] && !editingProduct.images[0].startsWith('data:') ? editingProduct.images[0] : ''} 
                    placeholder="https://example.com/item-image.jpg" 
                    className="rounded-md h-10 border-gray-200 bg-white" 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-md h-10 font-bold border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-bold border-none">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="p-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-400 font-medium text-sm">Loading inventory...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-400 font-medium text-sm">No products found.</td>
                </tr>
              ) : products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                        <img 
                          src={(Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : ''} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 px-6">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-1 rounded-sm">
                       {product.category}
                     </span>
                  </td>
                  <td className="p-4 px-6 font-bold text-gray-900 text-sm">
                    <div>₹{product.price.toLocaleString()}</div>
                    {product.originalPrice && (
                      <div className="text-[10px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="p-4 px-6">
                     <span className={`text-sm font-bold ${product.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}</span>
                  </td>
                  <td className="p-4 px-6">
                    {product.stock > 0 ? (
                      <Badge className="bg-green-100 text-green-700 border-none px-2 font-bold text-[10px] uppercase tracking-wider rounded-sm py-0.5">In Stock</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-none px-2 font-bold text-[10px] uppercase tracking-wider rounded-sm py-0.5">Out of Stock</Badge>
                    )}
                  </td>
                  <td className="p-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900" />}>
                        <MoreHorizontal className="w-5 h-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-gray-100 text-gray-700">
                        <DropdownMenuItem onClick={() => {
                          setEditingProduct(product);
                          setIsDialogOpen(true);
                        }} className="cursor-pointer font-bold text-xs">
                          <Edit className="w-4 h-4 mr-2 text-blue-600" /> Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(product.id)} className="cursor-pointer text-red-600 font-bold text-xs">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
