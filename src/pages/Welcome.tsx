
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Welcome = () => {
  const { user, isLoaded: isAuthLoaded, userRole, onboardingCompleted } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [sloganVisible, setSloganVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthLoaded && user) {
      if (onboardingCompleted) {
        if (userRole === 'teacher') navigate('/teacher-dashboard');
        else if (userRole === 'student') navigate('/student-dashboard');
        else navigate('/role-selection');
      } else {
        if (userRole) navigate('/onboarding', { state: { role: userRole } });
        else navigate('/role-selection');
      }
    }
  }, [isAuthLoaded, user, userRole, onboardingCompleted, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Staggered animation sequence
      setTimeout(() => setImageVisible(true), 200);
      setTimeout(() => setTitleVisible(true), 500);
      setTimeout(() => setSloganVisible(true), 700);
      setTimeout(() => setButtonVisible(true), 900);
    }
  }, [isLoaded]);

  console.log('Welcome: Rendering...', { isLoaded });

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-welcome relative overflow-hidden">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 relative z-20"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full gradient-welcome relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>

      {/* Main Content Container */}
      <div className={`min-h-screen w-full relative z-10`}>

        {/* Desktop Layout */}
        <div className="hidden lg:flex justify-end items-center min-h-screen relative w-full max-w-[1800px] mx-auto px-12 xl:px-24">
          {/* White gradient bridge to seamlessly blend the video's white background into the purple page */}
          <div className="absolute top-0 left-0 h-full w-[65vw] bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none z-0"></div>

          {/* Left side - Full-height cinematic video */}
          <div className="absolute top-0 left-0 h-full w-[55vw] xl:w-[60vw] pointer-events-none z-0">
            <div
              className={`w-full h-full transition-all duration-1000 ease-out ${imageVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{
                WebkitMaskImage: 'linear-gradient(to right, black 65%, transparent 100%)',
                maskImage: 'linear-gradient(to right, black 65%, transparent 100%)'
              }}
            >
              <div 
                className="w-full h-full"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                }}
              >
                <video
                  src="/learning-video_1_202607170641.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>
          </div>

          {/* Right side - Typography and CTA */}
          <div className="relative z-10 w-[45%] max-w-lg xl:max-w-xl animate-fade-in-up">
            <h1 className="text-fluid-display font-bold text-gray-800 mb-6 leading-tight">
              YadaLearn
            </h1>
            <p className="text-fluid-subheading text-gray-600 mb-12 leading-relaxed">
              Every Lesson a Treasure
            </p>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-black text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden min-h-[100svh] flex flex-col w-full overflow-x-hidden bg-transparent">
          {/* White gradient bridge to seamlessly blend the video's white background into the purple page */}
          <div className="absolute top-0 left-0 w-full h-[65vh] bg-gradient-to-b from-white via-white/90 to-transparent pointer-events-none z-0"></div>

          {/* Hero Video with Fade - Mobile (Top half) */}
          <div className="w-full relative z-0 pointer-events-none flex-shrink-0">
            <div
              className={`transition-all duration-1000 ease-out w-full ${imageVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{
                height: '55vh',
                WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)'
              }}
            >
              <video
                src="/learning-video_1_202607170641.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>

          {/* Text and Authentication - Mobile (Bottom half) */}
          <div className="text-center px-6 w-full max-w-sm mx-auto flex-1 flex flex-col justify-center relative z-10 pb-6 pt-2">
            <h1
              className={`text-4xl sm:text-5xl font-bold text-gray-800 transition-all duration-700 ease-out ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              YadaLearn
            </h1>
            <p
              className={`text-lg sm:text-xl text-gray-600 transition-all duration-700 ease-out delay-200 mt-3 mb-8 ${sloganVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Every Lesson a Treasure
            </p>

            <div
              className={`transition-all duration-700 ease-out ${buttonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <div className="w-full">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-black text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
