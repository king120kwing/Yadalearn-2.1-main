import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Send, Smile, Check, CheckCheck, Trash2, Edit2, Camera, Mic, Square, X, Play, Pause, Paperclip, FileText, ChevronLeft } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const AudioBubblePlayer = ({ src }: { src: string }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const audio = new Audio(src);
        audioRef.current = audio;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration || 0);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [src]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error(e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const val = parseFloat(e.target.value);
        audioRef.current.currentTime = val;
        setCurrentTime(val);
    };

    const cycleSpeed = () => {
        const nextRates = [1, 1.5, 2];
        const nextIndex = (nextRates.indexOf(playbackRate) + 1) % nextRates.length;
        setPlaybackRate(nextRates[nextIndex]);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 bg-black/10 dark:bg-white/10 p-2 rounded-xl min-w-[180px] text-white">
            <button 
                type="button" 
                onClick={togglePlay} 
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
            >
                {isPlaying ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white ml-0.5" />}
            </button>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <input 
                    type="range" 
                    min={0} 
                    max={duration || 100} 
                    value={currentTime} 
                    onChange={handleSeek} 
                    className="w-full accent-white h-1 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-white/70 font-bold">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
            <button 
                type="button"
                onClick={cycleSpeed}
                className="px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[8px] font-bold text-white shrink-0"
            >
                {playbackRate}x
            </button>
        </div>
    );
};

interface MessageTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId?: string;
}

