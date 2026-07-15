import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";

const Profile = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchOnboardingDetails() {
      try {
        setLoading(true);
        if (userRole === 'student') {
          const { data } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (data) setDetails(data);
        } else if (userRole === 'teacher') {
          const { data } = await supabase
            .from('teacher_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (data) setDetails(data);
        }
      } catch (err) {
        console.error("Error loading onboarding details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOnboardingDetails();
  }, [user, userRole]);

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const capitalize = (str?: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 pb-24">
      {/* Header */}
      <header className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="mx-auto max-w-4xl text-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-3 sm:mb-4 text-gray-600 text-sm sm:text-base">
            ← Back
          </Button>
          {/* Avatar */}
          <div className="mb-3 sm:mb-4 flex justify-center">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-2xl sm:text-3xl font-bold text-white shadow-md">
              {getInitials()}
            </div>
          </div>

          <h1 className="mb-2 text-xl sm:text-2xl font-bold text-gray-800">
            {user?.name || "User"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">{capitalize(userRole || "User")}</p>
        </div>
      </header>

      {/* Profile Cards */}
      <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 shadow-sm border border-purple-200/40 text-left">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Email</p>
              <p className="font-semibold text-gray-800">{user?.email}</p>
            </div>

            {userRole === 'student' && details && (
              <>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 shadow-sm border border-blue-200/40 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Study Path</p>
                  <p className="font-semibold text-gray-800">{details.study_path || "Not Specified"}</p>
                </div>

                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 shadow-sm border border-green-200/40 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Level / Grade</p>
                  <p className="font-semibold text-gray-800">{details.grade_level || details.current_level || "Not Specified"}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 shadow-sm border border-yellow-200/40 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Preference</p>
                  <p className="font-semibold text-gray-800">{details.study_preference || details.class_preference || "Not Specified"}</p>
                </div>

                <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 shadow-sm border border-pink-200/40 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Learning Goal</p>
                  <p className="font-semibold text-gray-800">{details.study_goal || details.learning_objective || "Not Specified"}</p>
                </div>
              </>
            )}

            {userRole === 'teacher' && details && (
              <>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 shadow-sm border border-blue-200/40 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Teaching Focus</p>
                  <p className="font-semibold text-gray-800">{details.teaching_focus?.join(', ') || "Not Specified"}</p>
                </div>

                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 shadow-sm border border-green-200/40 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Teaching Levels</p>
                  <p className="font-semibold text-gray-800">
                    {details.teaching_level?.join(', ') || details.grade_level_focus || "Not Specified"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 shadow-sm border border-yellow-200/40 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Hourly Rate</p>
                  <p className="font-semibold text-gray-800">
                    {details.min_rate !== null ? `$${details.min_rate} - $${details.max_rate} / hr` : "Not Specified"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 shadow-sm border border-pink-200/40 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Lesson Format</p>
                  <p className="font-semibold text-gray-800">{details.lesson_format || details.class_type || "Not Specified"}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            className="w-full bg-gradient-to-br from-purple-400 to-purple-600 text-white py-4 rounded-full font-medium hover:scale-105 transition-transform"
            onClick={() => navigate("/settings")}
          >
            Edit Profile
          </Button>

          <Button
            variant="outline"
            className="w-full py-4 rounded-full font-medium border-gray-300 text-gray-700 hover:bg-gray-50 text-gray-600"
            onClick={() => navigate("/logout")}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;

