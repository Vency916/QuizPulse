import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, SkipForward, CheckCircle, BarChart2, Pause, Square, QrCode, Maximize2, Minimize2, Users, HelpCircle, ArrowLeft, Volume2, VolumeX, Zap, Lock, Clock } from 'lucide-react';
import api from '../../services/api';
import Timer from '../../components/Timer';
import QRCodeModal from '../../components/QRCodeModal';
import { sounds } from '../../services/soundEffects';

export default function LiveControlPanel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [projectorMode, setProjectorMode] = useState(false);
  const [leaderboard, setLeaderboard] = useState({ individual: [], groups: [] });
  const [actionLoading, setActionLoading] = useState(false);
  const sessionCodeRef = useRef(null);

  const fetchSession = async () => {
    try {
      let code = sessionCodeRef.current;
      if (!code) {
        const res = await api.get(`/admin/sessions/${id}/analytics`);
        code = res.data.session?.session_code;
        sessionCodeRef.current = code;
      }
      if (!code) return;

      const liveRes = await api.get(`/sessions/code/${code}`);
      setSession(liveRes.data.session);

      if (liveRes.data.session.status === 'finished') {
        setLeaderboard((prev) => {
          if (!prev.individual || prev.individual.length === 0) {
            api.get(`/sessions/${code}/leaderboard`).then((b) => setLeaderboard(b.data)).catch(() => {});
          }
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 2000); // 2s polling
    return () => clearInterval(interval);
  }, [id]);

  // Action Handlers — instantly update local state with optimistic visual feedback
  const handleStart = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    sounds.playClick();
    try {
      const res = await api.post(`/admin/sessions/${id}/start`);
      sounds.playCorrect();
      if (res.data?.session) setSession(res.data.session);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShowAnswer = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    sounds.playClick();
    try {
      const res = await api.post(`/admin/sessions/${id}/show-answer`);
      sounds.playCorrect();
      if (res.data?.session) setSession(res.data.session);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    sounds.playClick();
    try {
      const res = await api.post(`/admin/sessions/${id}/next-question`);
      sounds.playClick();
      if (res.data?.session) setSession(res.data.session);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    sounds.playClick();
    try {
      const res = await api.post(`/admin/sessions/${id}/pause`);
      if (res.data?.session) setSession(res.data.session);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    sounds.playClick();
    try {
      const res = await api.post(`/admin/sessions/${id}/resume`);
      if (res.data?.session) setSession(res.data.session);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndQuiz = async () => {
    if (!confirm('Are you sure you want to end this live quiz? Final results will be saved.')) return;
    sounds.playClick();
    const res = await api.post(`/admin/sessions/${id}/end`);
    sounds.playFanfare();
    if (res.data?.session) setSession(res.data.session);
    else fetchSession();
  };

  const handleToggleLobby = async () => {
    sounds.playClick();
    const res = await api.post(`/admin/sessions/${id}/toggle-lobby`);
    if (res.data?.session) setSession(res.data.session);
    else fetchSession();
  };

  const handleToggleTimer = async () => {
    sounds.playClick();
    try {
      const res = await api.post(`/admin/sessions/${id}/toggle-timer`);
      if (res.data?.session) setSession(res.data.session);
      else fetchSession();
    } catch (err) {
      console.error('Failed to toggle timer:', err);
    }
  };

  if (loading || !session) {
    return (
      <div className="p-8 text-center font-bold text-slate-500">
        Connecting to live host console...
      </div>
    );
  }

  const currentQ = session.current_question;
  const isLastQuestion = currentQ && currentQ.order >= currentQ.total_questions;

  return (
    <div className={`space-y-6 ${projectorMode ? 'fixed inset-0 z-50 bg-[#F8F9FC] p-8 overflow-y-auto' : ''}`}>
      {/* Host Bar Header */}
      <div className="card-playful p-4 sm:p-6 bg-white border-2 border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!projectorMode && (
            <button
              onClick={() => {
                sounds.playClick();
                navigate('/admin');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-extrabold text-xl sm:text-2xl text-slate-800">
                {session.quiz.title}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#ECE9FE] text-[#6C5CE7]">
                PIN: {session.session_code}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#00B894]" />
                {session.participants_count} Players Connected
              </span>
              <span>•</span>
              <span className="uppercase text-[#6C5CE7]">{session.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Pace Mode & Timer Toggle Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleLobby}
            title={session.lobby_enabled ? 'Switch to Self-Paced (Fast Mode)' : 'Switch to Host-Controlled (Lobby)'}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-2 ${
              session.lobby_enabled || session.pace_mode === 'host_controlled'
                ? 'border-[#6C5CE7] bg-[#ECE9FE] text-[#6C5CE7]'
                : 'border-[#00B894] bg-[#E0F8F2] text-[#00B894]'
            }`}
          >
            {session.lobby_enabled || session.pace_mode === 'host_controlled' ? (
              <><Lock className="w-3.5 h-3.5" /><span>Lobby: Holding</span></>
            ) : (
              <><Zap className="w-3.5 h-3.5" /><span>Fast Mode: ON</span></>
            )}
          </button>

          <button
            onClick={handleToggleTimer}
            title={session.settings?.timer_enabled !== false ? 'Turn timer OFF for quiz (Untimed mode)' : 'Turn timer ON for quiz (Countdown mode)'}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-2 ${
              session.settings?.timer_enabled !== false
                ? 'border-[#0984E3] bg-[#EBF5FB] text-[#0984E3]'
                : 'border-amber-500 bg-amber-50 text-amber-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{session.settings?.timer_enabled !== false ? 'Timer: ON' : 'Timer: OFF (Untimed)'}</span>
          </button>
        </div>

        {/* Primary Host Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {session.status === 'waiting' && (
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className={`btn-3d-secondary px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md ${
                actionLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{actionLoading ? 'Starting...' : 'Start Live Quiz'}</span>
            </button>
          )}

          {session.status === 'live_question' && (
            <>
              <button
                onClick={handleShowAnswer}
                disabled={actionLoading}
                className={`btn-3d-primary px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md ${
                  actionLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{actionLoading ? 'Revealing...' : 'Reveal Answer'}</span>
              </button>

              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="btn-3d-white px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            </>
          )}

          {session.status === 'paused' && (
            <button
              onClick={handleResume}
              disabled={actionLoading}
              className="btn-3d-secondary px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{actionLoading ? 'Resuming...' : 'Resume Game'}</span>
            </button>
          )}

          {(session.status === 'showing_answer' || session.status === 'leaderboard') && (
            <button
              onClick={handleNextQuestion}
              disabled={actionLoading}
              className={`btn-3d-secondary px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md ${
                actionLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <SkipForward className="w-4 h-4" />
              <span>
                {actionLoading
                  ? 'Loading...'
                  : isLastQuestion
                  ? 'Complete Quiz & Results'
                  : 'Next Question'}
              </span>
            </button>
          )}

          {session.status !== 'finished' && (
            <button
              onClick={handleEndQuiz}
              title="End Quiz Now"
              className="p-2.5 rounded-2xl text-slate-400 hover:text-[#FF7675] hover:bg-[#FFEBEB] transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          {/* Projector / Screen Toggle */}
          <button
            onClick={() => setProjectorMode(!projectorMode)}
            title={projectorMode ? 'Exit Projector View' : 'Enter Classroom Projector View'}
            className="btn-3d-white p-2.5 rounded-2xl text-slate-600 cursor-pointer"
          >
            {projectorMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* QR Code trigger */}
          <button
            onClick={() => setShowQR(true)}
            title="Scan to Join QR"
            className="btn-3d-white p-2.5 rounded-2xl text-slate-600 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#6C5CE7]" />
          </button>
        </div>
      </div>

      {/* Main Host Area */}
      {session.status === 'waiting' && (
        <div className="card-playful p-10 bg-white border-2 border-slate-100 text-center shadow-lg">
          <div className="w-20 h-20 rounded-3xl bg-[#ECE9FE] text-[#6C5CE7] flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-slate-800 mb-2">
            Lobby Open — Waiting for Players
          </h2>
          <p className="text-slate-500 font-medium mb-6">
            Share PIN: <span className="font-display font-extrabold text-[#6C5CE7] text-xl tracking-widest">{session.session_code}</span> or display the QR code on the projector screen!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowQR(true)}
              className="btn-3d-primary px-5 py-3 rounded-2xl font-display font-bold text-sm flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              <span>Display Join QR Code</span>
            </button>
            <button
              onClick={handleStart}
              className="btn-3d-secondary px-6 py-3 rounded-2xl font-display font-bold text-sm flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Quiz ({session.participants_count} Players)</span>
            </button>
          </div>
        </div>
      )}

      {(session.status === 'live_question' || session.status === 'showing_answer') && currentQ && (
        <div className="space-y-6">
          {/* Active Question Display */}
          <div className="card-playful p-8 bg-white border-2 border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C5CE7] bg-[#ECE9FE] px-3 py-1 rounded-full">
                Question {currentQ.order} of {currentQ.total_questions}
              </span>

              {/* Timer */}
              {session.status === 'live_question' && (
                <Timer
                  totalSeconds={currentQ.time_limit}
                  startedAt={session.current_question_started_at}
                  enabled={session.settings?.timer_enabled !== false}
                />
              )}
            </div>

            <h2 className={`font-display font-extrabold text-slate-800 mb-6 leading-snug ${projectorMode ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>
              {currentQ.question_text}
            </h2>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options?.map((opt, idx) => {
                const isCorrect = opt.is_correct;
                const isShowingAnswer = session.status === 'showing_answer';
                const showCorrect = isShowingAnswer && isCorrect;
                const showWrong = isShowingAnswer && !isCorrect;

                return (
                  <div
                    key={opt.id}
                    className={`p-5 rounded-2xl border-2 font-display font-bold flex items-center justify-between text-lg transition-all ${
                      showCorrect
                        ? 'border-[#00B894] bg-[#E0F8F2] text-[#008D72] shadow-md ring-2 ring-[#00B894]/30'
                        : showWrong
                        ? 'border-slate-200 bg-slate-50/70 text-slate-400 opacity-60'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex-1 text-left leading-snug">{opt.option_text}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {isShowingAnswer && opt.responses_count !== undefined && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-white/80 border border-slate-200 text-slate-600">
                          {opt.responses_count} {opt.responses_count === 1 ? 'vote' : 'votes'}
                        </span>
                      )}
                      {showCorrect && (
                        <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-lg bg-[#00B894] text-white flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 stroke-[3]" /> Correct
                        </span>
                      )}
                      {showWrong && (
                        <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-lg bg-slate-200 text-slate-500">
                          Incorrect
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation box on Host Console */}
            {session.status === 'showing_answer' && currentQ.explanation && (
              <div className="mt-6 p-4 rounded-2xl bg-[#FFF8E6] border border-[#FDE5A9] text-left text-sm font-medium text-slate-700">
                <span className="font-bold text-[#B7791F]">💡 Explanation: </span>
                {currentQ.explanation}
              </div>
            )}

            {/* Live Response & Accuracy Counter */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#00B894]" />
                  <span>{session.answered_count} / {session.participants_count} Players Answered</span>
                </div>
                {session.status === 'showing_answer' && (
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <span className="text-[#00B894] font-extrabold">✅ {session.correct_count || 0} Correct</span>
                    <span className="text-[#FF7675] font-extrabold">❌ {session.incorrect_count || 0} Incorrect</span>
                    <span className="text-[#6C5CE7] font-extrabold">
                      {session.answered_count > 0 ? Math.round(((session.correct_count || 0) / session.answered_count) * 100) : 0}% Accuracy
                    </span>
                  </div>
                )}
              </div>
              <div>
                Time Limit: {currentQ.time_limit}s
              </div>
            </div>

            {/* Direct In-Card Next Question Button */}
            {session.status === 'showing_answer' && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  disabled={actionLoading}
                  className={`btn-3d-secondary px-6 py-3 rounded-2xl text-base font-bold flex items-center gap-2 cursor-pointer shadow-md ${
                    actionLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <SkipForward className="w-5 h-5" />
                  <span>
                    {actionLoading
                      ? 'Loading Next Question...'
                      : isLastQuestion
                      ? 'Complete Quiz & View Final Results'
                      : 'Next Question'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {session.status === 'leaderboard' && (
        <div className="card-playful p-8 bg-white border-2 border-slate-100 shadow-xl">
          <h2 className="font-display text-3xl font-extrabold text-slate-800 text-center mb-6">
            Current Standings
          </h2>
          <div className="space-y-3 max-w-lg mx-auto">
            {leaderboard.individual?.slice(0, 10).map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between font-bold"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 text-center font-display text-slate-400">#{p.rank}</span>
                  <span className="text-slate-800">{p.username}</span>
                  {p.group && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: p.group.color }}>
                      {p.group.name}
                    </span>
                  )}
                </div>
                <div className="font-display font-extrabold text-[#6C5CE7]">
                  {p.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {session.status === 'finished' && (
        <div className="card-playful p-10 bg-white border-2 border-slate-100 text-center shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF8E6] text-[#FDCB6E] flex items-center justify-center mx-auto mb-4">
            👑
          </div>
          <h2 className="font-display text-3xl font-extrabold text-slate-800 mb-2">Quiz Finished</h2>
          <p className="text-slate-500 text-sm mb-6">Session results have been computed and recorded.</p>
          <button
            onClick={() => navigate(`/admin/analytics/${id}`)}
            className="btn-3d-primary px-6 py-3 rounded-2xl font-display font-bold text-sm"
          >
            View Complete Session Analytics
          </button>
        </div>
      )}

      {/* QR Modal */}
      <QRCodeModal
        sessionCode={session.session_code}
        isOpen={showQR}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
}
