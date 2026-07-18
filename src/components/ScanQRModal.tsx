import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, QrCode } from 'lucide-react';

interface ScanQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanQRModal({ isOpen, onClose }: ScanQRModalProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    // Extract ID if a full URL is pasted
    let targetUrl = linkUrl.trim();
    if (targetUrl.includes('/link/')) {
        const id = targetUrl.split('/link/')[1];
        navigate(`/link/${id}`);
    } else {
        // Assume they just pasted the ID
        navigate(`/link/${targetUrl}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <QrCode className="w-8 h-8 text-purple-500" />
              Scan QR Code
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-500 dark:text-zinc-400" />
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-6 flex flex-col items-center text-center">
             <div className="w-32 h-32 bg-white rounded-xl border-4 border-dashed border-purple-200 dark:border-purple-900/50 flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                <QrCode className="w-12 h-12 text-slate-300 dark:text-zinc-700" />
             </div>
             <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
               Point your camera at the QR code, or manually enter the link below.
             </p>
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                QR Code Link / User ID
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://... or User ID"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow dark:text-white"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={!linkUrl.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
            >
              Simulate Scan & Connect
            </button>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
