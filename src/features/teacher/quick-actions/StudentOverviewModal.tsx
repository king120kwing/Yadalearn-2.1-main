import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface StudentOverviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StudentOverviewModal = ({ isOpen, onClose }: StudentOverviewModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    const students = [
        { id: 1, name: 'Sarah Connor', grade: '98% (A)', attendance: '98%', status: 'good', avatar: 'https://i.pravatar.cc/150?u=sarah', lastActive: '2h ago', missing: 0 },
        { id: 2, name: 'John Doe', grade: '64% (D)', attendance: '82%', status: 'danger', avatar: null, initials: 'JD', lastActive: '1d ago', missing: 3 },
        { id: 3, name: 'Michael Chen', grade: '88% (B+)', attendance: '95%', status: 'good', avatar: 'https://i.pravatar.cc/150?u=michael', lastActive: '5h ago', missing: 0 },
        { id: 4, name: 'Emily Davis', grade: '92% (A-)', attendance: '99%', status: 'good', avatar: 'https://i.pravatar.cc/150?u=emily', lastActive: '1h ago', missing: 0 },
        { id: 5, name: 'Alex Rodriguez', grade: '76% (C)', attendance: '88%', status: 'warning', avatar: null, initials: 'AR', lastActive: '3h ago', missing: 1 },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden h-screen max-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-4 pb-2">
                        <button
                            onClick={onClose}
                            className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg font-bold leading-tight tracking-tight">Student Overview</h2>
                            <span className="text-xs font-medium text-gray-500 dark:text-emerald-400">AP Calculus AB • Period 3</span>
                        </div>
                        <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="px-4 py-3 space-y-3">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500 dark:text-emerald-400">search</span>
                            </div>
                            <input
                                className="block w-full p-3 pl-10 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                                placeholder="Search student name..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filter Chips */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {['all', 'grade-low', 'missing', 'low-attendance'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${activeFilter === filter
                                            ? 'bg-emerald-500 text-white border-emerald-500'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">filter_list</span>
                                    {filter === 'all' ? 'All' : filter === 'grade-low' ? 'Grade < 70%' : filter === 'missing' ? 'Missing Work' : 'Low Attendance'}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Quick Stats */}
                    <div className="px-4 py-4">
                        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x">
                            <div className="snap-start flex flex-col min-w-[140px] p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider">Avg Grade</span>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">88%</span>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">↑ 2.1%</span>
                                </div>
                            </div>
                            <div className="snap-start flex flex-col min-w-[140px] p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider">Avg Attd.</span>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">94%</span>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">↑ 0.5%</span>
                                </div>
                            </div>
                            <div className="snap-start flex flex-col min-w-[140px] p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider">Missing</span>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">23</span>
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 mb-1.5">↓ -5%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Header */}
                    <div className="flex items-center justify-between px-4 pb-2">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">124 Students</h3>
                        <button className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">Select Multiple</button>
                    </div>

                    {/* Student List */}
                    <div className="flex flex-col gap-2 px-4 pb-24">
                        {students.map(student => (
                            <div
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className={`group relative flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800 border hover:bg-gray-50 dark:hover:bg-gray-750 active:scale-[0.99] transition-all cursor-pointer ${student.status === 'danger'
                                        ? 'border-l-4 border-l-red-500 border-y-gray-200 dark:border-y-gray-700 border-r-gray-200 dark:border-r-gray-700'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="relative">
                                    {student.avatar ? (
                                        <img className="size-12 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800" src={student.avatar} alt={student.name} />
                                    ) : (
                                        <div className={`flex items-center justify-center size-12 rounded-full font-bold text-lg border-2 border-transparent ${student.status === 'danger'
                                                ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                            }`}>
                                            {student.initials}
                                        </div>
                                    )}
                                    {student.status === 'good' && (
                                        <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white dark:bg-gray-900">
                                            <div className="size-3 rounded-full bg-emerald-500"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold truncate text-gray-900 dark:text-white">{student.name}</h4>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${student.status === 'good'
                                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30'
                                                : student.status === 'danger'
                                                    ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30'
                                                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                            {student.grade}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            {student.attendance} Attd.
                                        </div>
                                        {student.missing > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                                {student.missing} Missing
                                            </div>
                                        )}
                                        {student.missing === 0 && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                {student.lastActive}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        ))}

                        <button className="mt-2 w-full py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-600 transition-all font-medium">
                            Load more students
                        </button>
                    </div>
                </main>
            </DialogContent>
        </Dialog>
    );
};
