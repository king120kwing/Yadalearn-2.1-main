import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ScanQRModalProps {
  onClose: () => void;
}

const ScanQRModal: React.FC<ScanQRModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [linkedStudentData, setLinkedStudentData] = useState<any>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isScanning) {
      html5QrCode = new Html5Qrcode("qr-reader");

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          setIsScanning(false);
          if (html5QrCode && html5QrCode.isScanning) {
            await html5QrCode.stop().catch(console.error);
          }
          let targetUrl = decodedText.trim();
          let id = targetUrl;
          if (targetUrl.includes('/link/')) {
              id = targetUrl.split('/link/')[1];
          }
          await linkStudent(id);
        },
        (error) => {
          // Ignore frequent scan errors when no QR is in frame
        }
      ).catch((err) => {
        console.error("Camera start error", err);
        setErrorMessage("Could not start camera. Please ensure permissions are granted.");
        setScanStatus("error");
        setIsScanning(false);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const linkStudent = async (studentId: string) => {
    try {
      if (!user) throw new Error("Not authenticated");

      // Verify the student exists
      const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', studentId)
        .eq('role', 'student')
        .single();

      if (studentError || !student) {
        throw new Error("Student not found or invalid QR code.");
      }

      // Check if link already exists
      const { data: existingLink } = await supabase
        .from('parent_student_links')
        .select('id')
        .eq('parent_id', user.id)
        .eq('student_id', studentId)
        .single();

      if (existingLink) {
        setLinkedStudentData(student);
        setScanStatus('success');
        return;
      }

      // Create link
      const { error: linkError } = await supabase
        .from('parent_student_links')
        .insert([
          { parent_id: user.id, student_id: studentId }
        ]);

      if (linkError) throw linkError;

      // The parent's profile name should remain their normal name on the dashboard.
      // An automated introductory message will be sent to teachers when the parent first chats with them.

      setLinkedStudentData(student);
      setScanStatus('success');
    } catch (error: any) {
      console.error('Error linking student:', error);
      setScanStatus('error');
      setErrorMessage(error.message || "Failed to link student. Please try again.");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await linkStudent(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        <CardHeader className="border-b border-gray-100 flex flex-row justify-between items-center p-6">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <span className="material-symbols-outlined mr-2 text-orange-500">qr_code_scanner</span>
            Link a Child
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-gray-500">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          {scanStatus === 'success' && linkedStudentData ? (
            <div className="text-center py-8 flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Successfully Linked!</h3>
              <p className="text-gray-500 mb-6 text-sm">You are now linked with:</p>
              
              <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-4 w-full border border-gray-100 mb-6 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl mb-3 border-2 border-white shadow-sm overflow-hidden">
                   {linkedStudentData.avatar_url ? (
                     <img src={linkedStudentData.avatar_url} className="w-full h-full object-cover" />
                   ) : (
                     linkedStudentData.full_name.charAt(0).toUpperCase()
                   )}
                </div>
                <h4 className="font-bold text-gray-800 text-lg">{linkedStudentData.full_name}</h4>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mt-2">Student Profile</span>
              </div>

              <Button onClick={onClose} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-6 font-bold shadow-md">
                Back to Dashboard
              </Button>
            </div>
          ) : scanStatus === 'error' ? (
             <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Link Failed</h3>
              <p className="text-gray-500 mb-6">{errorMessage}</p>
              <Button onClick={() => setScanStatus('idle')} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-6 mb-3">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {!isScanning ? (
                <>
                  <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-10 w-10 text-orange-500" />
                    </div>
                    <p className="text-gray-600 mb-4 font-medium">Scan your child's QR code from their profile</p>
                    <Button onClick={() => setIsScanning(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                      Start Camera
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or enter code manually</span>
                    </div>
                  </div>

                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <Input 
                      placeholder="Enter 6-digit code or ID" 
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                    <Button type="submit" disabled={!manualCode.trim()} className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl">
                      Link
                    </Button>
                  </form>
                </>
              ) : (
                <div className="space-y-4">
                  <div id="qr-reader" className="rounded-2xl overflow-hidden border-2 border-orange-500" />
                  <Button variant="outline" onClick={() => setIsScanning(false)} className="w-full rounded-xl">
                    Cancel Scan
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanQRModal;
