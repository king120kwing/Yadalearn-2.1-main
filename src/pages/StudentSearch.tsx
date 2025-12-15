import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

const StudentSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'teachers' | 'courses'>('teachers');
    const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

    // Mock Teachers Data with requested fields
    const teachers = [
        {
            id: 1,
            name: 'Mrs. Sarah Wilson',
            subject: 'IGCSE Mathematics',
            rating: 4.9,
            country: 'United Kingdom',
            flag: '🇬🇧',
            students: 1240,
            avatar: 'https://i.pravatar.cc/150?u=sarah',
            about: 'Specialized in IGCSE and A-Level Math with 10 years of experience.',
            availability: {
                days: ['Mon', 'Wed', 'Fri'],
                times: ['09:00 AM', '02:00 PM', '04:00 PM']
            },
            reviews: 86,
            performance: {
                successRate: 98,
                avgGrade: 'A*',
                completionRate: 99
            }
        },
        {
            id: 2,
            name: 'Mr. David Chen',
            subject: 'Mandarin Chinese',
            rating: 4.8,
            country: 'China',
            flag: '🇨🇳',
            students: 850,
            avatar: 'https://i.pravatar.cc/150?u=david',
            about: 'Native speaker helping students master conversational Mandarin.',
            availability: {
                days: ['Tue', 'Thu', 'Sat'],
                times: ['10:00 AM', '01:00 PM']
            },
            reviews: 54,
            performance: {
                successRate: 95,
                avgGrade: 'A',
                completionRate: 92
            }
        },
        {
            id: 3,
            name: 'Ms. Emily Davis',
            subject: 'IGCSE Physics',
            rating: 4.7,
            country: 'Canada',
            flag: '🇨🇦',
            students: 920,
            avatar: 'https://i.pravatar.cc/150?u=emily',
            about: 'Making Physics fun and understandable for everyone.',
            availability: {
                days: ['Mon', 'Tue', 'Fri'],
                times: ['11:00 AM', '03:00 PM']
            },
            reviews: 42,
            performance: {
                successRate: 94,
                avgGrade: 'B+',
                completionRate: 96
            }
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark pb-24">
            {/* Header */}
            {!selectedTeacher ? (
                <>
                    <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 pt-4 pb-3">
                        <h1 className="text-xl font-bold mb-3 text-text-light dark:text-text-dark">Find Your Tutor</h1>

                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800/50 border-2 border-transparent focus-within:border-emerald-500 rounded-xl px-4 py-3 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-gray-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Search by subject, name, or country..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-text-light dark:text-text-dark placeholder-gray-400 outline-none text-sm"
                                />
                                <span className="material-symbols-outlined text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors">tune</span>
                            </div>
                        </div>

                        {/* Scope Toggles */}
                        <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                            <button
                                onClick={() => setActiveTab('teachers')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'teachers' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}
                            >
                                Teachers
                            </button>
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'courses' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}
                            >
                                Courses
                            </button>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="px-4 py-4 space-y-4">
                        {teachers.map(teacher => (
                            <div
                                key={teacher.id}
                                onClick={() => setSelectedTeacher(teacher)}
                                className="bg-white dark:bg-zinc-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4 cursor-pointer hover:shadow-md transition-all active:scale-95"
                            >
                                <Avatar className="w-16 h-16 rounded-2xl border-2 border-white dark:border-zinc-700 shadow-sm">
                                    <AvatarImage src={teacher.avatar} />
                                    <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{teacher.name}</h3>
                                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
                                            <span className="material-symbols-outlined text-xs text-yellow-500 fill-current">star</span>
                                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{teacher.rating}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{teacher.subject}</p>

                                    <div className="flex items-center gap-3 text-xs font-medium">
                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-700 px-2 py-1 rounded-lg">
                                            <span>{teacher.flag}</span>
                                            <span>{teacher.country}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                                            <span className="material-symbols-outlined text-xs">group</span>
                                            <span>{teacher.students} Students</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                /* Teacher Full Preview Mode */
                <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-background-light dark:bg-background-dark">
                    {/* Nav Header */}
                    <div className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
                        <button
                            onClick={() => setSelectedTeacher(null)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-lg font-bold">Teacher Profile</h2>
                    </div>

                    <div className="px-4 pb-20 pt-4">
                        {/* Profile Header */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-4">
                                <Avatar className="w-28 h-28 rounded-3xl border-4 border-white dark:border-zinc-800 shadow-lg">
                                    <AvatarImage src={selectedTeacher.avatar} />
                                    <AvatarFallback>{selectedTeacher.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-md border-4 border-white dark:border-zinc-900">
                                    <span className="material-symbols-outlined text-lg">videocam</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedTeacher.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <span>{selectedTeacher.flag} {selectedTeacher.country}</span>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{selectedTeacher.subject}</span>
                            </div>

                            {/* Detailed Performance Analysis (New Request) */}
                            <Card className="w-full p-4 bg-white dark:bg-zinc-800 border-none shadow-sm mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Performance Analysis</h3>
                                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100 dark:divide-zinc-700">
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-600">{selectedTeacher.performance.successRate}%</div>
                                        <div className="text-[10px] text-gray-400 font-medium mt-1">Success Rate</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-600">{selectedTeacher.performance.avgGrade}</div>
                                        <div className="text-[10px] text-gray-400 font-medium mt-1">Avg Grade</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-600">{selectedTeacher.performance.completionRate}%</div>
                                        <div className="text-[10px] text-gray-400 font-medium mt-1">Completion</div>
                                    </div>
                                </div>
                            </Card>

                        </div>

                        {/* About Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-3">About</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                {selectedTeacher.about}
                            </p>
                        </div>

                        {/* Availability Preview */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Availability</h3>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Next 7 Days</span>
                            </div>

                            <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {selectedTeacher.availability.days.map((day: string, idx: number) => (
                                        <div key={idx} className="flex flex-col gap-2">
                                            <div className="text-center text-sm font-bold text-gray-400 mb-1">{day}</div>
                                            {selectedTeacher.availability.times.map((time: string) => (
                                                <div key={time} className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 py-2 rounded-lg text-center font-medium border border-emerald-100 dark:border-emerald-800/30">
                                                    {time}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg">
                                    Book a Session
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default StudentSearch;
