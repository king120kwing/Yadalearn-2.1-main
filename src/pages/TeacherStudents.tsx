import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TeacherStudents = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    // Hardcoded mock data for now
    const students = [
        {
            id: 1,
            name: 'Liam Johnson',
            grade: '10th Grade',
            attendance: '98%',
            status: 'active',
            lastActive: '10m ago',
            avatar: 'https://i.pravatar.cc/150?u=liam',
            alerts: 2,
            stats: {
                assignments: { completed: 42, total: 45 },
                avgGrade: 'A-',
                participation: 'High'
            },
            email: 'liam.j@student.edu'
        },
        {
            id: 2,
            name: 'Emma Williams',
            grade: '11th Grade',
            attendance: '85%',
            status: 'active',
            lastActive: '2h ago',
            avatar: 'https://i.pravatar.cc/150?u=emma',
            alerts: 0,
            stats: {
                assignments: { completed: 38, total: 45 },
                avgGrade: 'B+',
                participation: 'Medium'
            },
            email: 'emma.w@student.edu'
        },
        {
            id: 3,
            name: 'Noah Brown',
            grade: '12th Grade',
            attendance: '62%',
            status: 'risk',
            lastActive: '1d ago',
            avatar: 'https://i.pravatar.cc/150?u=noah',
            alerts: 0,
            badge: 'RISK',
            stats: {
                assignments: { completed: 20, total: 45 },
                avgGrade: 'C',
                participation: 'Low'
            },
            email: 'noah.b@student.edu'
        },
        {
            id: 4,
            name: 'Olivia Davis',
            grade: '9th Grade',
            attendance: '95%',
            status: 'active',
            lastActive: 'Active now',
            avatar: 'https://i.pravatar.cc/150?u=olivia',
            alerts: 0,
            stats: {
                assignments: { completed: 15, total: 15 },
                avgGrade: 'A',
                participation: 'High'
            },
            email: 'olivia.d@student.edu'
        },
    ];

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'risk', label: 'At-Risk' },
        { id: 'overdue', label: 'Overdue' },
        { id: 'new', label: 'New' },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 pb-24">
            {/* Header */}
            {!selectedStudent ? (
                <>
                    <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-baseline gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
                                <span className="text-gray-500 font-medium">({students.length})</span>
                            </div>
                            <Button size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30">
                                <span className="material-symbols-outlined">add</span>
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                                <span className="material-symbols-outlined text-gray-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
                                />
                            </div>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {filters.map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${activeFilter === filter.id
                                            ? 'bg-purple-600 text-white shadow-purple-200 dark:shadow-purple-900/30'
                                            : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-500 shrink-0 ml-2">
                                <span className="material-symbols-outlined">filter_list</span>
                            </Button>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="px-4 space-y-3 py-4">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className="group bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer active:scale-95"
                            >
                                <div className="relative">
                                    <Avatar className="h-14 w-14 border-2 border-white dark:border-zinc-700 shadow-sm">
                                        <AvatarImage src={student.avatar} />
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-zinc-800 rounded-full ${student.lastActive.includes('now') ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{student.name}</h3>
                                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{student.lastActive}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">{student.grade}</span>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <span className={`font-semibold ${parseInt(student.attendance) < 70 ? 'text-red-500' : 'text-emerald-600'
                                            }`}>
                                            {student.attendance} Att.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {student.alerts > 0 && (
                                        <div className="w-6 h-6 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                                            {student.alerts}
                                        </div>
                                    )}
                                    {student.badge === 'RISK' && (
                                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                            Risk
                                        </span>
                                    )}
                                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                /* Detailed Student Preview */
                <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-background-light dark:bg-background-dark">
                    {/* Header */}
                    <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <h2 className="text-lg font-bold">Student Profile</h2>
                        </div>
                        <Button variant="ghost" className="text-purple-600 font-bold">Edit</Button>
                    </div>

                    <div className="px-4 pb-20 pt-4">
                        {/* Student Header */}
                        <div className="flex flex-col items-center mb-8">
                            <Avatar className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-lg mb-4">
                                <AvatarImage src={selectedStudent.avatar} />
                                <AvatarFallback>{selectedStudent.name[0]}</AvatarFallback>
                            </Avatar>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedStudent.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{selectedStudent.grade} • {selectedStudent.email}</p>

                            <div className="flex gap-3">
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 shadow-lg shadow-purple-200 dark:shadow-purple-900/30">
                                    Message
                                </Button>
                                <Button variant="outline" className="rounded-full px-6 border-gray-200 dark:border-gray-700">
                                    Report
                                </Button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <Card className="p-4 bg-white dark:bg-zinc-800 border-none shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.attendance}</span>
                                <span className="text-xs text-gray-400 font-bold uppercase">Attendance</span>
                            </Card>
                            <Card className="p-4 bg-white dark:bg-zinc-800 border-none shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined">grade</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.stats.avgGrade}</span>
                                <span className="text-xs text-gray-400 font-bold uppercase">Average Grade</span>
                            </Card>
                            <Card className="p-4 bg-white dark:bg-zinc-800 border-none shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined">assignment</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.stats.assignments.completed}/{selectedStudent.stats.assignments.total}</span>
                                <span className="text-xs text-gray-400 font-bold uppercase">Assignments</span>
                            </Card>
                            <Card className="p-4 bg-white dark:bg-zinc-800 border-none shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined">trending_up</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.stats.participation}</span>
                                <span className="text-xs text-gray-400 font-bold uppercase">Participation</span>
                            </Card>
                        </div>

                        {/* Recent Activity / Notes */}
                        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-4">Recent Notes</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Student showed great improvement in today's calculus session.</p>
                                        <span className="text-xs text-gray-400">Today, 10:30 AM</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Missed assignment deadline for Physics 101.</p>
                                        <span className="text-xs text-gray-400">Yesterday</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full mt-4 text-purple-600 font-bold">View All Notes</Button>
                        </div>
                    </div>
                </div>
            )}
            <BottomNav />
        </div>
    );
};

export default TeacherStudents;
