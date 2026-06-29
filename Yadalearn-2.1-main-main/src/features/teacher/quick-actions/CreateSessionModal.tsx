import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface CreateSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateSessionModal = ({ isOpen, onClose }: CreateSessionModalProps) => {
    const { user } = useAuth();
    const [isScheduling, setIsScheduling] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Algebra 101 - Review',
        description: '',
        subject: 'Math',
        dateOption: 'today',
        startTime: '14:00',
        duration: '60',
        sessionType: 'group',
        maxCapacity: 30,
        repeatWeekly: false,
        attendees: 124
    });

    const subjects = [
        { id: 'math', name: 'Math', icon: 'calculate' },
        { id: 'science', name: 'Science', icon: 'science' },
        { id: 'english', name: 'English', icon: 'book_2' },
        { id: 'art', name: 'Art', icon: 'palette' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden max-h-screen flex flex-col">
                {/* Header */}
                <div className="flex-none bg-white dark:bg-gray-900 pt-2 pb-2 px-4 z-20">
                    {/* Bottom Sheet Handle */}
                    <div className="flex w-full items-center justify-center mb-4">
                        <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700 opacity-50"></div>
                    </div>
                    {/* Top App Bar */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="text-gray-500 dark:text-emerald-400 text-base font-medium leading-normal tracking-[0.015em] shrink-0 hover:opacity-80 transition-opacity"
                        >
                            Cancel
                        </button>
                        <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">New Session</h2>
                        <div className="w-12"></div>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto pb-32">
                    {/* Title & Description Input */}
                    <div className="px-4 py-4 space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-500 dark:text-emerald-400 ml-1">Title</label>
                            <input
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3.5 text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="e.g., Math Review"
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-500 dark:text-emerald-400 ml-1">Description <span className="text-xs opacity-50 font-normal">(Optional)</span></label>
                            <textarea
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none transition-all"
                                placeholder="Add details about the session..."
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-800 mx-4"></div>

                    {/* Subject Section */}
                    <div className="pt-6 pb-4">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold px-4 mb-3">Subject</h3>
                        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
                            {subjects.map(subject => (
                                <button
                                    key={subject.id}
                                    onClick={() => setFormData({ ...formData, subject: subject.name })}
                                    className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-5 transition-transform active:scale-95 ${formData.subject === subject.name
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{subject.icon}</span>
                                    <p className="text-sm font-bold">{subject.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timing Section */}
                    <div className="pt-2 pb-4 px-4">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-3">Timing</h3>
                        {/* Date Selector */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setFormData({ ...formData, dateOption: 'today' })}
                                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors text-center ${formData.dateOption === 'today'
                                        ? 'bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, dateOption: 'tomorrow' })}
                                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors text-center ${formData.dateOption === 'tomorrow'
                                        ? 'bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Tomorrow
                            </button>
                            <button className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                            </button>
                        </div>

                        {/* Time & Duration */}
                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500 dark:text-emerald-400 ml-1">Start Time</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">schedule</span>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500 dark:text-emerald-400 ml-1">Duration</label>
                                <select
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                >
                                    <option>30 min</option>
                                    <option>60 min</option>
                                    <option>90 min</option>
                                    <option>120 min</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-800 mx-4 my-2"></div>

                    {/* Logistics Section */}
                    <div className="pt-4 px-4 space-y-5">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold">Logistics</h3>

                        {/* Session Type Segmented Control */}
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
                            <button
                                onClick={() => setFormData({ ...formData, sessionType: 'group' })}
                                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${formData.sessionType === 'group'
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Group
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, sessionType: 'individual' })}
                                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${formData.sessionType === 'individual'
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Individual
                            </button>
                        </div>

                        {/* Capacity Stepper */}
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col">
                                <span className="text-base font-medium text-gray-900 dark:text-white">Max Capacity</span>
                                <span className="text-xs text-gray-500 dark:text-emerald-400">Students allowed</span>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => setFormData({ ...formData, maxCapacity: Math.max(1, formData.maxCapacity - 1) })}
                                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">remove</span>
                                </button>
                                <span className="text-base font-bold text-gray-900 dark:text-white w-8 text-center">{formData.maxCapacity}</span>
                                <button
                                    onClick={() => setFormData({ ...formData, maxCapacity: formData.maxCapacity + 1 })}
                                    className="w-8 h-8 flex items-center justify-center rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                </button>
                            </div>
                        </div>

                        {/* Recurrence */}
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-emerald-400">
                                    <span className="material-symbols-outlined">repeat</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-medium text-gray-900 dark:text-white">Repeat Weekly</span>
                                    <span className="text-xs text-gray-500 dark:text-emerald-400">Every Monday</span>
                                </div>
                            </div>
                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    className="sr-only peer"
                                    type="checkbox"
                                    checked={formData.repeatWeekly}
                                    onChange={(e) => setFormData({ ...formData, repeatWeekly: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>

                        {/* Attendees */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-medium text-gray-500 dark:text-emerald-400">Attendees</label>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Select All</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center -space-x-3 overflow-hidden">
                                    <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover" src="https://i.pravatar.cc/150?u=student1" alt="Student 1" />
                                    <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover" src="https://i.pravatar.cc/150?u=student2" alt="Student 2" />
                                    <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover" src="https://i.pravatar.cc/150?u=student3" alt="Student 3" />
                                    <div className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-white">
                                        +121
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <span className="text-sm font-bold">Edit List</span>
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer CTA */}
                <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-50">
                    <button
                        onClick={async () => {
                            if (!user?.id) return;
                            setIsScheduling(true);
                            try {
                                const { data: students } = await supabase
                                    .from('profiles')
                                    .select('id')
                                    .eq('role', 'student')
                                    .limit(1);
                                    
                                const studentId = students && students.length > 0 ? students[0].id : null;
                                if (!studentId) {
                                    alert("No students found in the database. Please register a student first.");
                                    return;
                                }

                                const getFormattedDate = (option: string) => {
                                    const d = new Date();
                                    if (option === 'tomorrow') {
                                        d.setDate(d.getDate() + 1);
                                    }
                                    const yyyy = d.getFullYear();
                                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                                    const dd = String(d.getDate()).padStart(2, '0');
                                    return `${yyyy}-${mm}-${dd}`;
                                };

                                const sessionDate = getFormattedDate(formData.dateOption);
                                
                                const { data: newBooking, error } = await supabase
                                    .from('bookings')
                                    .insert({
                                        student_id: studentId,
                                        teacher_id: user.id,
                                        subject: formData.title || formData.subject,
                                        date: sessionDate,
                                        time: formData.startTime,
                                        status: 'confirmed'
                                    })
                                    .select('id')
                                    .single();

                                if (error) throw error;

                                if (newBooking) {
                                    const initiated = JSON.parse(localStorage.getItem('initiated_bookings') || '[]');
                                    initiated.push(newBooking.id);
                                    localStorage.setItem('initiated_bookings', JSON.stringify(initiated));
                                }

                                alert(`✅ Session "${formData.title || formData.subject}" scheduled successfully!`);
                                onClose();
                                window.location.reload();
                            } catch (err: any) {
                                console.error("Error scheduling session:", err);
                                alert("Failed to schedule session: " + err.message);
                            } finally {
                                setIsScheduling(false);
                            }
                        }}
                        disabled={isScheduling}
                        className="w-full bg-emerald-500 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined">calendar_add_on</span>
                        {isScheduling ? "Scheduling..." : "Schedule Session"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
