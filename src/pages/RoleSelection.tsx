
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'parent' | null>(null);
  const [studentVisible, setStudentVisible] = useState(false);
  const [teacherVisible, setTeacherVisible] = useState(false);
  const [parentVisible, setParentVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Staggered animation sequence
      setTimeout(() => setTitleVisible(true), 200);
      setTimeout(() => setStudentVisible(true), 500);
      setTimeout(() => setTeacherVisible(true), 700);
      setTimeout(() => setParentVisible(true), 900);
    }
  }, [isLoaded]);

  const handleRoleSelect = (role: 'student' | 'teacher' | 'parent') => {
    setSelectedRole(role);
    // Zoom and fade animation before navigation
    setTimeout(() => {
      navigate('/onboarding', { state: { role: role } });
    }, 800); // Increased delay for zoom animation
  };

  return (
    <div className="min-h-screen w-full gradient-welcome relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 gradient-mesh opacity-20"></div>

      {/* Main Content Container */}
      <div className={`min-h-screen w-full relative z-10 transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* Desktop Layout - Enhanced */}
        <div className="hidden lg:flex desktop-split">
          {/* Left side - Enhanced Title and Info */}
          <div className="w-1/2 desktop-sidebar text-right">
            <div className="space-fluid-2xl animate-fade-in-up">
              <h1 className="text-fluid-display font-bold text-gray-800 mb-6 leading-tight">
                Welcome to YadaLearn
              </h1>
              <p className="text-fluid-subheading text-gray-600 mb-8 leading-relaxed">
                Choose your role to get started
              </p>
              <p className="text-fluid-body text-gray-500 leading-relaxed">
                Join thousands of learners and educators worldwide
              </p>
            </div>
          </div>

          {/* Right side - Enhanced Role Selection Cards */}
          <div className="w-1/2 desktop-main h-screen overflow-y-auto pb-12 pt-12 pr-8 scrollbar-hide">
            <div className="space-y-8">

              {/* Student Role - Enhanced 3D */}
              <div
                className={`transition-all duration-700 ease-out ${studentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
              >
                <div
                  className={`role-card-3d group cursor-pointer relative transition-all duration-800 ${selectedRole === 'student' ? 'animate-zoom-in-fade-out' : ''
                    }`}
                  onClick={() => handleRoleSelect('student')}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const rotateX = (e.clientY - centerY) / 20;
                    const rotateY = (centerX - e.clientX) / 20;

                    card.style.setProperty('--rotate-x', `${rotateX}deg`);
                    card.style.setProperty('--rotate-y', `${rotateY}deg`);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty('--rotate-x', '0deg');
                    e.currentTarget.style.setProperty('--rotate-y', '0deg');
                  }}
                >
                  <div className="relative">
                    {/* Complex shadow effect for student */}
                    <div
                      className={`transition-all duration-300 ${selectedRole === 'student'
                        ? 'opacity-100 scale-110'
                        : 'opacity-0 group-hover:opacity-50 group-hover:scale-105'
                        }`}
                      style={{
                        width: '300px',
                        height: '350px',
                        background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
                        clipPath: 'polygon(0 0, 85% 0, 100% 85%, 15% 100%, 0 85%)',
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        zIndex: -1,
                        boxShadow: '15px 15px 40px rgba(139, 92, 246, 0.15)'
                      }}
                    />

                    {/* Student Card Content */}
                    <div className="relative bg-white rounded-3xl p-8 shadow-lg h-[350px]">
                      {/* Student Avatar */}
                      <div className="relative mx-auto mb-6 h-32 w-32">
                        <div className="h-full w-full rounded-full border-4 border-white bg-gradient-to-br from-purple-200 to-indigo-300 shadow-lg">
                          <img
                            src="/student-role.png"
                            alt="Student"
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Student Label */}
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">Student</h2>
                      <p className="text-gray-600 text-lg">Embark on your personalized learning journey</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Role - Enhanced 3D */}
              <div
                className={`transition-all duration-700 ease-out delay-100 ${teacherVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
              >
                <div
                  className={`role-card-3d group cursor-pointer relative transition-all duration-800 ${selectedRole === 'teacher' ? 'animate-zoom-in-fade-out' : ''
                    }`}
                  onClick={() => handleRoleSelect('teacher')}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const rotateX = (e.clientY - centerY) / 20;
                    const rotateY = (centerX - e.clientX) / 20;

                    card.style.setProperty('--rotate-x', `${rotateX}deg`);
                    card.style.setProperty('--rotate-y', `${rotateY}deg`);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty('--rotate-x', '0deg');
                    e.currentTarget.style.setProperty('--rotate-y', '0deg');
                  }}
                >
                  <div className="relative">
                    {/* Complex shadow effect for teacher */}
                    <div
                      className={`transition-all duration-300 ${selectedRole === 'teacher'
                        ? 'opacity-100 scale-110'
                        : 'opacity-0 group-hover:opacity-50 group-hover:scale-105'
                        }`}
                      style={{
                        width: '300px',
                        height: '350px',
                        background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
                        clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 85%, 0 15%)',
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        zIndex: -1,
                        boxShadow: '15px 15px 40px rgba(16, 185, 129, 0.15)'
                      }}
                    />

                    {/* Teacher Card Content */}
                    <div className="relative bg-white rounded-3xl p-8 shadow-lg h-[350px]">
                      {/* Teacher Avatar */}
                      <div className="relative mx-auto mb-6 h-32 w-32">
                        <div className="h-full w-full rounded-full border-4 border-white bg-gradient-to-br from-blue-200 to-teal-300 shadow-lg">
                          <img
                            src="/teacher-role.png"
                            alt="Teacher"
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Teacher Label */}
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">Teacher</h2>
                      <p className="text-gray-600 text-lg">Share your knowledge and inspire students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent Role - Enhanced 3D */}
              <div
                className={`transition-all duration-700 ease-out delay-200 ${parentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
              >
                <div
                  className={`role-card-3d group cursor-pointer relative transition-all duration-800 ${selectedRole === 'parent' ? 'animate-zoom-in-fade-out' : ''
                    }`}
                  onClick={() => handleRoleSelect('parent')}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const rotateX = (e.clientY - centerY) / 20;
                    const rotateY = (centerX - e.clientX) / 20;

                    card.style.setProperty('--rotate-x', `${rotateX}deg`);
                    card.style.setProperty('--rotate-y', `${rotateY}deg`);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty('--rotate-x', '0deg');
                    e.currentTarget.style.setProperty('--rotate-y', '0deg');
                  }}
                >
                  <div className="relative">
                    {/* Complex shadow effect for parent */}
                    <div
                      className={`transition-all duration-300 ${selectedRole === 'parent'
                        ? 'opacity-100 scale-110'
                        : 'opacity-0 group-hover:opacity-50 group-hover:scale-105'
                        }`}
                      style={{
                        width: '300px',
                        height: '350px',
                        background: 'linear-gradient(135deg, #FDE68A 0%, #FCA5A5 100%)',
                        clipPath: 'polygon(0 15%, 15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%)',
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        zIndex: -1,
                        boxShadow: '15px 15px 40px rgba(245, 158, 11, 0.15)'
                      }}
                    />

                    {/* Parent Card Content */}
                    <div className="relative bg-white rounded-3xl p-8 shadow-lg h-[350px]">
                      {/* Parent Avatar */}
                      <div className="relative mx-auto mb-6 h-32 w-32 flex items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-orange-200 to-rose-300 shadow-lg">
                          <img
                            src="/parent role image.jpg"
                            alt="Guardian"
                            className="h-full w-full rounded-full object-cover"
                          />
                      </div>

                      {/* Parent Label */}
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">Guardian</h2>
                      <p className="text-gray-600 text-lg">Track progress and support learning</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden h-full flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm text-center space-y-8">

            {/* Header - Mobile */}
            <div className="space-y-4">
              <h1
                className={`text-4xl font-bold text-gray-800 transition-all duration-700 ease-out ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
              >
                Welcome to YadaLearn
              </h1>
              <p
                className={`text-lg text-gray-600 transition-all duration-700 ease-out delay-200 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
              >
                Choose your role to get started
              </p>
            </div>

            {/* Student Role - Mobile */}
            <div
              className={`transition-all duration-700 ease-out ${studentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <div
                className={`group cursor-pointer transition-all duration-300 ${selectedRole === 'student' ? 'animate-zoom-in-fade-out' : 'hover:scale-105'
                  }`}
                onClick={() => handleRoleSelect('student')}
              >
                <div className="relative">
                  {/* Mobile shadow effect for student */}
                  <div
                    className={`transition-all duration-300 ${selectedRole === 'student'
                      ? 'opacity-100 scale-110'
                      : 'opacity-0 group-hover:opacity-50 group-hover:scale-105'
                      }`}
                    style={{
                      width: '280px',
                      height: '360px',
                      background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: -1,
                      boxShadow: '15px 15px 40px rgba(139, 92, 246, 0.15)'
                    }}
                  />

                  {/* Student Card Content - Mobile */}
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg mx-auto" style={{ width: '280px' }}>
                    {/* Student Avatar */}
                    <div className="relative mx-auto mb-4 h-24 w-24">
                      <div className="h-full w-full rounded-full border-4 border-white bg-gradient-to-br from-purple-200 to-purple-300 shadow-lg">
                        <img
                          src="/images/download (9).png"
                          alt="Student"
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Student Label */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Student</h2>
                    <p className="text-gray-600">Find teachers and start your learning journey</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Role - Mobile */}
            <div
              className={`transition-all duration-700 ease-out delay-200 ${teacherVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <div
                className={`group cursor-pointer transition-all duration-300 ${selectedRole === 'teacher' ? 'animate-zoom-in-fade-out' : 'hover:scale-105'
                  }`}
                onClick={() => handleRoleSelect('teacher')}
              >
                <div className="relative">
                  {/* Mobile shadow effect for teacher */}
                  <div
                    className={`transition-all duration-300 ${selectedRole === 'teacher'
                      ? 'opacity-100 scale-110'
                      : 'opacity-0 group-hover:opacity-50 group-hover:scale-105'
                      }`}
                    style={{
                      width: '280px',
                      height: '360px',
                      background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
                      clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0 100%)',
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: -1,
                      boxShadow: '15px 15px 40px rgba(16, 185, 129, 0.15)'
                    }}
                  />

                  {/* Teacher Card Content - Mobile */}
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg mx-auto" style={{ width: '280px' }}>
                    {/* Teacher Avatar */}
                    <div className="relative mx-auto mb-4 h-24 w-24">
                      <div className="h-full w-full rounded-full border-4 border-white bg-gradient-to-br from-blue-200 to-teal-300 shadow-lg">
                        <img
                          src="/teacher-role.png"
                          alt="Teacher"
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Teacher Label */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher</h2>
                    <p className="text-gray-600">Share your knowledge and inspire students</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Role - Mobile */}
            <div
              className={`transition-all duration-700 ease-out delay-300 ${parentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <div
                className={`group cursor-pointer transition-all duration-300 ${selectedRole === 'parent' ? 'animate-zoom-in-fade-out' : 'hover:scale-105'
                  }`}
                onClick={() => handleRoleSelect('parent')}
              >
                <div className="relative pb-12">
                  {/* Mobile shadow effect for parent */}
                  <div
                    className={`transition-all duration-300 ${selectedRole === 'parent'
                      ? 'opacity-100 scale-110'
                      : 'opacity-0 group-hover:opacity-50 group-hover:scale-105'
                      }`}
                    style={{
                      width: '280px',
                      height: '360px',
                      background: 'linear-gradient(135deg, #FDE68A 0%, #FCA5A5 100%)',
                      clipPath: 'polygon(0 0, 100% 20%, 100% 100%, 0 100%)',
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: -1,
                      boxShadow: '15px 15px 40px rgba(245, 158, 11, 0.15)'
                    }}
                  />

                  {/* Parent Card Content - Mobile */}
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg mx-auto" style={{ width: '280px' }}>
                    {/* Parent Avatar */}
                    <div className="relative mx-auto mb-4 h-24 w-24 flex items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-orange-200 to-rose-300 shadow-lg">
                      <img
                        src="/parent role image.jpg"
                        alt="Guardian"
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>

                    {/* Parent Label */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Guardian</h2>
                    <p className="text-gray-600">Track progress and support learning</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
