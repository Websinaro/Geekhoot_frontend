import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { User, Mail, Phone, MapPin, Settings, Shield, LogOut, ChevronRight, Edit3, Home, Calendar, ArrowRight, Save, X, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/src/components/common/ThemeProvider';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/src/services/api';

export default function Profile() {
  const { user, clearAuth, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    houseNo: '',
    streetNear: '',
    road: '',
    district: '',
    state: '',
    pincode: '',
  });

  // Load user data into form state when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        houseNo: user.houseNo || '',
        streetNear: user.streetNear || '',
        road: user.road || '',
        district: user.district || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user, isEditing]);

  if (!user) return null;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Name, Email, and Phone number are required.');
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      setUser(data.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white min-h-screen transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Profile Info */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="w-32 h-32 rounded-full shadow-sm border-4 border-gray-50 bg-gray-50">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                  <AvatarFallback className="text-3xl font-bold bg-[#ff5200] text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <Badge className="bg-blue-50 text-blue-600 border border-blue-100 font-bold px-3 py-1">
                    {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                  </Badge>
                  <p className="text-sm text-gray-400 font-medium">Member Account</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Personal & Delivery Information</h2>
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline" 
                    className="border-gray-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-sm h-9 gap-1.5"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Account Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                      <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <input 
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6 space-y-6">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Detailed Delivery Address</p>
                      <p className="text-[11px] text-gray-400 mb-4 font-medium">Please fill in these details strictly to complete orders via WhatsApp.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">House/Flat Number</label>
                          <input 
                            type="text"
                            name="houseNo"
                            value={formData.houseNo}
                            onChange={handleInputChange}
                            placeholder="e.g. Flat 4B, Emerald Apts"
                            className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Street Name / Near Landmark</label>
                          <input 
                            type="text"
                            name="streetNear"
                            value={formData.streetNear}
                            onChange={handleInputChange}
                            placeholder="e.g. Baker Street, near Clocktower"
                            className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Road / Area / Sector</label>
                          <input 
                            type="text"
                            name="road"
                            value={formData.road}
                            onChange={handleInputChange}
                            placeholder="e.g. Ring Road, Sector 4"
                            className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Inline Address Line</label>
                          <input 
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="e.g. Baker Street, Sector 4"
                            className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">District / City</label>
                          <input 
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            placeholder="e.g. Ernakulam"
                            className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">State</label>
                          <input 
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="e.g. Kerala"
                            className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pincode</label>
                          <input 
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="e.g. 682011"
                            className="w-full px-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-sm text-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 border-t border-gray-100 pt-6">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-11 gap-1.5 border-none"
                    >
                      <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Details'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-bold px-6 h-11 gap-1.5"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</p>
                    <div className="flex items-center gap-3 text-gray-900 font-medium font-sans">
                      <Mail className="w-5 h-5 text-gray-400" />
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</p>
                    <div className="flex items-center gap-3 text-gray-900 font-medium font-sans">
                      <Phone className="w-5 h-5 text-gray-400" />
                      {user.phone || <span className="text-red-400 italic font-bold">Not filled</span>}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Shipping Address</p>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
                      <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-orange-500 shrink-0 mt-1" />
                        <div className="space-y-3 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">House/Flat No.</span>
                              <span className="font-semibold text-gray-800 text-sm font-sans">{user.houseNo || <span className="text-red-400 italic">Not filled</span>}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Street / Near Landmark</span>
                              <span className="font-semibold text-gray-800 text-sm font-sans">{user.streetNear || <span className="text-red-400 italic">Not filled</span>}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Road / Area</span>
                              <span className="font-semibold text-gray-800 text-sm font-sans">{user.road || <span className="text-red-400 italic">Not filled</span>}</span>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-200/60 pt-2 font-bold text-gray-950 font-sans">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Full Inline Address</span>
                            {user.address || <span className="text-red-400 italic">Not filled</span>}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="text-xs bg-white px-3 py-1 rounded border border-gray-200 text-gray-600 font-bold font-sans">
                              District: {user.district || 'Not filled'}
                            </span>
                            <span className="text-xs bg-white px-3 py-1 rounded border border-gray-200 text-gray-600 font-bold font-sans">
                              State: {user.state || 'Not filled'}
                            </span>
                            <span className="text-xs bg-white px-3 py-1 rounded border border-gray-200 text-gray-600 font-bold font-sans">
                              Pincode: {user.pincode || 'Not filled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings / Actions */}
          <div className="lg:w-80 shrink-0 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden divide-y divide-gray-50 dark:divide-zinc-800">
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 px-2 text-sm uppercase tracking-wider">Account Settings</h3>
                <div className="space-y-1">
                  <button onClick={() => navigate('/orders')} className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-450" />
                      <span className="text-sm font-bold text-gray-750 dark:text-zinc-200 font-sans">My Orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-450" />
                      <span className="text-sm font-bold text-gray-750 dark:text-zinc-200 font-sans">Manage Address</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-bold font-sans">Logout</span>
                </button>
              </div>
            </div>

            {/* Web Page Settings Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 p-5 space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Web Page Settings</h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Personalize your application display theme</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-3 rounded border text-[11px] font-bold transition-all gap-1.5 cursor-pointer ${
                    theme === 'light'
                      ? 'border-[#ff5200] bg-orange-50/10 text-[#ff5200] dark:bg-orange-950/20'
                      : 'border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sun className="w-4.5 h-4.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-3 rounded border text-[11px] font-bold transition-all gap-1.5 cursor-pointer ${
                    theme === 'dark'
                      ? 'border-[#ff5200] bg-orange-50/10 text-[#ff5200] dark:bg-orange-950/20'
                      : 'border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Moon className="w-4.5 h-4.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-3 rounded border text-[11px] font-bold transition-all gap-1.5 cursor-pointer ${
                    theme === 'system'
                      ? 'border-[#ff5200] bg-orange-50/10 text-[#ff5200] dark:bg-orange-950/20'
                      : 'border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Laptop className="w-4.5 h-4.5" />
                  <span>System</span>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#ff5200] to-orange-600 rounded-lg p-8 text-white shadow-md">
               <h4 className="text-xl font-bold mb-2">WhatsApp Ordering</h4>
               <p className="text-sm text-orange-50 mb-6 font-medium">Make sure your detailed address (House No, Street Near, Road) is complete before purchasing items.</p>
               <Button 
                onClick={() => navigate('/')}
                className="w-full bg-white text-[#ff5200] hover:bg-orange-50 font-bold h-10 rounded shadow-sm border-none cursor-pointer"
               >
                 Go to Store
               </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
