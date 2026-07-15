const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'acer', 'Desktop', 'Yadalearn-2.1-main-main', 'Yadalearn-2.1-main-main', 'src', 'features', 'student', 'quick-actions', 'MessageTeacherModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import
if (!content.includes("import { AudioRecorder } from 'react-audio-voice-recorder'")) {
    content = content.replace(
        "import { Play, Pause, X, FileText, Download, Check, CheckCheck, Edit2, Camera, Paperclip, Mic, Send, Smile, Trash2 } from 'lucide-react';",
        "import { Play, Pause, X, FileText, Download, Check, CheckCheck, Edit2, Camera, Paperclip, Mic, Send, Smile, Trash2 } from 'lucide-react';\nimport { AudioRecorder } from 'react-audio-voice-recorder';"
    );
}

// Add handling function
const audioHandler = `
    const handleAudioComplete = (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64Data = reader.result;
            await handleSendRichMessage(null, 'audio', base64Data);
        };
    };
`;

if (!content.includes("const handleAudioComplete")) {
    content = content.replace("const handleSendRichMessage = async", audioHandler + "\n    const handleSendRichMessage = async");
}

// Replace Mic icon with AudioRecorder
const originalMicBlock = `                                        isRecording ? (
                                            <button
                                                type="button"
                                                onClick={() => stopRecording(false)}
                                                className={cn(
                                                    "h-[44px] w-[44px] rounded-full flex items-center justify-center text-white transition-all shadow-sm shrink-0",
                                                    role === 'teacher' ? "bg-[#FF7D46] hover:bg-[#e06530]" : "bg-[#5B4A9F] hover:bg-[#473980]"
                                                )}
                                            >
                                                <Send className="h-5 w-5 ml-0.5" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                className={cn(
                                                    "h-[44px] w-[44px] rounded-full flex items-center justify-center text-white transition-all shadow-sm shrink-0",
                                                    role === 'teacher' ? "bg-[#FF7D46] hover:bg-[#e06530]" : "bg-[#5B4A9F] hover:bg-[#473980]"
                                                )}
                                            >
                                                <Mic className="h-5 w-5" />
                                            </button>
                                        )`;

const newMicBlock = `                                        <div className="flex items-center justify-center shrink-0">
                                            <AudioRecorder 
                                              onRecordingComplete={handleAudioComplete}
                                              audioTrackConstraints={{
                                                noiseSuppression: true,
                                                echoCancellation: true,
                                              }} 
                                              downloadOnSavePress={false}
                                              downloadFileExtension="webm"
                                            />
                                        </div>`;

content = content.replace(originalMicBlock, newMicBlock);

// Remove the `isRecording ?` wrapping div in the input area
const originalInputArea = `{isRecording ? (
                                        <div className="flex-1 bg-white dark:bg-zinc-800 rounded-full h-[44px] px-5 flex items-center justify-between shadow-sm animate-pulse">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
                                                <span className="text-sm font-semibold text-red-500">
                                                    {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => stopRecording(true)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 bg-white dark:bg-zinc-800 rounded-[22px] min-h-[44px] flex items-end overflow-hidden shadow-sm">
                                            <button 
                                                type="button" 
                                                onClick={() => setShowEmojiBar(!showEmojiBar)}
                                                className="h-[44px] w-11 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shrink-0"
                                            >
                                                <Smile className="h-6 w-6" />
                                            </button>
                                            
                                            <input
                                                type="text"
                                                value={newMessageText}
                                                onChange={handleTyping}
                                                placeholder="Message"
                                                className="flex-1 bg-transparent border-0 h-[44px] px-1 text-[15px] focus:ring-0 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                                            />
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => documentInputRef.current?.click()}
                                                className="h-[44px] w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shrink-0"
                                            >
                                                <Paperclip className="h-5 w-5 -rotate-45" />
                                            </button>
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-[44px] w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shrink-0 mr-1"
                                            >
                                                <Camera className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}`;

const newInputArea = `<div className="flex-1 bg-white dark:bg-zinc-800 rounded-[22px] min-h-[44px] flex items-end overflow-hidden shadow-sm">
                                            <button 
                                                type="button" 
                                                onClick={() => setShowEmojiBar(!showEmojiBar)}
                                                className="h-[44px] w-11 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shrink-0"
                                            >
                                                <Smile className="h-6 w-6" />
                                            </button>
                                            
                                            <input
                                                type="text"
                                                value={newMessageText}
                                                onChange={handleTyping}
                                                placeholder="Message"
                                                className="flex-1 bg-transparent border-0 h-[44px] px-1 text-[15px] focus:ring-0 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                                            />
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => documentInputRef.current?.click()}
                                                className="h-[44px] w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shrink-0"
                                            >
                                                <Paperclip className="h-5 w-5 -rotate-45" />
                                            </button>
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-[44px] w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shrink-0 mr-1"
                                            >
                                                <Camera className="h-5 w-5" />
                                            </button>
                                        </div>`;
                                        
content = content.replace(originalInputArea, newInputArea);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected AudioRecorder into MessageTeacherModal.tsx!');
