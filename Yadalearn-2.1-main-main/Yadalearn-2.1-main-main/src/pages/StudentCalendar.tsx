import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, getDate, isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const StudentCalendar = () => {
    const { user } = useAuth();
    const userId = user?.id;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [days, setDays] = useState<{ day: string; date: number; fullDate: Date }[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Dynamic Days Generation (Surrounding selected date)
    useEffect(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = addDays(start, i);
            weekDays.push({
                day: format(currentDate, 'EEE'), // 'Sun'
                date: getDate(currentDate), // 1
                fullDate: currentDate
            });
        }
        setDays(weekDays);
    }, [selectedDate]);

    // Fetch dynamic student bookings from Supabase
    useEffect(() => {
        if (!userId) return;
        async function fetchBookings() {
            setLoading(true);
            try {
                const dbDateStr = format(selectedDate, 'yyyy-MM-dd');
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*, teacher:profiles!bookings_teacher_id_fkey(*)')
                    .eq('student_id', userId)
                    .eq('date', dbDateStr);

                if (error) throw error;
                if (data) {
                    const mapped = data.map((b: any) => {
                        const startStr = b.time; // e.g. "09:00 AM"
                        let endStr = '10:00 AM';
                        try {
                            const match = startStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
                            if (match) {
                                let hrs = parseInt(match[1]);
                                const mins = match[2];
                                const ampm = match[3].toUpperCase();
                                hrs = hrs + 1;
                                let newAmpm = ampm;
                                if (hrs === 12) {
                                    newAmpm = ampm === 'AM' ? 'PM' : 'AM';
                                } else if (hrs > 12) {
                                    hrs = hrs - 12;
                                }
                                endStr = `${String(hrs).padStart(2, '0')}:${mins} ${newAmpm}`;
                            }
                        } catch (e) {}

                        return {
                            id: b.id,
                            time: b.time,
                            endTime: endStr,
                            title: `Class with ${b.teacher?.full_name || 'Teacher'}`,
                            location: 'Yadalearn Live Room',
                            date: format(new Date(b.date + 'T12:00:00'), 'MMMM d, yyyy'),
                            status: b.status // confirmed, pending, completed
                        };
                    });
                    setEvents(mapped);
                }
            } catch (err) {
                console.error('Error loading student calendar events:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, [selectedDate, userId]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('12:00 PM');

    const handleDelete = async (id: string | number) => {
        try {
            if (typeof id === 'string') {
                const { error } = await supabase
                    .from('bookings')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            }
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            console.error('Error deleting calendar event:', err);
            alert('Failed to delete booking.');
        }
    };

    const handleAddEvent = () => {
        if (!newEventTitle) return;
        const newEvent = {
            id: Date.now(),
            time: newEventTime,
            endTime: '1:00 PM',
            title: newEventTitle,
            location: 'Online',
            date: format(selectedDate, 'MMMM d, yyyy'),
            status: 'upcoming'
        };
        setEvents([...events, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
        setShowAddModal(false);
        setNewEventTitle('');
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] dark:bg-zinc-950 pb-24 font-sans text-gray-900 dark:text-white">
            {/* Header Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-b-[40px] shadow-sm px-6 pt-6 pb-8 mb-6 relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">Appointment date</h1>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setSelectedDate(prev => addDays(prev, -7))}
                            className="size-8 rounded-full border border-gray-150 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
                        </button>
                        <button className="flex items-center gap-1 px-4 py-2 border border-gray-100 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-sm font-bold shadow-sm">
                            {format(selectedDate, 'MMMM')}
                        </button>
                        <button 
                            onClick={() => setSelectedDate(prev => addDays(prev, 7))}
                            className="size-8 rounded-full border border-gray-150 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Days Horizontal Scroll */}
                <div className="flex justify-between items-center">
                    {days.map((item) => {
                        const isSelected = isSameDay(item.fullDate, selectedDate);
                        const isToday = isSameDay(item.fullDate, new Date());

                        return (
                            <button
                                key={item.date}
                                onClick={() => setSelectedDate(item.fullDate)}
                                className="flex flex-col items-center gap-3 transition-transform active:scale-95"
                            >
                                <span className={`text-xs font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                    {item.day}
                                </span>
                                <div className={`w-11 h-14 rounded-[20px] flex items-center justify-center text-sm font-bold transition-all shadow-sm relative ${isSelected
                                        ? 'bg-emerald-500 text-white shadow-emerald-300 dark:shadow-emerald-900/50 scale-110'
                                        : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-transparent'
                                    }`}>
                                    {item.date}
                                    {/* Small dot for Today if not selected */}
                                    {!isSelected && isToday && (
                                        <div className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full"></div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Timeline Events */}
            <div className="px-6 relative">
                <div className="absolute left-[88px] top-0 bottom-0 w-[2px] bg-gray-200 dark:bg-zinc-800 z-0"></div>

                <div className="space-y-6 pb-20">
                    {/* Check if events exist for selected date */}
                    {events.filter(e => e.date === format(selectedDate, 'MMMM d, yyyy')).length > 0 ? (
                        events.filter(e => e.date === format(selectedDate, 'MMMM d, yyyy')).map((event, index) => {
                            const isActive = event.status === 'active';
                            return (
                                <div key={event.id} className="relative flex gap-4 group z-10 animate-in slide-in-from-bottom-2 duration-300">
                                    {/* Time Column */}
                                    <div className="w-16 pt-2 text-right shrink-0">
                                        <span className={`text-xs font-bold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                            {event.time}
                                        </span>
                                    </div>

                                    {/* Timeline Node */}
                                    <div className="relative pt-1 flex justify-center">
                                        {event.status === 'completed' ? (
                                            <div className="w-7 h-7 rounded-full border-2 border-gray-200 bg-white dark:bg-zinc-900 flex items-center justify-center z-20">
                                                <span className="material-symbols-outlined text-gray-300 text-sm">check</span>
                                            </div>
                                        ) : isActive ? (
                                            <div className="w-7 h-7 rounded-full border-[3px] border-emerald-500 bg-white dark:bg-zinc-900 flex items-center justify-center relative z-20 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                                            </div>
                                        ) : (
                                            <div className="w-7 h-7 rounded-full border-2 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center z-20">
                                                <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Card */}
                                    <div className="flex-1 min-w-0">
                                        <div className={`p-5 rounded-[24px] transition-all relative group-hover:bg-white group-hover:shadow-md dark:group-hover:bg-zinc-900 ${isActive ? 'bg-gradient-to-r from-emerald-50/80 to-transparent dark:from-emerald-900/10' : ''
                                            }`}>
                                            {isActive && (
                                                <div className="absolute top-8 -left-8 w-8 h-[2px] bg-emerald-500 z-0"></div>
                                            )}

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold text-base mb-2 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {event.title}
                                                    </h3>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                            <span className="material-symbols-outlined text-[16px] text-emerald-400">location_on</span>
                                                            <span>{event.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                            <span className="material-symbols-outlined text-[16px] text-emerald-400">calendar_today</span>
                                                            <span>{event.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                            <span className="material-symbols-outlined text-[16px] text-emerald-400">schedule</span>
                                                            <span>{event.time} - {event.endTime}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="p-2 h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm text-gray-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 text-gray-400 font-medium">
                            No plans for this day
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Add Plan Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-24 right-6 w-16 h-16 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full shadow-xl shadow-gray-400/30 flex items-center justify-center hover:scale-105 transition-transform z-40 active:scale-95"
            >
                <Plus className="h-6 w-6" />
            </button>

            {/* Add Plan Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6 text-center">New Plan</h2>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Design Review"
                                    className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none px-6 font-semibold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                    value={newEventTitle}
                                    onChange={e => setNewEventTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Time</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 10:00 AM"
                                    className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none px-6 font-semibold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                    value={newEventTime}
                                    onChange={e => setNewEventTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddEvent}
                                className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:bg-emerald-600 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default StudentCalendar;
