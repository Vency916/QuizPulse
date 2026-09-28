import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function Timer({ totalSeconds = 20, startedAt, onTimeUp, paused = false }) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    if (!startedAt || paused) return;

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
  }, [totalSeconds, startedAt, paused, onTimeUp]);

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
