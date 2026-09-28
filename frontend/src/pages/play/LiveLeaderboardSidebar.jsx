import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronDown, ChevronUp, Users, User, Sparkles, Medal } from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';

export default function LiveLeaderboardSidebar({ session, participant, answerState }) {
  const [tab, setTab] = useState('individual'); // 'individual' or 'groups'
  const [leaderboard, setLeaderboard] = useState({ individual: [], groups: [], groups_enabled: false });
  const [loading, setLoading] = useState(true);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const prevScoresRef = useRef({});

  const sessionCode = session?.session_code;

  // Sync directly with session participants broadcasted in real-time
  useEffect(() => {
    if (session?.participants) {
      setLeaderboard({
        individual: session.participants.map((p, idx) => ({ ...p, rank: idx + 1 })),
        groups: session.groups || [],
        groups_enabled: Boolean(session.groups && session.groups.length > 0),
      });
      setLoading(false);
    }
  }, [session?.participants, session?.groups]);

  // Derive rankings from leaderboard API or active session participants
  const individualList = leaderboard.individual && leaderboard.individual.length > 0
    ? leaderboard.individual
    : (session?.participants || []).map((p, idx) => ({ ...p, rank: idx + 1 }));
  const groupsList = leaderboard.groups && leaderboard.groups.length > 0
    ? leaderboard.groups
    : (session?.groups || []);
  const activeList = tab === 'groups' && groupsList.length > 0 ? groupsList : individualList;

  // Find user's own ranking in the list
  const userRankIndex = individualList.findIndex(
    (p) => p.id === participant?.id || p.username?.toLowerCase() === participant?.username?.toLowerCase()
  );
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;
  const userScore = userRankIndex !== -1 ? individualList[userRankIndex]?.score : (participant?.score || 0);

  // Top 5 for desktop display
  const topFive = activeList.slice(0, 5);
  const userInTopFive = userRank !== null && userRank <= 5;
  const currentUserItem = userRankIndex !== -1 ? individualList[userRankIndex] : null;

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-base">🥇</span>;
    if (rank === 2) return <span className="text-base">🥈</span>;
    if (rank === 3) return <span className="text-base">🥉</span>;
    return <span className="text-xs font-black text-slate-400 font-display">#{rank}</span>;
  };

  return (
    <>
      {/* ═════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW (Top Bar / Widget)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="order-1 lg:hidden w-full px-2 sm:px-4 pt-1 pb-2 animate-fade-in">
        <div className="card-playful p-3.5 bg-white border-2 border-slate-100 shadow-md">
          <div className="flex items-center justify-between gap-3">
            {/* Live Indicator & Trophy */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF8E6] text-[#FDCB6E] flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-[#E5AA3A]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Live Standings
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700">
                  {individualList.length} {individualList.length === 1 ? 'Player' : 'Players'}
                </div>
              </div>
            </div>

            {/* Current User Quick Pill */}
            {userRank !== null && (
              <div className="px-3 py-1 rounded-xl bg-[#ECE9FE] text-[#6C5CE7] font-display text-xs font-extrabold flex items-center gap-1.5 shadow-sm border border-[#DCD6FA]">
                <span>You:</span>
                <span className="text-[#6C5CE7] underline font-black">#{userRank}</span>
                <span className="text-slate-400">•</span>
                <span>{userScore.toLocaleString()} pts</span>
              </div>
            )}

            {/* Expand / Collapse Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setMobileExpanded(!mobileExpanded);
              }}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
              aria-label="Toggle Leaderboard"
            >
              <span className="text-[11px] font-bold">Top {Math.min(5, individualList.length)}</span>
              {mobileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Horizontal mini-chips for top 3 (when not expanded) */}
          {!mobileExpanded && topFive.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
              {topFive.slice(0, 3).map((item, idx) => {
                const isMe = item.id === participant?.id || item.username === participant?.username;
                return (
                  <div
                    key={item.id || idx}
                    className={`shrink-0 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold text-[11px] transition-all ${
                      isMe
                        ? 'bg-[#6C5CE7] text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                    <span className="truncate max-w-[80px]">{isMe ? 'You' : item.username}</span>
                    <span className={isMe ? 'text-white/80' : 'text-slate-400'}>
                      {item.score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Expanded Full List on Mobile */}
          {mobileExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 animate-scale-in max-h-60 overflow-y-auto">
              {topFive.map((item, idx) => {
                const isMe = item.id === participant?.id || item.username === participant?.username;
                return (
                  <div
                    key={item.id || idx}
                    className={`p-2 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                      isMe
                        ? 'bg-[#ECE9FE] text-[#6C5CE7] border border-[#DCD6FA]'
                        : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 text-center shrink-0">{getRankBadge(idx + 1)}</div>
                      <span className="truncate font-display">
                        {item.username} {isMe && '(You)'}
                      </span>
                    </div>
                    <span className="font-extrabold text-[#6C5CE7] shrink-0">
                      {item.score.toLocaleString()} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW (Sticky Sidebar on the Right)
          ═════════════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:block lg:order-2 w-80 xl:w-96 shrink-0 sticky top-20 self-start animate-fade-in">
        <div className="card-playful p-5 bg-white border-2 border-slate-100 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFF8E6] to-[#FFEAA7] text-[#E5AA3A] flex items-center justify-center shadow-sm">
                <Trophy className="w-5 h-5 fill-[#FDCB6E] text-[#E5AA3A]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-800 text-lg leading-tight">
                  Leaderboard
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
                  <span>LIVE • Updating</span>
                </div>
              </div>
            </div>

            {/* Total Players Badge */}
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">
              {individualList.length} {individualList.length === 1 ? 'Player' : 'Players'}
            </span>
          </div>

          {/* Group / Individual Toggle if Teams Enabled */}
          {leaderboard.groups_enabled && groupsList.length > 0 && (
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  setTab('individual');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === 'groups'
                    ? 'bg-white text-[#6C5CE7] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Teams
              </button>
            </div>
          )}

          {/* 3D Stepped Podium (Image 1 style) when top players have scores */}
          {activeList.length >= 3 && (activeList[0]?.score > 0 || activeList[1]?.score > 0) && (
            <div className="pt-4 pb-2 mb-4 border-b border-slate-100 flex items-end justify-center gap-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full border-2 border-slate-300 bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600 mb-1 shadow-sm">
                  🥈
                </div>
                <span className="text-[11px] font-bold text-slate-700 max-w-[70px] truncate text-center">
                  {tab === 'groups' ? activeList[1]?.name : activeList[1]?.username}
                </span>
                <span className="text-[10px] font-black text-[#6C5CE7]">
                  {activeList[1]?.score.toLocaleString()}
                </span>
                <div className="w-16 h-10 rounded-t-xl podium-step-2 flex items-center justify-center font-display font-black text-white text-sm shadow-sm">
                  2
                </div>
              </div>

              {/* 1st Place (Center & Elevated) */}
              <div className="flex flex-col items-center -mt-3">
                <span className="text-sm animate-bounce">👑</span>
                <div className="w-11 h-11 rounded-full border-2 border-[#FDCB6E] bg-[#FFF8E6] flex items-center justify-center font-black text-sm text-[#E5AA3A] mb-1 shadow-md">
                  🥇
                </div>
                <span className="text-xs font-black text-slate-800 max-w-[80px] truncate text-center">
                  {tab === 'groups' ? activeList[0]?.name : activeList[0]?.username}
                </span>
                <span className="text-[10px] font-black text-[#6C5CE7]">
                  {activeList[0]?.score.toLocaleString()}
                </span>
                <div className="w-20 h-16 rounded-t-xl podium-step-1 flex items-center justify-center font-display font-black text-white text-lg shadow-md">
                  1
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full border-2 border-amber-300 bg-amber-50 flex items-center justify-center font-black text-xs text-amber-700 mb-1 shadow-sm">
                  🥉
                </div>
                <span className="text-[11px] font-bold text-slate-700 max-w-[70px] truncate text-center">
                  {tab === 'groups' ? activeList[2]?.name : activeList[2]?.username}
                </span>
                <span className="text-[10px] font-black text-[#6C5CE7]">
                  {activeList[2]?.score.toLocaleString()}
                </span>
                <div className="w-16 h-8 rounded-t-xl podium-step-3 flex items-center justify-center font-display font-black text-white text-xs shadow-sm">
                  3
                </div>
              </div>
            </div>
          )}

          {/* Live Rankings List */}
          <div className="space-y-2">
            {activeList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-bold">
                Waiting for first answers...
              </div>
            ) : (
              topFive.map((item, idx) => {
                const rank = idx + 1;
                const isMe =
                  tab === 'individual' &&
                  (item.id === participant?.id ||
                    item.username?.toLowerCase() === participant?.username?.toLowerCase());

                return (
                  <div
                    key={item.id || idx}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-300 ${
                      isMe
                        ? 'bg-[#ECE9FE] border-2 border-[#6C5CE7] shadow-md scale-[1.02]'
                        : rank === 1
                        ? 'bg-[#FFFDF5] border border-[#FDE5A9]'
                        : 'bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Indicator */}
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-display font-black text-sm">
                        {getRankBadge(rank)}
                      </div>

                      {/* Name & Badge */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-display text-sm font-bold truncate ${
                              isMe ? 'text-[#6C5CE7]' : 'text-slate-800'
                            }`}
                          >
                            {tab === 'groups' ? item.name : item.username}
                          </span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#6C5CE7] text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        {tab === 'individual' && item.group_name && (
                          <div className="text-[10px] text-slate-400 font-semibold truncate">
                            {item.group_name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <div
                        className={`font-display text-sm font-extrabold ${
                          isMe ? 'text-[#6C5CE7]' : 'text-slate-700'
                        }`}
                      >
                        {item.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        pts
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* If Current User is not in Top 5, Pin them at the bottom */}
            {tab === 'individual' && !userInTopFive && currentUserItem && (
              <>
                <div className="flex items-center justify-center my-1.5 text-slate-300 font-bold text-xs tracking-widest">
                  •••
                </div>
                <div className="p-3 rounded-2xl bg-[#ECE9FE] border-2 border-[#6C5CE7] shadow-md flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-white text-[#6C5CE7] flex items-center justify-center shrink-0 font-display font-black text-xs shadow-sm">
                      #{userRank}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-bold text-[#6C5CE7] truncate">
                          {currentUserItem.username}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-[#6C5CE7] text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                          YOU
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-display text-sm font-extrabold text-[#6C5CE7]">
                      {currentUserItem.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      pts
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Sync Note */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Points update live</span>
            <span className="text-[#6C5CE7] font-extrabold">QuizPulse Live</span>
          </div>
        </div>
      </aside>
    </>
  );
}
