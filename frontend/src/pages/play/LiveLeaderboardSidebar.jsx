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

  // Top 3 for Sketched Podium
  const firstPlace = activeList[0] || null;
  const secondPlace = activeList[1] || null;
  const thirdPlace = activeList[2] || null;

  const firstName = firstPlace ? (tab === 'groups' ? firstPlace.name : firstPlace.username) : null;
  const secondName = secondPlace ? (tab === 'groups' ? secondPlace.name : secondPlace.username) : null;
  const thirdName = thirdPlace ? (tab === 'groups' ? thirdPlace.name : thirdPlace.username) : null;

  const isFirstMe = firstPlace && tab === 'individual' && (firstPlace.id === participant?.id || firstPlace.username?.toLowerCase() === participant?.username?.toLowerCase());
  const isSecondMe = secondPlace && tab === 'individual' && (secondPlace.id === participant?.id || secondPlace.username?.toLowerCase() === participant?.username?.toLowerCase());
  const isThirdMe = thirdPlace && tab === 'individual' && (thirdPlace.id === participant?.id || thirdPlace.username?.toLowerCase() === participant?.username?.toLowerCase());

  return (
    <>
      {/* ═════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW (Sketched 3-Step Podium Widget - Mobile Only)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="order-1 lg:hidden w-full px-2 sm:px-4 pt-1 pb-2 animate-fade-in">
        <div className="card-playful p-3.5 bg-white border-2 border-slate-100 shadow-md">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Live Indicator & Trophy */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF8E6] text-[#FDCB6E] flex items-center justify-center shrink-0 shadow-xs">
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
                  {activeList.length} {tab === 'groups' ? (activeList.length === 1 ? 'Team' : 'Teams') : (activeList.length === 1 ? 'Player' : 'Players')}
                </div>
              </div>
            </div>

            {/* Current User Quick Pill */}
            {userRank !== null && (
              <div className="px-2.5 py-1 rounded-xl bg-[#ECE9FE] text-[#6C5CE7] font-display text-xs font-extrabold flex items-center gap-1.5 shadow-xs border border-[#DCD6FA]">
                <span>You:</span>
                <span className="underline font-black">#{userRank}</span>
                <span className="text-slate-400">•</span>
                <span>{userScore.toLocaleString()} pts</span>
              </div>
            )}

            {/* Toggle Full List Button (if more than 3 contenders) */}
            {activeList.length > 3 && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setMobileExpanded(!mobileExpanded);
                }}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                aria-label="Toggle Full Standings"
              >
                <span className="text-[11px] font-bold">Top {Math.min(5, activeList.length)}</span>
                {mobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Group / Individual Toggle if Teams are Enabled */}
          {leaderboard.groups_enabled && groupsList.length > 0 && (
            <div className="flex p-0.5 bg-slate-100 rounded-xl mb-3 max-w-[200px] mx-auto text-xs">
              <button
                onClick={() => {
                  sounds.playClick();
                  setTab('individual');
                }}
                className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  tab === 'individual'
                    ? 'bg-white text-[#6C5CE7] shadow-xs'
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
                className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  tab === 'groups'
                    ? 'bg-white text-[#6C5CE7] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Teams
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              THE 3-STEP PODIUM (From Sketch: 2nd on Left, 1st in Center, 3rd on Right)
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="pt-2 px-1">
            <div className="flex items-end justify-center gap-2 sm:gap-3">
              {/* 2nd Place (Left Pedestal - Medium Height) */}
              <div className="flex-1 max-w-[105px] flex flex-col items-center">
                {secondPlace ? (
                  <div
                    className={`w-full h-22 sm:h-24 rounded-t-2xl flex flex-col justify-between items-center p-1.5 sm:p-2 transition-all relative ${
                      isSecondMe
                        ? 'bg-gradient-to-b from-[#F3F0FF] to-[#E5E0FA] border-2 border-[#6C5CE7] shadow-md ring-2 ring-[#6C5CE7]/30'
                        : 'bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Top: 2nd rank */}
                    <div className="flex items-center gap-1 font-display font-black text-xs sm:text-sm text-slate-700">
                      <span>🥈</span>
                      <span>2nd</span>
                    </div>

                    {/* Middle: Name */}
                    <div className="w-full text-center px-0.5">
                      <div className="font-display font-black text-xs text-slate-800 truncate" title={secondName}>
                        {secondName}
                      </div>
                      {isSecondMe && (
                        <span className="text-[10px] font-black text-[#6C5CE7] leading-none block">
                          (You)
                        </span>
                      )}
                    </div>

                    {/* Bottom: Score */}
                    <div className="text-[10px] font-extrabold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded-md shadow-xs">
                      {secondPlace.score?.toLocaleString() ?? 0} pts
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-18 rounded-t-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col justify-between items-center p-1.5 text-slate-400">
                    <span className="font-display font-black text-xs text-slate-400">2nd</span>
                    <span className="text-[11px] italic font-semibold text-slate-300">Open</span>
                    <span className="text-[10px] text-slate-300">—</span>
                  </div>
                )}
              </div>

              {/* 1st Place (Center Pedestal - Elevated & Tallest!) */}
              <div className="flex-1 max-w-[125px] flex flex-col items-center -mt-3">
                {/* Floating Crown */}
                <span className="text-base sm:text-lg animate-bounce leading-none mb-1">👑</span>

                {firstPlace ? (
                  <div
                    className={`w-full h-28 sm:h-32 rounded-t-2xl flex flex-col justify-between items-center p-2 transition-all relative ${
                      isFirstMe
                        ? 'bg-gradient-to-b from-[#FFF4D4] via-[#FFEAA7] to-[#FDCB6E] border-2 border-[#E5AA3A] shadow-lg ring-2 ring-[#6C5CE7] ring-offset-1'
                        : 'bg-gradient-to-b from-[#FFF4D4] via-[#FFEAA7] to-[#FDCB6E] border-2 border-[#E5AA3A] shadow-md'
                    }`}
                  >
                    {/* Top: 1st rank */}
                    <div className="flex items-center gap-1 font-display font-black text-sm sm:text-base text-amber-950">
                      <span>🥇</span>
                      <span>1st</span>
                    </div>

                    {/* Middle: Name */}
                    <div className="w-full text-center px-0.5">
                      <div className="font-display font-black text-xs sm:text-sm text-slate-900 truncate" title={firstName}>
                        {firstName}
                      </div>
                      {isFirstMe && (
                        <span className="text-[10px] font-black text-[#6C5CE7] leading-none block">
                          (You)
                        </span>
                      )}
                    </div>

                    {/* Bottom: Score */}
                    <div className="text-[11px] font-black text-amber-950 bg-white/80 px-2 py-0.5 rounded-full shadow-xs">
                      {firstPlace.score?.toLocaleString() ?? 0} pts
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-t-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 flex flex-col justify-between items-center p-2 text-amber-500">
                    <span className="font-display font-black text-xs">1st</span>
                    <span className="text-[11px] italic font-semibold text-amber-400">Waiting</span>
                    <span className="text-[10px] text-amber-300">—</span>
                  </div>
                )}
              </div>

              {/* 3rd Place (Right Pedestal - Shortest) */}
              <div className="flex-1 max-w-[105px] flex flex-col items-center">
                {thirdPlace ? (
                  <div
                    className={`w-full h-18 sm:h-20 rounded-t-2xl flex flex-col justify-between items-center p-1.5 sm:p-2 transition-all relative ${
                      isThirdMe
                        ? 'bg-gradient-to-b from-[#FFF0E6] to-[#FED7AA] border-2 border-[#FB923C] shadow-md ring-2 ring-[#6C5CE7]/30'
                        : 'bg-gradient-to-b from-[#FFF0E6] to-[#FED7AA] border-2 border-[#FB923C] shadow-xs'
                    }`}
                  >
                    {/* Top: 3rd rank */}
                    <div className="flex items-center gap-1 font-display font-black text-xs sm:text-sm text-amber-950">
                      <span>🥉</span>
                      <span>3rd</span>
                    </div>

                    {/* Middle: Name */}
                    <div className="w-full text-center px-0.5">
                      <div className="font-display font-black text-xs text-slate-800 truncate" title={thirdName}>
                        {thirdName}
                      </div>
                      {isThirdMe && (
                        <span className="text-[10px] font-black text-[#6C5CE7] leading-none block">
                          (You)
                        </span>
                      )}
                    </div>

                    {/* Bottom: Score */}
                    <div className="text-[10px] font-extrabold text-amber-950 bg-white/80 px-1.5 py-0.5 rounded-md shadow-xs">
                      {thirdPlace.score?.toLocaleString() ?? 0} pts
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-15 rounded-t-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col justify-between items-center p-1.5 text-slate-400">
                    <span className="font-display font-black text-xs text-slate-400">3rd</span>
                    <span className="text-[11px] italic font-semibold text-slate-300">Open</span>
                    <span className="text-[10px] text-slate-300">—</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ground Baseline from Sketch */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full shadow-inner" />

            {/* User Standings callout if participant is ranked 4th or lower */}
            {userRank !== null && userRank > 3 && (
              <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#ECE9FE] border border-[#DCD6FA] flex items-center justify-between text-xs animate-fade-in shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white font-display font-black text-[10px] flex items-center justify-center">
                    #{userRank}
                  </span>
                  <span className="font-bold text-slate-800 truncate max-w-[130px]">
                    You ({participant?.username})
                  </span>
                </div>
                <span className="font-extrabold text-[#6C5CE7]">
                  {userScore.toLocaleString()} pts
                </span>
              </div>
            )}

            {/* Expanded List for 4th+ (when user toggles Chevron) */}
            {mobileExpanded && activeList.length > 3 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 animate-scale-in max-h-48 overflow-y-auto">
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider px-1">
                  Other Contenders
                </div>
                {activeList.slice(3).map((item, idx) => {
                  const rank = idx + 4;
                  const isMe =
                    tab === 'individual' &&
                    (item.id === participant?.id ||
                      item.username?.toLowerCase() === participant?.username?.toLowerCase());
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
                        <span className="w-5 text-center text-xs font-black text-slate-400 font-display">
                          #{rank}
                        </span>
                        <span className="truncate font-display">
                          {tab === 'groups' ? item.name : item.username} {isMe && '(You)'}
                        </span>
                      </div>
                      <span className="font-extrabold text-[#6C5CE7] shrink-0">
                        {item.score?.toLocaleString() ?? 0} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
