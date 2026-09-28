import React, { useState, useEffect, useRef } from 'react';
import Timer from '../../components/Timer';
import { sounds } from '../../services/soundEffects';
import { Send, CheckSquare, Sparkles, Clock, ArrowLeft, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActiveQuestion({
  session,
  participant,
  onSubmitAnswer,
  questionOverride,
  selfPacedMode = false,
  onExit,
}) {
  const navigate = useNavigate();
  // Use questionOverride (self-paced local question) if provided, otherwise use server current_question
  const currentQ = questionOverride || session?.current_question;
  const [selectedAnswer, setSelectedAnswer] = useState(null); // option id or string or array for multi
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [selectedMulti, setSelectedMulti] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Track when this question was first shown to the user (local timer start)
  const [localStartTime, setLocalStartTime] = useState(Date.now());

  // Stable question id reference for resetting state
  const questionIdRef = useRef(currentQ?.id);

  // Clear selections when question changes
  useEffect(() => {
    if (currentQ?.id !== questionIdRef.current) {
      questionIdRef.current = currentQ?.id;
      setSelectedAnswer(null);
      setShortAnswerText('');
      setSelectedMulti([]);
      setSubmitting(false);
      setLocalStartTime(Date.now());
    }
  }, [currentQ?.id]);

  if (!currentQ) {
    return (
      <div className="card-playful p-8 text-center max-w-lg mx-auto bg-white border-2 border-slate-100 shadow-lg">
        <h2 className="font-display text-2xl font-bold text-slate-800">Preparing next question...</h2>
      </div>
    );
  }

  const handleSelectOption = (optionId) => {
    if (submitting || selectedAnswer !== null) return;
    sounds.playClick();
    setSelectedAnswer(optionId);
    setSubmitting(true);

    const clientElapsed = Date.now() - localStartTime;
    onSubmitAnswer({
      answer: optionId,
      client_response_time_ms: clientElapsed,
    });
  };

  const handleToggleMulti = (optionId) => {
    if (submitting) return;
    sounds.playClick();
    setSelectedMulti((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const handleSubmitMulti = (e) => {
    e.preventDefault();
    if (submitting || selectedMulti.length === 0) return;
    sounds.playClick();
    setSubmitting(true);

    const clientElapsed = Date.now() - localStartTime;
    onSubmitAnswer({
      answer: selectedMulti,
      client_response_time_ms: clientElapsed,
    });
  };

  const handleSubmitShort = (e) => {
    e.preventDefault();
    if (submitting || !shortAnswerText.trim()) return;
    sounds.playClick();
    setSubmitting(true);

    const clientElapsed = Date.now() - localStartTime;
    onSubmitAnswer({
      answer: shortAnswerText.trim(),
      client_response_time_ms: clientElapsed,
    });
  };

  const handleTimeUp = () => {
    if (submitting || selectedAnswer !== null) return;
    setSubmitting(true);
    const clientElapsed = Date.now() - localStartTime;
    onSubmitAnswer({
      answer: '__TIMED_OUT__',
      client_response_time_ms: clientElapsed,
    });
  };

  const timerStartedAt = new Date(localStartTime).toISOString();
  const totalQuestions = currentQ.total_questions || session?.quiz?.total_questions || 10;
  const currentOrder = currentQ.order || 1;
  const progressPercent = Math.min(100, Math.round((currentOrder / totalQuestions) * 100));

  return (
    <div className="max-w-2xl mx-auto w-full px-3 sm:px-6 py-4 animate-fade-in">
      {/* ═════════════════════════════════════════════════════════════════════
          1. TOP NAVIGATION & TIMER BAR (Matching Image 2)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Back / Exit Button */}
        <button
          onClick={() => (onExit ? onExit() : navigate('/'))}
          className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 hover:text-[#6C5CE7] hover:border-[#6C5CE7] flex items-center justify-center font-black transition-all cursor-pointer shadow-sm active:scale-95"
          title="Exit Quiz"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Centered Question Counter (e.g. "02 of 10") */}
        <div className="font-display font-black text-base sm:text-lg tracking-wide text-slate-800">
          {String(currentOrder).padStart(2, '0')} of {String(totalQuestions).padStart(2, '0')}
        </div>

        {/* Stopwatch Timer Pill (Matching Image 2 top-right pill) */}
        <div className="px-3.5 py-1.5 rounded-full bg-white border-2 border-[#E9E4F8] shadow-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FDCB6E] fill-[#FDCB6E]/30" />
          <Timer
            key={currentQ.id}
            totalSeconds={currentQ.time_limit || 20}
            startedAt={timerStartedAt}
            onTimeUp={handleTimeUp}
          />
        </div>
      </div>

      {/* Thin Neon Progress Bar (Matching Image 2) */}
      <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className="h-full bg-[#00B894] rounded-full transition-all duration-300 shadow-[0_0_8px_#00B894]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          2. FLOATING QUESTION CARD (Matching Image 2)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="card-playful p-6 sm:p-8 bg-white border-2 border-[#ECE8FD] shadow-xl shadow-[#6C5CE7]/6 mb-6">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {session?.quiz?.category || 'General Knowledge'}
          </span>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#ECE9FE] text-[#6C5CE7]">
            {currentQ.points} PTS {session?.settings?.speed_bonus && '⚡'}
          </span>
        </div>

        {/* Question Text */}
        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-snug mb-6">
          {currentQ.question_text}
        </h1>

        {/* Optional Question Image */}
        {currentQ.image && (
          <div className="mb-6 max-h-56 rounded-2xl overflow-hidden border border-slate-100 shadow-md">
            <img
              src={currentQ.image}
              alt="Question Visual"
              className="max-h-56 w-full object-contain mx-auto bg-slate-50"
            />
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            3. OPTIONS LIST (Image 2 Pill Card Design)
            ═════════════════════════════════════════════════════════════════════ */}

        {/* Multiple Choice */}
        {currentQ.type === 'multiple_choice' && (
          <div className="space-y-3">
            {currentQ.options?.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={submitting}
                  className={`w-full p-4 sm:p-5 rounded-2xl font-display font-bold text-base sm:text-lg flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'option-card-selected ring-4 ring-[#6C5CE7]/20'
                      : 'option-card-idle'
                  }`}
                >
                  <span className="leading-snug">{opt.option_text}</span>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* True / False */}
        {currentQ.type === 'true_false' && (
          <div className="grid grid-cols-2 gap-4">
            {currentQ.options?.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              const isTrue = opt.option_text.toLowerCase().includes('true');
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={submitting}
                  className={`py-6 px-4 rounded-2xl font-display font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'option-card-selected ring-4 ring-[#6C5CE7]/20'
                      : isTrue
                      ? 'bg-white border-2 border-slate-200 hover:border-[#00B894] hover:bg-[#E8F8F2] text-slate-800'
                      : 'bg-white border-2 border-slate-200 hover:border-[#FF7675] hover:bg-[#FFEAEA] text-slate-800'
                  }`}
                >
                  <span>{opt.option_text}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Multiple Select */}
        {currentQ.type === 'multiple_select' && (
          <form onSubmit={handleSubmitMulti} className="space-y-4">
            <div className="space-y-3">
              {currentQ.options?.map((opt) => {
                const isChecked = selectedMulti.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => handleToggleMulti(opt.id)}
                    disabled={submitting}
                    className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between font-display font-bold text-base transition-all cursor-pointer ${
                      isChecked
                        ? 'border-[#6C5CE7] bg-[#F1EEFF] text-[#6C5CE7]'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.option_text}</span>
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-[#6C5CE7] border-[#6C5CE7] text-white' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <CheckSquare className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={submitting || selectedMulti.length === 0}
              className="btn-3d-green w-full py-4 rounded-2xl font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
            >
              <span>Submit Selection</span>
            </button>
          </form>
        )}

        {/* Short Answer */}
        {currentQ.type === 'short_answer' && (
          <form onSubmit={handleSubmitShort} className="space-y-4">
            <input
              type="text"
              value={shortAnswerText}
              onChange={(e) => setShortAnswerText(e.target.value)}
              placeholder="Type your answer here..."
              disabled={submitting}
              required
              autoFocus
              className="w-full bg-white border-2 border-slate-200 focus:border-[#6C5CE7] rounded-2xl px-5 py-4 font-display text-xl font-bold text-center text-slate-800 focus:outline-none shadow-sm transition-all"
            />

            <button
              type="submit"
              disabled={submitting || !shortAnswerText.trim()}
              className="btn-3d-green w-full py-4 rounded-2xl font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-5 h-5" />
              <span>Submit Answer</span>
            </button>
          </form>
        )}
      </div>

      {/* Submitting Feedback Indicator */}
      {submitting && !selfPacedMode && (
        <div className="p-3 rounded-2xl bg-white border border-[#ECE8FD] text-center text-slate-500 font-bold text-xs flex items-center justify-center gap-2 shadow-sm animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#00B894] animate-ping" />
          <span>Answer recorded! Waiting for time or host to reveal answers...</span>
        </div>
      )}
    </div>
  );
}
