import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function Navbar() {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">MedVault</span>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-gray-900 tracking-tight">{userData?.name || user.displayName}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{userData?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-3 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
