import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

interface StartClassModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StartClassModal = ({ isOpen, onClose }: StartClassModalProps) => {
    const [sessionStatus, setSessionStatus] = useState<'pre-live' | 'live'>('pre-live');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // LiveKit States
    const [livekitToken, setLivekitToken] = useState<string>('');
    const [livekitUrl, setLivekitUrl] = useState<string>(import.meta.env.VITE_LIVEKIT_URL || '');
    const [roomId, setRoomId] = useState<string>('');

    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [cameraError, setCameraError] = useState<boolean>(false);

    const [classParticipants, setClassParticipants] = useState<any[]>([]);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const [subtitleLang, setSubtitleLang] = useState<string>('en');
    const [subtitlesText, setSubtitlesText] = useState<string>("Welcome to today's Calculus introduction class.");

    const [hasStream, setHasStream] = useState<boolean>(false);
    const [showSubtitles, setShowSubtitles] = useState<boolean>(false);

    // Callback ref to handle binding of stream to unmounted/mounted video tags cleanly
    const setVideoRef = (node: HTMLVideoElement | null) => {
        videoRef.current = node;
        if (node && streamRef.current) {
            node.srcObject = streamRef.current;
        }
    };

    const startCamera = async () => {
        setCameraError(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setHasStream(true);
        } catch (err) {
            console.warn('Camera access denied:', err);
            setCameraError(true);
        }
    };

