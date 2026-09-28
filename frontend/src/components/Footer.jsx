import React from 'react';
import { Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-slate-100 bg-white py-8 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#6C5CE7] flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="font-display font-bold text-slate-800">QuizPulse</span>
          <span className="text-slate-300">|</span>
          <span>Playful live quizzes for classrooms, events & competitions.</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Fast, friendly & mobile-first</span>
          <span>•</span>
          <Link to="/admin/login" className="hover:text-[#6C5CE7] transition-colors">Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}
