import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart3, Trophy, CheckCircle, XCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';

export default function AdminAnalytics() {
  const { id: paramId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(paramId || null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch list of sessions
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await api.get('/admin/stats');
        const list = res.data.recent_sessions || [];
        setSessions(list);
        if (!selectedId && list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchList();
  }, []);

  // Fetch specific session analytics
  useEffect(() => {
    if (!selectedId) {
      setLoading(false);
      return;
    }
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/sessions/${selectedId}/analytics`);
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedId]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-800">
            Session Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Question difficulty breakdown, response times, and final player results
          </p>
        </div>

        {/* Session Selector */}
        {sessions.length > 0 && (
          <select
            value={selectedId || ''}
            onChange={(e) => {
              sounds.playClick();
              setSelectedId(e.target.value);
            }}
            className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:border-[#6C5CE7]"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                PIN {s.session_code} — {s.title} ({s.status})
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold">Loading analytics...</div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-playful p-5 bg-white border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Players
              </div>
              <div className="font-display text-3xl font-extrabold text-[#0984E3]">
                {analytics.summary.total_participants}
              </div>
            </div>

            <div className="card-playful p-5 bg-white border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Average Score
              </div>
              <div className="font-display text-3xl font-extrabold text-[#6C5CE7]">
                {analytics.summary.average_score} <span className="text-xs font-sans font-bold text-slate-400">pts</span>
              </div>
            </div>

            <div className="card-playful p-5 bg-white border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Highest Score
              </div>
              <div className="font-display text-3xl font-extrabold text-[#00B894]">
                {analytics.summary.max_score} <span className="text-xs font-sans font-bold text-slate-400">pts</span>
              </div>
            </div>

            <div className="card-playful p-5 bg-white border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Lowest Score
              </div>
              <div className="font-display text-3xl font-extrabold text-[#FF7675]">
                {analytics.summary.min_score} <span className="text-xs font-sans font-bold text-slate-400">pts</span>
              </div>
            </div>
          </div>

          {/* Hardest & Easiest Question Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.summary.hardest_question && (
              <div className="card-playful p-5 bg-white border-2 border-[#FF7675]/30 shadow-sm">
                <div className="flex items-center gap-2 text-[#FF7675] text-xs font-bold uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Most Challenging Question</span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-800 mb-2">
                  {analytics.summary.hardest_question.question_text}
                </h3>
                <div className="text-xs font-bold text-slate-500">
                  Accuracy: <span className="text-[#FF7675] font-extrabold">{analytics.summary.hardest_question.accuracy_percent}%</span> ({analytics.summary.hardest_question.correct_answers}/{analytics.summary.hardest_question.total_answers} correct)
                </div>
              </div>
            )}

            {analytics.summary.easiest_question && (
              <div className="card-playful p-5 bg-white border-2 border-[#00B894]/30 shadow-sm">
                <div className="flex items-center gap-2 text-[#00B894] text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Highest Accuracy Question</span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-800 mb-2">
                  {analytics.summary.easiest_question.question_text}
                </h3>
                <div className="text-xs font-bold text-slate-500">
                  Accuracy: <span className="text-[#00B894] font-extrabold">{analytics.summary.easiest_question.accuracy_percent}%</span> ({analytics.summary.easiest_question.correct_answers}/{analytics.summary.easiest_question.total_answers} correct)
                </div>
              </div>
            )}
          </div>

          {/* Question Breakdown Table */}
          <div className="card-playful p-6 bg-white border-2 border-slate-100 shadow-sm">
            <h2 className="font-display text-xl font-bold text-slate-800 mb-4">
              Question-by-Question Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3">Question</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Answers</th>
                    <th className="pb-3">Accuracy</th>
                    <th className="pb-3">Avg Response Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {analytics.questions?.map((q, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-800 max-w-sm">
                        {q.question_text}
                      </td>
                      <td className="py-3 text-xs uppercase text-slate-400">
                        {q.type}
                      </td>
                      <td className="py-3">
                        {q.total_answers}
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          q.accuracy_percent >= 60 ? 'bg-[#E0F8F2] text-[#00B894]' : 'bg-[#FFEBEB] text-[#FF7675]'
                        }`}>
                          {q.accuracy_percent}%
                        </span>
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        {(q.avg_time_ms / 1000).toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Results Table */}
          <div className="card-playful p-6 bg-white border-2 border-slate-100 shadow-sm">
            <h2 className="font-display text-xl font-bold text-slate-800 mb-4">
              Final Player Results
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Username</th>
                    <th className="pb-3">Team</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Correct / Total</th>
                    <th className="pb-3">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {analytics.results?.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-display font-extrabold text-[#6C5CE7]">
                        #{r.final_rank}
                      </td>
                      <td className="py-3 font-bold text-slate-800">
                        {r.participant?.username || 'Player'}
                      </td>
                      <td className="py-3">
                        {r.group ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: r.group.color }}>
                            {r.group.name}
                          </span>
                        ) : '--'}
                      </td>
                      <td className="py-3 font-display font-bold text-slate-800">
                        {r.final_score.toLocaleString()} pts
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        {r.correct_count} correct
                      </td>
                      <td className="py-3 font-bold text-[#00B894]">
                        {r.accuracy_percent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-playful p-12 text-center text-slate-400 font-bold">
          No session selected.
        </div>
      )}
    </div>
  );
}
