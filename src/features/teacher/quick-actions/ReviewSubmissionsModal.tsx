import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface ReviewSubmissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Submission {
    id: string;
    content: string;
    submission_type: 'text' | 'link' | 'file';
    submitted_at: string;
    status: string;
    grade?: string | number;
    feedback?: string;
    student: {
        full_name: string;
        avatar_url: string;
    };
    assignment: {
        title: string;
    };
}

export const ReviewSubmissionsModal = ({ isOpen, onClose }: ReviewSubmissionsModalProps) => {
    const { user } = useUser();
    const [activeFilter, setActiveFilter] = useState('all');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);

    // Grading State
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && user?.id) {
            fetchSubmissions();
        }
    }, [isOpen, user?.id, activeFilter]); // Re-fetch on filter change if needed, or filter client-side

    const fetchSubmissions = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Fetch submissions for courses taught by this teacher
            // This requires a complex join or multiple queries. 
            // Supabase approach: select submissions, join assignments (filter by teacher_id indirectly via course)

            // Step 1: Get courses taught by teacher
            const { data: courses } = await supabase.from('courses').select('id').eq('teacher_id', user.id);

            if (courses && courses.length > 0) {
                const courseIds = courses.map(c => c.id);

                // Step 2: Get assignments for these courses
                const { data: assignments } = await supabase.from('assignments').select('id').in('course_id', courseIds);

                if (assignments && assignments.length > 0) {
                    const assignmentIds = assignments.map(a => a.id);

                    // Step 3: Get submissions for these assignments
                    let query = supabase
                        .from('submissions')
                        .select(`
                            id, content, submission_type, submitted_at, status, grade, feedback,
                            student:profiles!student_id(full_name, avatar_url),
                            assignment:assignments!assignment_id(title)
                        `)
                        .in('assignment_id', assignmentIds)
                        .order('submitted_at', { ascending: false });

                    if (activeFilter !== 'all') {
                        if (activeFilter === 'graded') query = query.eq('status', 'graded');
                        else query = query.neq('status', 'graded'); // pending/submitted
                    }

                    const { data, error } = await query;

                    if (error) throw error;

                    // Transform to match interface (handle array/single select quirks if any)
                    const formatted = (data || []).map((s: any) => ({
                        id: s.id,
                        content: s.content,
                        submission_type: s.submission_type,
                        submitted_at: s.submitted_at,
                        status: s.status,
                        grade: s.grade,
                        feedback: s.feedback,
                        student: {
                            full_name: s.student?.full_name || 'Unknown Student',
                            avatar_url: s.student?.avatar_url || ''
                        },
                        assignment: {
                            title: s.assignment?.title || 'Untitled Assignment'
                        }
                    }));

                    setSubmissions(formatted);

                    // Select first one by default if none selected
                    if (!selectedSubmissionId && formatted.length > 0) {
                        setSelectedSubmissionId(formatted[0].id);
                    }
                } else {
                    setSubmissions([]);
                }
            } else {
                setSubmissions([]);
            }
        } catch (err) {
            console.error('Error fetching submissions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitGrade = async () => {
        if (!selectedSubmissionId) return;
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('submissions')
                .update({
                    grade: grade,
                    feedback: feedback,
                    status: 'graded'
                })
                .eq('id', selectedSubmissionId);

            if (error) throw error;

            alert('Grade submitted!');
            // Update local state
            setSubmissions(prev => prev.map(s =>
                s.id === selectedSubmissionId ? { ...s, grade, feedback, status: 'graded' } : s
            ));

            // Clear inputs or move to next
            setGrade('');
            setFeedback('');

        } catch (err) {
            alert('Error submitting grade');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedSubmission = submissions.find(s => s.id === selectedSubmissionId);
    const quickFeedback = ['✨ Excellent point', '⚠️ Cite sources', '📝 Revise', '👏 Great work'];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden h-screen max-h-screen flex flex-col">
                {/* Top App Bar */}
                <div className="flex flex-col gap-2 p-4 pb-2 bg-white dark:bg-gray-900 sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center h-12 justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="text-gray-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <h1 className="text-xl font-bold leading-tight tracking-tight">Review Submissions</h1>
                        </div>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
                        {['all', 'pending', 'graded'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${activeFilter === filter
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-emerald-500/50'
                                    }`}
                            >
                                <span className="text-sm font-medium capitalize">{filter}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                    {loading ? (
                        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
                    ) : submissions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No submissions found.</p>
                            <p className="text-xs mt-2">Try initializing teacher data in dashboard if testing.</p>
                        </div>
                    ) : (
                        <>
                            {/* Queue List */}
                            <div className="px-4 py-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Queue</h3>
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30 px-2 py-1 rounded-md">{submissions.filter(s => s.status !== 'graded').length} Pending</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {submissions.map((submission) => (
                                        <div
                                            key={submission.id}
                                            onClick={() => {
                                                setSelectedSubmissionId(submission.id);
                                                setGrade(submission.grade?.toString() || '');
                                                setFeedback(submission.feedback || '');
                                            }}
                                            className={`flex gap-3 p-3 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${selectedSubmissionId === submission.id
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 shrink-0 border-2 border-emerald-500/30" style={{ backgroundImage: `url(${submission.student.avatar_url || 'https://i.pravatar.cc/150'})` }}></div>
                                            <div className="flex flex-1 flex-col justify-center">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-base font-medium leading-none mb-1 text-gray-900 dark:text-white">{submission.student.full_name}</p>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${submission.status === 'graded'
                                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30'
                                                        : 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30'
                                                        }`}>
                                                        {submission.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{submission.assignment.title}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {formatDistanceToNow(new Date(submission.submitted_at))} ago
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Active Grading Workspace */}
                            {selectedSubmission && (
                                <>
                                    <div className="mt-6 mb-2 px-4 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-bold">Active Workspace</span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 mx-2 rounded-t-3xl shadow-lg border border-gray-200 dark:border-gray-700 border-b-0 overflow-hidden relative">
                                        {/* Content Viewer */}
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-[200px]">
                                            <div className="bg-white dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Student Submission</h4>
                                                {selectedSubmission.submission_type === 'link' ? (
                                                    <a href={selectedSubmission.content} target="_blank" rel="noreferrer" className="text-blue-500 underline break-all flex items-center gap-2">
                                                        <span className="material-symbols-outlined">link</span>
                                                        {selectedSubmission.content}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-serif">
                                                        {selectedSubmission.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Grading Controls */}
                                        <div className="bg-white dark:bg-gray-800 p-4 pb-24">
                                            <div className="mb-4">
                                                <label className="text-xs font-bold text-gray-500 uppercase display-block mb-1">Grade (0-100)</label>
                                                <input
                                                    type="number"
                                                    max="100"
                                                    min="0"
                                                    value={grade}
                                                    onChange={e => setGrade(e.target.value)}
                                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-900"
                                                    placeholder="--/100"
                                                />
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-inner">
                                                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                                                    {quickFeedback.map(text => (
                                                        <span
                                                            key={text}
                                                            onClick={() => setFeedback(prev => prev ? prev + ' ' + text : text)}
                                                            className="shrink-0 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-[11px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors"
                                                        >
                                                            {text}
                                                        </span>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none h-20 border-none focus:ring-0 p-0"
                                                    placeholder="Add specific feedback..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Sticky Footer Action */}
                {selectedSubmission && (
                    <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 pb-6 z-40 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 dark:text-emerald-400 uppercase tracking-wider font-bold mb-0.5">Total Grade</label>
                                <div className="flex items-baseline gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white font-mono">{grade || '--'}</span>
                                    <span className="text-xs text-gray-400 font-mono">/100</span>
                                </div>
                            </div>
                            <button
                                onClick={handleSubmitGrade}
                                disabled={submitting || !grade}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 active:translate-y-0.5 transition-all text-white font-bold text-base h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                {submitting ? 'Sending...' : 'Return to Student'}
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
