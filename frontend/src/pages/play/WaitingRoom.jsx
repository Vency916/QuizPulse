import React, { useState } from 'react';
import { Users, QrCode, Sparkles, Clock, Shield } from 'lucide-react';
import QRCodeModal from '../../components/QRCodeModal';
import { sounds } from '../../services/soundEffects';
import Mascot from '../../components/Mascot';

export default function WaitingRoom({ session, participant }) {
  const [showQR, setShowQR] = useState(false);

  const participants = session.participants || [];
  const group = participant?.group;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="card-playful p-6 sm:p-8 text-center mb-6 bg-white border-2 border-[#ECE8FD] shadow-xl shadow-[#6C5CE7]/10">
        <div className="mb-2 animate-bounce">
          <Mascot mood="happy" size={72} className="mx-auto" />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0F8F2] text-[#00B894] font-extrabold text-xs uppercase tracking-wider mb-3">
          <span className="w-2 h-2 rounded-full bg-[#00B894] animate-ping" />
          <span>You're in the Lobby!</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
          {session.quiz?.title || 'Live Quiz'}
        </h1>

        <p className="text-slate-500 font-medium text-sm sm:text-base max-w-md mx-auto mb-6">
          Waiting for the host to start the quiz... Get ready to test your knowledge!
        </p>

        {/* PIN & QR Code Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="bg-[#ECE9FE] border-2 border-[#DCD6FA] px-4 py-2 rounded-2xl flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">PIN:</span>
            <span className="font-display text-xl font-bold text-[#6C5CE7] tracking-widest">
              {session.session_code}
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setShowQR(true);
            }}
            className="btn-3d-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#6C5CE7]" />
            <span>Show QR Code</span>
          </button>
        </div>

        {/* Participant Identity Badge */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700">
            <span>Playing as:</span>
            <span className="text-[#6C5CE7] font-extrabold">{participant?.username || 'Player'}</span>
          </div>

          {group && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: group.color || '#6C5CE7' }}
            >
              <span>{group.name}</span>
            </div>
          )}
        </div>

        {/* Waiting for host indicator */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#ECE9FE] to-[#E0F8F2] border-2 border-[#6C5CE7]/30 flex items-center justify-center gap-3 shadow-sm">
          <div className="w-3 h-3 rounded-full bg-[#6C5CE7] animate-pulse" />
          <div className="text-sm font-bold text-slate-700">
            Waiting for the host to start the quiz...
          </div>
        </div>

      </div>


      {/* Players in Lobby Section */}
      <div className="card-playful p-6 bg-white border-2 border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6C5CE7]" />
            <h2 className="font-display text-lg font-bold text-slate-800">
              Players in Waiting Room
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#ECE9FE] text-[#6C5CE7] text-xs font-bold">
            {participants.length} Joined
          </span>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-medium text-sm">
            Waiting for other players to connect...
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {participants.map((p) => {
              const isCurrent = p.username === participant?.username;
              return (
                <div
                  key={p.id || p.username}
                  className={`px-3.5 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border transition-all animate-scale-in ${
                    isCurrent
                      ? 'border-[#6C5CE7] bg-[#ECE9FE] text-[#6C5CE7] shadow-sm ring-2 ring-[#6C5CE7]/30'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.group?.color || '#00B894' }}
                  />
                  <span>{p.username}</span>
                  {isCurrent && <span className="text-[10px] uppercase font-bold text-[#6C5CE7] bg-white px-1.5 rounded-md">You</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        sessionCode={session.session_code}
        isOpen={showQR}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
}
