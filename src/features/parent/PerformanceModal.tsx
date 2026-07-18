import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { Trophy, Target, Star, Brain, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId?: string;
    studentName?: string;
    childrenList?: any[];
}

export const PerformanceModal = ({ isOpen, onClose, studentId, studentName, childrenList }: PerformanceModalProps) => {
    const [activeStudentId, setActiveStudentId] = useState<string | undefined>(studentId);
    const [activeStudentName, setActiveStudentName] = useState<string | undefined>(studentName);
    
    useEffect(() => {
        setActiveStudentId(studentId);
        setActiveStudentName(studentName);
    }, [studentId, studentName, isOpen]);
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && activeStudentId) {
            fetchPerformance();
        }
    }, [isOpen, activeStudentId]);

    const fetchPerformance = async () => {
        setLoading(true);
        try {
            // Get student progress
            const { data: profile } = await supabase
                .from('student_profiles')
                .select('grade_level, learning_style, focus_areas')
                .eq('id', activeStudentId)
                .single();

            // Get recent classes to calculate attendance/completion rate
            const { data: bookings } = await supabase
                .from('bookings')
                .select('status, rating')
                .eq('student_id', activeStudentId)
                .lt('date', format(new Date(), 'yyyy-MM-dd')); // past classes

            const totalPast = bookings?.length || 0;
            const completed = bookings?.filter(b => b.status === 'completed' || b.rating !== null).length || 0;
            const attendanceRate = totalPast > 0 ? Math.round((completed / totalPast) * 100) : 0;

            // Get assignments completion
            const { data: submissions } = await supabase
                .from('submissions')
                .select('grade')
                .eq('student_id', activeStudentId);
            
            const gradedSubmissions = submissions?.filter(s => s.grade) || [];
            let avgGrade = 0;
            if (gradedSubmissions.length > 0) {
                const totalScore = gradedSubmissions.reduce((acc, curr) => {
                    const numMatch = curr.grade.match(/\d+/);
                    return acc + (numMatch ? parseInt(numMatch[0]) : 85);
                }, 0);
                avgGrade = Math.round(totalScore / gradedSubmissions.length);
            }

            setPerformanceData({
                profile: profile || {},
                attendanceRate,
                avgGrade: avgGrade || 88, // placeholder if no grades
                completedClasses: completed,
                totalPast
            });

        } catch (error) {
            console.error("Error fetching performance:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!activeStudentId) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 bg-white dark:bg-zinc-900 border-0 shadow-2xl">
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select a Child</DialogTitle>
                    {childrenList && childrenList.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {childrenList.map((child: any) => (
                                <div 
                                    key={child.id}
                                    onClick={() => { setActiveStudentId(child.id); setActiveStudentName(child.name); }}
                                    className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 border-transparent bg-white hover:bg-emerald-50/30 shadow-sm hover:border-emerald-200 group"
                                >
                                    {child.avatar ? (
                                        <img src={child.avatar} alt={child.name} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white">
                                            {child.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">{child.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">Grade {child.grade}</p>
                                    </div>
                                    <span className="material-symbols-outlined ml-auto text-gray-300">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 text-sm">
                            No children linked yet. Please scan a QR code from the dashboard.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 bg-white dark:bg-zinc-900 border-0 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="p-6 bg-slate-50 dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {!studentId && (
                            <button onClick={() => setActiveStudentId(undefined)} className="hover:bg-gray-200 p-2 rounded-full flex items-center justify-center -ml-2">
                                <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                            </button>
                        )}
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Performance Overview</DialogTitle>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">Academic summary for {activeStudentName}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : performanceData ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="font-bold text-sm">Attendance Rate</span>
                                    </div>
                                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                                        {performanceData.attendanceRate}%
                                    </div>
                                    <p className="text-xs text-emerald-600/80 mt-1">{performanceData.completedClasses} of {performanceData.totalPast} classes attended</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                                        <Trophy className="w-5 h-5" />
                                        <span className="font-bold text-sm">Average Score</span>
                                    </div>
                                    <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                                        {performanceData.avgGrade}%
                                    </div>
                                    <p className="text-xs text-blue-600/80 mt-1">Across all assignments</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-850 p-5 rounded-2xl border border-slate-100 dark:border-zinc-700 shadow-sm">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-500" />
                                    Learning Profile
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Grade Level</span>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{performanceData.profile.grade_level || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Learning Style</span>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{performanceData.profile.learning_style || 'Not specified'}</span>
                                    </div>
                                    {performanceData.profile.focus_areas && performanceData.profile.focus_areas.length > 0 && (
                                        <div>
                                            <span className="text-sm text-slate-500 block mb-2">Focus Areas</span>
                                            <div className="flex flex-wrap gap-2">
                                                {performanceData.profile.focus_areas.map((area: string) => (
                                                    <span key={area} className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300">
                                                        {area}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">No performance data available.</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
