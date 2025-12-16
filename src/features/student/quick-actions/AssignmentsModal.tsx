import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, isToday, isThisWeek, parseISO } from 'date-fns';

interface AssignmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AssignmentsModal = ({ isOpen, onClose }: AssignmentsModalProps) => {
    const { user } = useAuth();
    const userId = user?.id; // Use real Clerk ID

    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && user) {
            fetchAssignments();
        }
    }, [isOpen, user]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    course:courses (
                        title,
                        assignments (
                            id,
                            title,
                            due_date,
                            description
                        )
                    )
                `)
                .eq('student_id', userId);

            if (error) throw error;

            // Flatten data
            const allAssignments: any[] = [];
            data?.forEach((enrollment: any) => {
                if (enrollment.course && enrollment.course.assignments) {
                    enrollment.course.assignments.forEach((a: any) => {
                        allAssignments.push({
                            ...a,
                            courseTitle: enrollment.course.title,
                            // specific submission status would need another fetch or join, assuming 'To Do' for now if not submitted
                            status: 'To Do'
                        });
                    });
                }
            });

            setAssignments(allAssignments);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Categorize
    const overdue = assignments.filter(a => isPast(parseISO(a.due_date)) && !isToday(parseISO(a.due_date)));
    const dueToday = assignments.filter(a => isToday(parseISO(a.due_date)));
    const thisWeek = assignments.filter(a => isThisWeek(parseISO(a.due_date)) && !isToday(parseISO(a.due_date)) && !isPast(parseISO(a.due_date)));
    const upcoming = assignments.filter(a => !isThisWeek(parseISO(a.due_date)) && !isPast(parseISO(a.due_date)));

    const AssignmentCard = ({ assignment, statusColor, statusText }: any) => (
        <div className={`group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 ${statusColor} shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer`}>
            <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 shrink-0 size-12`}>
                    <span className="material-symbols-outlined">assignment</span>
                </div>
                <div className="flex flex-col">
                    <h4 className="text-gray-900 dark:text-white text-base font-bold leading-snug line-clamp-1">{assignment.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-1">{assignment.courseTitle}</p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-xs font-bold uppercase tracking-wide`}>{format(parseISO(assignment.due_date), 'MMM d, h:mm a')}</span>
                <div className={`px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600`}>
                    <p className={`text-[10px] font-bold`}>{statusText}</p>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden h-screen max-h-screen flex flex-col">
                {/* TopAppBar */}
                <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 px-4 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* User Info Mock for now or from Clerk */}
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Welcome back,</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || 'Student'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Assignments</h1>
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white size-10 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined font-bold">close</span>
                        </button>
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 flex flex-col gap-6 px-4 pt-4 overflow-y-auto pb-24 bg-gray-50 dark:bg-gray-900">
                    {loading ? <p className="text-center py-4">Loading assignments...</p> : (
                        <>
                            {/* OVERDUE Section */}
                            {overdue.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3 className="text-red-600 dark:text-red-400 tracking-tight text-xl font-bold leading-tight">⚠️ Overdue</h3>
                                        <div className="h-px bg-red-300 dark:bg-red-800 flex-1"></div>
                                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">{overdue.length} Task{overdue.length !== 1 && 's'}</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {overdue.map(a => <AssignmentCard key={a.id} assignment={a} statusColor="border-red-500" statusText="Missing" />)}
                                    </div>
                                </section>
                            )}

                            {/* DUE TODAY Section */}
                            {dueToday.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3 className="text-orange-600 dark:text-orange-400 tracking-tight text-xl font-bold leading-tight">🔥 Due Today</h3>
                                        <div className="h-px bg-orange-300 dark:bg-orange-800 flex-1"></div>
                                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">{dueToday.length} Task{dueToday.length !== 1 && 's'}</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {dueToday.map(a => <AssignmentCard key={a.id} assignment={a} statusColor="border-orange-500" statusText="To Do" />)}
                                    </div>
                                </section>
                            )}

                            {/* THIS WEEK Section */}
                            {thisWeek.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3 className="text-yellow-600 dark:text-yellow-400 tracking-tight text-xl font-bold leading-tight">📅 This Week</h3>
                                        <div className="h-px bg-yellow-300 dark:bg-yellow-800 flex-1"></div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {thisWeek.map(a => <AssignmentCard key={a.id} assignment={a} statusColor="border-yellow-500" statusText="Upcoming" />)}
                                    </div>
                                </section>
                            )}

                            {/* UPCOMING Section */}
                            {upcoming.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3 className="text-emerald-600 dark:text-emerald-400 tracking-tight text-xl font-bold leading-tight">🔮 Upcoming</h3>
                                        <div className="h-px bg-emerald-300 dark:bg-emerald-800 flex-1"></div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {upcoming.map(a => <AssignmentCard key={a.id} assignment={a} statusColor="border-emerald-500" statusText="Open" />)}
                                    </div>
                                </section>
                            )}

                            {assignments.length === 0 && <p className="text-center text-gray-500 mt-10">No assignments found.</p>}
                        </>
                    )}
                </main>
            </DialogContent>
        </Dialog>
    );
};

