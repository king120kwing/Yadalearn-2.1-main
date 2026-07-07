import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface ProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProgressModal = ({ isOpen, onClose }: ProgressModalProps) => {
    const { user } = useAuth();
    const userName = user?.name || 'Student';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-background-light dark:bg-student-bg-dark text-gray-900 dark:text-white border-0 p-0 overflow-hidden h-screen max-h-screen flex flex-col">
                <DialogTitle className="sr-only">Progress Overview</DialogTitle>
                <DialogDescription className="sr-only">View your academic health check, grades overview, and studying progress stats.</DialogDescription>
                {/* Top App Bar */}
                <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-student-bg-dark/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer">
                            <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-full size-10 border-2 border-student-primary"></div>
                            <div className="absolute bottom-0 right-0 size-3 bg-student-primary rounded-full border-2 border-student-bg-dark"></div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Welcome back,</p>
                            <h2 className="text-sm font-bold leading-tight">{userName}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-700 dark:text-white">close</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="px-4 pt-6 flex-1 overflow-y-auto pb-24">
                    {/* Headline */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight">Progress Check</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here is your academic health overview.</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-white dark:bg-student-surface-dark rounded-xl p-3 flex flex-col gap-1 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-student-primary text-[20px]">school</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">GPA</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold leading-none">3.8</span>
                                <span className="text-[10px] font-bold text-student-primary mb-1">↑ 0.2</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-student-surface-dark rounded-xl p-3 flex flex-col gap-1 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-student-primary text-[20px]">calendar_today</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Attend</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold leading-none">92%</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-student-surface-dark rounded-xl p-3 flex flex-col gap-1 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-student-primary text-[20px]">assignment</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tasks</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold leading-none">12<span className="text-sm text-gray-500">/15</span></span>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="mb-8">
                        <div className="relative overflow-hidden bg-gradient-to-br from-student-surface-dark to-student-bg-dark border border-student-primary/20 rounded-2xl p-5 shadow-lg">
                            {/* Abstract decoration */}
                            <div className="absolute -right-4 -top-4 size-24 bg-student-primary/10 rounded-full blur-xl"></div>
                            <div className="relative z-10 flex gap-4">
                                <div className="shrink-0 size-10 rounded-full bg-student-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-student-primary">auto_awesome</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-student-primary font-bold text-base mb-1">AI Insight</h3>
                                    <p className="text-sm text-gray-300 leading-relaxed mb-3">
                                        You've missed 2 assignments in History. Catch up this weekend to maintain your A- grade.
                                    </p>
                                    <button className="bg-student-primary hover:bg-green-400 text-student-bg-dark text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1">
                                        Review Assignments
                                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Study Focus Chart */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-lg font-bold">Study Focus</h3>
                            <span className="text-xs font-medium text-student-primary bg-student-primary/10 px-2 py-1 rounded">14h this week</span>
                        </div>
                        <div className="bg-white dark:bg-student-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="grid grid-cols-7 gap-2 h-32 items-end">
                                {/* Day M */}
                                <div className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                        <div className="w-full bg-student-primary/50 group-hover:bg-student-primary transition-all duration-300" style={{ height: '30%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">M</span>
                                </div>
                                {/* Day T */}
                                <div className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                        <div className="w-full bg-student-primary/50 group-hover:bg-student-primary transition-all duration-300" style={{ height: '45%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">T</span>
                                </div>
                                {/* Day W */}
                                <div className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                        <div className="w-full bg-student-primary/70 group-hover:bg-student-primary transition-all duration-300" style={{ height: '70%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">W</span>
                                </div>
                                {/* Day T */}
                                <div className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                        <div className="w-full bg-student-primary group-hover:bg-student-primary transition-all duration-300" style={{ height: '90%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-student-primary">T</span>
                                </div>
                                {/* Day F */}
                                <div className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                        <div className="w-full bg-student-primary/60 group-hover:bg-student-primary transition-all duration-300" style={{ height: '60%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">F</span>
                                </div>
                                {/* Day S */}
                                <div className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                        <div className="w-full bg-student-primary/30 group-hover:bg-student-primary transition-all duration-300" style={{ height: '20%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">S</span>
                                </div>
                                {/* Day S */}
                                <div className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                        <div className="w-full bg-student-primary/40 group-hover:bg-student-primary transition-all duration-300" style={{ height: '35%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">S</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subjects & Skills */}
                    <div className="mb-4 flex items-center justify-between px-1">
                        <h3 className="text-lg font-bold">Subjects & Skills</h3>
                        <button className="text-student-primary text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="flex flex-col gap-4">
                        {/* Math Card */}
                        <div className="bg-white dark:bg-student-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="size-2 rounded-full bg-orange-400"></div>
                                        <h4 className="font-bold text-lg">Mathematics</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Mr. Anderson • Period 3</p>
                                </div>
                                <div className="relative size-14 flex items-center justify-center">
                                    {/* SVG Donut Chart */}
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-gray-200 dark:text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                                        <path className="text-student-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="88, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-xs font-bold text-student-primary">88%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {/* Skill 1 */}
                                <div>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="text-gray-600 dark:text-gray-300">Calculus</span>
                                        <span className="text-student-primary font-bold">90%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-student-primary rounded-full" style={{ width: '90%' }}></div>
                                    </div>
                                </div>
                                {/* Skill 2 */}
                                <div>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="text-gray-600 dark:text-gray-300">Geometry</span>
                                        <span className="text-white font-bold">75%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-student-primary/70 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                                <button className="w-full flex items-center justify-between text-sm font-bold text-gray-700 dark:text-white hover:text-student-primary transition-colors">
                                    <span>View Gradebook</span>
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        {/* English Card */}
                        <div className="bg-white dark:bg-student-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="size-2 rounded-full bg-blue-400"></div>
                                        <h4 className="font-bold text-lg">English Lit</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Ms. Davis • Period 1</p>
                                </div>
                                <div className="relative size-14 flex items-center justify-center">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-gray-200 dark:text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                                        <path className="text-student-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="94, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-xs font-bold text-student-primary">94%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {/* Skill 1 */}
                                <div>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="text-gray-600 dark:text-gray-300">Writing</span>
                                        <span className="text-student-primary font-bold">96%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-student-primary rounded-full" style={{ width: '96%' }}></div>
                                    </div>
                                </div>
                                {/* Skill 2 */}
                                <div>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="text-gray-600 dark:text-gray-300">Speaking</span>
                                        <span className="text-white font-bold">88%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-student-primary/80 rounded-full" style={{ width: '88%' }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                                <button className="w-full flex items-center justify-between text-sm font-bold text-gray-700 dark:text-white hover:text-student-primary transition-colors">
                                    <span>View Gradebook</span>
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-student-bg-dark/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/5 pb-6 pt-2 z-50">
                    <div className="flex justify-around items-center px-4">
                        <button className="flex flex-col items-center gap-1 p-2 text-student-primary">
                            <span className="material-symbols-outlined text-[24px] filled">dashboard</span>
                            <span className="text-[10px] font-medium">Progress</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-student-primary transition-colors">
                            <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                            <span className="text-[10px] font-medium">Calendar</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-student-primary transition-colors">
                            <span className="material-symbols-outlined text-[24px]">book_2</span>
                            <span className="text-[10px] font-medium">Courses</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-student-primary transition-colors">
                            <span className="material-symbols-outlined text-[24px]">person</span>
                            <span className="text-[10px] font-medium">Profile</span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
