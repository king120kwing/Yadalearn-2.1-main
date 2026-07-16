
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

  return (
    <div className="min-h-screen w-full gradient-welcome relative overflow-hidden flex bg-[#f8f9ff]">
      {/* Animated background mesh overlay for premium feel */}
      <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none"></div>

      {/* 
        Video Background Element (Left Side) 
        Takes up about 65% of width on desktop, 100% on mobile.
        Uses nested CSS masks to softly fade the video into the background 
        on the right edge and bottom edge without harsh borders.
      */}
      <div 
        className="absolute top-0 left-0 w-full lg:w-[65%] h-full z-0 pointer-events-none"
        style={{
          // Horizontal fade mask (fades out into the text area on the right)
          WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 95%)',
          maskImage: 'linear-gradient(to right, black 50%, transparent 95%)'
        }}
      >
        <div 
          className="w-full h-full"
          style={{
            // Vertical fade mask (strongest fade at the lower portion as requested)
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
          }}
        >
          <video
            src="/learning-video.mp4"
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Subtle overlay to ensure the video isn't overwhelmingly bright, preserving text readability if it overlaps */}
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>

      {/* Main Content Container (Right Side) */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center lg:items-end px-8 md:px-16 lg:px-[10%] max-w-[1800px] mx-auto pointer-events-none">
        
        <div 
          className={`w-full lg:w-[45%] xl:w-[40%] flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-1000 ease-out delay-300 pointer-events-auto ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* YadaLearn Logo/Title */}
          <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold text-[#1a202c] mb-6 tracking-tight leading-tight drop-shadow-sm">
            YadaLearn
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-slate-600 mb-14 font-medium max-w-lg">
            Every Lesson a Treasure
          </p>

          {/* Authentication CTA */}
          <div className="w-full max-w-sm flex flex-col items-center lg:items-start">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-black text-white text-lg md:text-xl font-semibold px-12 py-4 rounded-full shadow-2xl hover:shadow-black/20 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            >
              Get Started
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Welcome;
