import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [participant, setParticipant] = useState(() => {
    const saved = localStorage.getItem('qp_participant');
    return saved ? JSON.parse(saved) : null;
  });
  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem('qp_session_token') || null);
  const [activeCode, setActiveCode] = useState(() => localStorage.getItem('qp_active_code') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answerState, setAnswerState] = useState(null); // stores result of submitted answer for current question

  const pollingIntervalRef = useRef(null);

  // Connect live updates via responsive non-blocking polling (every 500ms for smooth real-time feel)
  const connectStream = (code) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const poll = async () => {
      try {
        const res = await api.get(`/sessions/code/${code}`);
        const data = res.data.session;
        if (data && data.session_code) {
          setSession((prev) => {
            // Check if status, active question, or participant metrics actually changed
            if (
              prev &&
              prev.status === data.status &&
              prev.current_question?.id === data.current_question?.id &&
              prev.answered_count === data.answered_count &&
              prev.participants_count === data.participants_count
            ) {
              // Return identical reference so React avoids unnecessary re-renders!
              return prev;
            }

            // Reset answerState if moving to a new question
            if (prev?.current_question?.id && data.current_question?.id && prev.current_question.id !== data.current_question.id) {
              setAnswerState(null);
            }
            return data;
          });

          // If session just finished, fetch latest authoritative participant record and stop polling
          if (data.status === 'finished') {
            refreshParticipant(code).catch(() => {});
            disconnectStream();
          }
        }
      } catch (err) {
        // Soft fail on polling glitch without breaking UI
      }
    };

    // Immediate initial poll, then every 2000ms
    poll();
    pollingIntervalRef.current = setInterval(poll, 2000);
  };

  // Refresh participant details from backend
  const refreshParticipant = async (code = activeCode) => {
    if (!code) return null;
    try {
      const res = await api.get(`/sessions/${code}/me`);
      const p = res.data.participant;
      if (p) {
        setParticipant(p);
        localStorage.setItem('qp_participant', JSON.stringify(p));
      }
      return p;
    } catch (e) {
      return null;
    }
  };

  // Disconnect stream
  const disconnectStream = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };


  // Fetch session details manually
  const fetchSession = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/sessions/code/${code}`);
      setSession(res.data.session);
      setActiveCode(code);
      localStorage.setItem('qp_active_code', code);
      connectStream(code);
      return res.data.session;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load quiz session.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Join session as guest participant
  const joinSession = async (code, username, groupId = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/sessions/${code}/join`, {
        username,
        group_id: groupId,
      });

      const { participant: newParticipant, session_token: token } = res.data;
      setParticipant(newParticipant);
      setSessionToken(token);
      setActiveCode(code);

      localStorage.setItem('qp_participant', JSON.stringify(newParticipant));
      localStorage.setItem('qp_session_token', token);
      localStorage.setItem('qp_active_code', code);

      await fetchSession(code);
      return newParticipant;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join quiz.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer
  const submitAnswer = async (code, answerPayload) => {
    try {
      const res = await api.post(`/sessions/${code}/answer`, answerPayload);
      setAnswerState(res.data);
      // Update local participant score and counts
      if (participant) {
        const updated = {
          ...participant,
          score: res.data.total_score,
          correct_answers: res.data.correct_answers ?? (res.data.is_correct ? (participant.correct_answers || 0) + 1 : (participant.correct_answers || 0)),
          incorrect_answers: res.data.incorrect_answers ?? (!res.data.is_correct ? (participant.incorrect_answers || 0) + 1 : (participant.incorrect_answers || 0)),
        };
        setParticipant(updated);
        localStorage.setItem('qp_participant', JSON.stringify(updated));
      }
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer.');
      throw err;
    }
  };

  // Leave / Reset Session
  const leaveSession = () => {
    disconnectStream();
    setSession(null);
    setParticipant(null);
    setSessionToken(null);
    setActiveCode('');
    setAnswerState(null);
    localStorage.removeItem('qp_participant');
    localStorage.removeItem('qp_session_token');
    localStorage.removeItem('qp_active_code');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectStream();
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        participant,
        sessionToken,
        activeCode,
        loading,
        error,
        answerState,
        setAnswerState,
        fetchSession,
        joinSession,
        submitAnswer,
        leaveSession,
        connectStream,
        refreshParticipant,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
