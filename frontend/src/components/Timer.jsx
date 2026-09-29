import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function Timer({
  totalSeconds = 20,
  startedAt,
  onTimeUp,
  paused = false,
  enabled = true,
  compact = false,
}) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    if (!enabled || !startedAt || paused || totalSeconds <= 0) return;

    const calculateRemaining = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const elapsed = (now - start) / 1000;
      const remaining = Math.max(0, Math.ceil(totalSeconds - elapsed));
      return remaining;
    };

    const initial = calculateRemaining();
    setTimeLeft(initial);

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      // Play tick sound when 5 seconds or less remain
      if (remaining <= 5 && remaining > 0) {
        sounds.playTick();
      }

      if (remaining <= 0) {
        clearInterval(interval);
        if (onTimeUp) onTimeUp();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [totalSeconds, startedAt, paused, onTimeUp, enabled]);

  // If timer is disabled for this quiz or session
  if (!enabled || totalSeconds <= 0) {
    if (compact) {
      return (
        <div className="flex items-center gap-1 font-display font-black text-xs text-[#6C5CE7]">
          <span className="text-base leading-none">∞</span>
          <span className="text-[10px] uppercase font-bold tracking-wider">Untimed</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#6C5CE7] bg-[#ECE9FE] text-[#6C5CE7] flex flex-col items-center justify-center font-display font-bold shadow-md">
          <span className="text-2xl leading-none">∞</span>
          <span className="text-[9px] font-sans uppercase font-bold tracking-wider opacity-90">Untimed</span>
        </div>
      </div>
    );
  }

  const percentage = Math.max(0, Math.min(100, (timeLeft / totalSeconds) * 100));

  // Determine color theme based on urgency
  let colorClass = 'text-[#00B894] border-[#00B894] bg-[#E0F8F2]';
  let barClass = 'bg-[#00B894]';
  if (timeLeft <= 5) {
    colorClass = 'text-[#FF7675] border-[#FF7675] bg-[#FFEBEB] animate-pulse';
    barClass = 'bg-[#FF7675]';
  } else if (timeLeft <= 10) {
    colorClass = 'text-[#FDCB6E] border-[#FDCB6E] bg-[#FFF8E6]';
    barClass = 'bg-[#FDCB6E]';
  }

  if (compact) {
    return (
      <span className={`font-display font-black text-sm sm:text-base leading-none ${timeLeft <= 5 ? 'text-[#FF7675] animate-pulse' : 'text-slate-700'}`}>
        {timeLeft}s
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Circle display */}
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 flex flex-col items-center justify-center font-display font-bold shadow-md transition-all ${colorClass}`}>
        <span className="text-xl sm:text-2xl leading-none">{timeLeft}</span>
        <span className="text-[10px] font-sans uppercase font-bold tracking-wider opacity-80">sec</span>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-24 sm:w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
        <div 
          className={`h-full transition-all duration-300 ${barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
