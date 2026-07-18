import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ClassesModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId?: string;
    studentName?: string;
    childrenList?: any[];
}

export const ClassesModal = ({ isOpen, onClose, studentId, studentName, childrenList }: ClassesModalProps) => {
    const [activeStudentId, setActiveStudentId] = useState<string | undefined>(studentId);
    const [activeStudentName, setActiveStudentName] = useState<string | undefined>(studentName);
    
    useEffect(() => {
        setActiveStudentId(studentId);
        setActiveStudentName(studentName);
    }, [studentId, studentName, isOpen]);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && activeStudentId) {
            fetchClasses();
        }
    }, [isOpen, activeStudentId]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('bookings')
                .select(`
                    id, subject, date, time, status, rating, teacher_id,
                    teacher:profiles!bookings_teacher_id_fkey(full_name)
                `)
                .eq('student_id', activeStudentId);

            if (data) {
                const now = new Date();
                const processedClasses = data.map(b => {
                    const [year, month, day] = b.date.split('-').map(Number);
                    const match = b.time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
                    let hours = 0; let minutes = 0;
                    if (match) {
                        hours = Number(match[1]);
                        minutes = Number(match[2]);
                        const ampm = match[3].toUpperCase();
                        if (ampm === 'PM' && hours < 12) hours += 12;
                        if (ampm === 'AM' && hours === 12) hours = 0;
                    }
                    const dateObj = new Date(year, month - 1, day, hours, minutes);
                    const hasTakenPlace = dateObj < now;
                    
                    let attendanceStatus = 'upcoming'; // default
                    if (hasTakenPlace) {
                        if (b.status === 'completed' || b.rating !== null) attendanceStatus = 'attended';
                        else if (b.status === 'cancelled') attendanceStatus = 'cancelled';
                        else attendanceStatus = 'missed'; // past but not completed
                    } else if (b.status === 'cancelled') {
                        attendanceStatus = 'cancelled';
                    }

                    return {
                        ...b,
                        dateObj,
                        hasTakenPlace,
                        attendanceStatus,
                        teacherName: b.teacher?.full_name || 'Teacher'
                    };
                }).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()); // newest first

                setClasses(processedClasses);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!activeStudentId) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 bg-white dark:bg-zinc-900 border-0 shadow-2xl">
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select a Child</DialogTitle>
                    {childrenList && childrenList.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {childrenList.map((child: any) => (
                                <div 
                                    key={child.id}
                                    onClick={() => { setActiveStudentId(child.id); setActiveStudentName(child.name); }}
                                    className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 border-transparent bg-white hover:bg-emerald-50/30 shadow-sm hover:border-emerald-200 group"
                                >
                                    {child.avatar ? (
                                        <img src={child.avatar} alt={child.name} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white">
                                            {child.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">{child.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">Grade {child.grade}</p>
                                    </div>
                                    <span className="material-symbols-outlined ml-auto text-gray-300">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 text-sm">
                            No children linked yet. Please scan a QR code from the dashboard.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 bg-white dark:bg-zinc-900 border-0 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="p-6 bg-slate-50 dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {!studentId && (
                            <button onClick={() => setActiveStudentId(undefined)} className="hover:bg-gray-200 p-2 rounded-full flex items-center justify-center -ml-2">
                                <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                            </button>
                        )}
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Classes & Attendance</DialogTitle>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">Showing records for {activeStudentName}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No classes found for this student.</div>
                    ) : (
                        <div className="space-y-4">
                            {classes.map(cls => (
                                <div key={cls.id} className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-700 bg-white dark:bg-zinc-850 flex items-center gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{cls.subject}</h4>
                                        <p className="text-sm text-slate-500">
                                            {format(cls.dateObj, 'MMM d, yyyy')} • {cls.time}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Teacher: {cls.teacherName}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {cls.attendanceStatus === 'upcoming' && (
                                            <div className="flex items-center text-blue-500 text-sm font-medium">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Upcoming
                                            </div>
                                        )}
                                        {cls.attendanceStatus === 'attended' && (
                                            <div className="flex items-center text-emerald-500 text-sm font-medium">
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Attended
                                            </div>
                                        )}
                                        {cls.attendanceStatus === 'cancelled' && (
                                            <div className="flex items-center text-slate-400 text-sm font-medium">
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Cancelled
                                            </div>
                                        )}
                                        {cls.attendanceStatus === 'missed' && (
                                            <div className="flex items-center text-red-500 text-sm font-medium">
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Missed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
