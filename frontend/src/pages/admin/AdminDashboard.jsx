import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Radio, Users, CheckSquare, Plus, ArrowRight, Play, BarChart2, Download } from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleDownloadSessionCsv = async (s) => {
    sounds.playClick();
    try {
      const response = await api.get(`/admin/sessions/${s.id}/export-csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (s.title || 'quiz').toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.setAttribute('download', `analytics_${safeTitle}_${s.session_code}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      sounds.playCorrect();
    } catch (err) {
      sounds.playIncorrect();
      alert('Failed to download session analytics report.');
    }
  };

  const cards = [
    { label: 'Total Quizzes', value: stats?.total_quizzes ?? '--', icon: BookOpen, color: 'text-[#6C5CE7]', bg: 'bg-[#ECE9FE]' },
    { label: 'Published Quizzes', value: stats?.published_quizzes ?? '--', icon: CheckSquare, color: 'text-[#00B894]', bg: 'bg-[#E0F8F2]' },
    { label: 'Active Live Sessions', value: stats?.live_sessions ?? '--', icon: Radio, color: 'text-[#FF7675]', bg: 'bg-[#FFEBEB]' },
    { label: 'Total Players Joined', value: stats?.total_participants ?? '--', icon: Users, color: 'text-[#0984E3]', bg: 'bg-[#E1F0FF]' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800">
            Control Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Welcome back! Here's an overview of your quiz platform activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/quizzes"
            onClick={() => sounds.playClick()}
            className="btn-3d-primary w-full sm:w-auto justify-center px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card-playful p-3.5 sm:p-5 bg-white border border-slate-100 flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-xl sm:text-2xl font-extrabold text-slate-800 leading-none truncate">
                  {card.value}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider truncate">
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Live Sessions Table */}
      <div className="card-playful p-4 sm:p-6 bg-white border-2 border-slate-100 shadow-md">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-800">Recent Sessions</h2>
            <p className="text-xs text-slate-500">Live games and past quiz sessions</p>
          </div>
          <Link
            to="/admin/quizzes"
            onClick={() => sounds.playClick()}
            className="text-xs font-bold text-[#6C5CE7] hover:underline"
          >
            Manage Quizzes →
          </Link>
        </div>

        {stats?.recent_sessions?.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">PIN Code</th>
                  <th className="pb-3">Quiz Title</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Players</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-display font-bold text-[#6C5CE7]">
                      {s.session_code}
                    </td>
                    <td className="py-3 font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
                      {s.title}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase ${
                        s.status === 'live_question'
                          ? 'bg-[#E0F8F2] text-[#00B894] animate-pulse'
                          : s.status === 'waiting'
                          ? 'bg-[#FFF8E6] text-[#E5AA3A]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-600 text-xs sm:text-sm">
                      {s.participants_count}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.status !== 'finished' ? (
                          <button
                            onClick={() => {
                              sounds.playClick();
                              navigate(`/admin/sessions/${s.id}`);
                            }}
                            className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Host Control</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              sounds.playClick();
                              navigate(`/admin/analytics/${s.id}`);
                            }}
                            className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <BarChart2 className="w-3.5 h-3.5 text-[#6C5CE7]" />
                            <span>Analytics</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadSessionCsv(s)}
                          title="Download CSV Report"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-[#0984E3] hover:bg-[#EBF5FB] transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 font-medium text-sm">
            No quiz sessions launched yet. Create a quiz and launch your first session!
          </div>
        )}
      </div>
    </div>
  );
}
