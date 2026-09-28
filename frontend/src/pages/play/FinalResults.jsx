import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, CheckCircle, XCircle, ArrowLeft, Users, Sparkles } from 'lucide-react';
import { triggerVictoryConfetti } from '../../components/Confetti';
import { sounds } from '../../services/soundEffects';
import api from '../../services/api';

export default function FinalResults({ session, participant, onLeave }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState({ individual: [], groups: [] });
  const [freshParticipant, setFreshParticipant] = useState(null);

  useEffect(() => {
    sounds.playFanfare();
    triggerVictoryConfetti();

    const fetchFinal = async () => {
      try {
        const [boardRes, meRes] = await Promise.all([
          api.get(`/sessions/${session.session_code}/leaderboard`),
          api.get(`/sessions/${session.session_code}/me`).catch(() => null),
        ]);
        setLeaderboard(boardRes.data);
        if (meRes?.data?.participant) {
          setFreshParticipant(meRes.data.participant);
        }
      } catch (err) {
        console.error('Failed to load final results', err);
      }
    };
    fetchFinal();
  }, [session.session_code]);

  // Find participant in final results
  const currentParticipant = freshParticipant || participant;
  const myResult = leaderboard.individual?.find((p) => p.username === currentParticipant?.username);
  const totalQuestions = session.quiz?.total_questions || session.quiz?.questions?.length || 5;
  const correctCount = currentParticipant?.correct_answers ?? myResult?.correct_answers ?? 0;
  const incorrectCount = currentParticipant?.incorrect_answers ?? myResult?.incorrect_answers ?? Math.max(0, totalQuestions - correctCount);
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const finalScore = currentParticipant?.score ?? myResult?.score ?? 0;
  const finalRank = myResult?.rank || 1;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 animate-fade-in">
      <div className="card-playful p-6 sm:p-10 bg-white border-2 border-slate-100 shadow-2xl text-center mb-6">
        {/* Celebration Trophy */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FDCB6E] to-[#FFEAA7] text-amber-900 flex items-center justify-center mx-auto mb-4 shadow-xl ring-8 ring-amber-100 animate-bounce">
          <Trophy className="w-14 h-14" />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-800 mb-2">
          Quiz Finished!
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          Great effort! Here is your final performance summary:
        </p>

        {/* Big Rank & Score Display */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-5 bg-[#ECE9FE]/50 rounded-3xl border-2 border-[#DCD6FA] mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Final Position</div>
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

        {/* Final Podium Standings */}
        <div className="mt-8 pt-8 border-t border-slate-100 text-left">
          <h2 className="font-display text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#6C5CE7]" />
            <span>Final Top Players</span>
          </h2>

          <div className="space-y-2">
            {leaderboard.individual?.slice(0, 5).map((p) => {
              const isCurrent = p.username === currentParticipant?.username;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-sm font-bold ${
                    isCurrent ? 'bg-[#ECE9FE] border-[#6C5CE7]' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 text-center text-slate-400 font-display font-extrabold">
                      #{p.rank}
                    </span>
                    <span>{p.username}</span>
                    {isCurrent && <span className="text-[10px] text-[#6C5CE7] bg-white px-1.5 rounded">You</span>}
                  </div>
                  <div className="font-display font-extrabold text-[#6C5CE7]">
                    {p.score.toLocaleString()} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Home Button */}
        <div className="mt-8">
          <button
            onClick={() => {
              sounds.playClick();
              if (onLeave) onLeave();
              navigate('/');
            }}
            className="btn-3d-primary w-full py-4 rounded-2xl font-display text-lg font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
