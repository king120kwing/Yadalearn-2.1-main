import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface StartClassModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StartClassModal = ({ isOpen, onClose }: StartClassModalProps) => {
    const [sessionStatus, setSessionStatus] = useState<'pre-live' | 'live'>('pre-live');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Camera access
    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => console.error('Camera access denied:', err));
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const handleStartSession = () => {
        setSessionStatus('live');
        // In real app, this would start the WebRTC session
        alert('Session Started! Recording in progress.');
    };

    const students = [
        { id: 1, name: 'Alice Martinez', status: 'ready', connection: 'good', avatar: 'https://i.pravatar.cc/150?u=alice' },
        { id: 2, name: 'Marcus Chen', status: 'connecting', connection: 'connecting', avatar: 'https://i.pravatar.cc/150?u=marcus' },
        { id: 3, name: 'Sarah Johnson', status: 'lobby', connection: 'waiting', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        { id: 4, name: 'David Kim', status: 'lobby', connection: 'waiting', avatar: null },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden max-h-screen flex flex-col">
                {/* Top Navigation */}
                <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center p-4 justify-between">
                        <button
                            onClick={onClose}
                            className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">Math 101</h2>
                        <div className="size-10"></div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Session Header */}
                    <div className="px-5 pt-4 pb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Session 12</span>
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-[14px]">schedule</span> 45 min
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-1 text-gray-900 dark:text-white">Calculus Intro</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pre-flight checks & student admission.</p>
                    </div>

                    {/* AV Diagnostics Card */}
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AV Diagnostics</h3>
                            <div className="flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-1">System Ready</span>
                            </div>
                        </div>

                        <div className="relative w-full rounded-2xl overflow-hidden aspect-video bg-gray-900 shadow-lg ring-1 ring-gray-200 dark:ring-gray-800 group">
                            {/* Camera Preview */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                            {/* Mic Visualizer */}
                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 border border-white/10">
                                <span className="material-symbols-outlined text-emerald-400 text-[16px]">mic</span>
                                <div className="flex gap-0.5 items-end h-3">
                                    <div className="w-1 bg-emerald-400 h-[40%] rounded-sm"></div>
                                    <div className="w-1 bg-emerald-400 h-[70%] rounded-sm"></div>
                                    <div className="w-1 bg-emerald-400 h-[100%] rounded-sm"></div>
                                    <div className="w-1 bg-emerald-400 h-[60%] rounded-sm"></div>
                                </div>
                            </div>

                            {/* Connection Status */}
                            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 border border-white/10">
                                <span className="material-symbols-outlined text-green-400 text-[16px]">wifi</span>
                                <span className="text-xs font-medium text-white">Strong</span>
                            </div>

                            {/* Controls Bar */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                <button className="size-12 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-lg">
                                    <span className="material-symbols-outlined">mic_off</span>
                                </button>
                                <button className="size-12 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg ring-4 ring-emerald-500/30">
                                    <span className="material-symbols-outlined">videocam</span>
                                </button>
                                <button className="size-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors border border-white/20">
                                    <span className="material-symbols-outlined">settings</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pre-Flight Checklist */}
                    <div className="px-5 mb-2">
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">fact_check</span>
                                Auto-Checks
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Lesson materials loaded</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Screen sharing ready</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between opacity-50">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500 text-[20px]">radio_button_unchecked</span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Co-teacher joined</span>
                                    </div>
                                    <span className="text-[10px] bg-gray-700 text-white px-2 py-0.5 rounded-full">Optional</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Roster */}
                    <div className="px-5 pt-4 pb-28">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Waiting Room</h3>
                                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{students.length}</span>
                            </div>
                            <button className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 transition-transform">
                                Admit All
                            </button>
                        </div>

                        <div className="space-y-1">
                            {students.map(student => (
                                <div key={student.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent dark:hover:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {student.avatar ? (
                                                <img className="size-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" src={student.avatar} alt={student.name} />
                                            ) : (
                                                <div className="size-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-800 dark:text-orange-200 font-bold border border-gray-200 dark:border-gray-700">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            )}
                                            <div className={`absolute bottom-0 right-0 size-3 border-2 border-white dark:border-gray-900 rounded-full ${student.status === 'ready' ? 'bg-green-500' :
                                                    student.status === 'connecting' ? 'bg-yellow-500' :
                                                        'bg-gray-500'
                                                }`}></div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900 dark:text-white">{student.name}</div>
                                            <div className={`text-xs ${student.status === 'ready' ? 'text-green-600 dark:text-green-400' :
                                                    student.status === 'connecting' ? 'text-yellow-600 dark:text-yellow-500' :
                                                        'text-gray-500'
                                                }`}>
                                                {student.status === 'ready' ? 'Connection Good' :
                                                    student.status === 'connecting' ? 'Connecting audio...' :
                                                        'In Lobby'}
                                            </div>
                                        </div>
                                    </div>
                                    {student.status === 'lobby' ? (
                                        <button className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white text-xs font-bold transition-colors">
                                            Admit
                                        </button>
                                    ) : (
                                        <button className="size-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 hover:text-white hover:bg-green-600 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 left-0 w-full z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-8 pt-4 px-5">
                    <button
                        onClick={handleStartSession}
                        className="group w-full relative overflow-hidden rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] transition-all duration-200 h-14 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            <div className="p-1 bg-black/10 rounded-full">
                                <span className="material-symbols-outlined text-white font-bold">radio_button_checked</span>
                            </div>
                            <span className="text-white text-lg font-bold tracking-tight">Start Session & Record</span>
                        </div>
                        {/* Shine effect */}
                        <div className="absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
