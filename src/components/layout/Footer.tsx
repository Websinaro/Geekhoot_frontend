import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-400 border-t border-gray-100 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#ff5200]/5 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          {/* Brand */}
          <div className="space-y-8">
            <Link to="/" className="flex flex-col leading-none group text-black">
               <span className="text-3xl font-black italic tracking-tighter uppercase group-hover:text-[#ff5200] transition-colors">Geekhoot</span>
               <span className="text-[9px] italic font-black text-gray-300 flex items-center gap-1 mt-1 uppercase tracking-widest">
                 System Version 2.0.4
               </span>
            </Link>
            <p className="text-sm font-medium leading-relaxed max-w-xs text-gray-400 uppercase tracking-tight">
              Elite inventory manifest for premium gadgets and handcrafted masterpieces. Execute your style protocol.
            </p>
            <div className="flex gap-4 pt-4">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <div key={i} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-[#ff5200] hover:text-white transition-all cursor-pointer border border-gray-100 shadow-sm">
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="text-black font-black uppercase text-xs tracking-[0.4em] border-l-2 border-[#ff5200] pl-4">Inventory Sectors</h3>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
              <li><Link to="/products" className="hover:text-[#ff5200] transition-colors text-gray-400">All Operations</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-[#ff5200] transition-colors text-gray-400">Digital Cores</Link></li>
              <li><Link to="/products?category=Accessories" className="hover:text-[#ff5200] transition-colors text-gray-400">Linkage Modules</Link></li>
              <li><Link to="/products?category=Wearables" className="hover:text-[#ff5200] transition-colors text-gray-400">Bio-Link Systems</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h3 className="text-black font-black uppercase text-xs tracking-[0.4em] border-l-2 border-[#ff5200] pl-4">Node Operations</h3>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
              <li><Link to="/profile" className="hover:text-[#ff5200] transition-colors text-gray-400">Identity Manifest</Link></li>
              <li><Link to="/orders" className="hover:text-[#ff5200] transition-colors text-gray-400">Logistics Track</Link></li>
              <li><Link to="/faq" className="hover:text-[#ff5200] transition-colors text-gray-400">Sync Protocol FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-[#ff5200] transition-colors text-gray-400">Engagement Terms</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <h3 className="text-black font-black uppercase text-xs tracking-[0.4em] border-l-2 border-[#ff5200] pl-4">Signal Terminal</h3>
            <ul className="space-y-6 text-[10px] font-black uppercase tracking-widest">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#ff5200] shrink-0" />
                <span className="leading-relaxed text-gray-400">Sector 7, Tech Park, <br />Bypass Region, Kochi, IN</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-[#ff5200] shrink-0" />
                <span className="text-gray-400">+91 81388 72364</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-[#ff5200] shrink-0" />
                <span className="lowercase text-gray-400">vAULT@GEEKHOOT.IO</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-300">
            © {new Date().getFullYear()} Geekhoot Architecture. Node Locked.
          </p>
          <div className="flex items-center gap-6">
             <div className="h-0.5 w-12 bg-gray-100"></div>
             <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff5200] italic">
               Powered by WEBSINARO
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
