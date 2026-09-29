import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Users, AlertCircle, ArrowLeft, Sparkles, BookOpen, CheckCircle, Radio } from 'lucide-react';
import api from '../../services/api';
import { useSession } from '../../context/SessionContext';
import { sounds } from '../../services/soundEffects';
import Mascot from '../../components/Mascot';

export default function JoinQuizPage() {
  const { sessionCode: paramCode } = useParams();
  const navigate = useNavigate();
  const { joinSession } = useSession();

  const [code, setCode] = useState(paramCode ? paramCode.toUpperCase() : '');
  const [username, setUsername] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch session details with gentle debounce to prevent flashing errors while typing
  useEffect(() => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setSessionDetails(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingQuiz(true);
      try {
        const res = await api.get(`/sessions/code/${trimmed}`);
        setSessionDetails(res.data.session);
        setError(null);
        if (res.data.session.groups && res.data.session.groups.length > 0) {
          setSelectedGroup(res.data.session.groups[0].id);
        }
      } catch (err) {
        setSessionDetails(null);
        setError(err.friendlyMessage || err.response?.data?.message || 'Quiz session not found. Please check code.');
      } finally {
        setLoadingQuiz(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please choose a username.');
      return;
    }

    if (!code.trim()) {
      setError('Please enter a game PIN.');
      return;
    }

    setSubmitting(true);
    setError(null);
    sounds.playClick();

    try {
      await joinSession(code.trim().toUpperCase(), username.trim(), selectedGroup || null);
      sounds.playCorrect();
      navigate(`/play/${code.trim().toUpperCase()}`);
    } catch (err) {
      sounds.playIncorrect();
      setError(err.friendlyMessage || err.response?.data?.message || 'Could not join quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gradient-to-b from-[#F6F4FF] via-[#FAF9FF] to-[#FFFFFF] relative overflow-hidden">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#6C5CE7]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00B894]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Back Link */}
        <button
          onClick={() => {
            sounds.playClick();
            navigate('/');
          }}
          className="mb-4 inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-[#6C5CE7] transition-all cursor-pointer bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Home</span>
        </button>

        {/* Main Join Card */}
        <div className="card-playful p-6 sm:p-8 bg-white border-2 border-[#ECE8FD] shadow-2xl shadow-[#6C5CE7]/10 relative">
          {/* Mascot Header */}
          <div className="text-center mb-6 relative">
            <div className="mb-2 animate-bounce">
              <Mascot mood={sessionDetails ? 'celebrating' : 'happy'} size={76} className="mx-auto" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Join Live Quiz
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Enter your game PIN & choose your nickname to compete!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#FFEAEA] border-2 border-[#FF7675]/30 text-[#DE4F4E] text-xs font-extrabold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Game PIN Input */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Game PIN
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EASY10"
                  maxLength={8}
                  required
                  className="w-full bg-[#FAF9FF] border-2 border-slate-200 focus:border-[#6C5CE7] focus:bg-white rounded-2xl px-5 py-3.5 font-display text-xl font-black tracking-widest text-center uppercase text-slate-800 placeholder:font-sans placeholder:text-sm placeholder:font-bold placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
                />
                {loadingQuiz && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Info Preview when PIN is found */}
            {sessionDetails && (
              <div
                className={`p-4 rounded-2xl border-2 flex items-center justify-between animate-fade-in ${
                  sessionDetails.status === 'finished'
                    ? 'bg-[#FFF8E6] border-[#FDE5A9]'
                    : 'bg-[#F6F4FF] border-[#DCD6FA]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        sessionDetails.status === 'finished' ? 'bg-[#E5AA3A]' : 'bg-[#00B894] animate-pulse'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        sessionDetails.status === 'finished' ? 'text-[#B7791F]' : 'text-[#6C5CE7]'
                      }`}
                    >
                      {sessionDetails.status === 'finished' ? '🏁 Quiz Ended' : 'Quiz Ready'}
                    </span>
                  </div>
                  <div className="font-display text-sm font-bold text-slate-800 line-clamp-1">
                    {sessionDetails.quiz?.title}
                  </div>
                </div>

                <div className="text-right text-[11px] font-extrabold text-slate-600">
                  <div className="flex items-center justify-end gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#6C5CE7]" />
                    <span>{sessionDetails.quiz?.total_questions || 10} Qs</span>
                  </div>
                  <div className={sessionDetails.status === 'finished' ? 'text-slate-400' : 'text-[#00B894]'}>
                    {sessionDetails.status === 'finished'
                      ? 'Concluded'
                      : `${sessionDetails.participants_count || 0} Playing`}
                  </div>
                </div>
              </div>
            )}

            {sessionDetails && sessionDetails.status === 'finished' ? (
              <div className="p-4 rounded-2xl bg-[#FFF8E6] border border-[#FDE5A9] text-center space-y-3 animate-fade-in">
                <p className="text-xs font-bold text-slate-700">
                  This live quiz session has ended and is no longer accepting new participants.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    navigate('/');
                  }}
                  className="btn-3d-purple w-full py-3 rounded-2xl font-display text-sm font-bold cursor-pointer"
                >
                  Back to Open Quizzes
                </button>
              </div>
            ) : (
              <>
                {/* Username Input */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Choose Your Nickname
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. SpeedyDave, Sarah, Alex"
                    maxLength={25}
                    required
                    className="w-full bg-[#FAF9FF] border-2 border-slate-200 focus:border-[#6C5CE7] focus:bg-white rounded-2xl px-5 py-3.5 font-display text-base font-bold text-slate-800 placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
                  />
                  <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                    No account required. Used for the real-time podium.
                  </span>
                </div>

                {/* Group Selection if groups enabled */}
                {sessionDetails && sessionDetails.groups && sessionDetails.groups.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Select Your Team
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sessionDetails.groups.map((group) => {
                        const isSelected = selectedGroup == group.id;
                        return (
                          <button
                            type="button"
                            key={group.id}
                            onClick={() => {
                              sounds.playClick();
                              setSelectedGroup(group.id);
                            }}
                            className={`p-3 rounded-2xl border-2 text-xs font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#6C5CE7] bg-[#ECE9FE] text-[#6C5CE7] shadow-sm'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: group.color || '#6C5CE7' }}
                            />
                            <span className="truncate">{group.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Chunky 3D Join Button (Matching Image 2 Green Style) */}
                <button
                  type="submit"
                  disabled={submitting || loadingQuiz}
                  className="btn-3d-green w-full py-4 rounded-2xl font-display text-lg font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-5"
                >
                  {submitting ? (
                    <span>Joining Quiz...</span>
                  ) : (
                    <>
                      <span>Enter Game</span>
                      <Play className="w-5 h-5 fill-white stroke-none" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
