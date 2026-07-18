import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LinkTeacher() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    async function handleLinking() {
      if (!user) {
        // If not logged in, they need to log in first.
        localStorage.setItem('redirect_after_login', `/link/${teacherId}`);
        navigate('/role-selection');
        return;
      }

      if (userRole !== 'student') {
        setStatus('error');
        setErrorMessage('Only student accounts can link to a teacher via QR code.');
        return;
      }

      if (!teacherId) {
        setStatus('error');
        setErrorMessage('Invalid teacher link.');
        return;
      }

      try {
        // Fetch teacher name for the UI
        const { data: teacherProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', teacherId)
          .single();

        if (teacherProfile) {
          setTeacherName(teacherProfile.full_name);
        }

        // Upsert the link
        const { error } = await supabase
          .from('teacher_student_links')
          .upsert({
            teacher_id: teacherId,
            student_id: user.id,
            status: 'accepted'
          }, {
            onConflict: 'teacher_id, student_id'
          });

        if (error) throw error;

        setStatus('success');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 3000);

      } catch (err: any) {
        console.error("Error linking teacher:", err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to link to teacher. Please try again.');
      }
    }

    handleLinking();
  }, [teacherId, user, userRole, navigate]);

  return (
    <div className="min-h-screen bg-[#FCFAF5] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B4A9F]/10 dark:bg-purple-900/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-zinc-800 flex flex-col items-center text-center max-w-md w-full z-10 animate-in slide-in-from-bottom-8">
        
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-purple-50 dark:bg-purple-950/30 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-[#5B4A9F] dark:text-purple-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connecting...</h2>
            <p className="text-gray-500 dark:text-gray-400">Please wait while we set up your class link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Successfully Linked!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You are now connected with <span className="font-bold text-gray-900 dark:text-white">{teacherName || 'your teacher'}</span>.
            </p>
            <button 
              onClick={() => navigate('/student-dashboard')}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#5B4A9F] to-[#8F81D6] hover:from-[#4A3B8C] hover:to-[#8274CF] text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Go to Dashboard
            </button>
            <p className="text-xs text-gray-400 mt-4">Redirecting automatically in a few seconds...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connection Failed</h2>
            <p className="text-red-500 dark:text-red-400 text-sm mb-6 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg w-full">
              {errorMessage}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold rounded-xl transition-all"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
