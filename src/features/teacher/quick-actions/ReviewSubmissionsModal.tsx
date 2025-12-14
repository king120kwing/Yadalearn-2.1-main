import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ReviewSubmissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReviewSubmissionsModal = ({ isOpen, onClose }: ReviewSubmissionsModalProps) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentSubmission, setCurrentSubmission] = useState(0);
    const [rubricScores, setRubricScores] = useState({ accuracy: 8, grammar: 0 });
    const [feedback, setFeedback] = useState('');

    const submissions = [
        { id: 1, student: 'Sarah Miller', assignment: 'History Essay: The Industrial Revolution', submitted: '2h ago', status: 'due-today', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        { id: 2, student: 'James Chen', assignment: 'Video Presentation: Cell Biology', submitted: 'Yesterday', status: 'late', avatar: 'https://i.pravatar.cc/150?u=james' },
    ];

    const quickFeedback = ['✨ Excellent point', '⚠️ Cite sources', '📝 Revise'];

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
                        <button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-emerald-600 dark:text-emerald-400 transition-colors">
                            <span className="material-symbols-outlined">sort</span>
                        </button>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
                        {['all', 'resubmissions', 'late', 'graded'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${activeFilter === filter
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-emerald-500/50'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {filter === 'all' ? 'check_circle' : filter === 'resubmissions' ? 'flag' : filter === 'late' ? 'schedule' : 'fact_check'}
                                </span>
                                <span className="text-sm font-medium capitalize">{filter}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                    {/* Queue List */}
                    <div className="px-4 py-2">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Queue</h3>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30 px-2 py-1 rounded-md">12 Left</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {submissions.map((submission, index) => (
                                <div
                                    key={submission.id}
                                    onClick={() => setCurrentSubmission(index)}
                                    className="flex gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group relative overflow-hidden"
                                >
                                    <div className="absolute right-0 top-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-lg">chevron_right</span>
                                    </div>
                                    <div className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 shrink-0 border-2 border-emerald-500/30" style={{ backgroundImage: `url(${submission.avatar})` }}></div>
                                    <div className="flex flex-1 flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                            <p className="text-base font-medium leading-none mb-1 text-gray-900 dark:text-white">{submission.student}</p>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${submission.status === 'due-today'
                                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30'
                                                    : 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30'
                                                }`}>
                                                {submission.status === 'due-today' ? 'Due Today' : 'Late'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{submission.assignment}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span> Submitted {submission.submitted}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grading Workspace */}
                    <div className="mt-6 mb-2 px-4 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-bold">Active Workspace</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 mx-2 rounded-t-3xl shadow-lg border border-gray-200 dark:border-gray-700 border-b-0 overflow-hidden relative">
                        {/* Workspace Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
                            <div className="flex items-center gap-3">
                                <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shrink-0 border border-gray-200 dark:border-gray-600" style={{ backgroundImage: 'url(https://i.pravatar.cc/150?u=liam)' }}></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Liam Johnson</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="size-1.5 rounded-full bg-red-400 animate-pulse"></span>
                                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium uppercase tracking-wide">Resubmission</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                                <button className="px-4 py-1.5 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold shadow-sm border border-gray-200 dark:border-gray-700">Work</button>
                                <button className="px-4 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs font-medium transition-colors">Info</button>
                            </div>
                        </div>

                        {/* Content: Student Work Viewer */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900">
                            <div className="w-full bg-white rounded-xl h-72 relative overflow-hidden group shadow-lg border border-gray-200 dark:border-gray-700">
                                {/* Simulated PDF Content */}
                                <div className="absolute inset-0 bg-white p-6 overflow-hidden">
                                    <h4 className="text-gray-900 font-serif text-xl font-bold mb-3">The Causes of the Industrial Revolution</h4>
                                    <p className="text-gray-600 font-serif text-[11px] leading-relaxed mb-3 text-justify">
                                        The Industrial Revolution was a period of major industrialization and innovation that took place during the late 1700s and early 1800s...
                                    </p>
                                    <div className="absolute top-[52px] left-[22px] w-[200px] h-[14px] bg-emerald-500/30 mix-blend-multiply rounded-sm transform -rotate-1"></div>
                                </div>
                                {/* Viewer Controls */}
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button className="size-9 bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gray-700 border border-gray-600 shadow-lg transition-transform active:scale-90">
                                        <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                                    </button>
                                    <button className="size-9 bg-emerald-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-emerald-600 border border-emerald-400 shadow-lg transition-transform active:scale-90">
                                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grading Tools Section */}
                        <div className="bg-white dark:bg-gray-800 p-4 pb-20">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-4 h-px bg-gray-300 dark:bg-gray-700"></span> Assessment Tools <span className="w-full h-px bg-gray-300 dark:bg-gray-700"></span>
                            </h4>

                            {/* Rubric Block */}
                            <div className="space-y-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Historical Accuracy</span>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">8/10</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {[...Array(5)].map((_, i) => (
                                            <button
                                                key={i}
                                                className={`h-2.5 flex-1 rounded-full transition-all ${i < 4 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Grammar & Flow</span>
                                        <span className="text-xs font-bold text-gray-400">--/10</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {[...Array(5)].map((_, i) => (
                                            <button
                                                key={i}
                                                className="h-2.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-emerald-500/50 transition-all"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Input Block */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-inner">
                                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                                    {quickFeedback.map(text => (
                                        <span
                                            key={text}
                                            className="shrink-0 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-[11px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors"
                                        >
                                            {text}
                                        </span>
                                    ))}
                                </div>
                                <div className="relative">
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none h-20 border-none focus:ring-0 p-0"
                                        placeholder="Add specific feedback for Liam..."
                                    />
                                    <div className="absolute bottom-0 right-0">
                                        <button className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all">
                                            <span className="material-symbols-outlined text-[18px]">mic</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer Action */}
                <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 pb-6 z-40 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 dark:text-emerald-400 uppercase tracking-wider font-bold mb-0.5">Total Grade</label>
                            <div className="flex items-baseline gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-xl font-bold text-gray-900 dark:text-white font-mono">85</span>
                                <span className="text-xs text-gray-400 font-mono">/100</span>
                            </div>
                        </div>
                        <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:translate-y-0.5 transition-all text-white font-bold text-base h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                            Return to Student
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
