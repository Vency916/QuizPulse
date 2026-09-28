import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, CheckCircle, XCircle, ArrowLeft, BarChart2, Sparkles, Crown, Medal } from 'lucide-react';
import { triggerVictoryConfetti } from '../../components/Confetti';
import { sounds } from '../../services/soundEffects';
import api from '../../services/api';
import Mascot from '../../components/Mascot';

export default function SelfPacedComplete({ session, participant, finishData, onLeave, showLeaderboard, onToggleLeaderboard }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState({ individual: [], groups: [] });
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    if (!confettiFired && finishData) {
      sounds.playFanfare();
      triggerVictoryConfetti();
      setConfettiFired(true);
    }
  }, [finishData, confettiFired]);

  useEffect(() => {
    if (showLeaderboard) {
      const fetchLeaderboard = async () => {
        try {
          const res = await api.get(`/sessions/${session.session_code}/leaderboard`);
          setLeaderboard(res.data);
        } catch (err) {
          console.error('Failed to load leaderboard', err);
        }
      };
      fetchLeaderboard();
    }
  }, [showLeaderboard, session.session_code]);

  if (!finishData) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#6C5CE7] border-t-transparent animate-spin" />
          <span className="font-display font-bold text-slate-600">Calculating your results...</span>
        </div>
      </div>
    );
  }

  const totalQ = finishData.total_questions || session.quiz?.total_questions || 0;
  const correctCount = finishData.correct_count || 0;
  const incorrectCount = finishData.incorrect_count || Math.max(0, totalQ - correctCount);
  const accuracy = finishData.accuracy || (totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0);
  const finalScore = finishData.final_score || participant?.score || 0;
  const finalRank = finishData.final_rank || 1;

  // Leaderboard View
  if (showLeaderboard) {
    const myUsername = participant?.username;
    return (
      <div className="min-h-[calc(100vh-64px)] max-w-2xl mx-auto w-full px-4 py-8 animate-fade-in">
        <div className="card-playful p-6 sm:p-10 bg-white border-2 border-slate-100 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#6C5CE7] to-[#A29BFE] text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
              <BarChart2 className="w-8 h-8" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-800 mb-1">
              Leaderboard
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {session.quiz?.title} • {session.participants_count || leaderboard.individual?.length || 0} players
            </p>
          </div>

          {/* Your Position Badge */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#ECE9FE] to-[#E0F8F2] border-2 border-[#6C5CE7]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center font-display font-extrabold text-lg">
                #{finalRank}
              </div>
              <div>
                <div className="font-display font-bold text-slate-800">{myUsername}</div>
                <div className="text-xs text-[#6C5CE7] font-bold">Your Position</div>
              </div>
            </div>
            <div className="font-display text-2xl font-extrabold text-[#6C5CE7]">
              {finalScore.toLocaleString()} pts
            </div>
          </div>

          {/* Full Rankings */}
          <div className="space-y-2 mb-8">
            {leaderboard.individual?.map((p, idx) => {
              const isCurrent = p.username === myUsername;
              const rank = p.rank || idx + 1;
              const rankIcon = rank === 1 ? <Crown className="w-4 h-4 text-amber-500" /> :
                               rank === 2 ? <Medal className="w-4 h-4 text-slate-400" /> :
                               rank === 3 ? <Medal className="w-4 h-4 text-amber-700" /> : null;
              return (
                <div
                  key={p.id || idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-sm font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#ECE9FE] border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30 shadow-sm'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 text-center font-display font-extrabold text-slate-400 flex items-center justify-center gap-1">
                      {rankIcon || `#${rank}`}
                    </span>
                    <span>{p.username}</span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold text-white bg-[#6C5CE7] px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="font-display font-extrabold text-[#6C5CE7]">
                    {p.score?.toLocaleString()} pts
                  </div>
                </div>
              );
            })}

            {leaderboard.individual?.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">
                Loading rankings...
              </div>
            )}
          </div>

          {/* Group Scores if available */}
          {leaderboard.groups?.length > 0 && (
            <div className="mb-8 pt-6 border-t border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#00B894]" />
                Team Standings
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {leaderboard.groups.map((g, idx) => (
                  <div
                    key={g.id || idx}
                    className="p-3 rounded-2xl border border-slate-100 bg-white text-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: g.color || '#6C5CE7' }}
                    />
                    <div className="font-display font-bold text-sm text-slate-800">{g.name}</div>
                    <div className="font-display font-extrabold text-lg text-[#6C5CE7]">
                      {g.score?.toLocaleString()} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onToggleLeaderboard}
              className="btn-3d-white w-full py-3 rounded-2xl font-display text-sm font-bold flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-[#FDCB6E]" />
              <span>Back to Score Summary</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                if (onLeave) onLeave();
                navigate('/');
              }}
              className="btn-3d-primary w-full py-3 rounded-2xl font-display text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Score Summary View ──────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-64px)] max-w-2xl mx-auto w-full px-4 py-8 animate-fade-in">
      <div className="card-playful p-6 sm:p-10 bg-white border-2 border-slate-100 shadow-2xl text-center">
        {/* Celebration Mascot */}
        <div className="mb-3 animate-bounce">
          <Mascot mood="celebrating" size={90} className="mx-auto" />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-800 mb-2">
          Quiz Complete! 🎉
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          Great effort, <b>{participant?.username}</b>! Here are your results:
        </p>

        {/* Big Rank & Score Display */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-5 bg-[#ECE9FE]/50 rounded-3xl border-2 border-[#DCD6FA] mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Your Rank</div>
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#6C5CE7] flex items-center justify-center gap-1">
              <span>#{finalRank}</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Points</div>
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#252A34]">
              {finalScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stats Row: Correct, Incorrect, Accuracy */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto mb-8 text-center">
          <div className="p-3 bg-[#E0F8F2] rounded-2xl border border-[#00B894]/20">
            <CheckCircle className="w-5 h-5 text-[#00B894] mx-auto mb-1" />
            <div className="font-display text-2xl font-bold text-[#00B894]">{correctCount}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Correct</div>
          </div>

          <div className="p-3 bg-[#FFEBEB] rounded-2xl border border-[#FF7675]/20">
            <XCircle className="w-5 h-5 text-[#FF7675] mx-auto mb-1" />
            <div className="font-display text-2xl font-bold text-[#FF7675]">
              {incorrectCount}
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Incorrect</div>
          </div>

          <div className="p-3 bg-[#FFF8E6] rounded-2xl border border-[#FDCB6E]/30">
            <Sparkles className="w-5 h-5 text-[#E5AA3A] mx-auto mb-1" />
            <div className="font-display text-2xl font-bold text-[#E5AA3A]">{accuracy}%</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Accuracy</div>
          </div>
        </div>

        {/* Leaderboard CTA */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggleLeaderboard();
          }}
          className="btn-3d-secondary w-full py-4 rounded-2xl font-display text-lg font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer mb-4"
        >
          <Trophy className="w-5 h-5" />
          <span>🏆 View Leaderboard & Where I Rank</span>
        </button>

        {/* Home */}
        <button
          onClick={() => {
            sounds.playClick();
            if (onLeave) onLeave();
            navigate('/');
          }}
          className="btn-3d-white w-full py-3 rounded-2xl font-display text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
}
