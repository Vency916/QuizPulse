import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import WaitingRoom from './WaitingRoom';
import ActiveQuestion from './ActiveQuestion';
import AnswerFeedback from './AnswerFeedback';
import LiveLeaderboard from './LiveLeaderboard';
import LiveLeaderboardSidebar from './LiveLeaderboardSidebar';
import FinalResults from './FinalResults';
import SelfPacedComplete from './SelfPacedComplete';
import { Pause, AlertCircle, RefreshCw, Trophy, BarChart2 } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import api from '../../services/api';

export default function PlayPage() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const {
    session,
    participant,
    answerState,
    fetchSession,
    submitAnswer,
    leaveSession,
    setAnswerState,
    loading,
    error,
  } = useSession();

  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);

  // ── Self-Paced State ──────────────────────────────────────────────────
  const [selfPacedIndex, setSelfPacedIndex] = useState(0);
  const [selfPacedFinished, setSelfPacedFinished] = useState(false);
  const [finishData, setFinishData] = useState(null);
  const [showLeaderboardView, setShowLeaderboardView] = useState(false);
  const selfPacedSubmittedRef = useRef(new Set()); // track which question ids have been submitted

  // Detect self-paced mode
  const isSelfPaced = Boolean(session && (!session.lobby_enabled || session.pace_mode === 'self_paced'));

  // Get all_questions for self-paced mode
  const allQuestions = session?.all_questions || [];
  const currentSelfPacedQuestion = isSelfPaced && allQuestions.length > 0
    ? allQuestions[selfPacedIndex]
    : null;

  // Track all in-flight answer promises so we can await them before calling /finish
  const answerPromisesRef = useRef([]);

  useEffect(() => {
    if (sessionCode) {
      fetchSession(sessionCode).catch(() => {});
    }
  }, [sessionCode]);

  // Reset local submission tracker when question changes (host-controlled mode only)
  useEffect(() => {
    setHasSubmittedCurrent(false);
    setAnswerState(null);
  }, [session?.current_question?.id]);

  // ── "Get Ready!" Countdown for Host-Controlled Launch ─────────────────
  const [getReadyCountdown, setGetReadyCountdown] = useState(null);
  const prevStatusRef = useRef(session?.status);

  useEffect(() => {
    // When transitioning from 'waiting' to 'live_question' in host-controlled mode
    if (prevStatusRef.current === 'waiting' && session?.status === 'live_question' && !isSelfPaced) {
      setGetReadyCountdown(3);
      sounds.playTick();
    }
    prevStatusRef.current = session?.status;
  }, [session?.status, isSelfPaced]);

  useEffect(() => {
    if (getReadyCountdown === null) return;
    if (getReadyCountdown > 1) {
      const timer = setTimeout(() => {
        setGetReadyCountdown((c) => (c ? c - 1 : null));
        sounds.playTick();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (getReadyCountdown === 1) {
      const timer = setTimeout(() => {
        setGetReadyCountdown(0); // "GO!"
        sounds.playCorrect();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (getReadyCountdown === 0) {
      const timer = setTimeout(() => {
        setGetReadyCountdown(null);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [getReadyCountdown]);

  // ── Self-Paced Answer Handler ─────────────────────────────────────────
  const handleSelfPacedAnswer = useCallback(async (payload) => {
    if (!currentSelfPacedQuestion) return;
    const qId = currentSelfPacedQuestion.id;

    // Prevent double-submission for the same question
    if (selfPacedSubmittedRef.current.has(qId)) return;
    selfPacedSubmittedRef.current.add(qId);

    // Submit answer to server — track the promise
    const answerPromise = submitAnswer(sessionCode, {
      ...payload,
      question_id: qId,
    }).catch((err) => {
      console.error('Answer submission error:', err);
    });
    answerPromisesRef.current.push(answerPromise);

    // Immediately advance to next question (no feedback reveal)
    const nextIndex = selfPacedIndex + 1;
    if (nextIndex >= allQuestions.length) {
      // All questions answered — wait for ALL answers to be recorded,
      // then call finish so the server has the complete score
      setSelfPacedFinished(true);
      try {
        await Promise.all(answerPromisesRef.current);
        const res = await api.post(`/sessions/${sessionCode}/finish`);
        setFinishData(res.data);
        sounds.playFanfare();
      } catch (err) {
        console.error('Finish error:', err);
        // Still show completion even if finish call fails
        setFinishData({
          final_score: participant?.score || 0,
          total_questions: allQuestions.length,
          correct_count: 0,
          accuracy: 0,
          final_rank: 1,
        });
      }
    } else {
      setSelfPacedIndex(nextIndex);
      // Clear answer state so it doesn't carry over
      setAnswerState(null);
    }
  }, [selfPacedIndex, allQuestions, currentSelfPacedQuestion, sessionCode, submitAnswer, participant, setAnswerState]);

  // ── Host-Controlled Answer Handler ────────────────────────────────────
  const handleSubmitAnswer = async (payload) => {
    if (hasSubmittedCurrent) return;
    setHasSubmittedCurrent(true);
    try {
      await submitAnswer(sessionCode, {
        ...payload,
        question_id: session?.current_question?.id,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // If participant identity not found in local storage, prompt redirect to join
  if (!participant && !loading && session) {
    if (session.status === 'finished') {
      return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
          <div className="card-playful p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF8E6] text-[#FDCB6E] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">
              Quiz Has Ended 🏁
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              This live session for <b>{session.quiz?.title}</b> has already concluded.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-3d-secondary w-full py-3.5 rounded-2xl font-display text-lg font-bold"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="card-playful p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#ECE9FE] text-[#6C5CE7] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">
            Join This Quiz
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Enter your username to enter the live game room for <b>{session.quiz?.title}</b>.
          </p>
          <button
            onClick={() => navigate(`/join/${sessionCode}`)}
            className="btn-3d-primary w-full py-3.5 rounded-2xl font-display text-lg font-bold"
          >
            Enter Username
          </button>
        </div>
      </div>
    );
  }

  if (loading && !session) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#6C5CE7] animate-spin" />
          <span className="font-display font-bold text-slate-600">Connecting to live game...</span>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="card-playful p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFEBEB] text-[#FF7675] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">Connection Issue</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                if (sessionCode) fetchSession(sessionCode).catch(() => {});
              }}
              className="btn-3d-primary w-full py-3 rounded-2xl font-display text-base font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-3d-secondary w-full py-3 rounded-2xl font-display text-base font-bold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#6C5CE7] animate-spin" />
          <span className="font-display font-bold text-slate-600">Connecting to quiz session...</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  SELF-PACED RENDERING PATH
  // ═══════════════════════════════════════════════════════════════════════
  if (isSelfPaced) {
    // Show completion screen after all questions answered
    if (selfPacedFinished) {
      return (
        <SelfPacedComplete
          session={session}
          participant={participant}
          finishData={finishData}
          onLeave={leaveSession}
          showLeaderboard={showLeaderboardView}
          onToggleLeaderboard={() => setShowLeaderboardView(!showLeaderboardView)}
        />
      );
    }

    // Show current question from local index (bypasses host control entirely)
    if (currentSelfPacedQuestion && allQuestions.length > 0) {
      // Build a question object matching what ActiveQuestion expects
      const questionForDisplay = {
        ...currentSelfPacedQuestion,
        order: selfPacedIndex + 1,
        total_questions: allQuestions.length,
      };

      return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between relative">
          <ActiveQuestion
            session={session}
            participant={participant}
            onSubmitAnswer={handleSelfPacedAnswer}
            questionOverride={questionForDisplay}
            selfPacedMode={true}
          />
        </div>
      );
    }

    // Fallback: waiting for all_questions to be loaded
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#6C5CE7] animate-spin" />
          <span className="font-display font-bold text-slate-600">Loading quiz questions...</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  HOST-CONTROLLED RENDERING PATH (original behavior)
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between relative">
      {/* Paused Banner Overlay if game is paused by host */}
      {session.status === 'paused' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-playful p-8 max-w-sm w-full text-center bg-white border-2 border-slate-100 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#FFF8E6] text-[#FDCB6E] flex items-center justify-center mx-auto mb-4">
              <Pause className="w-8 h-8" />
            </div>
            <h2 className="font-display text-3xl font-bold text-slate-800 mb-2">Game Paused</h2>
            <p className="text-slate-500 text-sm">
              The host has temporarily paused the quiz. Hang tight, we'll resume shortly!
            </p>
          </div>
        </div>
      )}

      {/* 3-2-1 Get Ready Countdown Overlay */}
      {getReadyCountdown !== null && (
        <div className="fixed inset-0 z-50 bg-gradient-to-tr from-[#6C5CE7] to-[#8E84FC] flex flex-col items-center justify-center p-6 text-white text-center animate-fade-in shadow-2xl">
          <div className="text-xl sm:text-2xl font-display font-extrabold uppercase tracking-widest text-[#DCD6FA] mb-4 animate-pulse">
            Get Ready! 🚀
          </div>
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center font-display text-7xl sm:text-8xl font-black mb-6 animate-scale-in text-white drop-shadow-2xl">
            {getReadyCountdown === 0 ? 'GO!' : getReadyCountdown}
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-white max-w-sm">
            {session.quiz?.title || 'Live Quiz'} is starting!
          </div>
        </div>
      )}

      {/* Dynamic View rendering based on authoritative server state */}
      {session.status === 'waiting' && (
        <WaitingRoom session={session} participant={participant} />
      )}

      {(session.status === 'live_question' || session.status === 'showing_answer') && (
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 flex flex-col lg:flex-row gap-6 items-start">
          {/* Live Leaderboard (Desktop: Right Order 2, Mobile: Top Order 1) */}
          <LiveLeaderboardSidebar
            session={session}
            participant={participant}
            answerState={answerState}
          />

          {/* Quiz Gameplay Column (Desktop: Left Order 1, Mobile: Bottom Order 2) */}
          <div className="flex-1 w-full min-w-0 order-2 lg:order-1">
            {session.status === 'live_question' ? (
              hasSubmittedCurrent || answerState ? (
                <AnswerFeedback session={session} participant={participant} answerState={answerState} />
              ) : (
                <ActiveQuestion
                  session={session}
                  participant={participant}
                  onSubmitAnswer={handleSubmitAnswer}
                />
              )
            ) : (
              <AnswerFeedback session={session} participant={participant} answerState={answerState} />
            )}
          </div>
        </div>
      )}

      {session.status === 'leaderboard' && (
        <LiveLeaderboard session={session} participant={participant} />
      )}

      {session.status === 'finished' && (
        <FinalResults session={session} participant={participant} onLeave={leaveSession} />
      )}
    </div>
  );
}
