import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Play, Volume2, VolumeX, Shield, Radio } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { useAuth } from '../context/AuthContext';

import Mascot from './Mascot';

export default function Navbar() {
  const [muted, setMuted] = useState(sounds.muted);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleToggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
    if (!isMuted) sounds.playClick();
  };

  const isPlayPage = location.pathname.startsWith('/play/');

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-slate-100 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2.5 group"
        >
          <Mascot mood="happy" size={38} className="group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="font-display text-xl font-black tracking-tight text-[#252A34] flex items-center gap-1">
              Quiz<span className="text-[#6C5CE7]">Pulse</span>
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        {!isPlayPage && (
          <nav className="hidden sm:flex items-center gap-6">
            <a 
              href="#live-quizzes" 
              onClick={() => sounds.playClick()}
              className="text-sm font-semibold text-slate-600 hover:text-[#6C5CE7] flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-4 h-4 text-[#00B894] animate-pulse" />
              Live Quizzes
            </a>
            <Link 
              to="/join" 
              onClick={() => sounds.playClick()}
              className="text-sm font-semibold text-slate-600 hover:text-[#6C5CE7] transition-colors"
            >
              Enter Code
            </Link>
          </nav>
        )}

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label="Toggle Sound"
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title={muted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#6C5CE7]" />}
          </button>

          {/* Join CTA */}
          <Link
            to="/join"
            onClick={() => sounds.playClick()}
            className="btn-3d-secondary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span className="hidden xs:inline">Join</span> Quiz
          </Link>

          {/* Super Admin Access */}
          <Link
            to={isAuthenticated ? '/admin' : '/admin/login'}
            onClick={() => sounds.playClick()}
            aria-label="Admin Portal"
            className="p-2 rounded-xl text-slate-400 hover:text-[#6C5CE7] hover:bg-[#ECE9FE]/40 transition-colors"
            title="Super Admin Portal"
          >
            <Shield className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
