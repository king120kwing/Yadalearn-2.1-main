import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AssignmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AssignmentsModal = ({ isOpen, onClose }: AssignmentsModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden h-screen max-h-screen flex flex-col">
                {/* TopAppBar */}
                <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 px-4 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-full size-10 ring-2 ring-emerald-400 shadow-md"></div>
                                <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Welcome back,</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Alex Johnson</p>
                            </div>
                        </div>
                        <button className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">notifications</span>
                        </button>
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

                {/* Subject Filters (Chips) */}
                <div className="w-full overflow-x-auto hide-scrollbar pl-4 pr-4 py-3 mb-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3 min-w-max">
                        <button className="flex h-9 shrink-0 items-center justify-center px-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-md transition-transform active:scale-95">
                            All
                        </button>
                        <button className="flex h-9 shrink-0 items-center justify-center px-5 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95">
                            Math
                        </button>
                        <button className="flex h-9 shrink-0 items-center justify-center px-5 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95">
                            History
                        </button>
                        <button className="flex h-9 shrink-0 items-center justify-center px-5 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95">
                            Science
                        </button>
                        <button className="flex h-9 shrink-0 items-center justify-center px-5 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95">
                            English
                        </button>
                        <button className="flex h-9 shrink-0 items-center justify-center px-5 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95">
                            Art
                        </button>
                    </div>
                </div>

                {/* Main Content Scroll Area */}
                <main className="flex-1 flex flex-col gap-6 px-4 pt-4 overflow-y-auto pb-24 bg-gray-50 dark:bg-gray-900">
                    {/* OVERDUE Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-red-600 dark:text-red-400 tracking-tight text-xl font-bold leading-tight">⚠️ Overdue</h3>
                            <div className="h-px bg-red-300 dark:bg-red-800 flex-1"></div>
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">1 Task</span>
                        </div>
                        {/* Card */}
                        <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-red-500 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 shrink-0 size-12">
                                    <span className="material-symbols-outlined">calculate</span>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-gray-900 dark:text-white text-base font-bold leading-snug line-clamp-1">Calculus Problem Set 4</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-1">Mrs. Johnson • Math</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wide">Yesterday</span>
                                <div className="px-2 py-1 rounded bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400">Missing</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* DUE TODAY Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-orange-600 dark:text-orange-400 tracking-tight text-xl font-bold leading-tight">🔥 Due Today</h3>
                            <div className="h-px bg-orange-300 dark:bg-orange-800 flex-1"></div>
                            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">2 Tasks</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {/* Card 1 */}
                            <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-orange-500 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shrink-0 size-12">
                                        <span className="material-symbols-outlined">history_edu</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-gray-900 dark:text-white text-base font-bold leading-snug line-clamp-1">History Essay Draft</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-1">Mr. Lewis • History</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wide">11:59 PM</span>
                                    <div className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                                        <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400">To Do</p>
                                    </div>
                                </div>
                            </div>
                            {/* Card 2 */}
                            <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-orange-500 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shrink-0 size-12">
                                        <span className="material-symbols-outlined">science</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-gray-900 dark:text-white text-base font-bold leading-snug line-clamp-1">Lab Prep: Acids</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-1">Ms. Frizzle • Science</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wide">4:00 PM</span>
                                    <div className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">In Progress</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* THIS WEEK Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-yellow-600 dark:text-yellow-400 tracking-tight text-xl font-bold leading-tight">📅 This Week</h3>
                            <div className="h-px bg-yellow-300 dark:bg-yellow-800 flex-1"></div>
                        </div>
                        <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-yellow-500 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 shrink-0 size-12">
                                    <span className="material-symbols-outlined">biotech</span>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-gray-900 dark:text-white text-base font-bold leading-snug line-clamp-1">Physics Lab Report</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-1">Mr. Einstein • Physics</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold uppercase tracking-wide">Thursday</span>
                                <div className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Not Started</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* UPCOMING Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-emerald-600 dark:text-emerald-400 tracking-tight text-xl font-bold leading-tight">🔮 Upcoming</h3>
                            <div className="h-px bg-emerald-300 dark:bg-emerald-800 flex-1"></div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {/* Card */}
                            <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 shrink-0 size-12">
                                        <span className="material-symbols-outlined">book</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-gray-900 dark:text-white text-base font-bold leading-snug line-clamp-1">Reading Log Ch. 5</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-1">Mrs. Hemingway • English</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wide">Next Mon</span>
                                    <div className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                        <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Open</p>
                                    </div>
                                </div>
                            </div>
                            {/* Card */}
                            <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 shrink-0 size-12">
                                        <span className="material-symbols-outlined">palette</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-gray-900 dark:text-white text-base font-bold leading-snug line-clamp-1">Portrait Sketch</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs font-medium line-clamp-1">Mr. Ross • Art</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wide">Next Wed</span>
                                    <div className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                        <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Open</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Bottom Navigation Bar */}
                <nav className="fixed bottom-0 left-0 right-0 h-[80px] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-start pt-3 pb-8 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <button className="flex flex-col items-center gap-1 w-16 group">
                        <span className="material-symbols-outlined text-emerald-500 text-[28px] group-hover:scale-110 transition-transform">dashboard</span>
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Dashboard</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 w-16 group">
                        <span className="material-symbols-outlined text-gray-400 text-[28px] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors group-hover:scale-110 transition-transform">calendar_month</span>
                        <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Calendar</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 w-16 group">
                        <span className="material-symbols-outlined text-gray-400 text-[28px] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors group-hover:scale-110 transition-transform">school</span>
                        <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Grades</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 w-16 group">
                        <span className="material-symbols-outlined text-gray-400 text-[28px] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors group-hover:scale-110 transition-transform">person</span>
                        <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Profile</span>
                    </button>
                </nav>
            </DialogContent>
        </Dialog>
    );
};
