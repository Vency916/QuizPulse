import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, X, QrCode } from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function QRCodeModal({ sessionCode, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinUrl = `${window.location.origin}/join/${sessionCode}`;

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-slate-100 shadow-2xl relative flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#ECE9FE] flex items-center justify-center text-[#6C5CE7] mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="font-display text-2xl font-bold text-slate-800">Scan to Join</h3>
        <p className="text-sm text-slate-500 mb-6">Point your phone camera to join the quiz instantly!</p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border-4 border-[#6C5CE7]/20 shadow-inner mb-6">
          <QRCodeSVG
            value={joinUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Session Code Highlight */}
        <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-4 flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs uppercase font-bold text-slate-400">Game PIN</div>
            <div className="font-display text-2xl font-bold tracking-widest text-[#6C5CE7]">{sessionCode}</div>
          </div>
          <button
            onClick={handleCopy}
            className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00B894]" />
                <span className="text-[#00B894]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
