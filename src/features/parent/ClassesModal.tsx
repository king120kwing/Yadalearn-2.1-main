import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ClassesModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

export const ClassesModal = ({ isOpen, onClose, studentId, studentName }: ClassesModalProps) => {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchClasses();
        }
    }, [isOpen, studentId]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('bookings')
                .select(`
                    id, subject, date, time, status, rating, teacher_id,
                    teacher:profiles!bookings_teacher_id_fkey(full_name)
                `)
                .eq('student_id', studentId);

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 bg-white dark:bg-zinc-900 border-0 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="p-6 bg-slate-50 dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Classes & Attendance</h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Showing records for {studentName}</p>
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
