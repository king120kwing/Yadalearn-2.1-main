import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';

interface BookClassModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BookClassModal = ({ isOpen, onClose }: BookClassModalProps) => {
    const [step, setStep] = useState(1);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const topics = [
        { id: 'math', name: 'Mathematics', teacher: 'Mr. Wilson', avatar: 'https://i.pravatar.cc/150?u=wilson', color: 'from-blue-400 to-cyan-400' },
        { id: 'sci', name: 'Physics', teacher: 'Ms. Davis', avatar: 'https://i.pravatar.cc/150?u=davis', color: 'from-purple-400 to-pink-400' },
        { id: 'spa', name: 'Spanish', teacher: 'Mrs. Garcia', avatar: 'https://i.pravatar.cc/150?u=garcia', color: 'from-orange-400 to-red-400' },
    ];

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'
    ];

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);
    const handleConfirm = () => {
        alert('Class Booked Successfully! Confirmation sent to your email.');
        onClose();
        setStep(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book a Class</h2>
                        <button
                            onClick={onClose}
                            className="size-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-500">close</span>
                        </button>
                    </div>
                    {/* Progress Steps */}
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step
                                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                                        : 'bg-gray-200 dark:bg-gray-700'
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
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Select Topic & Teacher</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Choose the subject you'd like to learn</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {topics.map((t) => (
                                    <div
                                        key={t.id}
                                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedTopic === t.id
                                                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                                            }`}
                                        onClick={() => setSelectedTopic(t.id)}
                                    >
                                        <div className="flex flex-col items-center text-center gap-3">
                                            <div className={`relative size-16 rounded-full bg-gradient-to-br ${t.color} p-0.5`}>
                                                <Avatar className="size-full border-2 border-white dark:border-gray-900">
                                                    <AvatarImage src={t.avatar} />
                                                    <AvatarFallback className="bg-white dark:bg-gray-800">{t.teacher[0]}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-base">{t.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{t.teacher}</p>
                                            </div>
                                            {selectedTopic === t.id && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="size-6 rounded-full bg-emerald-400 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-3 bg-gray-50 dark:bg-gray-800/50">
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
                                                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
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
                            <div className="size-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20">
                                <span className="material-symbols-outlined text-5xl text-emerald-500 dark:text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Your Booking</h3>
                                <p className="text-gray-600 dark:text-gray-400">Please review the details below</p>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-6 rounded-2xl max-w-md mx-auto text-left space-y-4 border border-gray-200 dark:border-gray-700">
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
                                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                                    <span className="text-gray-900 dark:text-white font-bold text-base">Total Price</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">$45.00</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="px-5 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
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
                                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30'
                                }`}
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-200"
                        >
                            Confirm Booking ✓
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
