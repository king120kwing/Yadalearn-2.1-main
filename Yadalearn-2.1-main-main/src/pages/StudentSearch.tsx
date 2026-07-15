import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const mockTeachers = [
    {
        id: 'mock-1',
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
        id: 'mock-2',
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
        id: 'mock-3',
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

const StudentSearch = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'teachers' | 'courses'>('teachers');
    const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingSubject, setBookingSubject] = useState('');
    const [paymentAffirmed, setPaymentAffirmed] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        if (selectedTeacher) {
            setBookingSubject(selectedTeacher.subject?.split(',')[0] || '');
        }
    }, [selectedTeacher]);

    useEffect(() => {
        async function fetchTeachers() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select(`
                        id,
                        email,
                        full_name,
                        avatar_url,
                        subjects,
                        country,
                        bio,
                        teacher_profiles (
                            teaching_focus,
                            language_specialization,
                            subject_specialization,
                            teaching_level,
                            teaching_approach,
                            lesson_format,
                            availability,
                            min_rate,
                            max_rate,
                            grade_level_focus,
                            teaching_style,
                            class_type,
                            schedule
                        )
                    `)
                    .eq('role', 'teacher')
                    .eq('onboarding_completed', true);

                if (error) {
                    console.error("Error fetching teachers:", error);
                    return;
                }

                const dbTeachers = data ? data.map((t: any) => {
                    const tp = t.teacher_profiles || {};
                    const subjectsList = [];
                    if (tp.language_specialization) subjectsList.push(...tp.language_specialization);
                    if (tp.subject_specialization) subjectsList.push(...tp.subject_specialization);
                    if (subjectsList.length === 0 && t.subjects) subjectsList.push(...t.subjects);
                    
                    const days = tp.availability === 'Both' ? ['Mon', 'Wed', 'Fri', 'Sat'] :
                                 tp.availability === 'Weekdays' ? ['Mon', 'Wed', 'Fri'] :
                                 tp.availability === 'Weekends' ? ['Sat', 'Sun'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

                    const countryName = t.country || 'Global';
                    const flagEmoji = countryName === 'Myanmar' ? '🇲🇲' : 
                                      countryName === 'Indonesia' ? '🇮🇩' : 
                                      countryName === 'United Kingdom' ? '🇬🇧' : 
                                      countryName === 'Canada' ? '🇨🇦' : 
                                      countryName === 'China' ? '🇨🇳' : '🌐';

                    return {
                        id: t.id,
                        name: t.full_name || 'Teacher',
                        subject: subjectsList.length > 0 ? subjectsList.join(', ') : 'General Tutor',
                        rating: 4.9,
                        country: countryName,
                        flag: flagEmoji,
                        students: 12,
                        avatar: t.avatar_url || `https://i.pravatar.cc/150?u=${t.id}`,
                        about: t.bio || tp.teaching_approach || 'Experienced tutor.',
                        availability: {
                            days: days,
                            times: ['09:00 AM', '02:00 PM', '04:00 PM']
                        },
                        reviews: 8,
                        performance: {
                            successRate: 98,
                            avgGrade: 'A*',
                            completionRate: 99
                        },
                        hourlyRate: tp.min_rate || 20,
                        minRate: tp.min_rate,
                        maxRate: tp.max_rate,
                        teachingStyle: tp.teaching_style || tp.teaching_approach || 'Standard',
                        lessonFormat: tp.lesson_format || tp.class_type || 'One-on-one'
                    };
                }) : [];

                if (dbTeachers.length > 0) {
                    setTeachers(dbTeachers);
                } else {
                    setTeachers([]);
                }
            } catch (err) {
                console.error("Unexpected error fetching teachers:", err);
                setTeachers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchTeachers();
    }, []);

    const handleConfirmBooking = async () => {
        if (!user?.id) {
            alert("Please log in to book a session.");
            return;
        }
        if (!bookingDate || !bookingTime || !bookingSubject) {
            alert("Please fill in all booking details (date, time, subject).");
            return;
        }
        if (!paymentAffirmed) {
            alert("You must affirm that you agree to the payment terms.");
            return;
        }

        setBookingLoading(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .insert({
                    student_id: user.id,
                    teacher_id: selectedTeacher.id,
                    subject: bookingSubject,
                    date: bookingDate,
                    time: bookingTime,
                    status: 'pending'
                });

            if (error) throw error;

            alert(`🎉 Success! Your booking request for ${bookingSubject} has been sent to ${selectedTeacher.name}. They will review and confirm your registration.`);
            setIsBookingModalOpen(false);
            // Reset form
            setBookingDate('');
            setBookingTime('');
            setBookingSubject('');
            setPaymentAffirmed(false);
        } catch (err: any) {
            console.error('Error creating booking:', err);
            alert('Failed to submit booking: ' + err.message);
        } finally {
            setBookingLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(t => {
        const q = searchQuery.toLowerCase();
        return (
            t.name.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            t.country.toLowerCase().includes(q) ||
            (t.about && t.about.toLowerCase().includes(q))
        );
    });

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
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            </div>
                        ) : filteredTeachers.length > 0 ? (
                            filteredTeachers.map(teacher => (
                                <div
                                    key={teacher.id}
                                    onClick={() => setSelectedTeacher(teacher)}
                                    className="bg-white dark:bg-zinc-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4 cursor-pointer hover:shadow-md transition-all active:scale-95 text-left"
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
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">No teachers found matching your search.</div>
                        )}
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
                                <button 
                                    onClick={() => setIsBookingModalOpen(true)}
                                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg"
                                >
                                    Book a Session
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {isBookingModalOpen && selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-2xl border border-gray-150 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Book a Tutor Registration</h3>
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Teacher Summary Panel */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-3xl mb-6 border border-slate-100 dark:border-zinc-800/80">
                            <Avatar className="w-16 h-16 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-sm shrink-0">
                                <AvatarImage src={selectedTeacher.avatar} />
                                <AvatarFallback className="bg-emerald-500 text-white font-bold">{selectedTeacher.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                <h4 className="font-extrabold text-slate-850 dark:text-white text-base">{selectedTeacher.name}</h4>
                                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">{selectedTeacher.flag} From {selectedTeacher.country}</p>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">Rate: ${selectedTeacher.hourlyRate}/hr</p>
                            </div>
                        </div>

                        {/* About/Bio Block */}
                        <div className="mb-6 text-left">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About the Teacher</h4>
                            <p className="text-xs font-medium text-slate-655 dark:text-zinc-405 leading-relaxed bg-slate-50/50 dark:bg-zinc-950/20 p-3 rounded-2xl border border-slate-100/50 dark:border-zinc-850 italic">
                                "{selectedTeacher.about || 'Experienced tutor dedicated to student success.'}"
                            </p>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Subject</label>
                                <input
                                    type="text"
                                    value={bookingSubject}
                                    onChange={(e) => setBookingSubject(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                    placeholder="e.g. Mathematics"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Date</label>
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Time Slot</label>
                                    <select
                                        value={bookingTime}
                                        onChange={(e) => setBookingTime(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                    >
                                        <option value="" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-white">Select a time</option>
                                        {selectedTeacher.availability.times.map((t: string) => (
                                            <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-white">{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Payment Affirmation */}
                            <div className="rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/10 p-4 border border-emerald-100/50 dark:border-emerald-900/20 mt-2">
                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={paymentAffirmed}
                                        onChange={(e) => setPaymentAffirmed(e.target.checked)}
                                        className="mt-1 h-4.5 w-4.5 rounded border-gray-350 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                    />
                                    <div className="text-xs font-semibold text-slate-700 dark:text-zinc-350 leading-relaxed text-left">
                                        I agree to book this session with <span className="font-bold text-slate-850 dark:text-white">{selectedTeacher.name}</span> and authorize a registration holding fee of <span className="font-bold text-slate-850 dark:text-white">${selectedTeacher.hourlyRate}/hr</span> according to terms of service.
                                    </div>
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={handleConfirmBooking}
                                    disabled={bookingLoading || !paymentAffirmed || !bookingDate || !bookingTime || !bookingSubject}
                                    className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-center text-sm font-bold text-white shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {bookingLoading ? "Booking..." : "Confirm & Book"}
                                </Button>
                                <Button
                                    onClick={() => setIsBookingModalOpen(false)}
                                    disabled={bookingLoading}
                                    className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </Button>
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
