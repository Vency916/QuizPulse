import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Radio, Users, CheckSquare, Plus, ArrowRight, Play, BarChart2 } from 'lucide-react';
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
          <h1 className="font-display text-3xl font-extrabold text-slate-800">
            Control Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back! Here's an overview of your quiz platform activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/quizzes"
            onClick={() => sounds.playClick()}
            className="btn-3d-primary px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card-playful p-5 bg-white border border-slate-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-slate-800 leading-none">
                  {card.value}
                </div>
                <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Live Sessions Table */}
      <div className="card-playful p-6 bg-white border-2 border-slate-100 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800">Recent Sessions</h2>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
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
                    <td className="py-3 font-bold text-slate-800 truncate max-w-xs">
                      {s.title}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        s.status === 'live_question'
                          ? 'bg-[#E0F8F2] text-[#00B894] animate-pulse'
                          : s.status === 'waiting'
                          ? 'bg-[#FFF8E6] text-[#E5AA3A]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-600">
                      {s.participants_count}
                    </td>
                    <td className="py-3 text-right">
                      {s.status !== 'finished' ? (
                        <button
                          onClick={() => {
                            sounds.playClick();
                            navigate(`/admin/sessions/${s.id}`);
                          }}
                          className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
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
                          className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-[#6C5CE7]" />
                          <span>Analytics</span>
                        </button>
                      )}
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
