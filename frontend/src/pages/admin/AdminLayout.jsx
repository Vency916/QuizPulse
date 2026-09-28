import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, HelpCircle, Radio, BarChart3, LogOut, Plus, ShieldCheck, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sounds } from '../../services/soundEffects';

export default function AdminLayout() {
  const { admin, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="font-display font-bold text-slate-500 animate-pulse">Verifying credentials...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  const handleLogout = async () => {
    sounds.playClick();
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Quizzes', path: '/admin/quizzes', icon: BookOpen },
    { label: 'Questions', path: '/admin/questions', icon: HelpCircle },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];


  return (
    <div className="min-h-screen flex bg-[#F8F9FC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-2 border-slate-100 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-slate-800 leading-tight">Admin Hub</div>
              <div className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wider">Super Admin</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => sounds.playClick()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-[#ECE9FE] text-[#6C5CE7] shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#6C5CE7]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            to="/"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Public Game View</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-[#FF7675] hover:bg-[#FFEBEB] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <div className="pt-2 px-4 text-[11px] text-slate-400 font-semibold truncate">
            {admin?.email}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#6C5CE7] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-slate-800">Admin</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/quizzes"
              className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl"
            >
              Quizzes
            </Link>
            <Link
              to="/admin/questions"
              className="text-xs font-bold text-[#6C5CE7] bg-[#ECE9FE] px-3 py-1.5 rounded-xl"
            >
              Questions
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-[#FF7675] p-1.5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
