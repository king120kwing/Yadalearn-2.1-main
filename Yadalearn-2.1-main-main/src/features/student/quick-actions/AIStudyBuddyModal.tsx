import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface AIStudyBuddyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AIStudyBuddyModal = ({ isOpen, onClose }: AIStudyBuddyModalProps) => {
    const [message, setMessage] = useState('');
    const { user, subjects } = useAuth();
    const userName = user?.name || 'Student';
    const firstSubject = (subjects && subjects.length > 0) ? subjects[0] : 'General Studies';

    const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>(() => [
        {
            sender: 'ai',
            text: `Hi ${userName.split(' ')[0]}! Ready to continue our study on ${firstSubject}? What questions do you have?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        const userMsg = {
            sender: 'user' as const,
            text: message.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');

        setTimeout(() => {
            const aiMsg = {
                sender: 'ai' as const,
                text: `That's an interesting question about ${firstSubject}! Let me help you break down: "${userMsg.text}".`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    const handleSuggestionClick = (query: string) => {
        const userMsg = {
            sender: 'user' as const,
            text: query,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            const aiMsg = {
                sender: 'ai' as const,
                text: `Generating resource for: "${query}". Let's dive deeper!`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-3xl mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden rounded-[2.5rem] max-h-[85vh] flex flex-col shadow-2xl w-[95vw] md:w-full">
                <DialogTitle className="sr-only">AI Study Buddy - {firstSubject}</DialogTitle>
                <DialogDescription className="sr-only">Chat with your AI study buddy on {firstSubject} topics.</DialogDescription>
                {/* Navigation Header */}
                <header className="shrink-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800 z-20">
                    <button
                        onClick={onClose}
                        className="text-gray-700 dark:text-gray-300 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-gray-950 dark:text-white text-lg font-bold leading-tight tracking-tight">{firstSubject}</h2>
                        <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <span className="text-xs font-semibold text-[#5B4A9F] dark:text-purple-400">Online</span>
                        </div>
                    </div>
                    <button className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="material-symbols-outlined text-[24px] text-gray-700 dark:text-gray-300">more_vert</span>
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative w-full scrollbar-hide bg-gray-50 dark:bg-zinc-950/20">
                    <div className="flex flex-col min-h-full px-6 pt-6 pb-24 max-w-3xl mx-auto w-full gap-6">
                        {/* Date Separator */}
                        <div className="flex justify-center">
                            <span className="text-xs font-semibold text-gray-550 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800">
                                Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* Messages List */}
                        {messages.map((msg, index) => {
                            if (msg.sender === 'ai') {
                                return (
                                    <div key={index} className="flex flex-col gap-2">
                                        <div className="flex items-end gap-3">
                                            <div className="size-8 rounded-full bg-gradient-to-br from-[#5B4A9F] to-[#8F81D6] flex items-center justify-center shrink-0 shadow-md">
                                                <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
                                            </div>
                                            <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white max-w-[85%] shadow-sm">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={index} className="flex items-end gap-3 justify-end">
                                        <div className="flex flex-col items-end gap-1 max-w-[85%]">
                                            <div className="p-4 rounded-2xl rounded-tr-none bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6] text-white shadow-md">
                                                <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                                                    {msg.text}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-gray-400 pr-1">{msg.time}</span>
                                        </div>
                                        <div className="size-8 rounded-full bg-gradient-to-br from-[#8F81D6] to-purple-400 overflow-hidden shrink-0 border-2 border-white dark:border-zinc-850 shadow-sm flex items-center justify-center text-white text-xs font-bold">
                                            {userName[0]}
                                        </div>
                                    </div>
                                );
                            }
                        })}

                        {/* Suggestion Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button 
                                onClick={() => handleSuggestionClick(`Quiz: ${firstSubject}`)}
                                className="flex shrink-0 items-center justify-center gap-x-2 rounded-full border-2 border-[#8F81D6] bg-purple-50 dark:bg-purple-950/20 px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[#5B4A9F] dark:text-purple-400 text-[18px]">quiz</span>
                                <span className="text-purple-800 dark:text-purple-300 text-xs font-bold">Quiz: {firstSubject}</span>
                            </button>
                            <button 
                                onClick={() => handleSuggestionClick(`Summarize: ${firstSubject}`)}
                                className="flex shrink-0 items-center justify-center gap-x-2 rounded-full border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 hover:bg-gray-55 dark:hover:bg-zinc-850 transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-550 dark:text-zinc-400 text-[18px]">summarize</span>
                                <span className="text-gray-700 dark:text-zinc-300 text-xs font-bold">Summarize: {firstSubject}</span>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Fixed Input Area */}
                <footer className="shrink-0 bg-white dark:bg-zinc-900 p-4 pb-6 pt-2 z-20 border-t border-gray-150 dark:border-zinc-800">
                    {/* Floating Input Container */}
                    <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-750 rounded-[24px] p-2 shadow-sm max-w-3xl mx-auto">
                        {/* Attachment Button */}
                        <button className="size-10 shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:text-[#5B4A9F] dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-zinc-850 transition-colors">
                            <span className="material-symbols-outlined">add_circle</span>
                        </button>
                        {/* Text Input */}
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="flex-1 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 py-3 px-0 resize-none max-h-32 leading-relaxed text-sm"
                            placeholder={`Ask anything about ${firstSubject}...`}
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />
                        {/* Voice Input */}
                        <button className="size-10 shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:text-[#5B4A9F] dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-zinc-850 transition-colors">
                            <span className="material-symbols-outlined">mic</span>
                        </button>
                        {/* Send Button */}
                        <button 
                            onClick={handleSend}
                            className="size-10 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6] hover:from-[#493a85] hover:to-[#7c6ec4] text-white transition-all duration-200 shadow-md"
                        >
                            <span className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-550">AI can make mistakes. Verify important info.</p>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    );
};
