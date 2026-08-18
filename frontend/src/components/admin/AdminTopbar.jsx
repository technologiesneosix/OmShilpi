import React, { useState } from 'react';
import { Menu, User, LogOut, ChevronDown, Shield, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminTopbar = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-[#16171d] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 text-white">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="lg:hidden p-2 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
          Om Shilpi Jewels Management Platform
        </span>
      </div>

      {/* Admin User Profile */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800 transition cursor-pointer text-xs"
        >
          <div className="w-8 h-8 rounded-full bg-[#7b5818] text-white flex items-center justify-center font-bold font-serif text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block font-semibold text-white leading-tight">{user?.name}</span>
            <span className="block text-[10px] text-[#b98f4a] uppercase font-bold">{user?.role}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#1f2028] border border-slate-700 rounded shadow-xl py-2 z-50 text-xs">
            <div className="px-4 py-2 border-b border-slate-800">
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-slate-800 text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out Admin
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
