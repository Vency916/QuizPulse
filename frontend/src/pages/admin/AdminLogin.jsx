import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sounds } from '../../services/soundEffects';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    sounds.playClick();
    setEmail('admin@quizpulse.com');
    setPassword('password123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    sounds.playClick();

    try {
      await login(email, password);
      sounds.playCorrect();
      navigate('/admin');
    } catch (err) {
      sounds.playIncorrect();
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gradient-to-b from-[#ECE9FE]/40 to-[#F8F9FC]">
      <div className="max-w-md w-full">
        <div className="card-playful p-6 sm:p-8 bg-white border-2 border-slate-100 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white mx-auto mb-3 shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-800">
              Super Admin Access
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to manage quizzes, host live sessions & view analytics
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-[#FFEBEB] border border-[#FF7675]/30 text-[#E85B5A] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quizpulse.com"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#6C5CE7] focus:bg-white rounded-2xl pl-12 pr-4 py-3 font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#6C5CE7] focus:bg-white rounded-2xl pl-12 pr-4 py-3 font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-3d-primary w-full py-3.5 rounded-2xl font-display text-base font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-bold text-[#6C5CE7] bg-[#ECE9FE] hover:bg-[#DCD6FA] px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autofill Demo Credentials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
