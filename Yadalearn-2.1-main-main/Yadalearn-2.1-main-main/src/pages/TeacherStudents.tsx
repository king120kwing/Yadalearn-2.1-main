import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MessageTeacherModal } from '@/features/student/quick-actions/MessageTeacherModal';
import { cn } from '@/lib/utils';

const countries = [
    { name: "Afghanistan", emoji: "🇦🇫" },
    { name: "Albania", emoji: "🇦🇱" },
    { name: "Algeria", emoji: "🇩🇿" },
    { name: "Andorra", emoji: "🇦🇩" },
    { name: "Angola", emoji: "🇦🇴" },
    { name: "Antigua and Barbuda", emoji: "🇦🇬" },
    { name: "Argentina", emoji: "🇦🇷" },
    { name: "Armenia", emoji: "🇦🇲" },
    { name: "Australia", emoji: "🇦🇺" },
    { name: "Austria", emoji: "🇦🇹" },
    { name: "Azerbaijan", emoji: "🇦🇿" },
    { name: "Bahamas", emoji: "🇧🇸" },
    { name: "Bahrain", emoji: "🇧🇭" },
    { name: "Bangladesh", emoji: "🇧🇩" },
    { name: "Barbados", emoji: "🇧🇧" },
    { name: "Belarus", emoji: "🇧🇾" },
    { name: "Belgium", emoji: "🇧🇪" },
    { name: "Belize", emoji: "🇧🇿" },
    { name: "Benin", emoji: "🇧🇯" },
    { name: "Bhutan", emoji: "🇧🇹" },
    { name: "Bolivia", emoji: "🇧🇴" },
    { name: "Bosnia and Herzegovina", emoji: "🇧🇦" },
    { name: "Botswana", emoji: "🇧🇼" },
    { name: "Brazil", emoji: "🇧🇷" },
    { name: "Brunei", emoji: "🇧🇳" },
    { name: "Bulgaria", emoji: "🇧🇬" },
    { name: "Burkina Faso", emoji: "🇧🇫" },
    { name: "Burundi", emoji: "🇧🇮" },
    { name: "Cabo Verde", emoji: "🇨🇻" },
    { name: "Cambodia", emoji: "🇰🇭" },
    { name: "Cameroon", emoji: "🇨🇲" },
    { name: "Canada", emoji: "🇨🇦" },
    { name: "Central African Republic", emoji: "🇨🇫" },
    { name: "Chad", emoji: "🇹🇩" },
    { name: "Chile", emoji: "🇨🇱" },
    { name: "China", emoji: "🇨🇳" },
    { name: "Colombia", emoji: "🇨🇴" },
    { name: "Comoros", emoji: "🇰🇲" },
    { name: "Congo", emoji: "🇨🇬" },
    { name: "Costa Rica", emoji: "🇨🇷" },
    { name: "Croatia", emoji: "🇭🇷" },
    { name: "Cuba", emoji: "🇨🇺" },
    { name: "Cyprus", emoji: "🇨🇾" },
    { name: "Czechia", emoji: "🇨🇿" },
    { name: "DR Congo", emoji: "🇨🇩" },
    { name: "Denmark", emoji: "🇩🇰" },
    { name: "Djibouti", emoji: "🇩🇯" },
    { name: "Dominica", emoji: "🇩🇲" },
    { name: "Dominican Republic", emoji: "🇩🇴" },
    { name: "Ecuador", emoji: "🇪🇨" },
    { name: "Egypt", emoji: "🇪🇬" },
    { name: "El Salvador", emoji: "🇸🇻" },
    { name: "Equatorial Guinea", emoji: "🇬🇶" },
    { name: "Eritrea", emoji: "🇪🇷" },
    { name: "Estonia", emoji: "🇪🇪" },
    { name: "Eswatini", emoji: "🇸🇿" },
    { name: "Ethiopia", emoji: "🇪🇹" },
    { name: "Fiji", emoji: "🇫🇯" },
    { name: "Finland", emoji: "🇫🇮" },
    { name: "France", emoji: "🇫🇷" },
    { name: "Gabon", emoji: "🇬🇦" },
    { name: "Gambia", emoji: "🇬🇲" },
    { name: "Georgia", emoji: "🇬🇪" },
    { name: "Germany", emoji: "🇩🇪" },
    { name: "Ghana", emoji: "🇬🇭" },
    { name: "Greece", emoji: "🇬🇷" },
    { name: "Grenada", emoji: "🇬🇩" },
    { name: "Guatemala", emoji: "🇬🇹" },
    { name: "Guinea", emoji: "🇬🇳" },
    { name: "Guinea-Bissau", emoji: "🇬🇼" },
    { name: "Guyana", emoji: "🇬🇾" },
    { name: "Haiti", emoji: "🇭🇹" },
    { name: "Honduras", emoji: "🇭🇳" },
    { name: "Hungary", emoji: "🇭🇺" },
    { name: "Iceland", emoji: "🇮🇸" },
    { name: "India", emoji: "🇮🇳" },
    { name: "Indonesia", emoji: "🇮🇩" },
    { name: "Iran", emoji: "🇮🇷" },
    { name: "Iraq", emoji: "🇮🇶" },
    { name: "Ireland", emoji: "🇮🇪" },
    { name: "Italy", emoji: "🇮🇹" },
    { name: "Jamaica", emoji: "🇯🇲" },
    { name: "Japan", emoji: "🇯🇵" },
    { name: "Jordan", emoji: "🇯🇴" },
    { name: "Kazakhstan", emoji: "🇰🇿" },
    { name: "Kenya", emoji: "🇰🇪" },
    { name: "Kiribati", emoji: "🇰🇮" },
    { name: "Kuwait", emoji: "🇰🇼" },
    { name: "Kyrgyzstan", emoji: "🇰🇬" },
    { name: "Laos", emoji: "🇱🇦" },
    { name: "Latvia", emoji: "🇱🇻" },
    { name: "Lebanon", emoji: "🇱🇧" },
    { name: "Lesotho", emoji: "🇱🇸" },
    { name: "Liberia", emoji: "🇱🇷" },
    { name: "Libya", emoji: "🇱🇾" },
    { name: "Liechtenstein", emoji: "🇱🇮" },
    { name: "Lithuania", emoji: "🇱🇹" },
    { name: "Luxembourg", emoji: "🇱🇺" },
    { name: "Madagascar", emoji: "🇲🇬" },
    { name: "Malawi", emoji: "🇲🇼" },
    { name: "Malaysia", emoji: "🇲🇾" },
    { name: "Maldives", emoji: "🇲🇻" },
    { name: "Mali", emoji: "🇲🇱" },
    { name: "Malta", emoji: "🇲🇹" },
    { name: "Marshall Islands", emoji: "🇲🇭" },
    { name: "Mauritania", emoji: "🇲🇷" },
    { name: "Mauritius", emoji: "🇲🇺" },
    { name: "Mexico", emoji: "🇲🇽" },
    { name: "Micronesia", emoji: "🇫🇲" },
    { name: "Moldova", emoji: "🇲🇩" },
    { name: "Monaco", emoji: "🇲🇨" },
    { name: "Mongolia", emoji: "🇲🇳" },
    { name: "Montenegro", emoji: "🇲🇪" },
    { name: "Morocco", emoji: "🇲🇦" },
    { name: "Mozambique", emoji: "🇲🇿" },
    { name: "Myanmar", emoji: "🇲🇲" },
    { name: "Namibia", emoji: "🇳🇦" },
    { name: "Nauru", emoji: "🇳🇷" },
    { name: "Nepal", emoji: "🇳🇵" },
    { name: "Netherlands", emoji: "🇳🇱" },
    { name: "New Zealand", emoji: "🇳🇿" },
    { name: "Nicaragua", emoji: "🇳🇮" },
    { name: "Niger", emoji: "🇳🇪" },
    { name: "Nigeria", emoji: "🇳🇬" },
    { name: "North Korea", emoji: "🇰🇵" },
    { name: "North Macedonia", emoji: "🇲🇰" },
    { name: "Norway", emoji: "🇳🇴" },
    { name: "Oman", emoji: "🇴🇲" },
    { name: "Pakistan", emoji: "🇵🇰" },
    { name: "Palau", emoji: "🇵🇼" },
    { name: "Palestine", emoji: "🇵🇸" },
    { name: "Panama", emoji: "🇵🇦" },
    { name: "Papua New Guinea", emoji: "🇵🇬" },
    { name: "Paraguay", emoji: "🇵🇾" },
    { name: "Peru", emoji: "🇵🇪" },
    { name: "Philippines", emoji: "🇵🇭" },
    { name: "Poland", emoji: "🇵🇱" },
    { name: "Portugal", emoji: "🇵🇹" },
    { name: "Qatar", emoji: "🇶🇦" },
    { name: "Romania", emoji: "🇷🇴" },
    { name: "Russia", emoji: "🇷🇺" },
    { name: "Rwanda", emoji: "🇷🇼" },
    { name: "Saint Kitts and Nevis", emoji: "🇰🇳" },
    { name: "Saint Lucia", emoji: "🇱🇨" },
    { name: "Saint Vincent", emoji: "🇻🇨" },
    { name: "Samoa", emoji: "🇼🇸" },
    { name: "San Marino", emoji: "🇸🇲" },
    { name: "Sao Tome and Principe", emoji: "🇸🇹" },
    { name: "Saudi Arabia", emoji: "🇸🇦" },
    { name: "Senegal", emoji: "🇸🇳" },
    { name: "Serbia", emoji: "🇷🇸" },
    { name: "Seychelles", emoji: "🇸🇨" },
    { name: "Sierra Leone", emoji: "🇸🇱" },
    { name: "Singapore", emoji: "🇸🇬" },
    { name: "Slovakia", emoji: "🇸🇰" },
    { name: "Slovenia", emoji: "🇸🇮" },
    { name: "Solomon Islands", emoji: "🇸🇧" },
    { name: "Somalia", emoji: "🇸🇴" },
    { name: "South Africa", emoji: "🇿🇦" },
    { name: "South Korea", emoji: "🇰🇷" },
    { name: "South Sudan", emoji: "🇸🇸" },
    { name: "Spain", emoji: "🇪🇸" },
    { name: "Sri Lanka", emoji: "🇱🇰" },
    { name: "Sudan", emoji: "🇸🇩" },
    { name: "Suriname", emoji: "🇸🇷" },
    { name: "Sweden", emoji: "🇸🇪" },
    { name: "Switzerland", emoji: "🇨🇭" },
    { name: "Syria", emoji: "🇸🇾" },
    { name: "Tajikistan", emoji: "🇹🇯" },
    { name: "Tanzania", emoji: "🇹🇿" },
    { name: "Thailand", emoji: "🇹🇭" },
    { name: "Timor-Leste", emoji: "🇹🇱" },
    { name: "Togo", emoji: "🇹🇬" },
    { name: "Tonga", emoji: "🇹🇴" },
    { name: "Trinidad and Tobago", emoji: "🇹🇹" },
    { name: "Tunisia", emoji: "🇹🇳" },
    { name: "Turkey", emoji: "🇹🇷" },
    { name: "Turkmenistan", emoji: "🇹🇲" },
    { name: "Tuvalu", emoji: "🇹🇻" },
    { name: "Uganda", emoji: "🇺🇬" },
    { name: "Ukraine", emoji: "🇺🇦" },
    { name: "United Arab Emirates", emoji: "🇦🇪" },
    { name: "United Kingdom", emoji: "🇬🇧" },
    { name: "United States", emoji: "🇺🇸" },
    { name: "Uruguay", emoji: "🇺🇾" },
    { name: "Uzbekistan", emoji: "🇺🇿" },
    { name: "Vanuatu", emoji: "🇻🇺" },
    { name: "Venezuela", emoji: "🇻🇪" },
    { name: "Vietnam", emoji: "🇻🇳" },
    { name: "Yemen", emoji: "🇾🇪" },
    { name: "Zambia", emoji: "🇿🇲" },
    { name: "Zimbabwe", emoji: "🇿🇼" }
];