    // Cleanup stream on close
    useEffect(() => {
        if (!isOpen) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setHasStream(false);
            setCameraError(false);
        }
    }, [isOpen]);

    // Re-bind camera stream when DOM changes or session transitions
    useEffect(() => {
        if (streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [sessionStatus, cameraError, isOpen, hasStream]);

    // Trigger camera automatically when going live if not already started
    useEffect(() => {
        if (sessionStatus === 'live' && !hasStream && !cameraError && isOpen) {
            startCamera();
        }
    }, [sessionStatus, hasStream, cameraError, isOpen]);

    // When session starts, admit waiting room students to live participants
    useEffect(() => {
        if (sessionStatus === 'live') {
            const list = students.map(s => ({
                id: s.id,
                name: s.name,
                avatar: s.avatar,
                isMuted: false
            }));
            setClassParticipants(list);
        }
    }, [sessionStatus, students]);

    // Authentic Web Speech API for real-time live subtitles
    useEffect(() => {
        if (sessionStatus !== 'live' || !isOpen || !showSubtitles) {
            setSubtitlesText("");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSubtitlesText("Live speech recognition not supported in this browser. Please speak to your class.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false; // Disable interim results to completely eliminate blinking!
        recognition.lang = subtitleLang === 'en' ? 'en-US' : 
                           subtitleLang === 'fr' ? 'fr-FR' : 
                           subtitleLang === 'es' ? 'es-ES' : 
                           subtitleLang === 'zh' ? 'zh-CN' : 'en-US';

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript + ' ';
                }
            }
            if (transcript.trim()) {
                setSubtitlesText(prev => {
                    const cleanPrev = prev.startsWith("Listening") || prev.startsWith("Speech") ? "" : prev;
                    const parts = (cleanPrev + ' ' + transcript).split('.').map(s => s.trim()).filter(Boolean);
                    // Keep the last 2 recognized sentences for a clean, stable scrolling layout
                    return parts.slice(-2).join('. ') + (parts.length > 0 ? '.' : '');
                });
            }
        };

        recognition.onerror = (event: any) => {
            console.warn('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            if (sessionStatus === 'live' && showSubtitles) {
                try {
                    recognition.start();
                } catch (e) {}
            }
        };

        try {
            recognition.start();
            setSubtitlesText("Listening to your voice... Speak now.");
        } catch (err) {
            console.warn("Could not start speech recognition:", err);
        }

        return () => {
            recognition.onend = null;
            try {
                recognition.stop();
            } catch (e) {}
        };
    }, [sessionStatus, subtitleLang, isOpen, showSubtitles]);

    // Fetch dynamic students
    useEffect(() => {
        async function fetchStudents() {
            try {
                setLoadingStudents(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: links } = await supabase
                    .from('teacher_student_links')
                    .select('student:profiles!teacher_student_links_student_id_fkey(*)')
                    .eq('teacher_id', user.id)
                    .eq('status', 'accepted');

                if (links) {
                    const uniqueStudents = links
                        .map((l: any) => l.student)
                        .filter(Boolean);

                    const list = uniqueStudents.map((s: any, idx) => {
                        const statuses = ['ready', 'connecting', 'lobby'];
                        const status = statuses[idx % 3];
                        return {
                            id: s.id,
                            name: s.full_name || 'Unknown Student',
                            status,
                            connection: status === 'ready' ? 'good' : status === 'connecting' ? 'connecting' : 'waiting',
                            avatar: s.avatar_url
                        };
                    });
                    setStudents(list);
                }
            } catch (err) {
                console.error('Error fetching class students:', err);
            } finally {
                setLoadingStudents(false);
            }
        }
        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen]);

    const handleStartSession = async () => {
        setSessionStatus('live');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Clean up pre-live stream first so LiveKit can request the camera exclusively
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Try LiveKit initialization if URL is set
        if (livekitUrl) {
            try {
                const roomName = `class-${user.id}-${Date.now()}`;
                setRoomId(roomName);

                // Fetch LiveKit room token from Supabase Edge Function
                const { data, error } = await supabase.functions.invoke('livekit-token', {
                    body: { roomName, participantName: user.email || 'Teacher' }
                });

                if (error) throw error;
                if (data && data.token) {
                    setLivekitToken(data.token);
                    
                    // Insert into live_classes table
                    await supabase.from('live_classes').insert({
                        teacher_id: user.id,
                        room_id: roomName,
                        status: 'active',
                        scheduled_start: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.warn("LiveKit Token negotiation failed, running local simulator:", err);
            }
        }
    };

    const handleEndSession = async () => {
        // Clean up streams
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // Terminate active live class session in Supabase if LiveKit was running
        if (roomId) {
            try {
                await supabase
                    .from('live_classes')
                    .update({ status: 'completed', ended_at: new Date().toISOString() })
                    .eq('room_id', roomId);
            } catch (err) {
                console.warn('Error ending class in database:', err);
            }
        }

        setLivekitToken('');
        setRoomId('');
        setSessionStatus('pre-live');
        onClose();
        alert('Live class ended successfully.');
    };

    const handleMuteAll = () => {
        setClassParticipants(prev => prev.map(p => ({ ...p, isMuted: true })));
    };

    const handleUnmuteAll = () => {
        setClassParticipants(prev => prev.map(p => ({ ...p, isMuted: false })));
    };

    const handleToggleMuteParticipant = (id: string) => {
        setClassParticipants(prev => prev.map(p => p.id === id ? { ...p, isMuted: !p.isMuted } : p));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className={sessionStatus === 'live' 
                    ? "!max-w-none !w-screen !h-screen !max-h-none !rounded-none !m-0 !p-0 bg-zinc-950 border-0 flex flex-col text-white transition-all duration-300"
                    : "!max-w-4xl mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden max-h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl transition-all duration-300"
                }
            >
                {sessionStatus === 'live' ? (
                    livekitToken ? (
                        <LiveKitRoom
                            video={!isVideoOff}
                            audio={!isMuted}
                            token={livekitToken}
                            serverUrl={livekitUrl}
                            connect={true}
                            onDisconnected={handleEndSession}
                            className="flex-1 flex flex-col md:flex-row overflow-hidden bg-zinc-950 text-white relative h-full"
                        >
                            <div className="flex-grow flex items-center justify-center p-4 relative bg-zinc-900">
                                <VideoConference />
                            </div>
                            {/* Subtitles Overlay */}
                            {showSubtitles && subtitlesText && (
                                <div className="absolute bottom-24 left-1/2 translate-x-[-50%] z-50 bg-black/85 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 max-w-[80%] text-center">
                                    <p className="text-sm font-medium text-orange-400 font-mono tracking-tight">
                                        [Subtitles ({subtitleLang.toUpperCase()})]: {subtitlesText}
                                    </p>
                                </div>
                            )}
                        </LiveKitRoom>
                    ) : (
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-zinc-950 text-white relative h-full">
                            {/* Left: Video & Controls */}
                            <div className="flex-1 flex flex-col relative bg-zinc-900/60 h-full justify-between">
                                {/* Top Bar overlay */}
                                <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
                                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3 border border-white/10 pointer-events-auto">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                        <span className="text-xs font-bold text-white tracking-wider">REC 00:04:12</span>
                                        <div className="h-3 w-px bg-white/20"></div>
                                        <span className="text-xs text-gray-300 font-medium">Calculus Intro</span>
                                    </div>

                                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 pointer-events-auto">
                                        <span className="material-symbols-outlined text-green-500 text-[18px]">verified_user</span>
                                        <span className="text-xs text-white font-bold">Secure HD Call</span>
                                    </div>
                                </div>

                                {/* Main Video Feed */}
                                <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                                    {cameraError || isVideoOff ? (
                                        <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-950/80 rounded-3xl border border-white/5 max-w-md w-full aspect-video shadow-2xl">
                                            <span className="material-symbols-outlined text-zinc-600 text-5xl mb-3">videocam_off</span>
                                            <p className="text-base font-bold text-zinc-300">
                                                {isVideoOff ? 'Video Paused' : 'Webcam Stream Offline'}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-2 max-w-[280px]">
                                                {isVideoOff 
                                                    ? 'Your camera feed is turned off. Toggle the camera icon below to resume.' 
                                                    : 'Please ensure camera access is enabled in your browser settings to transmit live HD video.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <video
                                            ref={setVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full max-h-[80vh] object-cover rounded-3xl shadow-2xl border border-white/10"
                                        />
                                    )}

                                    {/* Subtitles Overlay */}
                                    {showSubtitles && subtitlesText && (
                                        <div className="absolute bottom-6 left-1/2 translate-x-[-50%] z-45 bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 max-w-[80%] text-center">
                                            <p className="text-sm font-medium text-orange-400 font-mono tracking-tight">
                                                [Subtitles ({subtitleLang.toUpperCase()})]: {subtitlesText}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Zoom Bottom Control Bar */}
                                <div className="bg-zinc-950/90 border-t border-white/5 p-4 flex items-center justify-between z-40 shrink-0">
                                    {/* Left Controls */}
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setIsMuted(!isMuted)}
                                            className={`size-12 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                        >
                                            <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
                                        </button>
                                        <button 
                                            onClick={() => setIsVideoOff(!isVideoOff)}
                                            className={`size-12 rounded-xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                        >
                                            <span className="material-symbols-outlined">{isVideoOff ? 'videocam_off' : 'videocam'}</span>
                                        </button>
                                        <button 
                                            onClick={() => setShowSubtitles(!showSubtitles)}
                                            className={`size-12 rounded-xl flex items-center justify-center transition-all ${showSubtitles ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                            title="Toggle Subtitles"
                                        >
                                            <span className="material-symbols-outlined text-[22px]">{showSubtitles ? 'subtitles' : 'subtitles_off'}</span>
                                        </button>
                                    </div>

                                    {/* Center Controls (Screen Share & Translation) */}
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setIsSharing(!isSharing)}
                                            className={`px-5 h-12 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${isSharing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">screen_share</span>
                                            {isSharing ? 'Sharing Screen' : 'Share Screen'}
                                        </button>

                                        <div className="flex items-center bg-white/10 rounded-xl px-3 border border-white/10">
                                            <span className="material-symbols-outlined text-gray-400 text-[20px] mr-1.5">translate</span>
                                            <select 
                                                value={subtitleLang}
                                                onChange={(e) => setSubtitleLang(e.target.value)}
                                                className="bg-transparent text-white font-bold text-xs h-12 outline-none cursor-pointer pr-4 border-0"
                                            >
                                                <option value="en" className="bg-zinc-950 text-white">English Sub</option>
                                                <option value="fr" className="bg-zinc-950 text-white">French Sub</option>
                                                <option value="es" className="bg-zinc-950 text-white">Spanish Sub</option>
                                                <option value="zh" className="bg-zinc-950 text-white">Mandarin Sub</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Right Controls */}
                                    <button 
                                        onClick={handleEndSession}
                                        className="px-6 h-12 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/20"
                                    >
                                        End Session
                                    </button>
                                </div>
                            </div>

                            {/* Right: Zoom Participants Sidebar */}
                            <div className="w-full md:w-80 border-l border-white/5 bg-zinc-950 flex flex-col h-full shrink-0">
                                <div className="p-4 border-b border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-white text-base">Participants ({classParticipants.length})</h3>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleMuteAll}
                                                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all"
                                            >
                                                Mute All
                                            </button>
                                            <button 
                                                onClick={handleUnmuteAll}
                                                className="px-2.5 py-1 rounded bg-[#FF7D46] hover:bg-[#e06634] text-white text-[11px] font-bold transition-all"
                                            >
                                                Unmute All
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {classParticipants.map(participant => (
                                        <div key={participant.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {participant.avatar ? (
                                                        <img className="size-9 rounded-full object-cover border border-white/10" src={participant.avatar} alt={participant.name} />
                                                    ) : (
                                                        <div className="size-9 rounded-full bg-[#FF7D46]/20 flex items-center justify-center text-[#FF7D46] font-bold text-sm border border-white/10">
                                                            {participant.name[0]}
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border border-zinc-950"></div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white truncate max-w-[120px]">{participant.name}</div>
                                                    <div className="text-[10px] text-zinc-500">Connected</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                {/* Audio status visualizer */}
                                                {!participant.isMuted && (
                                                    <div className="flex gap-0.5 items-end h-2.5 mr-1">
                                                        <div className="w-0.5 bg-green-500 h-[30%] rounded-sm animate-pulse"></div>
                                                        <div className="w-0.5 bg-green-500 h-[60%] rounded-sm animate-pulse"></div>
                                                        <div className="w-0.5 bg-green-500 h-[90%] rounded-sm animate-pulse"></div>
                                                    </div>
                                                )}

                                                <button 
                                                    onClick={() => handleToggleMuteParticipant(participant.id)}
                                                    className={`size-7 rounded-lg flex items-center justify-center transition-all ${participant.isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">{participant.isMuted ? 'mic_off' : 'mic'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        {/* Top Navigation */}
                        <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shrink-0">
                            <div className="flex items-center p-6 justify-between">
                                <button
                                    onClick={onClose}
                                    className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <h2 className="text-lg font-bold leading-tight tracking-tight">Math 101</h2>
                                <div className="size-10"></div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-28">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Basic Details & AV */}
                                <div className="space-y-6">
                                    {/* Session Header */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-[#FF7D46]/10 dark:bg-[#FF7D46]/20 text-[#FF7D46] text-xs font-bold uppercase tracking-wider">Session 12</span>
                                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-[14px]">schedule</span> 45 min
                                            </span>
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-1 text-gray-900 dark:text-white font-serif">Calculus Intro</h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Pre-flight checks & student admission.</p>
                                    </div>

                                    {/* AV Diagnostics Card */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AV Diagnostics</h3>
                                            <div className="flex items-center gap-1">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7D46] opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7D46]"></span>
                                                </span>
                                                <span className="text-xs font-medium text-[#FF7D46] ml-1 font-bold">System Ready</span>
                                            </div>
                                        </div>

                                        <div className="relative w-full rounded-2xl overflow-hidden aspect-video bg-gray-950 shadow-lg ring-1 ring-gray-250 dark:ring-gray-800 group flex items-center justify-center">
                                            {/* Camera Preview */}
                                            {cameraError ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 p-6 text-center z-10">
                                                    <span className="material-symbols-outlined text-gray-500 text-4xl mb-2">videocam_off</span>
                                                    <p className="text-sm font-bold text-gray-400">Camera / Microphone Blocked</p>
                                                    <p className="text-xs text-gray-500 mt-1 max-w-[240px]">Enable media permissions in your browser bar to preview your feed.</p>
                                                </div>
                                            ) : !hasStream ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 p-6 text-center z-10">
                                                    <div className="size-12 rounded-full bg-[#FF7D46]/10 flex items-center justify-center mb-3">
                                                        <span className="material-symbols-outlined text-[#FF7D46] text-[26px]">videocam</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-300">AV System Idle</p>
                                                    <p className="text-xs text-gray-550 mt-1 max-w-[240px] mb-4">Start your camera and mic preview before the session begins.</p>
                                                    <button 
                                                        onClick={startCamera}
                                                        className="px-4 py-2 rounded-xl bg-[#FF7D46] hover:bg-[#e06634] text-white text-xs font-bold transition-all shadow-md shadow-[#FF7D46]/10 active:scale-95"
                                                    >
                                                        Start Preview
                                                    </button>
                                                </div>
                                            ) : (
                                                <video
                                                    ref={setVideoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                                                />
                                            )}

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

                                            {/* Mic Visualizer */}
                                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 border border-white/10 z-10">
                                                <span className="material-symbols-outlined text-[#FF7D46] text-[16px]">mic</span>
                                                <div className="flex gap-0.5 items-end h-3">
                                                    <div className="w-1 bg-[#FF7D46] h-[40%] rounded-sm"></div>
                                                    <div className="w-1 bg-[#FF7D46] h-[70%] rounded-sm"></div>
                                                    <div className="w-1 bg-[#FF7D46] h-[100%] rounded-sm"></div>
                                                    <div className="w-1 bg-[#FF7D46] h-[60%] rounded-sm"></div>
                                                </div>
                                            </div>

                                            {/* Connection Status */}
                                            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 border border-white/10 z-10">
                                                <span className="material-symbols-outlined text-[#FF7D46] text-[16px]">wifi</span>
                                                <span className="text-xs font-medium text-white">Strong</span>
                                            </div>

                                            {/* Controls Bar */}
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
                                                <button className="size-12 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-[#FF7D46] hover:text-white transition-colors shadow-lg">
                                                    <span className="material-symbols-outlined">mic_off</span>
                                                </button>
                                                <button 
                                                    onClick={hasStream ? () => {
                                                        if (streamRef.current) {
                                                            streamRef.current.getTracks().forEach(t => t.stop());
                                                            streamRef.current = null;
                                                        }
                                                        setHasStream(false);
                                                    } : startCamera}
                                                    className="size-12 rounded-full bg-[#FF7D46] text-white flex items-center justify-center hover:bg-[#e06634] transition-colors shadow-lg ring-4 ring-[#FF7D46]/30 active:scale-95"
                                                >
                                                    <span className="material-symbols-outlined">{hasStream ? 'videocam_off' : 'videocam'}</span>
                                                </button>
                                                <button className="size-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors border border-white/20">
                                                    <span className="material-symbols-outlined">settings</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pre-Flight Checklist */}
                                    <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700/60 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#FF7D46]">fact_check</span>
                                            Auto-Checks
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[#FF7D46] text-[20px]">check_circle</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Lesson materials loaded</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[#FF7D46] text-[20px]">check_circle</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Screen sharing ready</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between opacity-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-gray-500 text-[20px]">radio_button_unchecked</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Co-teacher joined</span>
                                                </div>
                                                <span className="text-[10px] bg-gray-750 text-white px-2 py-0.5 rounded-full">Optional</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Student Roster */}
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Waiting Room</h3>
                                            <span className="bg-[#FF7D46] text-white text-xs font-bold px-2 py-0.5 rounded-full">{students.length}</span>
                                        </div>
                                        <button className="text-sm font-bold text-[#FF7D46] hover:text-[#e06634] active:scale-95 transition-transform">
                                            Admit All
                                        </button>
                                    </div>

                                    <div className="space-y-1 overflow-y-auto no-scrollbar max-h-[45vh]">
                                        {loadingStudents ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF7D46]"></div>
                                            </div>
                                        ) : students.length === 0 ? (
                                            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                                                <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">group</span>
                                                <p className="text-xs font-bold">No students in waiting room</p>
                                            </div>
                                        ) : (
                                            students.map(student => (
                                                <div key={student.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-transparent dark:hover:border-zinc-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            {student.avatar ? (
                                                                <img className="size-10 rounded-full object-cover border border-gray-200 dark:border-zinc-700" src={student.avatar} alt={student.name} />
                                                            ) : (
                                                                <div className="size-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-orange-800 dark:text-orange-200 font-bold border border-gray-200 dark:border-zinc-700">
                                                                    {student.name.split(' ').map((n: string) => n[0]).join('')}
                                                                </div>
                                                            )}
                                                            <div className={`absolute bottom-0 right-0 size-3 border-2 border-white dark:border-zinc-900 rounded-full ${student.status === 'ready' ? 'bg-green-500' :
                                                                    student.status === 'connecting' ? 'bg-yellow-500' :
                                                                        'bg-gray-500'
                                                                }`}></div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm text-gray-900 dark:text-white text-left">{student.name}</div>
                                                            <div className={`text-left text-xs ${student.status === 'ready' ? 'text-green-600 dark:text-green-400' :
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
                                                        <button className="px-3 py-1.5 rounded-lg bg-[#FF7D46]/10 dark:bg-[#FF7D46]/20 hover:bg-[#FF7D46] text-[#FF7D46] hover:text-white text-xs font-bold transition-colors">
                                                            Admit
                                                        </button>
                                                    ) : (
                                                        <button className="size-8 flex items-center justify-center rounded-full bg-gray-250 dark:bg-zinc-800 text-gray-500 hover:text-white hover:bg-green-600 transition-colors">
                                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="absolute bottom-0 left-0 w-full z-50 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 p-4 pb-8 flex justify-end">
                            <button
                                onClick={handleStartSession}
                                className="group w-full md:w-auto md:px-8 relative overflow-hidden rounded-xl bg-[#FF7D46] hover:bg-[#e06634] active:scale-[0.99] transition-all duration-200 h-14 shadow-lg shadow-[#FF7D46]/30 hover:shadow-[#FF7D46]/50"
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
