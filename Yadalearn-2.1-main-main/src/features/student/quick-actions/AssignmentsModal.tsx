import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, isToday, isThisWeek, parseISO } from 'date-fns';
import { seedDatabase } from '@/utils/seedData';
interface AssignmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AssignmentsModal = ({ isOpen, onClose }: AssignmentsModalProps) => {
    const { user, isLoaded } = useAuth();
    const userId = user?.id;

    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [submissionContent, setSubmissionContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchAssignments();
        }
    }, [isOpen, user]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);

            // 1. Fetch Assignments via Course Enrollments
            const { data: enrollments, error } = await supabase
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

            // 2. Fetch User's Submissions
            const { data: submissions, error: subError } = await supabase
                .from('submissions')
                .select('*')
                .eq('student_id', userId);

            if (subError) throw subError;

            // 3. Merge Data
            const allAssignments: any[] = [];
            enrollments?.forEach((enrollment: any) => {
                if (enrollment.course && enrollment.course.assignments) {
                    enrollment.course.assignments.forEach((a: any) => {
                        const sub = submissions?.find((s: any) => s.assignment_id === a.id);

                        let status = 'To Do';
                        if (sub) {
                            status = sub.grade ? 'Graded' : 'Submitted';
                        } else if (isPast(parseISO(a.due_date)) && !isToday(parseISO(a.due_date))) {
                            status = 'Missing';
                        }

                        allAssignments.push({
                            ...a,
                            courseTitle: enrollment.course.title,
                            status,
                            submission: sub
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

    const handleSubmitAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submittingId || !userId) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('submissions').insert({
                assignment_id: submittingId,
                student_id: userId,
                content: submissionContent,
                submitted_at: new Date().toISOString()
            });

            if (error) throw error;

            // Success
            setSubmittingId(null);
            setSubmissionContent('');
            fetchAssignments(); // Refresh list associated statuses
        } catch (err: any) {
            console.error('Error submitting:', err);
            alert('Failed to submit: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Categorize
    const overdue = assignments.filter(a => a.status === 'Missing');
    const dueToday = assignments.filter(a => isToday(parseISO(a.due_date)) && a.status === 'To Do');
    const thisWeek = assignments.filter(a => isThisWeek(parseISO(a.due_date)) && !isToday(parseISO(a.due_date)) && !isPast(parseISO(a.due_date)) && a.status === 'To Do');
    const upcoming = assignments.filter(a => !isThisWeek(parseISO(a.due_date)) && !isPast(parseISO(a.due_date)) && a.status === 'To Do');

    const completed = assignments.filter(a => a.status === 'Submitted' || a.status === 'Graded');

    const AssignmentCard = ({ assignment, statusColor, statusText }: any) => {
        const canSubmit = assignment.status !== 'Graded' && assignment.status !== 'Submitted';

        return (
            <div className={`group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 ${statusColor} shadow-sm transition-all`}>
                <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => { if (canSubmit) setSubmittingId(assignment.id); }}
                >
                    <div className={`flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 shrink-0 size-12`}>
                        {assignment.status === 'Graded' ? (
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                        ) : assignment.status === 'Submitted' ? (
                            <span className="material-symbols-outlined text-blue-500">hourglass_top</span>
                        ) : (
                            <span className="material-symbols-outlined">assignment</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-gray-900 dark:text-white text-base font-bold leading-snug line-clamp-1">{assignment.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-1">{assignment.courseTitle}</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    <span className={`text-xs font-bold uppercase tracking-wide`}>{format(parseISO(assignment.due_date), 'MMM d, h:mm a')}</span>

                    <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600`}>
                            <p className={`text-[10px] font-bold`}>{assignment.status === 'Graded' ? `Grade: ${assignment.submission.grade}` : statusText}</p>
                        </div>

                        {canSubmit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSubmittingId(assignment.id);
                                }}
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
                            >
                                {assignment.status === 'Missing' ? 'Submit Late' : 'Submit'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) setSubmittingId(null);
            onClose();
        }}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden h-screen max-h-screen flex flex-col">

                {/* SUBMISSION FORM OVERLAY */}
                {submittingId ? (
                    <div className="flex flex-col h-full bg-white dark:bg-gray-900 z-50 animate-in slide-in-from-right relative">
                        <header className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                            <button onClick={() => setSubmittingId(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <h2 className="text-lg font-bold">Submit Assignment</h2>
                        </header>

                        <div className="p-6 flex-1">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-1">{assignments.find(a => a.id === submittingId)?.title}</h3>
                                <p className="text-sm text-gray-500">{assignments.find(a => a.id === submittingId)?.description}</p>
                            </div>

                            <form onSubmit={handleSubmitAssignment} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Detailed Response or Link</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 ring-indigo-500 min-h-[200px] resize-none"
                                        placeholder="Type your answer here or paste a link to your Google Doc..."
                                        value={submissionContent}
                                        onChange={(e) => setSubmissionContent(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Sending...' : 'Submit Assignment'}
                                    {!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* TopAppBar */}
                        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 px-4 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {/* User Info */}
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Welcome back,</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.fullName || user?.firstName || 'Student'}</p>
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

                                    {/* COMPLETED/GRADED Section */}
                                    {completed.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-3">
                                                <h3 className="text-gray-500 dark:text-gray-400 tracking-tight text-xl font-bold leading-tight">✅ Completed</h3>
                                                <div className="h-px bg-gray-300 dark:bg-gray-800 flex-1"></div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                {completed.map(a => <AssignmentCard key={a.id} assignment={a} statusColor="border-gray-500" statusText={a.status} />)}
                                            </div>
                                        </section>
                                    )}

                                    {assignments.length === 0 && (
                                        <div className="flex flex-col items-center justify-center mt-10 gap-4">
                                            <p className="text-center text-gray-500">No assignments found.</p>
                                            <button
                                                onClick={async () => {
                                                    if (userId) await seedDatabase(userId, 'student');
                                                }}
                                                className="text-xs px-4 py-2 rounded-lg border border-dashed border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">database</span>
                                                Load Demo Assignments
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </main>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