const getCountryEmoji = (countryName: string) => {
    const found = countries.find(c => c.name.toLowerCase() === countryName?.toLowerCase());
    return found ? found.emoji : '🌐';
};

const TeacherStudents = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [currentTab, setCurrentTab] = useState<'my-students' | 'search-match'>('my-students');
    const [selectedStudentIdForChat, setSelectedStudentIdForChat] = useState<string | undefined>(undefined);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Search and Match State
    const [searchSubject, setSearchSubject] = useState('');
    const [searchCountry, setSearchCountry] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);
    const [sentRequests, setSentRequests] = useState<string[]>([]);

    const { topStudents: students, loading } = useTeacherDashboardData();
    const { user } = useAuth();
    const userId = user?.id;

    const handleSearchStudents = async () => {
        try {
            setSearchLoading(true);
            let query = supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student');

            if (searchCountry) {
                query = query.eq('country', searchCountry);
            }
            if (searchQuery.trim()) {
                query = query.ilike('full_name', `%${searchQuery.trim()}%`);
            }

            const { data, error } = await query;
            if (error) throw error;

            const list = data || [];
            // Filter by subject client-side for fuzzy overlap matching
            const matched = list.filter(student => {
                const studentSubjects = student.subjects || [];
                return !searchSubject.trim() || studentSubjects.some((s: string) => s.toLowerCase().includes(searchSubject.toLowerCase()));
            });

            // Fetch already sent requests to avoid duplicates
            if (userId) {
                const { data: existingRequests } = await supabase
                    .from('connection_requests')
                    .select('student_id')
                    .eq('teacher_id', userId);
                
                const requestIds = (existingRequests || []).map((r: any) => r.student_id);
                setSentRequests(requestIds);
            }

            setSearchResults(matched);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setSearchLoading(false);
        }
    };

    // Debounce search effect to instantly trigger search on typing initials or filters
    useEffect(() => {
        if (currentTab === 'search-match') {
            const delayDebounceFn = setTimeout(() => {
                handleSearchStudents();
            }, 300); // 300ms debounce
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchQuery, searchSubject, searchCountry, currentTab, userId]);

    const handleSendRequest = async (studentId: string) => {
        if (!userId) {
            alert("Please log in first.");
            return;
        }
        try {
            setSendingRequestId(studentId);
            const { error } = await supabase
                .from('connection_requests')
                .insert({
                    teacher_id: userId,
                    student_id: studentId,
                    status: 'pending'
                });

            if (error) throw error;

            setSentRequests(prev => [...prev, studentId]);
            alert("Connection request sent successfully!");
        } catch (err) {
            console.error("Error sending connection request:", err);
            alert("Failed to send request.");
        } finally {
            setSendingRequestId(null);
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to end the contract and delete this student? All bookings will be deleted.");
        if (!confirmDelete) return;

        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('student_id', studentId)
                .eq('teacher_id', userId);

            if (error) {
                console.error("Error deleting student contract:", error);
                alert("Failed to delete student contract.");
            } else {
                alert("Student contract terminated successfully.");
                setSelectedStudent(null);
                window.location.reload();
            }
        } catch (err) {
            console.error("Unexpected error ending contract:", err);
        }
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'risk', label: 'At-Risk' },
        { id: 'overdue', label: 'Overdue' },
        { id: 'new', label: 'New' },
    ];

    const filteredStudents = students.filter(student => {
        // Search query filter
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             student.id.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Active filter
        if (activeFilter === 'risk') return matchesSearch && student.status === 'risk';
        if (activeFilter === 'overdue') return matchesSearch && student.alerts > 0;
        if (activeFilter === 'new') return matchesSearch && student.sessionsCompleted === 0;
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 pb-24">
            {/* Header */}
            {!selectedStudent ? (
                <>
                    <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-baseline gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
                                <span className="text-gray-500 font-medium">
                                    ({currentTab === 'my-students' ? filteredStudents.length : searchResults.length})
                                </span>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-xl border border-gray-200 dark:border-zinc-700/60 mb-1">
                            <button
                                onClick={() => setCurrentTab('my-students')}
                                className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all ${currentTab === 'my-students'
                                    ? 'bg-[#FF7D46] text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                My Students
                            </button>
                            <button
                                onClick={() => setCurrentTab('search-match')}
                                className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all ${currentTab === 'search-match'
                                    ? 'bg-[#FF7D46] text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Find New Students
                            </button>
                        </div>
                    </div>

                    {currentTab === 'my-students' ? (
                        <>
                            {/* original filter and search UI */}
                            <div className="px-4 pt-4">
                                <div className="relative mb-4">
                                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#FF7D46] transition-all">
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

                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {filters.map(filter => (
                                            <button
                                                key={filter.id}
                                                onClick={() => setActiveFilter(filter.id)}
                                                className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${activeFilter === filter.id
                                                    ? 'bg-[#FF7D46] text-white shadow-orange-100 dark:shadow-orange-950/20'
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
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7D46]"></div>
                                    </div>
                                ) : filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            onClick={() => setSelectedStudent(student)}
                                            className="group bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer active:scale-95 text-left"
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
                                                    <span className="font-semibold text-emerald-600">
                                                        {student.attendance || '100%'} Att.
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500">No matching students found.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="px-4 py-6">
                            {/* Search and Match Form */}
                            <div className="space-y-4 mb-6">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-orange-400 pl-1">Student Name</label>
                                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#FF7D46] transition-all">
                                        <span className="material-symbols-outlined text-gray-400">person</span>
                                        <input
                                            type="text"
                                            placeholder="What is their name?"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-orange-400 pl-1">Subject Focus</label>
                                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#FF7D46] transition-all">
                                        <span className="material-symbols-outlined text-gray-400">book</span>
                                        <input
                                            type="text"
                                            placeholder="What subject? e.g. English, Math, Physics..."
                                            value={searchSubject}
                                            onChange={(e) => setSearchSubject(e.target.value)}
                                            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-orange-400 pl-1">Jurisdiction / Country</label>
                                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#FF7D46] transition-all">
                                        <span className="material-symbols-outlined text-gray-400">public</span>
                                        <select
                                            value={searchCountry}
                                            onChange={(e) => setSearchCountry(e.target.value)}
                                            className="flex-1 bg-transparent text-gray-900 dark:text-white outline-none text-base font-semibold border-0 cursor-pointer pr-4"
                                        >
                                            <option value="" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">All Jurisdictions / Global</option>
                                            {countries.map(c => (
                                                <option key={c.name} value={c.name} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                                                    {c.name} {c.emoji}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleSearchStudents}
                                    disabled={searchLoading}
                                    className="w-full bg-[#FF7D46] hover:bg-[#e06530] text-white font-bold h-13 rounded-xl transition-all shadow-md shadow-orange-500/10 active:scale-98 flex items-center justify-center gap-2"
                                >
                                    {searchLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">search</span>
                                            Search Jurisdiction
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Search Results List */}
                            <div className="space-y-4">
                                {searchResults.length > 0 ? (
                                    searchResults.map((student) => {
                                        const isSent = sentRequests.includes(student.id);
                                        return (
                                            <div
                                                key={student.id}
                                                className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-gray-200 dark:border-zinc-700 shadow-sm flex items-center gap-4 text-left"
                                            >
                                                <Avatar className="h-14 w-14 border-2 border-orange-100 dark:border-zinc-700">
                                                    <AvatarImage src={student.avatar_url || `https://i.pravatar.cc/150?u=${student.id}`} />
                                                    <AvatarFallback>{student.full_name?.charAt(0) || 'S'}</AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{student.full_name || 'Student'}</h3>
                                                        <span className="text-lg">
                                                            {getCountryEmoji(student.country)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{student.country || 'Global'}</p>
                                                    
                                                    <div className="flex flex-wrap gap-1">
                                                        {(student.subjects || []).map((sub: string, idx: number) => (
                                                            <span key={idx} className="px-2 py-0.5 rounded-full bg-[#FF7D46]/10 dark:bg-[#FF7D46]/20 text-[#FF7D46] dark:text-orange-400 text-[10px] font-bold">
                                                                {sub}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => handleSendRequest(student.id)}
                                                    disabled={isSent || sendingRequestId === student.id}
                                                    className={`h-9 px-4 rounded-lg font-bold text-xs transition-all ${
                                                        isSent 
                                                            ? 'bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-zinc-650 cursor-not-allowed'
                                                            : 'bg-[#FF7D46] hover:bg-[#e06530] text-white shadow-sm'
                                                    }`}
                                                >
                                                    {sendingRequestId === student.id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    ) : isSent ? (
                                                        'Requested'
                                                    ) : (
                                                        'Connect'
                                                    )}
                                                </Button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-850/50">
                                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">search</span>
                                        <p className="text-xs font-bold">Search above to find students by subject and jurisdiction.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
                        <Button variant="ghost" className="text-[#FF7D46] font-bold">Edit</Button>
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
                                <Button 
                                    onClick={() => {
                                        setSelectedStudentIdForChat(selectedStudent.id);
                                        setIsChatOpen(true);
                                    }}
                                    className="bg-[#FF7D46] hover:bg-[#e06530] text-white rounded-full px-6 shadow-lg shadow-orange-100 dark:shadow-orange-950/20"
                                >
                                    Message
                                </Button>
                                <Button 
                                    onClick={() => handleDeleteStudent(selectedStudent.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 shadow-lg shadow-red-200 dark:shadow-red-900/30"
                                >
                                    End Contract
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
                                    <div className="w-10 h-10 rounded-full bg-[#FF7D46]/10 dark:bg-[#FF7D46]/20 text-[#FF7D46] flex items-center justify-center mb-2">
                                        <span className="material-symbols-outlined">assignment</span>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.stats.assignments.completed}/{selectedStudent.stats.assignments.total}</span>
                                    <span className="text-xs text-gray-400 font-bold uppercase">Assignments</span>
                                </Card>
                                <Card className="p-4 bg-white dark:bg-zinc-800 border-none shadow-sm flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-[#FF7D46] flex items-center justify-center mb-2">
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
                                <Button variant="ghost" className="w-full mt-4 text-[#FF7D46] font-bold">View All Notes</Button>
                            </div>
                    </div>
                </div>
            )}
            <BottomNav />
            <MessageTeacherModal
                isOpen={isChatOpen}
                onClose={() => { setIsChatOpen(false); setSelectedStudentIdForChat(undefined); }}
                recipientId={selectedStudentIdForChat}
            />
        </div>
    );
};

export default TeacherStudents;
