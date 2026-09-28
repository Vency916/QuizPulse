import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Play,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Target,
  Crown,
  ChevronRight,
  Radio,
  BookOpen
} from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';
import Mascot from '../../components/Mascot';

export default function LandingPage() {
  const [pinCode, setPinCode] = useState('');
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Interactive In-Hero Question Preview State (Image 2 style interactive demo)
  const [demoSelected, setDemoSelected] = useState(2); // Option 2 (Franz Beckenbauer) is correct
  const [demoAnswerRevealed, setDemoAnswerRevealed] = useState(true);
  const [demoStreak, setDemoStreak] = useState(5);

  useEffect(() => {
    const fetchLiveQuizzes = async () => {
      try {
        const res = await api.get('/quizzes/live');
        setLiveSessions(res.data.live_sessions || []);
      } catch (err) {
        console.error('Failed to load live sessions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveQuizzes();
    const interval = setInterval(fetchLiveQuizzes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinByPin = (e) => {
    e.preventDefault();
    if (!pinCode.trim()) return;
    sounds.playClick();
    navigate(`/join/${pinCode.trim().toUpperCase()}`);
  };

  const handleDemoSelect = (idx) => {
    sounds.playClick();
    setDemoSelected(idx);
    setDemoAnswerRevealed(true);
    if (idx === 2) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }
  };

  // Mock sample options for the interactive hero preview (from Image 2)
  const demoOptions = [
    { text: 'Antonio Carbajal', isCorrect: false },
    { text: 'Lothar Matthaus', isCorrect: false },
    { text: 'Franz Beckenbauer', isCorrect: true },
    { text: 'Rafael Marquez', isCorrect: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F6F4FF] via-[#FAF9FF] to-[#FFFFFF] text-[#252A34]">
      {/* ═════════════════════════════════════════════════════════════════════
          1. HERO SECTION WITH MASCOT & INTERACTIVE PREVIEW
          ═════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Soft background glow accents */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#6C5CE7]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-[#00B894]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 pt-4">
          {/* Left Column: Headline, Pin Form, Features */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Pill Badge with Streak/Mascot */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#E4DEF8] shadow-sm mb-6">
              <div className="flex items-center gap-1 text-[#E5AA3A]">
                <Flame className="w-4 h-4 fill-[#FDCB6E] text-[#E5AA3A]" />
                <span className="text-xs font-black">{demoStreak} Days Streak</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C5CE7]">
                Gamified Live Quizzing
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#252A34] tracking-tight leading-[1.1] mb-6">
              Learn, Compete &{' '}
              <span className="text-[#6C5CE7] relative inline-block">
                Climb the Podium!
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#FDCB6E]"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Experience dynamic live trivia with real-time 3D podiums, instant speed bonuses, and zero registration. Enter a PIN or jump into open challenges!
            </p>

            {/* Quick Game PIN Box */}
            <div className="max-w-md mx-auto lg:mx-0 bg-white p-3 rounded-3xl border-2 border-[#E9E4F8] shadow-xl shadow-[#6C5CE7]/10 mb-8">
              <form onSubmit={handleJoinByPin} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                  placeholder="ENTER GAME PIN"
                  maxLength={8}
                  className="flex-1 bg-slate-50 border-2 border-slate-200 focus:border-[#6C5CE7] focus:bg-white rounded-2xl px-5 py-3.5 text-center font-display text-xl sm:text-2xl font-bold tracking-widest text-[#252A34] uppercase placeholder:font-sans placeholder:text-sm placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="btn-3d-purple px-8 py-3.5 rounded-2xl font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </form>
            </div>

            {/* Micro Feature Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200/80">
                <Zap className="w-4 h-4 text-[#6C5CE7]" />
                <span>Instant Speed Scoring</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200/80">
                <Trophy className="w-4 h-4 text-[#FDCB6E]" />
                <span>3D Live Podiums</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200/80">
                <Users className="w-4 h-4 text-[#00B894]" />
                <span>Up to 100+ Live Guests</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Question Preview (Exact Image 2 Style in Light Theme) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md relative">
              {/* Mascot Peeking from top-right */}
              <div className="absolute -top-12 -right-4 z-20 animate-bounce">
                <Mascot mood="celebrating" size={85} />
              </div>

              {/* Mobile Phone Mock Card Frame */}
              <div className="rounded-[2.5rem] bg-gradient-to-b from-[#6C5CE7] to-[#5544DB] p-4 sm:p-5 shadow-2xl shadow-[#6C5CE7]/30 border-4 border-white">
                {/* Header Bar inside Card */}
                <div className="flex items-center justify-between text-white mb-3 px-1">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
                    <span className="text-sm font-black">←</span>
                  </div>
                  <span className="font-display font-extrabold text-sm sm:text-base tracking-wide">
                    02 of 10
                  </span>
                  <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur flex items-center gap-1.5 text-xs font-black">
                    <Clock className="w-3.5 h-3.5 text-[#FDCB6E]" />
                    <span>03:58</span>
                  </div>
                </div>

                {/* Neon Progress Bar */}
                <div className="w-full h-1.5 bg-black/20 rounded-full mb-4 overflow-hidden">
                  <div className="w-1/5 h-full bg-[#00B894] rounded-full shadow-[0_0_8px_#00B894]" />
                </div>

                {/* Floating Question White Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-100">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    General Knowledge
                  </span>
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-800 leading-snug mb-5">
                    Who among the following does not have the record of playing the most World Cup?
                  </h3>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {demoOptions.map((opt, idx) => {
                      const isChosen = demoSelected === idx;
                      const isCorrect = opt.isCorrect;

                      let cardStyle = 'option-card-idle';
                      let icon = null;

                      if (demoAnswerRevealed) {
                        if (isCorrect) {
                          cardStyle = 'option-card-correct';
                          icon = (
                            <span className="w-6 h-6 rounded-full bg-[#00B894] text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </span>
                          );
                        } else if (isChosen && !isCorrect) {
                          cardStyle = 'option-card-wrong';
                          icon = (
                            <span className="w-6 h-6 rounded-full bg-[#FF7675] text-white flex items-center justify-center shrink-0 shadow-sm">
                              <X className="w-4 h-4 stroke-[3]" />
                            </span>
                          );
                        }
                      } else if (isChosen) {
                        cardStyle = 'option-card-selected';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleDemoSelect(idx)}
                          className={`w-full p-3.5 sm:p-4 rounded-2xl font-display font-bold text-sm sm:text-base flex items-center justify-between text-left transition-all cursor-pointer ${cardStyle}`}
                        >
                          <span className="leading-tight">{opt.text}</span>
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chunky 3D "Next" Button from Image 2 */}
                <div className="mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setDemoSelected(demoSelected === 2 ? 0 : 2);
                    }}
                    className="btn-3d-green w-full py-3.5 rounded-2xl font-display text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Next</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          2. GAMIFIED STATS & 3D PODIUM SECTION (Inspired by Image 1)
          ═════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECE9FE] text-[#6C5CE7] text-xs font-extrabold uppercase tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5" />
            Competitive Gamification
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-800">
            Climb Higher, Earn More XP
          </h2>
          <p className="text-slate-500 font-medium text-base mt-2">
            Every correct answer boosts your accuracy rating, powers your streak, and puts you on the center podium.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 5-Day Streak Feature (from Image 1) */}
          <div className="card-playful p-6 bg-white border-2 border-[#ECE8FD] shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Daily Consistency
                </span>
                <span className="w-9 h-9 rounded-2xl bg-[#FFF8E6] text-[#E5AA3A] flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-[#FDCB6E] text-[#E5AA3A]" />
                </span>
              </div>
              <h3 className="font-display text-2xl font-black text-slate-800 mb-1">
                5 Days Straight!
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Increases when you complete daily quizzes and returns to zero if you skip a day!
              </p>

              {/* Day of Week Tracker Pills */}
              <div className="flex items-center justify-between gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d, i) => (
                  <div key={d} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">{d}</span>
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        i < 5
                          ? 'bg-[#6C5CE7] text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-400'
                      }`}
                    >
                      {i < 5 ? '✓' : '•'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs font-bold text-[#6C5CE7] flex items-center gap-1">
              <span>Streak Bonus: +20% Points</span>
            </div>
          </div>

          {/* Card 2: 3D Live Podium Preview (from Image 1) */}
          <div className="card-playful p-6 bg-white border-2 border-[#ECE8FD] shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Live Standings
                </span>
                <span className="w-9 h-9 rounded-2xl bg-[#ECE9FE] text-[#6C5CE7] flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </span>
              </div>
              <h3 className="font-display text-2xl font-black text-slate-800 mb-1">
                Hall of Champions
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-4">
                The top 3 performers earn custom avatar podiums at the end of each round.
              </p>

              {/* Visual 3D Podium Stepped Base */}
              <div className="pt-6 pb-2 flex items-end justify-center gap-3">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600 mb-1 shadow-sm">
                    🥈
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Sarah</span>
                  <span className="text-[10px] font-extrabold text-[#6C5CE7]">850 XP</span>
                  <div className="w-16 h-12 rounded-t-xl podium-step-2 flex items-center justify-center font-display font-black text-white text-base">
                    2
                  </div>
                </div>

                {/* 1st Place (Center & Elevated) */}
                <div className="flex flex-col items-center -mt-4">
                  <span className="text-base animate-bounce">👑</span>
                  <div className="w-12 h-12 rounded-full border-2 border-[#FDCB6E] bg-[#FFF8E6] flex items-center justify-center font-black text-sm text-[#E5AA3A] mb-1 shadow-md">
                    🥇
                  </div>
                  <span className="text-xs font-black text-slate-800">Ada</span>
                  <span className="text-[10px] font-extrabold text-[#6C5CE7]">1,355 XP</span>
                  <div className="w-20 h-18 rounded-t-xl podium-step-1 flex items-center justify-center font-display font-black text-white text-xl">
                    1
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-300 bg-amber-50 flex items-center justify-center font-black text-xs text-amber-700 mb-1 shadow-sm">
                    🥉
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Alex</span>
                  <span className="text-[10px] font-extrabold text-[#6C5CE7]">520 XP</span>
                  <div className="w-16 h-9 rounded-t-xl podium-step-3 flex items-center justify-center font-display font-black text-white text-sm">
                    3
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-[#00B894] flex items-center gap-1 mt-2">
              <span>Podiums update live during gameplay</span>
            </div>
          </div>

          {/* Card 3: Diamonds, Badges & Rewards (from Image 1) */}
          <div className="card-playful p-6 bg-white border-2 border-[#ECE8FD] shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Progression System
                </span>
                <span className="w-9 h-9 rounded-2xl bg-[#E0F8F2] text-[#00B894] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </span>
              </div>
              <h3 className="font-display text-2xl font-black text-slate-800 mb-1">
                Badges & Rewards
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Unlock achievements, earn diamond points, and level up your trivia profile.
              </p>

              {/* Sample Badges List */}
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-2xl bg-[#FAF8FF] border border-[#ECE8FD] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#FFF8E6] flex items-center justify-center text-sm">
                      👑
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Quiz King</div>
                      <div className="text-[10px] font-bold text-slate-400">Score 1,000+ points</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#6C5CE7] bg-[#ECE9FE] px-2 py-0.5 rounded-lg">
                    +50 💎
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF8FF] border border-[#ECE8FD] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#E0F8F2] flex items-center justify-center text-sm">
                      ⚡
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Speed Demon</div>
                      <div className="text-[10px] font-bold text-slate-400">Answer under 2.0s</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#00B894] bg-[#E0F8F2] px-2 py-0.5 rounded-lg">
                    +25 💎
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF8FF] border border-[#ECE8FD] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#FFEAEA] flex items-center justify-center text-sm">
                      🎯
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Flawless Aim</div>
                      <div className="text-[10px] font-bold text-slate-400">100% Accuracy round</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF7675] bg-[#FFEAEA] px-2 py-0.5 rounded-lg">
                    +40 💎
                  </span>
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-[#6C5CE7] flex items-center gap-1 mt-4">
              <span>Collect diamonds on every match</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          3. ACTIVE LIVE QUIZZES DISCOVERY SECTION
          ═════════════════════════════════════════════════════════════════════ */}
      <section id="live-quizzes" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00B894] animate-ping" />
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800">
                Live & Active Quizzes
              </h2>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Join an open live session right now or browse self-paced quizzes.
            </p>
          </div>

          <span className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-sm">
            {liveSessions.length} {liveSessions.length === 1 ? 'Session' : 'Sessions'} Available
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Checking for live game sessions...</p>
          </div>
        ) : liveSessions.length === 0 ? (
          <div className="card-playful p-10 text-center max-w-md mx-auto bg-white border-2 border-slate-100 shadow-md">
            <Mascot mood="thinking" size={70} className="mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-slate-700 mb-1">
              No Open Games at this Moment
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Ask your quiz host for their Game PIN or launch a host session from the Admin Hub.
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="btn-3d-purple px-6 py-2.5 rounded-2xl text-sm font-bold cursor-pointer"
            >
              Host a Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveSessions.map((session) => (
              <div
                key={session.id}
                className="card-playful card-playful-hover p-5 bg-white border-2 border-[#ECE8FD] shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top Tags */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-[#ECE9FE] text-[#6C5CE7]">
                      {session.quiz?.category || 'Trivia'}
                    </span>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-[#E0F8F2] text-[#00B894] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00B894] animate-pulse" />
                      {session.status === 'waiting' ? 'Lobby Open' : 'In Progress'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display text-xl font-bold text-slate-800 line-clamp-1 mb-2">
                    {session.quiz?.title || 'Live Quiz'}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 font-medium mb-4">
                    {session.quiz?.description || 'Fast-paced multiplayer trivia session.'}
                  </p>

                  {/* Meta Pills */}
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#6C5CE7]" />
                      <span>{session.participants_count || 0} Joined</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#00B894]" />
                      <span>{session.quiz?.total_questions || 10} Questions</span>
                    </div>
                  </div>
                </div>

                {/* PIN and Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Game PIN</span>
                    <span className="font-display text-lg font-black text-[#6C5CE7] tracking-wider">
                      {session.session_code}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      navigate(`/join/${session.session_code}`);
                    }}
                    className="btn-3d-green px-5 py-2.5 rounded-xl font-display text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Join Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          4. LIGHT THEME FOOTER
          ═════════════════════════════════════════════════════════════════════ */}
      <footer className="mt-auto border-t border-[#ECE8FD] bg-white/70 backdrop-blur py-8 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mascot mood="happy" size={32} />
            <span className="font-display font-black text-lg text-slate-800">
              Quiz<span className="text-[#6C5CE7]">Pulse</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#ECE9FE] text-[#6C5CE7]">
              v2.0
            </span>
          </div>

          <p className="text-xs text-slate-500 font-semibold">
            Designed for interactive learning, classroom engagement, and high-energy multiplayer trivia.
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <button
              onClick={() => navigate('/admin/login')}
              className="hover:text-[#6C5CE7] transition-colors"
            >
              Host Console
            </button>
            <span>•</span>
            <a href="#live-quizzes" className="hover:text-[#6C5CE7] transition-colors">
              Live Quizzes
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
