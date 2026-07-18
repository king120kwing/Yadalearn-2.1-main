import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, QrCode, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';

interface ScanQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanQRModal({ isOpen, onClose }: ScanQRModalProps) {
  const navigate = useNavigate();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setScannedId(null);
      setProfile(null);
      setError('');
      setLoading(false);
      setIsScanning(true);
    }
  }, [isOpen]);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isOpen && !scannedId && isScanning) {
      html5QrCode = new Html5Qrcode("teacher-qr-reader");

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          setIsScanning(false);
          if (html5QrCode && html5QrCode.isScanning) {
            await html5QrCode.stop().catch(console.error);
          }
          handleScan(decodedText);
        },
        (error) => {
          // Ignore frequent scan errors when no QR is in frame
        }
      ).catch((err) => {
        console.error("Camera start error", err);
        setError("Could not start camera. Please ensure permissions are granted.");
        setIsScanning(false);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isOpen, scannedId, isScanning]);

  const handleScan = async (decodedText: string) => {
    if (loading) return;
    
    let targetUrl = decodedText.trim();
    let id = targetUrl;
    
    // Extract ID if a full URL is scanned
    if (targetUrl.includes('/link/')) {
        id = targetUrl.split('/link/')[1];
    }
    
    setScannedId(id);
    setLoading(true);
    setError('');
    
    try {
        const { data, error: err } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (err || !data) {
            setError('User not found. Invalid QR Code.');
        } else {
            setProfile(data);
        }
    } catch (e: any) {
        setError('Error fetching profile.');
    } finally {
        setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!scannedId) return;
    navigate(`/link/${scannedId}`);
    onClose();
  };

  const handleRetry = () => {
    setScannedId(null);
    setProfile(null);
    setError('');
    setIsScanning(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8 overflow-y-auto">
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

          {!scannedId ? (
              <div className="flex flex-col items-center">
                  <div className="relative rounded-2xl overflow-hidden bg-black w-full aspect-square flex items-center justify-center border-4 border-slate-100 dark:border-zinc-800">
                    <div id="teacher-qr-reader" className="w-full h-full [&_video]:object-cover" />
                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                       <div className="w-full h-full border-2 border-dashed border-purple-500 relative">
                         <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                       </div>
                    </div>
                  </div>
                  {error && <p className="text-red-500 font-bold mt-4 text-center text-sm">{error}</p>}
                  <p className="text-center text-sm text-slate-500 dark:text-zinc-400 mt-6 font-medium">
                      Point your camera at a YadaLearn QR code.
                  </p>
              </div>
          ) : (
              <div className="bg-slate-50 dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center">
                  {loading && (
                      <div className="flex flex-col items-center py-8">
                          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
                          <p className="text-slate-500 dark:text-zinc-400 font-medium">Fetching profile...</p>
                      </div>
                  )}
                  
                  {error && !loading && (
                      <div className="flex flex-col items-center py-6">
                          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                              <X className="w-8 h-8" />
                          </div>
                          <p className="text-red-500 font-bold mb-6">{error}</p>
                          <button onClick={handleRetry} className="px-6 py-2 bg-slate-200 dark:bg-zinc-800 rounded-full font-bold">Scan Again</button>
                      </div>
                  )}

                  {profile && (
                      <div className="w-full flex flex-col items-center animate-in zoom-in duration-300">
                          {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt="Profile" className="w-24 h-24 rounded-full border-4 border-purple-500 mb-4 object-cover shadow-xl" />
                          ) : (
                              <div className="w-24 h-24 rounded-full border-4 border-purple-500 mb-4 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shadow-xl">
                                  <span className="material-symbols-outlined text-4xl text-purple-600 dark:text-purple-400">person</span>
                              </div>
                          )}
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{profile.full_name || profile.name || 'User'}</h3>
                          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 capitalize font-medium">{profile.role || 'Member'}</p>
                          
                          {profile.bio && (
                              <p className="text-sm text-slate-600 dark:text-zinc-300 mt-4 line-clamp-2 italic">"{profile.bio}"</p>
                          )}

                          <div className="w-full grid grid-cols-2 gap-3 mt-8">
                              <button onClick={handleRetry} className="py-3 px-4 rounded-xl font-bold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors">
                                  Cancel
                              </button>
                              <button onClick={handleConnect} className="py-3 px-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
                                  Add
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          )}
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
