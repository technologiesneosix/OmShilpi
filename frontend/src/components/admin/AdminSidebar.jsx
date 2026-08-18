import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Sparkles,
  Boxes,
  ShoppingBag,
  FileText,
  Image,
  MessageSquare,
  Settings,
  ExternalLink,
  Crown,
} from 'lucide-react';

export const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Collections', path: '/admin/collections', icon: Sparkles },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Content CMS', path: '/admin/content', icon: FileText },
    { label: 'Media Library', path: '/admin/media', icon: Image },
    { label: 'Customer Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#16171d] text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Om Shilpi Jewels CMS"
              className="h-12 w-auto object-contain bg-white/90 p-1 rounded shadow-sm"
            />
            <div>
              <h1 className="font-serif text-xs font-bold text-white tracking-wider">ADMIN CMS</h1>
              <p className="text-[9px] uppercase text-[#b98f4a] font-semibold tracking-widest">Management</p>
            </div>
          </Link>
        </div>

        {/* Nav Links List */}
        <nav className="p-3 space-y-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded font-medium transition ${
                    isActive
                      ? 'bg-[#7b5818] text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-800/80 hover:text-white text-slate-400'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Storefront Link */}
      <div className="p-4 border-t border-slate-800 bg-[#121318]">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-[#b98f4a] bg-slate-800/60 hover:bg-slate-800 rounded transition"
        >
          <span>View Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
};
