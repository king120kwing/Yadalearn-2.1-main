import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

interface MessageTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MessageTeacherModal = ({ isOpen, onClose }: MessageTeacherModalProps) => {
    const [priority, setPriority] = useState<'standard' | 'urgent'>('standard');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchTeachers = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, full_name, subjects')
                    .eq('role', 'teacher')
                    .eq('onboarding_completed', true);
                if (data) {
                    setTeachers(data);
                }
            };
            fetchTeachers();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-4xl mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden rounded-[2.5rem] max-h-[85vh] flex flex-col shadow-2xl w-[95vw] md:w-full">
                <DialogTitle className="sr-only">New Message</DialogTitle>
                <DialogDescription className="sr-only">Send a direct message to your teacher.</DialogDescription>
                
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800 shrink-0 z-10">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[28px]">close</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">New Message</h1>
                    <button className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6] hover:from-[#493a85] hover:to-[#7c6ec4] rounded-full transition-all duration-200 shadow-md active:scale-95">
                        Send
                    </button>
                </header>

                {/* Split Main Content Area */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left Column: Settings and Subject */}
                    <div className="w-full md:w-1/2 border-r border-gray-150 dark:border-zinc-800 flex flex-col overflow-y-auto no-scrollbar p-6 bg-gray-50 dark:bg-zinc-900/30 gap-6">
                        {/* Teacher Selector (To) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">To</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B4A9F] dark:text-[#8F81D6] material-symbols-outlined pointer-events-none">school</span>
                                <select 
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    className="form-select w-full pl-12 pr-10 py-3.5 bg-white dark:bg-zinc-900 border-2 border-gray-250 dark:border-zinc-700 rounded-xl text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8F81D6] focus:border-[#8F81D6] outline-none appearance-none transition-shadow cursor-pointer hover:border-gray-400 dark:hover:border-zinc-650"
                                >
                                    <option value="" disabled>Select Teacher</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.full_name} ({t.subjects?.join(', ') || 'General'})</option>
                                    ))}
                                </select>
                                {/* Custom chevron */}
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none material-symbols-outlined text-xl">expand_more</span>
                            </div>
                        </div>

                        {/* Urgency Toggle */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Priority</label>
                            <div className="bg-gray-200 dark:bg-zinc-800 p-1 rounded-xl flex shadow-inner border border-gray-300 dark:border-zinc-700">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        checked={priority === 'standard'}
                                        onChange={() => setPriority('standard')}
                                        className="peer sr-only"
                                        name="urgency"
                                        type="radio"
                                        value="standard"
                                    />
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 transition-all peer-checked:bg-white dark:peer-checked:bg-[#5B4A9F] peer-checked:text-gray-900 dark:peer-checked:text-white peer-checked:shadow-md">
                                        <span className="material-symbols-outlined text-[18px]">help</span>
                                        Standard
                                    </div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        checked={priority === 'urgent'}
                                        onChange={() => setPriority('urgent')}
                                        className="peer sr-only"
                                        name="urgency"
                                        type="radio"
                                        value="urgent"
                                    />
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 transition-all peer-checked:bg-white dark:peer-checked:bg-red-650 peer-checked:text-gray-900 dark:peer-checked:text-white peer-checked:shadow-md">
                                        <span className="material-symbols-outlined text-[18px] text-red-500 peer-checked:text-white">error</span>
                                        Urgent
                                    </div>
                                </label>
                            </div>
                            {/* Helper text for urgent */}
                            {priority === 'urgent' && (
                                <p className="text-xs text-red-650 ml-1 mt-1 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900">
                                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                                    Use urgent only for time-sensitive matters (within 24h).
                                </p>
                            )}
                        </div>

                        {/* Subject Line */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Subject</label>
                            <input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white dark:bg-zinc-900 border-2 border-gray-250 dark:border-zinc-700 rounded-xl text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8F81D6] focus:border-[#8F81D6] outline-none transition-shadow placeholder-gray-450 hover:border-gray-400 dark:hover:border-zinc-650"
                                placeholder="Enter subject..."
                                type="text"
                            />
                            {/* Quick Tags (Chips) */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
                                {['Homework Help', 'Extension Request', 'Grade Inquiry', 'Absence'].map((tag) => (
                                    <button 
                                        key={tag}
                                        onClick={() => setSubject(tag)}
                                        className="shrink-0 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-gray-250 dark:border-zinc-700 hover:border-[#8F81D6] dark:hover:border-purple-500 text-xs font-semibold text-gray-700 dark:text-zinc-300 transition-colors whitespace-nowrap shadow-sm hover:shadow-md active:scale-95"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Message Box & Formatting Tools */}
                    <div className="w-full md:w-1/2 flex flex-col p-6 bg-white dark:bg-zinc-900 gap-4 overflow-y-auto no-scrollbar">
                        {/* Message Body */}
                        <div className="flex flex-col flex-1 relative group min-h-[220px]">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 mb-2">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full flex-1 p-4 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-250 dark:border-zinc-750 rounded-xl text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8F81D6] focus:border-[#8F81D6] outline-none resize-none transition-shadow placeholder-gray-450 leading-relaxed hover:border-gray-450"
                                placeholder="Write your message here. Please be respectful and concise..."
                            />
                            <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-400 pointer-events-none bg-white dark:bg-zinc-850 px-2 py-1 rounded border border-gray-200 dark:border-zinc-750">{message.length} / 2000</div>
                        </div>

                        {/* Bottom Toolbar */}
                        <div className="shrink-0 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4 pt-2">
                            {/* Attachment */}
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border border-gray-250 dark:border-zinc-700 hover:border-[#8F81D6] dark:hover:border-purple-500 shadow-sm active:scale-95">
                                <span className="material-symbols-outlined text-[20px] rotate-45">attach_file</span>
                                <span className="text-xs font-bold">Attach File</span>
                            </button>
                            
                            {/* Formatting Tools */}
                            <div className="flex items-center gap-1 border border-gray-250 dark:border-zinc-700 rounded-xl p-1">
                                <button className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#5B4A9F] dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">format_bold</span>
                                </button>
                                <button className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#5B4A9F] dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">format_italic</span>
                                </button>
                                <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1"></div>
                                <button className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#5B4A9F] dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
