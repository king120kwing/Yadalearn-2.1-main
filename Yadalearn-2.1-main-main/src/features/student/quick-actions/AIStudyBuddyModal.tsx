import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AIStudyBuddyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AIStudyBuddyModal = ({ isOpen, onClose }: AIStudyBuddyModalProps) => {
    const [message, setMessage] = useState('');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden h-screen max-h-screen flex flex-col">
                {/* Navigation Header */}
                <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-20">
                    <button
                        onClick={onClose}
                        className="text-gray-700 dark:text-gray-300 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">menu</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Biology 101</h2>
                        <div className="flex items-center gap-1">
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Online</span>
                        </div>
                    </div>
                    <button className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[24px] text-gray-700 dark:text-gray-300">more_vert</span>
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative w-full scrollbar-hide bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col min-h-full px-4 pt-6 pb-24 max-w-3xl mx-auto w-full gap-6">
                        {/* Date Separator */}
                        <div className="flex justify-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                Today, 10:23 AM
                            </span>
                        </div>

                        {/* AI Greeting */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-end gap-3">
                                <div className="size-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shrink-0 shadow-md">
                                    <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
                                </div>
                                <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 max-w-[85%] shadow-sm">
                                    <p>Hi Alex! Ready to continue our study on <strong>Cellular Respiration</strong>? I can also quiz you on the last chapter.</p>
                                </div>
                            </div>
                        </div>

                        {/* Suggestion Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button className="flex shrink-0 items-center justify-center gap-x-2 rounded-full border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">quiz</span>
                                <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Quiz: Photosynthesis</span>
                            </button>
                            <button className="flex shrink-0 items-center justify-center gap-x-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[18px]">summarize</span>
                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Summarize Lecture</span>
                            </button>
                        </div>

                        {/* User Message */}
                        <div className="flex items-end gap-3 justify-end">
                            <div className="flex flex-col items-end gap-1 max-w-[85%]">
                                <div className="p-4 rounded-2xl rounded-tr-none bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md">
                                    <p className="text-base font-medium leading-relaxed">
                                        Can you explain the main difference between Mitosis and Meiosis simply? I keep mixing them up.
                                    </p>
                                </div>
                                <span className="text-[11px] text-gray-400 pr-1">10:25 AM</span>
                            </div>
                            <div className="size-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 overflow-hidden shrink-0 border-2 border-white dark:border-gray-900 shadow-sm">
                            </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-end gap-3 w-full">
                                <div className="size-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shrink-0 shadow-md">
                                    <span className="material-symbols-outlined text-white text-lg font-bold">smart_toy</span>
                                </div>
                                <div className="flex flex-col gap-3 w-full max-w-[90%]">
                                    {/* Main Text Bubble */}
                                    <div className="p-5 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm relative group">
                                        <p className="text-base leading-7">
                                            Think of <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded">Mitosis</span> as making a <strong>photocopy</strong>. It creates two identical cells for growth and repair.
                                            <br /><br />
                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded">Meiosis</span> is for <strong>reproduction</strong>. It shuffles the genetics to create four unique cells with half the chromosomes.
                                        </p>
                                        {/* Inline Actions */}
                                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                <span className="material-symbols-outlined text-[16px]">child_care</span>
                                                Simplify More
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                <span className="material-symbols-outlined text-[16px]">psychology</span>
                                                Deeper Dive
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ml-auto">
                                                <span className="material-symbols-outlined text-[16px]">note_add</span>
                                                Add to Notes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Follow up Suggestion */}
                        <div className="pl-11 pr-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Suggested next steps:</p>
                            <div className="flex flex-col gap-2">
                                <button className="w-full text-left p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors flex items-center justify-between group shadow-sm">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Show me a comparison table</span>
                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-emerald-500 text-lg">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Fixed Input Area */}
                <footer className="shrink-0 bg-white dark:bg-gray-900 p-4 pb-6 pt-2 z-20 border-t border-gray-200 dark:border-gray-700">
                    {/* Floating Input Container */}
                    <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-[24px] p-2 shadow-sm max-w-3xl mx-auto">
                        {/* Attachment Button */}
                        <button className="size-10 shrink-0 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <span className="material-symbols-outlined">add_circle</span>
                        </button>
                        {/* Text Input */}
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 py-3 px-0 resize-none max-h-32 leading-relaxed"
                            placeholder="Ask anything about Biology..."
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />
                        {/* Voice Input */}
                        <button className="size-10 shrink-0 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <span className="material-symbols-outlined">mic</span>
                        </button>
                        {/* Send Button */}
                        <button className="size-10 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-colors shadow-md">
                            <span className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-500">AI can make mistakes. Verify important info.</p>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    );
};
