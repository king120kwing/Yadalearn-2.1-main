import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, isToday, isThisWeek, parseISO } from 'date-fns';
interface AssignmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId?: string;
}

export const AssignmentsModal = ({ isOpen, onClose, studentId }: AssignmentsModalProps) => {
    const { user, isLoaded } = useAuth();
    const userId = studentId || user?.id;

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

    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    const activeAssignment = assignments.find(a => a.id === selectedAssignmentId);
    const canSubmitActive = activeAssignment && (activeAssignment.status === 'To Do' || activeAssignment.status === 'Missing');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setSelectedAssignmentId(null);
                setSubmittingId(null);
            }
            onClose();
        }}>
            <DialogContent className="!max-w-4xl mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden rounded-[2.5rem] max-h-[85vh] flex flex-col shadow-2xl w-[95vw] md:w-full">
                <DialogTitle className="sr-only">Assignments</DialogTitle>
                <DialogDescription className="sr-only">Submit, review, and view grades for your enrolled class assignments.</DialogDescription>

                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[28px]">close</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">Assignments</h1>
                    <div className="w-10"></div>
                </header>

                {/* Main Content: Split Grid */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left Column: Scrollable List of Assignments */}
                    <div className="w-full md:w-1/2 border-r border-gray-150 dark:border-zinc-800 flex flex-col overflow-y-auto no-scrollbar p-6 bg-gray-50 dark:bg-zinc-900/30">
                        {loading ? (
                            <p className="text-center py-4 text-sm text-gray-500">Loading assignments...</p>
                        ) : (
                            <div className="space-y-6">
                                {/* OVERDUE Section */}
                                {overdue.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-red-500 tracking-tight text-sm font-bold uppercase">⚠️ Overdue</h3>
                                            <div className="h-px bg-red-100 dark:bg-red-950 flex-1"></div>
                                            <span className="text-[10px] font-bold text-red-650 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">{overdue.length}</span>
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            {overdue.map(a => (
                                                <div
                                                    key={a.id}
                                                    onClick={() => setSelectedAssignmentId(a.id)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                                        selectedAssignmentId === a.id
                                                            ? 'border-[#5B4A9F] bg-purple-50/45 dark:bg-purple-950/20 shadow-sm'
                                                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-850'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{a.title}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.courseTitle}</p>
                                                        </div>
                                                        <span className="text-[10px] font-extrabold uppercase bg-red-150 text-red-700 px-2 py-0.5 rounded-full shrink-0">Missing</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* DUE TODAY Section */}
                                {dueToday.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-orange-500 tracking-tight text-sm font-bold uppercase">🔥 Due Today</h3>
                                            <div className="h-px bg-orange-100 dark:bg-orange-950 flex-1"></div>
                                            <span className="text-[10px] font-bold text-orange-650 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">{dueToday.length}</span>
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            {dueToday.map(a => (
                                                <div
                                                    key={a.id}
                                                    onClick={() => setSelectedAssignmentId(a.id)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                                        selectedAssignmentId === a.id
                                                            ? 'border-[#5B4A9F] bg-purple-50/45 dark:bg-purple-950/20 shadow-sm'
                                                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-850'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{a.title}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.courseTitle}</p>
                                                        </div>
                                                        <span className="text-[10px] font-extrabold uppercase bg-orange-150 text-orange-700 px-2 py-0.5 rounded-full shrink-0">Today</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* THIS WEEK Section */}
                                {thisWeek.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-yellow-600 dark:text-yellow-500 tracking-tight text-sm font-bold uppercase">📅 This Week</h3>
                                            <div className="h-px bg-yellow-100 dark:bg-yellow-950 flex-1"></div>
                                            <span className="text-[10px] font-bold text-yellow-650 bg-yellow-50 dark:bg-yellow-950/40 px-2 py-0.5 rounded-full">{thisWeek.length}</span>
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            {thisWeek.map(a => (
                                                <div
                                                    key={a.id}
                                                    onClick={() => setSelectedAssignmentId(a.id)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                                        selectedAssignmentId === a.id
                                                            ? 'border-[#5B4A9F] bg-purple-50/45 dark:bg-purple-950/20 shadow-sm'
                                                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-850'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{a.title}</p>
                                                            <p className="text-xs text-gray-550 mt-0.5">{a.courseTitle}</p>
                                                        </div>
                                                        <span className="text-[10px] font-extrabold uppercase bg-yellow-150 text-yellow-750 px-2 py-0.5 rounded-full shrink-0">Soon</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* UPCOMING Section */}
                                {upcoming.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-[#5B4A9F] tracking-tight text-sm font-bold uppercase">🔮 Upcoming</h3>
                                            <div className="h-px bg-purple-100 dark:bg-purple-950 flex-1"></div>
                                            <span className="text-[10px] font-bold text-purple-650 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">{upcoming.length}</span>
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            {upcoming.map(a => (
                                                <div
                                                    key={a.id}
                                                    onClick={() => setSelectedAssignmentId(a.id)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                                        selectedAssignmentId === a.id
                                                            ? 'border-[#5B4A9F] bg-purple-50/45 dark:bg-purple-950/20 shadow-sm'
                                                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-850'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{a.title}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{a.courseTitle}</p>
                                                        </div>
                                                        <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-[#5B4A9F] px-2 py-0.5 rounded-full shrink-0">Open</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* COMPLETED/GRADED Section */}
                                {completed.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-gray-550 dark:text-gray-400 tracking-tight text-sm font-bold uppercase">✅ Completed</h3>
                                            <div className="h-px bg-gray-150 dark:bg-zinc-800 flex-1"></div>
                                            <span className="text-[10px] font-bold text-gray-650 bg-gray-50 dark:bg-zinc-850 px-2 py-0.5 rounded-full">{completed.length}</span>
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            {completed.map(a => (
                                                <div
                                                    key={a.id}
                                                    onClick={() => setSelectedAssignmentId(a.id)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                                        selectedAssignmentId === a.id
                                                            ? 'border-[#5B4A9F] bg-purple-50/45 dark:bg-purple-950/20 shadow-sm'
                                                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-850'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{a.title}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{a.courseTitle}</p>
                                                        </div>
                                                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">Done</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {assignments.length === 0 && (
                                    <div className="flex flex-col items-center justify-center mt-10 gap-4">
                                        <p className="text-center text-sm text-gray-550">No assignments found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Selected Assignment Details & Submission Panel */}
                    <div className="w-full md:w-1/2 flex flex-col overflow-y-auto no-scrollbar p-6 bg-white dark:bg-zinc-900">
                        {activeAssignment ? (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="text-xl font-bold leading-tight">{activeAssignment.title}</h3>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase shrink-0 ${
                                            activeAssignment.status === 'Graded' ? 'bg-emerald-100 text-emerald-700' :
                                            activeAssignment.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                                            activeAssignment.status === 'Missing' ? 'bg-red-150 text-red-700' : 'bg-purple-100 text-[#5B4A9F]'
                                        }`}>
                                            {activeAssignment.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-semibold">{activeAssignment.courseTitle}</p>
                                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-2">Due Date: <span className="font-bold">{format(parseISO(activeAssignment.due_date), 'MMMM d, yyyy h:mm a')}</span></p>
                                </div>

                                <div className="border-t border-gray-150 dark:border-zinc-800 pt-4">
                                    <h4 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-2">Description</h4>
                                    <p className="text-sm leading-relaxed text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-850 p-4 rounded-2xl border border-gray-150 dark:border-zinc-800/80">
                                        {activeAssignment.description || 'No description provided.'}
                                    </p>
                                </div>

                                {canSubmitActive ? (
                                    <div className="border-t border-gray-150 dark:border-zinc-800 pt-4">
                                        <h4 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-3">Submit Assignment</h4>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            setSubmittingId(activeAssignment.id);
                                            handleSubmitAssignment(e);
                                        }} className="space-y-4">
                                            <textarea
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[140px] resize-none text-sm leading-relaxed"
                                                placeholder="Type your response or paste a link to your Google Doc..."
                                                value={submissionContent}
                                                onChange={(e) => setSubmissionContent(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-[#5B4A9F] hover:bg-[#4a3b8c] text-white font-bold rounded-2xl shadow-lg shadow-purple-100 dark:shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? 'Sending...' : 'Submit Response'}
                                                {!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-150 dark:border-zinc-800 pt-4 space-y-4">
                                        <h4 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Your Submission</h4>
                                        {activeAssignment.submission ? (
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-zinc-850 p-4 rounded-2xl border border-gray-150 dark:border-zinc-800/80">
                                                    <p className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">{activeAssignment.submission.content}</p>
                                                    <p className="text-[10px] text-gray-550 dark:text-gray-400 mt-3">Submitted: {format(parseISO(activeAssignment.submission.submitted_at), 'MMMM d, yyyy')}</p>
                                                </div>
                                                {activeAssignment.status === 'Graded' && (
                                                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-250 dark:border-emerald-900/30">
                                                        <h5 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-base">grade</span>
                                                            Grade: {activeAssignment.submission.grade}
                                                        </h5>
                                                        {activeAssignment.submission.feedback && (
                                                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 font-medium">Feedback: "{activeAssignment.submission.feedback}"</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 italic">No submission found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-[#5B4A9F] mb-4">
                                    <span className="material-symbols-outlined text-3xl">assignment_turned_in</span>
                                </div>
                                <h3 className="font-bold text-lg">No Assignment Selected</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
                                    Select an assignment from the list on the left to view details, grades, and submit.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

