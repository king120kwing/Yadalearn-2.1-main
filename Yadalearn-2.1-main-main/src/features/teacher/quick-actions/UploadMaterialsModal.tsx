import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface UploadMaterialsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UploadMaterialsModal = ({ isOpen, onClose }: UploadMaterialsModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [materialType, setMaterialType] = useState<'lecture' | 'homework' | 'reading'>('lecture');
    const [releaseImmediately, setReleaseImmediately] = useState(true);
    const [allowDownload, setAllowDownload] = useState(true);
    const [enableComments, setEnableComments] = useState(true);
    const [trackViews, setTrackViews] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-4xl mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-0 p-0 overflow-hidden max-h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl">
                {/* Sticky Header */}
                <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-250 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-850 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                    <h2 className="text-lg font-bold tracking-tight">New Material</h2>
                    <button className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95">
                        Upload
                    </button>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Upload and Basic Info */}
                        <div className="space-y-6">
                            {/* Upload Zone */}
                            <div className="w-full">
                                <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-orange-500/40 bg-gray-50/50 dark:bg-zinc-800/40 hover:bg-gray-100/50 dark:hover:bg-zinc-800/80 px-6 py-10 transition-all cursor-pointer group">
                                    <div className="size-16 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-3xl">cloud_upload</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <p className="text-base font-bold text-gray-900 dark:text-white">Tap to browse files</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">or drag and drop here (PDF, DOC, MP4)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields: Title & Description */}
                            <div className="flex flex-col gap-4">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Material Title</span>
                                    <input
                                        className="w-full rounded-xl bg-white dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-550 p-4 h-14"
                                        placeholder="e.g., Chapter 4 Review"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Description <span className="text-gray-500 font-normal">(Optional)</span></span>
                                    <textarea
                                        className="w-full rounded-xl bg-white dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 focus:border-orange-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-550 p-4 min-h-[120px] resize-none"
                                        placeholder="Add instructions for students..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Right Column: Configurations */}
                        <div className="space-y-6">
                            {/* Destination Selector */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white px-1">Destination</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-orange-500 text-white font-medium text-sm">
                                        <span>Math 101</span>
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                    <button className="flex items-center px-4 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:border-orange-500/50 transition-colors">
                                        History 2B
                                    </button>
                                    <button className="flex items-center justify-center size-8 rounded-full bg-white dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-600 text-orange-600 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                </div>
                            </div>

                            {/* Material Type Segmented Control */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white px-1">Type</h3>
                                <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                                    {(['lecture', 'homework', 'reading'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setMaterialType(type)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${materialType === type
                                                    ? 'bg-orange-500 text-white shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Release Schedule */}
                            <div className="flex items-center justify-between py-1 border-y border-gray-150 dark:border-zinc-800/80 py-4">
                                <div className="flex flex-col">
                                    <span className="text-base font-medium text-gray-900 dark:text-white">Release Immediately</span>
                                    <span className="text-xs text-gray-500">Material will be visible now</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        checked={releaseImmediately}
                                        onChange={(e) => setReleaseImmediately(e.target.checked)}
                                        className="sr-only peer"
                                        type="checkbox"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                                </label>
                            </div>

                            {/* Permissions Section */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-2 uppercase tracking-wider text-xs px-1">Student Access</h3>
                                <div className="flex flex-col bg-white dark:bg-zinc-800/80 rounded-xl overflow-hidden divide-y divide-gray-250 dark:divide-zinc-700/60 border border-gray-200 dark:border-zinc-700">
                                    {/* Toggle Item 1 */}
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-gray-400">
                                                <span className="material-symbols-outlined text-lg">download</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Allow Download</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                checked={allowDownload}
                                                onChange={(e) => setAllowDownload(e.target.checked)}
                                                className="sr-only peer"
                                                type="checkbox"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                                        </label>
                                    </div>
                                    {/* Toggle Item 2 */}
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-gray-400">
                                                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Enable Comments</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                checked={enableComments}
                                                onChange={(e) => setEnableComments(e.target.checked)}
                                                className="sr-only peer"
                                                type="checkbox"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                                        </label>
                                    </div>
                                    {/* Toggle Item 3 */}
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-gray-400">
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Track Views</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                checked={trackViews}
                                                onChange={(e) => setTrackViews(e.target.checked)}
                                                className="sr-only peer"
                                                type="checkbox"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </DialogContent>
        </Dialog>
    );
};
