import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Users, User, ArrowUp } from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';

export default function LiveLeaderboard({ session, participant }) {
  const [tab, setTab] = useState('individual'); // 'individual' or 'groups'
  const [leaderboard, setLeaderboard] = useState({ individual: [], groups: [], groups_enabled: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await api.get(`/sessions/${session.session_code}/leaderboard`);
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
    const interval = setInterval(fetchBoard, 2500);
    return () => clearInterval(interval);
  }, [session.session_code]);

  const individualList = leaderboard.individual || [];
  const groupsList = leaderboard.groups || [];
  const topThree = individualList.slice(0, 3);
  const restList = individualList.slice(3);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 animate-fade-in">
      <div className="card-playful p-6 sm:p-8 bg-white border-2 border-slate-100 shadow-xl mb-6">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8E6] text-[#E5AA3A] font-bold text-xs uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Live Standings</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-800">
            Leaderboard
          </h1>
        </div>

        {/* Tab Toggle: Individual vs Group */}
        {leaderboard.groups_enabled && groupsList.length > 0 && (
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 max-w-xs mx-auto">
            <button
              onClick={() => {
                sounds.playClick();
                setTab('individual');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'individual'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Players
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setTab('groups');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'groups'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Teams
            </button>
          </div>
        )}

        {/* 1. Individual Leaderboard */}
        {tab === 'individual' && (
          <div>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="flex items-end justify-center gap-3 sm:gap-4 mb-8 pt-6">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-display font-bold text-lg mb-2 shadow">
                      2
                    </div>
                    <div className="text-xs font-bold text-slate-700 truncate w-full text-center">
                      {topThree[1].username}
                    </div>
                    <div className="text-[11px] font-extrabold text-[#6C5CE7]">
                      {topThree[1].score} pts
                    </div>
                    <div className="w-full h-20 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl mt-2 flex items-center justify-center font-display font-extrabold text-slate-400">
                      🥈
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div className="flex flex-col items-center flex-1 max-w-[140px] -mt-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FDCB6E] to-[#FFEAA7] text-amber-900 flex items-center justify-center font-display font-bold text-xl mb-2 shadow-lg ring-4 ring-amber-200 animate-bounce">
                      👑
                    </div>
                    <div className="text-sm font-extrabold text-slate-800 truncate w-full text-center">
                      {topThree[0].username}
                    </div>
                    <div className="text-xs font-extrabold text-[#00B894]">
                      {topThree[0].score} pts
                    </div>
                    <div className="w-full h-28 bg-gradient-to-t from-[#FDCB6E]/30 to-[#FFEAA7]/40 border-2 border-[#FDCB6E]/40 rounded-t-2xl mt-2 flex items-center justify-center font-display font-extrabold text-2xl">
                      🏆
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-display font-bold text-lg mb-2 shadow">
                      3
                    </div>
                    <div className="text-xs font-bold text-slate-700 truncate w-full text-center">
                      {topThree[2].username}
                    </div>
                    <div className="text-[11px] font-extrabold text-[#6C5CE7]">
                      {topThree[2].score} pts
                    </div>
                    <div className="w-full h-16 bg-gradient-to-t from-amber-100 to-amber-50 rounded-t-2xl mt-2 flex items-center justify-center font-display font-extrabold text-amber-700">
                      🥉
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Remaining Player Rows */}
            <div className="space-y-2">
              {individualList.map((p) => {
                const isCurrent = p.username === participant?.username;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-[#6C5CE7] bg-[#ECE9FE] ring-2 ring-[#6C5CE7]/30 shadow-sm'
                        : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 text-center font-display font-bold text-sm text-slate-400">
                        #{p.rank}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-display font-bold text-slate-800 flex items-center gap-1.5">
                          {p.username}
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold text-[#6C5CE7] bg-white px-1.5 rounded">
                              You
                            </span>
                          )}
                        </span>
                        {p.group && (
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: p.group.color || '#6C5CE7' }}
                          >
                            {p.group.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-display font-extrabold text-base text-[#6C5CE7]">
                      {p.score.toLocaleString()} <span className="text-xs font-sans font-bold text-slate-400">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Group / Team Leaderboard */}
        {tab === 'groups' && (
          <div className="space-y-3">
            {groupsList.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl border-2 border-slate-100 bg-white shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-display font-bold text-white shadow-sm"
                    style={{ backgroundColor: g.color || '#6C5CE7' }}
                  >
                    #{g.rank}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-lg">
                      {g.name}
                    </h3>
                    <div className="text-xs text-slate-400 font-bold">
                      {g.participants_count} Players
                    </div>
                  </div>
                </div>

                <div className="font-display font-extrabold text-2xl text-[#252A34]">
                  {g.score.toLocaleString()} <span className="text-xs font-sans font-bold text-slate-400">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-6 p-4 rounded-2xl bg-white border-2 border-slate-100 shadow-md max-w-sm mx-auto flex items-center justify-center gap-2.5 text-xs font-bold text-slate-500">
        <div className="w-2.5 h-2.5 rounded-full bg-[#6C5CE7] animate-ping" />
        <span>Waiting for host to continue quiz...</span>
      </div>

    </div>
  );
}
