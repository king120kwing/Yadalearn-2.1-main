import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StreamCall, StreamTheme, SpeakerLayout, CallControls, useCallStateHooks, Call } from '@stream-io/video-react-sdk';
import { useStream } from '@/contexts/StreamProvider';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

import '@stream-io/video-react-sdk/dist/css/styles.css';

const Meeting = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client, isStreamReady } = useStream();
  const { user, endSession } = useAuth();
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState('');

  const [isWaiting, setIsWaiting] = useState(() => {
    const role = user?.role || localStorage.getItem('yadalearn-user-role');
    return role === 'student';
  });
  const [waitingStudents, setWaitingStudents] = useState<any[]>([]);

  // Supabase Realtime channel for Waiting Room
  useEffect(() => {
    if (!id || !user) return;
    
    const role = user.role || localStorage.getItem('yadalearn-user-role');
    const channel = supabase.channel(`room-${id}`);

    channel.on('broadcast', { event: 'waiting' }, ({ payload }) => {
      if (role === 'teacher') {
        setWaitingStudents(prev => {
          if (!prev.find(s => s.id === payload.id)) {
            return [...prev, payload];
          }
          return prev;
        });
      }
    });

    channel.on('broadcast', { event: 'admit' }, ({ payload }) => {
      if (role === 'student' && payload.studentId === user.id) {
        setIsWaiting(false);
      }
    });

    let pingInterval: any;
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && role === 'student' && isWaiting) {
        // Send a ping while waiting
        channel.send({
          type: 'broadcast',
          event: 'waiting',
          payload: { id: user.id, name: user.name || 'Student', avatar: user.imageUrl }
        });
        pingInterval = setInterval(() => {
            channel.send({
              type: 'broadcast',
              event: 'waiting',
              payload: { id: user.id, name: user.name || 'Student', avatar: user.imageUrl }
            });
        }, 5000);
      }
    });

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      supabase.removeChannel(channel);
    };
  }, [id, user, isWaiting]);

  useEffect(() => {
    if (!client || !isStreamReady || !id || isWaiting) return;

    let callObj: Call | null = null;
    let isMounted = true;

    const joinCall = async () => {
      try {
        callObj = client.call('default', id);
        await callObj.join({ create: true });
        
        if (isMounted) {
          setCall(callObj);
        }
      } catch (err: any) {
        console.error('Failed to join call', err);
        if (isMounted) {
          setError(err.message || 'Failed to join call');
        }
      }
    };

    joinCall();

    return () => {
      isMounted = false;
      if (callObj) {
        callObj.leave().catch(console.error);
      }
    };
  }, [client, isStreamReady, id, isWaiting]);

  const handleAdmit = async (studentId: string) => {
    // We already have a subscribed channel in this component, but Supabase Realtime requires
    // broadcasting on the exact same instance. We can fetch the active channel:
    const activeChannel = supabase.getChannels().find(c => c.topic === `realtime:room-${id}`);
    if (activeChannel) {
        await activeChannel.send({
            type: 'broadcast',
            event: 'admit',
            payload: { studentId }
        });
    } else {
        // Fallback just in case
        const tempChannel = supabase.channel(`room-${id}`);
        await tempChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                tempChannel.send({
                    type: 'broadcast',
                    event: 'admit',
                    payload: { studentId }
                });
                setTimeout(() => supabase.removeChannel(tempChannel), 1000);
            }
        });
    }
    setWaitingStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleLeave = async () => {
    if (call) {
      call.leave();
    }
    await endSession();
    
    // Check localStorage fallback for role in case context is clearing out during exit
    const savedRole = localStorage.getItem('yadalearn-user-role');
    const role = user?.role || savedRole;
    
    if (role === 'student') {
        navigate(`/rate-teacher/${id}`);
    } else {
        navigate('/teacher-dashboard');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connection Error</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host</h2>
        <p className="text-zinc-400">The teacher will let you in shortly.</p>
        <button 
          onClick={() => navigate('/student-dashboard')}
          className="mt-8 px-6 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Leave
        </button>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="min-h-screen gradient-welcome flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-purple-900 font-medium">Connecting to secure classroom...</p>
        </div>
      </div>
    );
  }

  const role = user?.role || localStorage.getItem('yadalearn-user-role');

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-zinc-950 flex flex-col z-[100] overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent p-4 md:p-6 shrink-0 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeave}
              className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Live Classroom</h2>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Secure connection
              </p>
            </div>
          </div>
        </div>
      </div>

      {role === 'teacher' && waitingStudents.length > 0 && (
        <div className="absolute top-20 right-6 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[50vh]">
            <div className="bg-purple-900/30 p-3 border-b border-zinc-800 flex justify-between items-center">
                <span className="font-bold text-sm text-white">Waiting Room ({waitingStudents.length})</span>
            </div>
            <div className="overflow-y-auto p-2">
                {waitingStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/50">
                        <div className="flex items-center gap-2">
                            {s.avatar ? (
                                <img src={s.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                </div>
                            )}
                            <span className="text-sm font-medium text-white truncate max-w-[100px]">{s.name}</span>
                        </div>
                        <button onClick={() => handleAdmit(s.id)} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-full transition-colors">
                            Admit
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Video Container - True Full Screen */}
      <div className="flex-1 w-full h-full relative">
        <div className="absolute inset-0 bg-zinc-950 overflow-hidden">
          <StreamCall call={call}>
            <StreamTheme className="h-full w-full custom-stream-theme">
              {/* Internal layout container */}
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <SpeakerLayout participantsBarPosition="bottom" />
                </div>
                
                {/* Custom Controls Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-xl rounded-full px-6 py-3 flex items-center gap-4 z-50 shadow-2xl border border-white/10">
                  <CallControls onLeave={handleLeave} />
                </div>
              </div>
            </StreamTheme>
          </StreamCall>
        </div>
      </div>

      {/* Inject custom CSS overrides for Stream Video to match Yadalearn theme */}
      <style>{`
        .custom-stream-theme {
          --str-video-bg: transparent;
          --str-video-surface-color: transparent;
        }
        
        .str-video__speaker-layout__wrapper {
          height: 100% !important;
          width: 100% !important;
        }

        .str-video__call-controls {
          background: transparent !important;
          border: none !important;
        }

        /* Theme the Context Menus */
        .str-video__menu,
        .str-video__menu-container {
          background-color: #18181b !important; /* zinc-900 */
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 1rem !important;
          font-family: inherit !important;
        }

        .str-video__menu-item:hover,
        .str-video__button:hover {
          background-color: rgba(255,255,255,0.1) !important;
        }

        .str-video__call-controls {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }

        .str-video__composite-button {
          background: rgba(255,255,255,0.1) !important;
          color: white !important;
          border-radius: 1rem !important;
          transition: all 0.2s;
        }

        .str-video__composite-button:hover {
          background: rgba(255,255,255,0.2) !important;
        }

        .str-video__composite-button--danger {
          background: #ef4444 !important;
        }

        .str-video__composite-button--danger:hover {
          background: #dc2626 !important;
        }
      `}</style>
    </div>
  );
};

export default Meeting;
