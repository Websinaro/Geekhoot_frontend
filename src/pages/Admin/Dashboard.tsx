import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Bell,
  ShieldCheck,
  Archive
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/src/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AdminProducts from './Products';
import AdminOrders from './Orders';
import AdminInventory from './Inventory';

const StatCard = ({ title, value, change, trend, icon: Icon }: any) => (
  <Card className="rounded-lg border border-gray-100 shadow-sm bg-white overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-[#ff5200] group-hover:bg-[#ff5200] group-hover:text-white transition-all">
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center text-[10px] sm:text-xs font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-500'} bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 shrink-0 whitespace-nowrap`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {typeof change === 'number' ? change.toFixed(1) : change}%
        </div>
      </div>
      <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </CardContent>
  </Card>
);

const AdminOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium">Overview of your store performance</p>
        </div>
        <div className="flex gap-3">
           <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm border-none">
             <Plus className="w-4 h-4 mr-2" /> Quick Action
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.revenue.toLocaleString()}`} 
          change={stats.revenueGrowth} 
          trend={stats.revenueGrowth >= 0 ? "up" : "down"} 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          change={stats.ordersGrowth} 
          trend={stats.ordersGrowth >= 0 ? "up" : "down"} 
          icon={ShoppingBag} 
        />
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          change={stats.usersGrowth} 
          trend={stats.usersGrowth >= 0 ? "up" : "down"} 
          icon={Users} 
        />
        <StatCard 
          title="Total Products" 
          value={stats.products} 
          change={stats.productsGrowth} 
          trend="up" 
          icon={Package} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-lg border border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-4 text-gray-900">
               Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-gray-50">
               {stats.recentOrders.length > 0 ? stats.recentOrders.map((order: any) => (
                 <div key={order.id} className="flex items-center justify-between p-4 px-6 hover:bg-gray-50 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center font-bold text-gray-400 text-[10px] border border-gray-100">
                       ODR
                     </div>
                     <div>
                       <p className="font-bold text-gray-900 text-sm">{order.user.name}</p>
                       <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{order.user.district || 'Location Unknown'}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-sm text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                     <p className={cn(
                       "text-[9px] font-bold px-2 py-0.5 rounded-sm mt-1",
                       order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 
                       order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                     )}>
                       {order.status}
                     </p>
                   </div>
                 </div>
               )) : (
                 <p className="text-center py-10 text-gray-400 font-medium text-sm">No recent orders.</p>
               )}
             </div>
             <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link 
                  to="orders" 
                  className="text-blue-600 font-bold text-xs hover:underline block text-center"
                >
                   View all orders
                </Link>
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-4 text-gray-900">
               Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="space-y-3">
               {stats.stockAlerts.length > 0 ? stats.stockAlerts.map((product: any) => (
                 <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded border border-red-100">
                   <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-bold text-red-700 text-sm truncate max-w-[150px]">{product.name}</p>
                        <p className="text-[10px] font-medium text-red-400">Only {product.stock} left</p>
                      </div>
                   </div>
                   <Link 
                     to={`/admin/products`}
                     className="bg-white px-3 py-1.5 rounded border border-red-200 text-[10px] font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase"
                   >
                     Restock
                   </Link>
                 </div>
               )) : (
                 <div className="py-10 text-center">
                    <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium text-sm">All inventory is looking good.</p>
                 </div>
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Archive, label: 'Inventory', path: '/admin/inventory' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 sticky top-16 h-[calc(100vh-64px)]">
        <div className="p-4 flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all ${
                (link.path === '/admin' ? currentPath === '/admin' : currentPath.startsWith(link.path))
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <link.icon className={cn("w-4 h-4", (link.path === '/admin' ? currentPath === '/admin' : currentPath.startsWith(link.path)) ? "text-white" : "text-gray-400")} />
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto p-4 border-t border-gray-100">
           <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
              <h4 className="text-xs font-bold text-blue-700 mb-1">Admin Panel</h4>
              <p className="text-[10px] text-blue-500 font-medium mb-3">Version 2.0.4</p>
              <Button size="sm" className="w-full h-8 bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold border-none">
                System Status
              </Button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-10 bg-[#f8f9fa] overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
           {/* Top bar for mobile */}
           <div className="flex lg:hidden flex-wrap items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
             {sidebarLinks.map((link) => (
               <Link 
                 key={link.path} 
                 to={link.path}
                 className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs whitespace-nowrap transition-all border ${
                   (link.path === '/admin' ? currentPath === '/admin' : currentPath.startsWith(link.path))
                     ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                     : 'text-gray-500 bg-white border-gray-200'
                 }`}
               >
                 <link.icon className="w-4 h-4" />
                 {link.label}
               </Link>
             ))}
           </div>

           <Routes>
             <Route path="/" element={<AdminOverview />} />
             <Route path="/products" element={<AdminProducts />} />
             <Route path="/inventory" element={<AdminInventory />} />
             <Route path="/orders" element={<AdminOrders />} />
             <Route path="/users" element={<div className="p-12 text-center text-gray-400 font-bold">User Management coming soon...</div>} />
           </Routes>
        </div>
      </div>
    </div>
  );
}
