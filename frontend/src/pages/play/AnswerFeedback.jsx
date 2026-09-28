import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Sparkles, Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import { triggerConfetti } from '../../components/Confetti';
import { sounds } from '../../services/soundEffects';

export default function AnswerFeedback({ session, participant, answerState, onNextQuestion }) {
  const isAnswerRevealed = session?.status === 'showing_answer' || session?.status === 'leaderboard';
  const isCorrect = answerState?.is_correct === true;
  const isTimedOut = answerState?.timed_out === true || (!answerState && isAnswerRevealed);
  const currentQ = session?.current_question;
  const userAnswer = answerState?.user_answer;

  useEffect(() => {
    if (isAnswerRevealed) {
      if (isCorrect) {
        sounds.playCorrect();
        triggerConfetti();
      } else {
        sounds.playIncorrect();
      }
    }
  }, [isAnswerRevealed, isCorrect]);

  // 1. Waiting for Host to Reveal Results
  if (!isAnswerRevealed && (answerState || session?.status === 'live_question')) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-8 text-center animate-fade-in">
        <div className="card-playful p-8 bg-white border-2 border-[#ECE8FD] shadow-xl shadow-[#6C5CE7]/10">
          <div className="w-16 h-16 rounded-3xl bg-[#ECE9FE] text-[#6C5CE7] flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-black text-slate-800 mb-2">
            {answerState ? 'Answer Locked In! 🔒' : 'Answer Received!'}
          </h2>
          <p className="text-slate-500 font-medium text-sm mb-6">
            Hold tight! Results will appear as soon as the question timer ends or host reveals answers.
          </p>

          <div className="p-4 bg-[#FAF9FF] rounded-2xl border border-[#ECE8FD] flex items-center justify-around text-slate-700">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Score</div>
              <div className="font-display text-2xl font-black text-[#6C5CE7]">
                {(participant?.score || 0).toLocaleString()}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Response Time</div>
              <div className="font-display text-2xl font-black text-slate-700">
                {answerState?.response_time_ms ? `${(answerState.response_time_ms / 1000).toFixed(1)}s` : '--'}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#6C5CE7] animate-ping" />
            <span>Waiting for host to reveal...</span>
          </div>
        </div>
      </div>
    );
  }

  // Helper to determine if an option was chosen by this user
  const isUserChoice = (optId, optText) => {
    if (userAnswer === null || userAnswer === undefined) return false;
    if (typeof userAnswer === 'object' && Array.isArray(userAnswer)) {
      return userAnswer.map(String).includes(String(optId));
    }
    return (
      String(userAnswer) === String(optId) ||
      Boolean(optText && String(userAnswer).toLowerCase() === String(optText).toLowerCase())
    );
  };

  const totalQuestions = currentQ?.total_questions || session?.quiz?.total_questions || 10;
  const currentOrder = currentQ?.order || 1;
  const progressPercent = Math.min(100, Math.round((currentOrder / totalQuestions) * 100));

  // 2. Answer Revealed: High-Fidelity Image 2 Design
  return (
    <div className="max-w-2xl mx-auto w-full px-3 sm:px-6 py-4 animate-scale-in">
      {/* Top Bar matching Image 2 */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 flex items-center justify-center font-black shadow-sm">
          <span>#{currentOrder}</span>
        </div>

        <div className="font-display font-black text-base sm:text-lg tracking-wide text-slate-800">
          {String(currentOrder).padStart(2, '0')} of {String(totalQuestions).padStart(2, '0')}
        </div>

        {/* Status Pill */}
        <div
          className={`px-3.5 py-1.5 rounded-full font-display font-black text-xs flex items-center gap-1.5 shadow-sm border ${
            isCorrect
              ? 'bg-[#E0F8F2] text-[#00B894] border-[#00B894]/30'
              : 'bg-[#FFEAEA] text-[#FF7675] border-[#FF7675]/30'
          }`}
        >
          {isCorrect ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>+{answerState?.points_earned || 0} PTS</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 stroke-[3]" />
              <span>+0 PTS</span>
            </>
          )}
        </div>
      </div>

      {/* Thin Neon Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className="h-full bg-[#00B894] rounded-full transition-all duration-300 shadow-[0_0_8px_#00B894]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Floating Question Card (Image 2 style) */}
      <div className="card-playful p-6 sm:p-8 bg-white border-2 border-[#ECE8FD] shadow-xl shadow-[#6C5CE7]/6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {session?.quiz?.category || 'General Knowledge'}
          </span>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
              isCorrect ? 'bg-[#E0F8F2] text-[#00B894]' : 'bg-[#FFEAEA] text-[#FF7675]'
            }`}
          >
            {isCorrect ? 'Correct Answer 🎉' : isTimedOut ? "Time's Up ⏱️" : 'Incorrect ❌'}
          </span>
        </div>

        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-snug mb-6">
          {currentQ?.question_text}
        </h1>

        {/* Options Breakdown matching Image 2 */}
        {currentQ?.options && (
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const userPickedThis = isUserChoice(opt.id, opt.option_text);
              const isCorrectOpt = opt.is_correct === true || opt.is_correct === 1;

              let cardStyle = 'option-card-idle opacity-60';
              let badge = null;

              if (isCorrectOpt) {
                // Correct answer always highlighted in soft mint green with right circular green check
                cardStyle = 'option-card-correct opacity-100';
                badge = (
                  <span className="w-7 h-7 rounded-full bg-[#00B894] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                );
              } else if (userPickedThis && !isCorrectOpt) {
                // User picked wrong answer -> soft pink with circular red X
                cardStyle = 'option-card-wrong opacity-100';
                badge = (
                  <span className="w-7 h-7 rounded-full bg-[#FF7675] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <X className="w-4 h-4 stroke-[3]" />
                  </span>
                );
              }

              return (
                <div
                  key={opt.id}
                  className={`w-full p-4 sm:p-5 rounded-2xl font-display font-bold text-base sm:text-lg flex items-center justify-between text-left transition-all ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="leading-snug">{opt.option_text}</span>
                    {userPickedThis && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-white/80 border border-slate-300 text-slate-700">
                        Your Pick
                      </span>
                    )}
                  </div>
                  {badge}
                </div>
              );
            })}
          </div>
        )}

        {/* Explanation Box */}
        {(currentQ?.explanation || answerState?.explanation) && (
          <div className="mt-6 p-4 rounded-2xl bg-[#FFF8E6] border border-[#FDE5A9] text-left text-sm font-medium text-slate-800 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#E5AA3A] shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-[#B7791F]">Explanation: </span>
              <span>{currentQ?.explanation || answerState?.explanation}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button (Image 2 Chunky 3D Green "Next" Button) */}
      {onNextQuestion ? (
        <button
          onClick={() => {
            sounds.playClick();
            onNextQuestion();
          }}
          className="btn-3d-green w-full py-4 rounded-2xl font-display text-lg font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <span>Next Question</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-[#ECE8FD] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B894] animate-ping" />
            <span className="text-xs font-black text-slate-600">
              Host will advance to next question shortly...
            </span>
          </div>
          <span className="font-display font-black text-xs text-[#6C5CE7]">
            Rank #{answerState?.current_rank || '—'}
          </span>
        </div>
      )}
    </div>
  );
}
