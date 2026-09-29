import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  BarChart3,
  LogOut,
  Plus,
  ShieldCheck,
  Home,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sounds } from '../../services/soundEffects';

export default function AdminLayout() {
  const { admin, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="font-display font-bold text-slate-500 animate-pulse flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
          <span>Verifying credentials...</span>
        </div>
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
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Quizzes', path: '/admin/quizzes', icon: BookOpen, exact: false },
    { label: 'Questions', path: '/admin/questions', icon: HelpCircle, exact: false },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, exact: false },
  ];

  const isNavActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FC]">
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR (Visible on md and up) */}
      {/* ============================================================== */}
      <aside className="w-64 bg-white border-r-2 border-slate-100 flex-col justify-between shrink-0 hidden md:flex sticky top-0 h-screen z-20">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Hub Header */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8C7AE6] flex items-center justify-center text-white shadow-md shadow-[#6C5CE7]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-extrabold text-lg text-slate-800 leading-tight">Admin Hub</div>
              <div className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wider">Super Admin</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => sounds.playClick()}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                    active
                      ? 'bg-[#ECE9FE] text-[#6C5CE7] shadow-sm translate-x-1'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-[#6C5CE7]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-[#6C5CE7]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <Link
            to="/"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
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

          <div className="pt-2 px-4 text-[11px] text-slate-400 font-semibold truncate border-t border-slate-100/80">
            {admin?.email}
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE TOP BAR (With Hamburger Button) */}
      {/* ============================================================== */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle navigation menu"
            className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#6C5CE7]" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo & Title */}
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8C7AE6] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm text-slate-800 leading-none block">
                Admin Hub
              </span>
              <span className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-wider block">
                Super Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/quizzes"
            onClick={() => sounds.playClick()}
            className="btn-3d-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </Link>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MOBILE DRAWER NAVIGATION & BACKDROP */}
      {/* ============================================================== */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          sounds.playClick();
          setMobileMenuOpen(false);
        }}
      />

      {/* Slide-out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-[290px] max-w-[85vw] bg-white z-50 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8C7AE6] flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-extrabold text-base text-slate-800 leading-tight">Admin Hub</div>
                <div className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-wider">Super Admin</div>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                setMobileMenuOpen(false);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Info Card */}
          <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-[#ECE9FE]/80 to-[#ECE9FE]/30 rounded-2xl border border-[#6C5CE7]/15">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center font-display font-extrabold text-sm shadow-sm">
                  {admin?.email ? admin.email.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="w-3 h-3 rounded-full bg-[#00B894] border-2 border-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {admin?.email || 'admin@quizpulse.com'}
                </div>
                <div className="text-[10px] font-semibold text-[#6C5CE7] uppercase tracking-wide flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Full Permissions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Management Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => sounds.playClick()}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                    active
                      ? 'bg-[#ECE9FE] text-[#6C5CE7] shadow-sm font-extrabold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-[#6C5CE7]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-[#6C5CE7]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50">
          <Link
            to="/"
            onClick={() => sounds.playClick()}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-slate-400" />
              <span>Public Game View</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs text-[#FF7675] hover:bg-[#FFEBEB] transition-colors cursor-pointer border border-[#FF7675]/20 bg-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Admin</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
