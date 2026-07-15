import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface QuickAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QuickAnnouncementModal = ({ isOpen, onClose }: QuickAnnouncementModalProps) => {
    const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState(['Math 101', 'Absent Students']);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-4xl mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden max-h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-250 dark:border-zinc-800 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[28px]">close</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">New Announcement</h1>
                    <button className="text-orange-600 dark:text-orange-400 font-bold text-base px-2 py-1 hover:text-orange-750 dark:hover:text-orange-355 transition-colors">
                        Post
                    </button>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Recipients and Setup */}
                        <div className="space-y-6">
                            {/* Recipients Section */}
                            <section>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-orange-400 mb-3 pl-1">To</label>
                                <div className="flex flex-wrap gap-2">
                                    {recipients.map((recipient, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 group cursor-pointer hover:border-orange-500 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{recipient}</span>
                                            <span className="material-symbols-outlined text-[18px] text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">close</span>
                                        </div>
                                    ))}
                                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/30 hover:bg-orange-200 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 border border-transparent hover:border-orange-500 transition-all">
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                    </button>
                                </div>
                            </section>

                            {/* Priority Segmented Control */}
                            <section>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-orange-400 mb-3 pl-1">Priority</label>
                                <div className="flex p-1 bg-gray-150 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700/60">
                                    <label className="flex-1 cursor-pointer relative">
                                        <input
                                            checked={priority === 'normal'}
                                            onChange={() => setPriority('normal')}
                                            className="sr-only"
                                            name="priority"
                                            type="radio"
                                            value="normal"
                                        />
                                        <div className={`flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${priority === 'normal'
                                                ? 'bg-orange-500 text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-450'
                                            }`}>
                                            Normal
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer relative">
                                        <input
                                            checked={priority === 'urgent'}
                                            onChange={() => setPriority('urgent')}
                                            className="sr-only"
                                            name="priority"
                                            type="radio"
                                            value="urgent"
                                        />
                                        <div className={`flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 gap-2 ${priority === 'urgent'
                                                ? 'bg-red-500 text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-450'
                                            }`}>
                                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                                            Urgent
                                        </div>
                                    </label>
                                </div>
                            </section>

                            {/* Subject */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-orange-400 mb-2 pl-1">Subject</label>
                                <input
                                    className="w-full bg-white dark:bg-zinc-800 rounded-xl border border-gray-250 dark:border-zinc-700 focus:border-orange-500 focus:ring-0 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 transition-colors"
                                    placeholder="Subject: What's this about?"
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Right Column: Message and Attachments */}
                        <div className="space-y-6">
                            {/* Body */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-orange-400 mb-2 pl-1">Message Body</label>
                                <div className="border border-gray-250 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 p-4">
                                    <textarea
                                        className="w-full min-h-[140px] bg-transparent text-sm leading-relaxed placeholder:text-gray-500 text-gray-900 dark:text-white border-0 resize-none focus:ring-0 p-0"
                                        placeholder="Type your message here..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />

                                    {/* Rich Text Toolbar */}
                                    <div className="flex items-center gap-1 pt-3 mt-3 border-t border-gray-200 dark:border-zinc-700">
                                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Bold">
                                            <span className="material-symbols-outlined text-[20px]">format_bold</span>
                                        </button>
                                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Italic">
                                            <span className="material-symbols-outlined text-[20px]">format_italic</span>
                                        </button>
                                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Underline">
                                            <span className="material-symbols-outlined text-[20px]">format_underlined</span>
                                        </button>
                                        <div className="w-px h-5 bg-gray-200 dark:border-zinc-700 mx-1"></div>
                                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Bullet List">
                                            <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                                        </button>
                                        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Link">
                                            <span className="material-symbols-outlined text-[20px]">link</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Attachment Area */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-orange-400 mb-2 pl-1">Attachments</label>
                                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-orange-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50 dark:bg-zinc-800/30 hover:bg-gray-100 dark:hover:bg-zinc-805 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-[24px]">cloud_upload</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Tap to upload files</p>
                                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Images, PDF, or Docs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sticky Footer for Scheduling */}
                <footer className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-6 py-4 z-20 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-850 flex items-center justify-center text-gray-500 dark:text-orange-400">
                                <span className="material-symbols-outlined text-[22px]">schedule</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-orange-400 font-medium uppercase tracking-wide">Send Time</span>
                                <span className="text-sm text-gray-900 dark:text-white font-semibold">Send Now</span>
                            </div>
                        </div>
                        <button className="text-orange-600 dark:text-orange-400 text-sm font-semibold hover:underline">
                            Change
                        </button>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    );
};
