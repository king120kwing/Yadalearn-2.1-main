import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

interface StudentOverviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StudentOverviewModal = ({ isOpen, onClose }: StudentOverviewModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch dynamic students
    useEffect(() => {
        async function fetchStudents() {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('student:profiles!bookings_student_id_fkey(*)')
                    .eq('teacher_id', user.id)
                    .eq('status', 'confirmed');

                if (bookings) {
                    const uniqueStudentsMap = new Map();
                    bookings.forEach((b: any) => {
                        if (b.student) {
                            uniqueStudentsMap.set(b.student.id, b.student);
                        }
                    });

                    const list = Array.from(uniqueStudentsMap.values()).map((s: any) => {
                        const name = s.full_name || 'Unknown Student';
                        const initials = name.split(' ').map((n: any) => n[0]).join('');
                        return {
                            id: s.id,
                            name,
                            grade: '92% (A-)',
                            attendance: '95%',
                            status: 'good',
                            avatar: s.avatar_url,
                            initials,
                            lastActive: 'Active now',
                            missing: 0,
                            stats: {
                                avgGrade: '92% (A-)',
                                attendance: '95%',
                                participation: 'High',
                                assignments: { completed: 8, total: 8 }
                            }
                        };
                    });
                    setStudents(list);
                    if (list.length > 0) {
                        setSelectedStudent(list[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching students:', err);
            } finally {
                setLoading(false);
            }
        }
        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen]);

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === 'grade-low') return matchesSearch && parseFloat(student.grade) < 70;
        if (activeFilter === 'missing') return matchesSearch && student.missing > 0;
        if (activeFilter === 'low-attendance') return matchesSearch && parseFloat(student.attendance) < 90;
        return matchesSearch;
    });

    const activeStudent = selectedStudent || (filteredStudents.length > 0 ? filteredStudents[0] : null);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-4xl mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden max-h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-gray-250 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center justify-between p-6 pb-2">
                        <button
                            onClick={onClose}
                            className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg font-bold leading-tight tracking-tight">Student Overview</h2>
                            <span className="text-xs font-semibold text-[#FF7D46]">AP Calculus AB • Period 3</span>
                        </div>
                        <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                            <span className="material-symbols-outlined text-[#FF7D46]">more_vert</span>
                        </button>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="px-6 py-3 space-y-3">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="material-symbols-outlined text-[#FF7D46]">search</span>
                            </div>
                            <input
                                className="block w-full p-3 pl-10 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus:ring-[#FF7D46] focus:border-[#FF7D46] placeholder-gray-550 dark:placeholder-gray-400 transition-all font-medium"
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
                                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-colors ${activeFilter === filter
                                            ? 'bg-[#FF7D46] text-white border-[#FF7D46]'
                                            : 'bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-250 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-750 hover:text-[#FF7D46]'
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
                <main className="flex-1 overflow-y-auto p-6 pb-20 no-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7D46]"></div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                            <span className="material-symbols-outlined text-5xl mb-2 text-gray-300">group</span>
                            <p className="text-sm font-bold">No registered students found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: List and stats */}
                            <div className="space-y-6">
                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col p-4 rounded-2xl bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-200/65 dark:border-zinc-850">
                                        <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider">Avg Grade</span>
                                        <div className="flex items-end gap-2 mt-1">
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">92%</span>
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 mb-1">↑ 2%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-4 rounded-2xl bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-200/65 dark:border-zinc-850">
                                        <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider">Avg Attd.</span>
                                        <div className="flex items-end gap-2 mt-1">
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">95%</span>
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-455 mb-1">↑ 0.5%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-4 rounded-2xl bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-200/65 dark:border-zinc-850">
                                        <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider">Missing</span>
                                        <div className="flex items-end gap-2 mt-1">
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">0</span>
                                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 mb-1">Good</span>
                                        </div>
                                    </div>
                                </div>

                                {/* List Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{filteredStudents.length} Students</h3>
                                    <button className="text-[#FF7D46] dark:text-orange-400 text-xs font-bold hover:underline">Select Multiple</button>
                                </div>

                                {/* Student List */}
                                <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[40vh]">
                                    {filteredStudents.map(student => (
                                        <div
                                            key={student.id}
                                            onClick={() => setSelectedStudent(student)}
                                            className={`group relative flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-800 border hover:bg-gray-50/50 dark:hover:bg-zinc-750 active:scale-[0.99] transition-all cursor-pointer ${
                                                activeStudent && activeStudent.id === student.id 
                                                    ? 'border-[#FF7D46] ring-2 ring-[#FF7D46]/10'
                                                    : 'border-gray-200 dark:border-zinc-700'
                                            }`}
                                        >
                                            <div className="relative">
                                                {student.avatar ? (
                                                    <img className="size-10 rounded-full object-cover border border-gray-200 dark:border-zinc-700" src={student.avatar} alt={student.name} />
                                                ) : (
                                                    <div className="flex items-center justify-center size-10 rounded-full font-bold border bg-gray-250 dark:bg-zinc-700 text-gray-650 dark:text-gray-300 border-gray-300 dark:border-zinc-650">
                                                        {student.initials}
                                                    </div>
                                                )}
                                                {student.status === 'good' && (
                                                    <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                                                        <div className="size-2 rounded-full bg-emerald-500"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold truncate text-sm text-gray-900 dark:text-white">{student.name}</h4>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30">
                                                        {student.grade}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                                        {student.attendance} Attd.
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                        {student.lastActive}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Detailed student sheet */}
                            {activeStudent && (
                                <div className="flex flex-col bg-gray-50/50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800/80 rounded-[2rem] p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        {activeStudent.avatar ? (
                                            <img className="size-16 rounded-[1.25rem] object-cover border-2 border-white dark:border-zinc-700 shadow-md" src={activeStudent.avatar} alt={activeStudent.name} />
                                        ) : (
                                            <div className="flex items-center justify-center size-16 rounded-[1.25rem] font-bold text-2xl bg-orange-100 dark:bg-orange-950/30 text-[#FF7D46] border border-orange-200 dark:border-orange-900/40 shadow-sm">
                                                {activeStudent.initials}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-serif">{activeStudent.name}</h3>
                                            <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">Last active: {activeStudent.lastActive}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-150 dark:border-zinc-700/60 shadow-sm">
                                            <span className="text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-1">Attendance</span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">{activeStudent.attendance}</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-150 dark:border-zinc-700/60 shadow-sm">
                                            <span className="text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-1">Missing Work</span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {activeStudent.missing} assignments
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-150 dark:border-zinc-700/60 shadow-sm">
                                        <span className="text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-2">Subject Performance</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-bold text-gray-900 dark:text-white">{activeStudent.grade}</span>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-100 dark:bg-emerald-950/20 px-2 py-0.5 rounded">Passing</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-full mt-3 overflow-hidden">
                                            <div 
                                                className="bg-[#FF7D46] h-full rounded-full transition-all duration-500" 
                                                style={{ width: '92%' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button className="flex-1 py-3 px-4 rounded-xl bg-[#FF7D46] hover:bg-[#e06634] active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-[#FF7D46]/20 hover:shadow-[#FF7D46]/30 transition-all flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">mail</span>
                                            Message
                                        </button>
                                        <button className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.98] text-gray-700 dark:text-gray-300 text-sm font-bold transition-all flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                            Schedule
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </DialogContent>
        </Dialog>
    );
};