export const MessageTeacherModal = ({ isOpen, onClose, recipientId }: MessageTeacherModalProps) => {
    const { user, userRole: role } = useAuth();
    const userId = user?.id;

    // Chat partner selection
    const [partners, setPartners] = useState<any[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [selectedPartner, setSelectedPartner] = useState<any>(null);
    const [isFallbackMode, setIsFallbackMode] = useState(false);

    // Messages state
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessageText, setNewMessageText] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Editing message state
    const [editingMessage, setEditingMessage] = useState<any | null>(null);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const recordingTimerRef = useRef<any>(null);

    // File input ref for camera/photos
    const fileInputRef = useRef<HTMLInputElement>(null);

    // File input ref for documents
    const documentInputRef = useRef<HTMLInputElement>(null);

    // Scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isRecording) {
            setRecordingSeconds(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Data = reader.result as string;
                    await handleSendRichMessage(null, 'audio', base64Data);
                };
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Failed to start audio recording:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = (cancel: boolean = false) => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
        if (cancel) {
            mediaRecorder.onstop = () => {
                // Cancelled
            };
        }
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
    };

    // 1. Fetch active chat partners (teachers if student, students if teacher)
    useEffect(() => {
        if (!isOpen || !userId || !role) return;

        const fetchPartners = async () => {
            try {
                let list: any[] = [];
                let hasActiveConnections = false;

                if (role === 'student') {
                    // Fetch accepted teachers
                    const { data: linkData } = await supabase
                        .from('teacher_student_links')
                        .select('teacher:profiles!teacher_student_links_teacher_id_fkey(id, full_name, avatar_url, subjects, is_online, last_active_at)')
                        .eq('student_id', userId)
                        .eq('status', 'accepted');

                    // Fetch booked teachers
                    const { data: bookingData } = await supabase
                        .from('bookings')
                        .select('teacher:profiles!bookings_teacher_id_fkey(id, full_name, avatar_url, subjects, is_online, last_active_at)')
                        .eq('student_id', userId);

                    const linkList = linkData ? linkData.map((item: any) => item.teacher).filter(Boolean) : [];
                    const bookingList = bookingData ? bookingData.map((item: any) => item.teacher).filter(Boolean) : [];

                    const mergedMap = new Map();
                    linkList.forEach((t: any) => mergedMap.set(t.id, t));
                    bookingList.forEach((t: any) => mergedMap.set(t.id, t));

                    if (linkList.length > 0 || bookingList.length > 0) {
                        hasActiveConnections = true;
                    }

                    // If a recipientId is passed but not in list, fetch their profile and add them
                    if (recipientId && !mergedMap.has(recipientId)) {
                        const { data: recipientProfile } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url, subjects, is_online, last_active_at')
                            .eq('id', recipientId)
                            .maybeSingle();
                        if (recipientProfile) {
                            mergedMap.set(recipientId, recipientProfile);
                        }
                    }

                    list = Array.from(mergedMap.values());
                } else {
                    // Fetch accepted students for teacher
                    const { data: linkData } = await supabase
                        .from('teacher_student_links')
                        .select('student:profiles!teacher_student_links_student_id_fkey(id, full_name, avatar_url, country, is_online, last_active_at)')
                        .eq('teacher_id', userId)
                        .eq('status', 'accepted');

                    // Fetch booked students
                    const { data: bookingData } = await supabase
                        .from('bookings')
                        .select('student:profiles!bookings_student_id_fkey(id, full_name, avatar_url, country, is_online, last_active_at)')
                        .eq('teacher_id', userId);

                    const linkList = linkData ? linkData.map((item: any) => item.student).filter(Boolean) : [];
                    const bookingList = bookingData ? bookingData.map((item: any) => item.student).filter(Boolean) : [];

                    const mergedMap = new Map();
                    linkList.forEach((s: any) => mergedMap.set(s.id, s));
                    bookingList.forEach((s: any) => mergedMap.set(s.id, s));

                    if (linkList.length > 0 || bookingList.length > 0) {
                        hasActiveConnections = true;
                    }

                    // If a recipientId is passed but not in list, fetch their profile and add them
                    if (recipientId && !mergedMap.has(recipientId)) {
                        const { data: recipientProfile } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url, country, is_online, last_active_at')
                            .eq('id', recipientId)
                            .maybeSingle();
                        if (recipientProfile) {
                            mergedMap.set(recipientId, recipientProfile);
                        }
                    }

                    list = Array.from(mergedMap.values());
                }

                // If no active connections found, fetch all registered profiles of the opposite role
                if (list.length === 0) {
                    const oppositeRole = role === 'student' ? 'teacher' : 'student';
                    const { data: fallbackProfiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, country, subjects, is_online, last_active_at')
                        .eq('role', oppositeRole)
                        .limit(50);

                    if (fallbackProfiles) {
                        list = fallbackProfiles;
                    }
                    setIsFallbackMode(true);
                } else {
                    setIsFallbackMode(false);
                }

                // Ensure recipientId is always included in the list and selected if provided
                if (recipientId && !list.some(p => p.id === recipientId)) {
                    const { data: recipientProfile } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, country, subjects, is_online, last_active_at')
                        .eq('id', recipientId)
                        .maybeSingle();
                    if (recipientProfile) {
                        list = [recipientProfile, ...list];
                    }
                }

                setPartners(list);

                if (recipientId && list.some(p => p.id === recipientId)) {
                    setSelectedPartnerId(recipientId);
                } else if (list.length > 0) {
                    setSelectedPartnerId(list[0].id);
                }
            } catch (err) {
                console.error("Error loading chat partners:", err);
            }
        };

        fetchPartners();
    }, [isOpen, userId, role, recipientId]);

    // Handle preselected partner changes from props dynamically
    useEffect(() => {
        if (recipientId && partners.some(p => p.id === recipientId)) {
            setSelectedPartnerId(recipientId);
        }
    }, [recipientId, partners]);

    // Update selectedPartner object when selectedPartnerId changes
    useEffect(() => {
        const found = partners.find(p => p.id === selectedPartnerId);
        setSelectedPartner(found || null);
    }, [selectedPartnerId, partners]);

    // 2. Fetch messages between current user and selected partner
    useEffect(() => {
        if (!userId || !selectedPartnerId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const { data, error } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedPartnerId}),and(sender_id.eq.${selectedPartnerId},receiver_id.eq.${userId})`)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (err) {
                console.error("Error loading chat messages:", err);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();

        // 3. Set up real-time subscription for messages (including UPDATE/DELETE)
        const channel = supabase
            .channel(`chat_thread_${selectedPartnerId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_messages'
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newMsg = payload.new;
                    if ((newMsg.sender_id === userId && newMsg.receiver_id === selectedPartnerId) ||
                        (newMsg.sender_id === selectedPartnerId && newMsg.receiver_id === userId)) {
                        setMessages(prev => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                } else if (payload.eventType === 'UPDATE') {
                    const updatedMsg = payload.new;
                    setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
                } else if (payload.eventType === 'DELETE') {
                    const deletedMsg = payload.old;
                    setMessages(prev => prev.filter(m => m.id !== deletedMsg.id));
                }
            })
            .subscribe();

        // Subscribe to presence/online updates of profiles
        const presenceChannel = supabase
            .channel('chat-presence-updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${selectedPartnerId}`
            }, (payload) => {
                const updatedProfile = payload.new;
                setPartners(prev => prev.map(p => p.id === updatedProfile.id ? { ...p, is_online: updatedProfile.is_online, last_active_at: updatedProfile.last_active_at } : p));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(presenceChannel);
        };
    }, [userId, selectedPartnerId]);

    // Mark incoming messages as read when active
    useEffect(() => {
        if (!userId || !selectedPartnerId || !isOpen || messages.length === 0) return;

        const markAsRead = async () => {
            const unread = messages.filter(m => m.sender_id === selectedPartnerId && !m.is_read);
            if (unread.length > 0) {
                await supabase
                    .from('chat_messages')
                    .update({ is_read: true })
                    .eq('sender_id', selectedPartnerId)
                    .eq('receiver_id', userId)
                    .eq('is_read', false);
            }
        };
        markAsRead();
    }, [userId, selectedPartnerId, isOpen, messages.length]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendRichMessage = async (text: string | null, attachmentType?: 'image' | 'audio' | 'document', attachmentUrl?: string) => {
        if (!userId || !selectedPartnerId) return;

        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    sender_id: userId,
                    receiver_id: selectedPartnerId,
                    message: text || '',
                    attachment_type: attachmentType || null,
                    attachment_url: attachmentUrl || null
                })
                .select()
                .single();

            if (error) throw error;
            
            setMessages(prev => {
                if (prev.find(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
        } catch (err) {
            console.error("Failed to send rich message:", err);
            alert("Failed to send message.");
        }
    };

    // 4. Send/Edit Message function
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessageText.trim() || !userId || !selectedPartnerId) return;

        const textToSend = newMessageText.trim();
        setNewMessageText(''); // Clear input immediately for responsive UX

        try {
            if (editingMessage) {
                const { error } = await supabase
                    .from('chat_messages')
                    .update({ message: textToSend, is_edited: true })
                    .eq('id', editingMessage.id);

                if (error) throw error;
                setEditingMessage(null);
            } else {
                await handleSendRichMessage(textToSend);
            }
        } catch (err) {
            console.error("Failed to send/edit message:", err);
            alert("Failed to send message.");
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        try {
            const { error } = await supabase
                .from('chat_messages')
                .delete()
                .eq('id', msgId);
            if (error) throw error;
        } catch (err) {
            console.error("Error deleting message:", err);
        }
    };

    const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = reader.result as string;
            await handleSendRichMessage(null, 'image', base64Data);
        };
        reader.readAsDataURL(file);
    };

    const handleDocumentSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = reader.result as string;
            await handleSendRichMessage(file.name, 'document', base64Data);
        };
        reader.readAsDataURL(file);
    };

    const groupMessagesByDate = (msgList: any[]) => {
        const groups: { [key: string]: any[] } = {};
        msgList.forEach(msg => {
            const date = new Date(msg.created_at);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            
            let dateStr = '';
            if (date.toDateString() === today.toDateString()) {
                dateStr = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateStr = 'Yesterday';
            } else {
                dateStr = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
            }
            
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(msg);
        });
        return groups;
    };

    const formatMessageTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {
            return '';
        }
    };

    const [showEmojiBar, setShowEmojiBar] = useState(false);

    const addEmoji = (emoji: string) => {
        setNewMessageText(prev => prev + emoji);
    };

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-full !w-screen !h-screen !m-0 !p-0 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 overflow-hidden rounded-none flex flex-col shadow-none [&>button.absolute]:hidden">
                <DialogTitle className="sr-only">Messages</DialogTitle>
                <DialogDescription className="sr-only">Real-time messenger conversation thread.</DialogDescription>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar: Conversations list */}
                    <div className={cn(
                        "w-full md:w-80 border-r border-gray-100 dark:border-zinc-800 flex flex-col bg-gray-50/50 dark:bg-zinc-950/20 shrink-0",
                        selectedPartnerId ? "hidden md:flex" : "flex"
                    )}>
                        <div className="p-5 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conversations</h2>
                            {isFallbackMode && (
                                <p className="text-[10px] text-orange-500 dark:text-orange-400 font-semibold mt-1.5 bg-orange-500/10 p-2 rounded-xl border border-orange-500/20 leading-relaxed">
                                    ⚠️ No active connections or bookings found in database. Showing registered profiles of the opposite role.
                                </p>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
                            {partners.length > 0 ? (
                                partners.map(p => {
                                    const isSelected = p.id === selectedPartnerId;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPartnerId(p.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left",
                                                isSelected 
                                                    ? role === 'teacher'
                                                        ? "bg-[#FF7D46]/10 text-[#FF7D46] dark:text-orange-400 font-bold"
                                                        : "bg-[#5B4A9F]/10 text-[#5B4A9F] dark:text-purple-400 font-bold"
                                                    : "hover:bg-gray-100/50 dark:hover:bg-zinc-800/30 text-gray-700 dark:text-gray-300"
                                            )}
                                        >
                                            <div className="relative">
                                                <Avatar className="h-10 w-10 border border-gray-200 dark:border-zinc-800">
                                                    <AvatarImage src={p.avatar_url || `https://i.pravatar.cc/150?u=${p.id}`} />
                                                    <AvatarFallback>{p.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-zinc-900 rounded-full",
                                                    p.is_online ? "bg-green-500" : "bg-gray-300"
                                                )} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate font-bold">{p.full_name}</p>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                                    {role === 'student'
                                                        ? (p.subjects?.join(', ') || 'General Studies')
                                                        : (p.country || 'Student')
                                                    }
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                                    No active teachers/students found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Active Chat Thread */}
                    <div className={cn(
                        "flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-900 relative",
                        selectedPartnerId ? "flex" : "hidden md:flex"
                    )}>
                        {selectedPartner ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        {/* Back Button for mobile */}
                                        <button 
                                            onClick={() => setSelectedPartnerId('')}
                                            className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mr-1 shrink-0"
                                            title="Back to conversations"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border border-gray-200 dark:border-zinc-850">
                                                <AvatarImage src={selectedPartner.avatar_url || `https://i.pravatar.cc/150?u=${selectedPartner.id}`} />
                                                <AvatarFallback>{selectedPartner.full_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className={cn(
                                                "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-zinc-900 rounded-full",
                                                selectedPartner.is_online ? "bg-green-500" : "bg-gray-300"
                                            )} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{selectedPartner.full_name}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {selectedPartner.is_online ? "Active now" : "Offline"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-gray-500 text-lg">close</span>
                                    </button>
                                </div>

                                {/* Messages History List */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/30 dark:bg-zinc-950/10">
                                    {loadingMessages ? (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                        </div>
                                    ) : messages.length > 0 ? (
                                        Object.keys(groupedMessages).map((dateKey) => (
                                            <div key={dateKey} className="space-y-3">
                                                {/* Date Header Divider */}
                                                <div className="flex justify-center">
                                                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        {dateKey}
                                                    </span>
                                                </div>

                                                {/* Message Bubbles */}
                                                {groupedMessages[dateKey].map((msg) => {
                                                    const isMe = msg.sender_id === userId;
                                                    return (
                                                        <div
                                                            key={msg.id}
                                                            className={cn(
                                                                "flex w-full mb-1",
                                                                isMe ? "justify-end" : "justify-start"
                                                            )}
                                                        >
                                                            <div className="relative group flex items-center">
                                                                {/* Edit/Delete hover triggers for my messages */}
                                                                {isMe && (
                                                                    <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-zinc-800 shadow-lg border border-gray-100 dark:border-zinc-700 p-1.5 rounded-xl z-20">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEditingMessage(msg);
                                                                                setNewMessageText(msg.message);
                                                                            }}
                                                                            title="Edit message"
                                                                            className="text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-zinc-700 p-1 rounded-lg transition-all"
                                                                        >
                                                                            <Edit2 className="h-3 w-3" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteMessage(msg.id)}
                                                                            title="Delete message"
                                                                            className="text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-zinc-700 p-1 rounded-lg transition-all"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                <div
                                                                    className={cn(
                                                                        "rounded-2xl px-4 py-2.5 shadow-sm flex flex-col gap-1 relative",
                                                                        isMe 
                                                                            ? role === 'teacher'
                                                                                ? "bg-[#FF7D46] text-white rounded-br-sm pr-16"
                                                                                : "bg-[#5B4A9F] text-white rounded-br-sm pr-16"
                                                                            : "bg-gray-100 dark:bg-zinc-850 text-gray-900 dark:text-white rounded-bl-sm pr-16"
                                                                    )}
                                                                >
                                                                    {msg.attachment_type === 'image' && (
                                                                        <img 
                                                                            src={msg.attachment_url} 
                                                                            alt="Attachment" 
                                                                            className="max-w-[200px] rounded-lg mb-1 shadow-sm object-cover" 
                                                                        />
                                                                    )}
                                                                    {msg.attachment_type === 'audio' && (
                                                                        <AudioBubblePlayer src={msg.attachment_url} />
                                                                    )}
                                                                    {msg.attachment_type === 'document' && (
                                                                        <a 
                                                                            href={msg.attachment_url} 
                                                                            download={msg.message || 'document'}
                                                                            className="flex items-center gap-2.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5 mb-1 text-left min-w-[200px]"
                                                                        >
                                                                            <div className="h-9 w-9 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
                                                                                <FileText className="h-5 w-5" />
                                                                            </div>
                                                                            <div className="overflow-hidden">
                                                                                <p className="text-xs font-bold truncate text-gray-900 dark:text-white leading-tight">
                                                                                    {msg.message || 'Document'}
                                                                                </p>
                                                                                <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5 font-medium uppercase tracking-wider">
                                                                                    Click to download
                                                                                </p>
                                                                            </div>
                                                                        </a>
                                                                    )}
                                                                    {msg.message && msg.attachment_type !== 'document' && (
                                                                        <p className="text-sm font-medium leading-relaxed break-words">
                                                                            {msg.message}
                                                                        </p>
                                                                    )}
                                                                    {msg.is_edited && (
                                                                        <span className="text-[8px] opacity-60 font-semibold block text-right mt-0.5">
                                                                            (edited)
                                                                        </span>
                                                                    )}
                                                                    <span className={cn(
                                                                        "text-[8px] absolute bottom-1 right-2 font-bold flex items-center gap-0.5",
                                                                        isMe ? "text-white/70" : "text-gray-450 dark:text-zinc-500"
                                                                    )}>
                                                                        {formatMessageTime(msg.created_at)}
                                                                        {isMe && (
                                                                            msg.is_read 
                                                                                ? <CheckCheck className="h-3 w-3 text-cyan-200 font-bold" title="Read" /> 
                                                                                : selectedPartner?.is_online 
                                                                                    ? <CheckCheck className="h-3 w-3 text-white/60" title="Delivered" /> 
                                                                                    : <Check className="h-3 w-3 text-white/40" title="Sent" />
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-450 gap-2">
                                            <span className="material-symbols-outlined text-4xl text-gray-300">chat</span>
                                            <p className="text-xs font-semibold">No messages yet. Say hello to get started!</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Full Emoji Picker */}
                                {showEmojiBar && (
                                    <div className="absolute bottom-[80px] left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                        <EmojiPicker 
                                            onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)} 
                                            skinTonesDisabled
                                            width={320}
                                            height={380}
                                        />
                                    </div>
                                )}

                                {/* Editing Message Indicator */}
                                {editingMessage && (
                                    <div className="px-6 py-2 bg-blue-50/50 dark:bg-blue-950/20 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between shrink-0 text-xs font-bold text-blue-600 dark:text-blue-400">
                                        <div className="flex items-center gap-1.5">
                                            <Edit2 className="h-3.5 w-3.5" />
                                            <span>Editing message...</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingMessage(null);
                                                setNewMessageText('');
                                            }}
                                            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Hidden file input for Photo Upload */}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef}
                                    onChange={handlePhotoSelected}
                                    className="hidden" 
                                />

                                {/* Hidden file input for Document Upload */}
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" 
                                    ref={documentInputRef}
                                    onChange={handleDocumentSelected}
                                    className="hidden" 
                                />

                                {/* Message Compose Form Input */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-3 shrink-0 bg-white dark:bg-zinc-900">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowEmojiBar(!showEmojiBar)}
                                        className={cn(
                                            "h-11 w-11 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shrink-0",
                                            showEmojiBar && "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20"
                                        )}
                                    >
                                        <Smile className="h-5 w-5" />
                                    </button>

                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Attach Photo"
                                        className="h-11 w-11 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
                                    >
                                        <Camera className="h-5 w-5" />
                                    </button>

                                    <button 
                                        type="button" 
                                        onClick={() => documentInputRef.current?.click()}
                                        title="Attach Document"
                                        className="h-11 w-11 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>

                                    {isRecording ? (
                                        <div className="flex-1 bg-red-50 dark:bg-red-950/10 rounded-2xl px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400 flex items-center justify-between transition-all animate-pulse">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 bg-red-650 rounded-full animate-ping shrink-0" />
                                                <span>Recording voice note... {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => stopRecording(true)}
                                                    title="Cancel Recording"
                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <X className="h-4.5 w-4.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => stopRecording(false)}
                                                    title="Save/Send Voice Note"
                                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100/50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Square className="h-4 w-4 fill-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={newMessageText}
                                            onChange={(e) => setNewMessageText(e.target.value)}
                                            placeholder="Type a message..."
                                            className={cn(
                                                "flex-1 bg-gray-50 dark:bg-zinc-800 border-0 rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:bg-white dark:focus:bg-zinc-800 outline-none text-gray-900 dark:text-white placeholder-gray-400 transition-all",
                                                role === 'teacher' ? "focus:ring-[#FF7D46]" : "focus:ring-[#5B4A9F]"
                                            )}
                                        />
                                    )}

                                    {/* Mic/Send button toggler (mic if text is empty and not editing, else send) */}
                                    {!newMessageText.trim() && !editingMessage && !isRecording ? (
                                        <button
                                            type="button"
                                            onClick={startRecording}
                                            title="Record Voice Note"
                                            className={cn(
                                                "h-11 w-11 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 shrink-0",
                                                role === 'teacher' 
                                                    ? "bg-[#FF7D46] hover:bg-[#e06530]" 
                                                    : "bg-[#5B4A9F] hover:bg-[#473980]"
                                            )}
                                        >
                                            <Mic className="h-4.5 w-4.5" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!newMessageText.trim()}
                                            className={cn(
                                                "h-11 w-11 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 shrink-0 disabled:opacity-50 disabled:scale-100",
                                                role === 'teacher' 
                                                    ? "bg-[#FF7D46] hover:bg-[#e06530]" 
                                                    : "bg-[#5B4A9F] hover:bg-[#473980]"
                                            )}
                                        >
                                            <Send className="h-4.5 w-4.5" />
                                        </button>
                                    )}
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-450 gap-3">
                                <span className="material-symbols-outlined text-5xl">forum</span>
                                <h3 className="font-bold text-base text-gray-800 dark:text-zinc-200">Select a Conversation</h3>
                                <p className="text-xs px-6 max-w-sm leading-relaxed">
                                    Choose an active teacher or student from the sidebar panel to begin chatting in real-time.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
