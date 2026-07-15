import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface BookClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId?: string;
}

export const BookClassModal = ({ isOpen, onClose, teacherId }: BookClassModalProps) => {
    const { user } = useAuth();
    const userId = user?.id;

    const [step, setStep] = useState(1);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [topics, setTopics] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && userId) {
            const fetchTeachers = async () => {
                try {
                    // 1. Fetch from teacher_student_links
                    const { data: linksData } = await supabase
                        .from('teacher_student_links')
                        .select('teacher_id')
                        .eq('student_id', userId)
                        .eq('status', 'accepted');

                    // 2. Fetch from bookings
                    const { data: bookingsData } = await supabase
                        .from('bookings')
                        .select('teacher_id')
                        .eq('student_id', userId);

                    const teacherIds = Array.from(new Set([
                        ...(linksData?.map(l => l.teacher_id) || []),
                        ...(bookingsData?.map(b => b.teacher_id) || [])
                    ].filter(Boolean)));

                    let profilesToMap = [];

                    if (teacherIds.length === 0) {
                        // Match the dashboard fallback logic!
                        const { data: fallbackProfiles } = await supabase
                            .from('profiles')
                            .select('id, full_name, subjects, avatar_url, teacher_profiles(min_rate)')
                            .eq('role', 'teacher')
                            .eq('onboarding_completed', true)
                            .limit(5);
                        profilesToMap = fallbackProfiles || [];
                    } else {
                        // 3. Fetch profiles for these teachers
                        const { data: profiles, error } = await supabase
                            .from('profiles')
                            .select('id, full_name, subjects, avatar_url, teacher_profiles(min_rate)')
                            .in('id', teacherIds);

                        if (error) throw error;
                        profilesToMap = profiles || [];
                    }

                    if (profilesToMap.length > 0) {
                        const mapped = profilesToMap.map((t: any) => {
                            const minRate = t.teacher_profiles?.min_rate || (Array.isArray(t.teacher_profiles) ? t.teacher_profiles[0]?.min_rate : null) || 45;
                            return ({
                                id: t.id,
                                name: t.subjects?.[0] || 'General Studies',
                                teacher: t.full_name,
                                avatar: t.avatar_url || 'https://i.pravatar.cc/150?u=' + t.id,
                                color: 'from-purple-400 to-indigo-400',
                                rate: minRate
                            });
                        });
                        setTopics(mapped);
                    }
                } catch (error) {
                    console.error('Error loading teachers:', error);
                }
            };
            fetchTeachers();
        }
    }, [isOpen, userId]);

    // Handle preselected teacher if provided
    useEffect(() => {
        if (isOpen && teacherId && topics.length > 0) {
            if (topics.some(t => t.id === teacherId)) {
                setSelectedTopic(teacherId);
            }
        }
    }, [isOpen, teacherId, topics]);

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'
    ];

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);
    
    const handleConfirm = async () => {
        if (!selectedTopic || !selectedDate || !selectedSlot || !userId) {
            alert('Please complete all selection steps first.');
            return;
        }
        const topicObj = topics.find(t => t.id === selectedTopic);
        if (!topicObj) return;

        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            const { error } = await supabase.from('bookings').insert({
                student_id: userId,
                teacher_id: topicObj.id,
                subject: topicObj.name,
                date: formattedDate,
                time: selectedSlot,
                status: 'confirmed'
            });

            if (error) throw error;

            alert('Class Booked Successfully! Confirmation has been added to your calendar.');
            onClose();
            setStep(1);
            window.location.reload();
        } catch (e: any) {
            console.error("Booking error:", e);
            alert("Failed to book class: " + e.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-3xl mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden rounded-[2.5rem] max-h-[85vh] flex flex-col shadow-2xl w-[95vw] md:w-full">
                <DialogTitle className="sr-only">Book a Class</DialogTitle>
                <DialogDescription className="sr-only">Schedule a new live video tutoring session with a qualified teacher.</DialogDescription>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book a Class</h2>
                    </div>
                    {/* Progress Steps */}
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step
                                        ? 'bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6]'
                                        : 'bg-gray-200 dark:bg-zinc-800'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {/* Step 1: Select Topic & Teacher */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Select a Teacher</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Choose a teacher you are registered with</p>
                            </div>
                            {topics.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 dark:text-gray-400">You are not currently registered with any teachers.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {topics.map((t) => (
                                        <div
                                            key={t.id}
                                            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedTopic === t.id
                                                    ? 'border-[#5B4A9F] bg-purple-50 dark:bg-purple-950/20 shadow-lg shadow-purple-100 dark:shadow-purple-900/20'
                                                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-md'
                                                }`}
                                            onClick={() => setSelectedTopic(t.id)}
                                        >
                                            <div className="flex flex-col items-center text-center gap-3">
                                                <div className={`relative size-16 rounded-full bg-gradient-to-br ${t.color} p-0.5`}>
                                                    <Avatar className="size-full border-2 border-white dark:border-zinc-900">
                                                        <AvatarImage src={t.avatar} />
                                                        <AvatarFallback className="bg-white dark:bg-zinc-800">{t.teacher[0]}</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-base">{t.name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{t.teacher}</p>
                                                </div>
                                                {selectedTopic === t.id && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="size-6 rounded-full bg-[#5B4A9F] flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Select Date & Time */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Select Date & Time</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Pick your preferred schedule</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Calendar */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Choose Date</label>
                                    <div className="border-2 border-gray-200 dark:border-zinc-800 rounded-2xl p-3 bg-gray-50 dark:bg-zinc-800/30">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                                {/* Time Slots */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Available Time Slots</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {timeSlots.map(slot => (
                                            <button
                                                key={slot}
                                                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${selectedSlot === slot
                                                        ? 'bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6] text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-850'
                                                    }`}
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className="space-y-6 text-center py-6">
                            <div className="size-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-100 dark:shadow-purple-900/25">
                                <span className="material-symbols-outlined text-5xl text-[#5B4A9F] dark:text-[#8F81D6]" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Your Booking</h3>
                                <p className="text-gray-600 dark:text-gray-400">Please review the details below</p>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800/40 dark:to-zinc-900/40 p-6 rounded-2xl max-w-md mx-auto text-left space-y-4 border border-gray-200 dark:border-zinc-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">Subject</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{topics.find(t => t.id === selectedTopic)?.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">Teacher</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{topics.find(t => t.id === selectedTopic)?.teacher}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">Date</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{selectedDate?.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">Time</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{selectedSlot}</span>
                                </div>
                                <div className="border-t-2 border-gray-200 dark:border-zinc-800 pt-4 flex justify-between items-center">
                                    <span className="text-gray-900 dark:text-white font-bold text-base">Total Price</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6] bg-clip-text text-transparent">
                                        ${topics.find(t => t.id === selectedTopic)?.rate || 45}.00
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-850 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/30">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="px-5 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                            ← Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 && !selectedTopic || step === 2 && (!selectedDate || !selectedSlot)}
                            className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${(step === 1 && !selectedTopic) || (step === 2 && (!selectedDate || !selectedSlot))
                                    ? 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-650 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6] hover:from-[#4a3b8c] hover:to-[#8274cf] text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                                }`}
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6] hover:from-[#4a3b8c] hover:to-[#8274cf] text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30 transition-all duration-200"
                        >
                            Confirm Booking ✓
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
