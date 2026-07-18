import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
// @ts-ignore
import {
  UndrawStudying, UndrawPresentation, UndrawChat, UndrawGrowing, UndrawTarget,
  UndrawChoose, UndrawTimeManagement, UndrawCelebration, UndrawReadingList,
  UndrawGrades, UndrawCreativity, UndrawLiveCollaboration, UndrawCalendar,
  UndrawCalculator, UndrawScience
} from 'react-undraw-illustrations';

const Onboarding = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('yadalearn-lang') || 'en');

  const navigate = useNavigate();
  const location = useLocation();
  const { setUserRole, setOnboardingCompleted, user, refreshUser } = useAuth();
  const role = location.state?.role || 'student';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedRole = localStorage.getItem('yadalearn-user-role');
    if (savedRole === 'teacher') {
      setUserRole?.('teacher');
    }
    const lang = localStorage.getItem('yadalearn-lang');
    if (lang) setLanguage(lang);
  }, []);

  const onChangeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('yadalearn-lang', lang);
  };

  const isDualPath = answers.teachingFocus?.includes('Languages') && answers.teachingFocus?.includes('IGCSE Subjects');
  const showIGCSEPath = answers.teachingFocus?.includes('IGCSE Subjects') &&
    (!answers.teachingFocus?.includes('Languages') || currentStep > 9);

  const getMaxStep = () => {
    if (role === 'student') return 7;
    if (role === 'parent') return 3;
    // Teacher
    if (isDualPath) return 16;
    return 9;
  };

  const nextStep = () => {
    const maxStep = getMaxStep();
    if (currentStep < maxStep) {
      setCurrentStep(prev => prev + 1);
    } else {
      const userName = answers.userName || (role === 'teacher' ? 'Teacher' : 'Student');
      const defaultUser = {
        email: 'onboarding@yadalearn.com',
        name: userName,
        firstName: userName.split(' ')[0],
        lastName: userName.split(' ').slice(1).join(' ') || '',
        imageUrl: ''
      };
      localStorage.setItem('yadalearn-user', JSON.stringify(defaultUser));
      localStorage.setItem('yadalearn-user-role', role);
      localStorage.setItem('yadalearn-lang', language);
      localStorage.setItem('yadalearn-onboarding-answers', JSON.stringify(answers));

      // Extract selected subjects & languages
      const selectedSubjectsList: string[] = [];
      const selectedLanguagesList: string[] = [];
      if (role === 'student') {
        if (answers.studyPath === 'Languages') {
          if (answers.selectedLanguages) {
            selectedLanguagesList.push(...answers.selectedLanguages);
            selectedSubjectsList.push(...answers.selectedLanguages);
          }
        } else if (answers.studyPath === 'IGCSE') {
          if (answers.selectedSubjects) selectedSubjectsList.push(...answers.selectedSubjects);
        }
      } else { // teacher
        if (answers.languageSpecialization) {
          selectedLanguagesList.push(...answers.languageSpecialization);
          selectedSubjectsList.push(...answers.languageSpecialization);
        }
        if (answers.subjectSpecialization) selectedSubjectsList.push(...answers.subjectSpecialization);
      }

      setUserRole?.(role);
      setOnboardingCompleted?.(true, selectedSubjectsList, selectedLanguagesList, answers, role);
      refreshUser?.();

      const dashboardPath = role === 'teacher' ? '/teacher-dashboard' : role === 'parent' ? '/parent-dashboard' : '/student-dashboard';
      setTimeout(() => {
        navigate(dashboardPath, { replace: true });
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAnswer = (question: string, answer: any, autoAdvance = false) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
    if (autoAdvance) {
      setTimeout(() => {
        nextStep();
      }, 300);
    }
  };

  const Illustration = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-center mb-8 transform scale-125 origin-center">
      {children}
    </div>
  );

  const renderStudentStep = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <Illustration>
            <UndrawStudying primaryColor='#9333ea' height='200px' />
          </Illustration>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">What would you like to study?</h2>
            <p className="text-gray-600">Choose your learning path</p>
          </div>
          <div className="space-y-4">
            <div className={`relative flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${answers.studyPath === 'Languages' ? 'border-purple-400 bg-purple-50 shadow-md transform scale-[1.02]' : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm'}`} onClick={() => handleAnswer('studyPath', 'Languages', true)}>
              <div className="flex-1 text-center"><span className="text-xl font-bold text-gray-800 block">Languages</span><span className="text-sm text-gray-500">Learn new languages</span></div>
            </div>
            <div className={`relative flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${answers.studyPath === 'IGCSE' ? 'border-blue-400 bg-blue-50 shadow-md transform scale-[1.02]' : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'}`} onClick={() => handleAnswer('studyPath', 'IGCSE', true)}>
              <div className="flex-1 text-center"><span className="text-xl font-bold text-gray-800 block">IGCSE Subjects</span><span className="text-sm text-gray-500">Excel in academics</span></div>
            </div>
          </div>
        </div>
      );
    }
    if (answers.studyPath === 'Languages') {
      if (currentStep === 2) {
        const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawChat primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Which language?</h2><p className="text-sm text-gray-600">Select one or more</p></div>
            <div className="grid grid-cols-2 gap-3">
              {languages.map(lang => {
                const isSelected = answers.selectedLanguages?.includes(lang) || false;
                return (
                  <div key={lang} className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${isSelected ? 'border-purple-400 bg-purple-50 font-semibold text-purple-900' : 'border-gray-100 bg-white text-gray-600 hover:border-purple-200'}`} onClick={() => {
                    const current = answers.selectedLanguages || [];
                    handleAnswer('selectedLanguages', isSelected ? current.filter((l: string) => l !== lang) : [...current, lang]);
                  }}>{lang}</div>
                );
              })}
            </div>
          </div>
        );
      }
      if (currentStep === 3) {
        const levels = [{ value: 'Beginner', label: "Beginner", sublabel: "Just starting" }, { value: 'Intermediate', label: "Intermediate", sublabel: "Basic conversations" }, { value: 'Advanced', label: "Advanced", sublabel: "Fluent & accurate" }];
        return (
          <div className="space-y-6">
            <Illustration><UndrawGrowing primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Your current level?</h2></div>
            <div className="space-y-3">
              {levels.map(option => (
                <div key={option.value} className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${answers.currentLevel === option.value ? 'border-purple-400 bg-purple-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-purple-200'}`} onClick={() => handleAnswer('currentLevel', option.value, true)}>
                  <span className="text-lg font-bold text-gray-800 block">{option.label}</span><span className="text-sm text-gray-500">{option.sublabel}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (currentStep === 4) {
        const goals = ["Communicate confidently", "Exam preparation", "Career & Business", "Travel & Culture", "Personal Interest"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawTarget primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Main goal?</h2></div>
            <div className="space-y-3">
              {goals.map(goal => (
                <div key={goal} className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${answers.learningObjective === goal ? 'border-blue-400 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-blue-200'}`} onClick={() => handleAnswer('learningObjective', goal, true)}>
                  <span className="font-medium text-gray-700">{goal}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (currentStep === 5) {
        const preferences = ["One-on-one private", "Group sessions", "Self-paced"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawChoose primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Study preference?</h2></div>
            <div className="space-y-3">
              {preferences.map(pref => (
                <div key={pref} className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${answers.classPreference === pref ? 'border-purple-400 bg-purple-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-purple-200'}`} onClick={() => handleAnswer('classPreference', pref, true)}>
                  <span className="text-lg font-semibold text-gray-700">{pref}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (currentStep === 6) {
        const timeOptions = ['Weekdays', 'Weekends', 'Flexible'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawTimeManagement primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Preferred time?</h2></div>
            <div className="space-y-3">
              {timeOptions.map(time => (
                <div key={time} className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${answers.timeAvailability === time ? 'border-blue-400 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-blue-200'}`} onClick={() => handleAnswer('timeAvailability', time, true)}>
                  <span className="text-lg font-semibold text-gray-700">{time}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (currentStep === 7) {
        return (
          <div className="text-center py-8 space-y-6">
            <Illustration><UndrawCelebration primaryColor='#9333ea' height='200px' /></Illustration>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">🎉 All set!</h2>
            <p className="text-lg text-gray-600">Your dashboard is ready. Getting you matched...</p>
            <Button onClick={nextStep} size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg text-lg font-bold py-6">Go to Dashboard →</Button>
          </div>
        );
      }
    }
    if (answers.studyPath === 'IGCSE') {
      if (currentStep === 2) {
        const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Business', 'Computer Science'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawScience primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Choose subjects</h2><p className="text-sm text-gray-600">Select one or more subjects</p></div>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map(subject => {
                const isSelected = answers.selectedSubjects?.includes(subject) || false;
                return (
                  <div key={subject} className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${isSelected ? 'border-blue-400 bg-blue-50 font-semibold text-blue-900 shadow-sm' : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200'}`} onClick={() => {
                    const current = answers.selectedSubjects || [];
                    handleAnswer('selectedSubjects', isSelected ? current.filter((s: string) => s !== subject) : [...current, subject]);
                  }}>{subject}</div>
                );
              })}
            </div>
          </div>
        );
      }
      if (currentStep === 3) {
        const grades = ['Year 9', 'Year 10', 'Year 11'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawGrades primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Grade level?</h2></div>
            <div className="space-y-3">
              {grades.map(grade => (<div key={grade} className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${answers.gradeLevel === grade ? 'border-purple-400 bg-purple-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-purple-200'}`} onClick={() => handleAnswer('gradeLevel', grade, true)}><span className="text-lg font-semibold text-gray-700">{grade}</span></div>))}
            </div>
          </div>
        );
      }
      if (currentStep === 4) {
        const goals = ["Exams", "Weak topics", "Past papers", "General"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawTarget primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Main goal?</h2></div>
            <div className="space-y-3">
              {goals.map(goal => (<div key={goal} className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${answers.studyGoal === goal ? 'border-blue-400 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-blue-200'}`} onClick={() => handleAnswer('studyGoal', goal, true)}><span className="font-medium text-gray-700">{goal}</span></div>))}
            </div>
          </div>
        );
      }
      if (currentStep === 5) {
        const preferences = ["One-on-one", "Group", "Self-paced"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawChoose primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Study preference?</h2></div>
            <div className="space-y-3">
              {preferences.map(pref => (<div key={pref} className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${answers.studyPreference === pref ? 'border-purple-400 bg-purple-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-purple-200'}`} onClick={() => handleAnswer('studyPreference', pref, true)}><span className="text-lg font-semibold text-gray-700">{pref}</span></div>))}
            </div>
          </div>
        );
      }
      if (currentStep === 6) {
        const schedules = ["Daily", "3x Week", "Once a week", "Flexible"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawCalendar primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">How often?</h2></div>
            <div className="space-y-3">
              {schedules.map(schedule => (<div key={schedule} className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${answers.studySchedule === schedule ? 'border-blue-400 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-blue-200'}`} onClick={() => handleAnswer('studySchedule', schedule, true)}><span className="text-lg font-semibold text-gray-700">{schedule}</span></div>))}
            </div>
          </div>
        );
      }
      if (currentStep === 7) {
        return (
          <div className="text-center py-8 space-y-6">
            <Illustration><UndrawCelebration primaryColor='#9333ea' height='200px' /></Illustration>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">🎉 All set!</h2>
            <p className="text-lg text-gray-600">Your IGCSE plan is ready.</p>
            <Button onClick={nextStep} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full shadow-lg text-lg font-bold py-6">Go to Dashboard →</Button>
          </div>
        );
      }
    }
    return null;
  };

  const renderTeacherStep = () => {
    if (currentStep === 1) {
      return (
        <div className="text-center py-8 space-y-6">
          <Illustration>
            <UndrawPresentation primaryColor='#9333ea' height='200px' />
          </Illustration>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Teacher</h2>
          <p className="text-gray-600">Let's build your profile.</p>
          <Button onClick={nextStep} size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg font-bold py-6">Get Started →</Button>
        </div>
      );
    }
    if (currentStep === 2) {
      const focuses = ['Languages', 'IGCSE Subjects'];
      return (
        <div className="space-y-6">
          <Illustration><UndrawReadingList primaryColor='#9333ea' height='200px' /></Illustration>
          <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">What do you teach?</h2><p className="text-sm text-gray-600">Select all that apply</p></div>
          <div className="space-y-3">
            {focuses.map(focus => {
              const isSelected = answers.teachingFocus?.includes(focus) || false;
              return (
                <div key={focus} className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${isSelected ? 'border-purple-400 bg-purple-50 shadow-md' : 'border-gray-100 bg-white hover:border-purple-200'}`} onClick={() => {
                  const current = answers.teachingFocus || [];
                  handleAnswer('teachingFocus', isSelected ? current.filter((f: string) => f !== focus) : [...current, focus], true);
                }}><span className="text-lg font-bold text-gray-800">{focus}</span></div>
              );
            })}
          </div>
        </div>
      );
    }
    if (answers.teachingFocus?.includes('Languages')) {
      if (currentStep === 3) {
        const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawChat primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Each one teach one</h2><p className="text-sm text-gray-600">Which languages do you teach?</p></div>
            <div className="grid grid-cols-2 gap-3">
              {languages.map(lang => {
                const isSelected = answers.languageSpecialization?.includes(lang) || false;
                return (
                  <div key={lang} className={`p-3 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${isSelected ? 'bg-purple-50 border-purple-400 font-semibold text-purple-900' : 'bg-white border-gray-100 text-gray-600 hover:border-purple-200'}`} onClick={() => {
                    const current = answers.languageSpecialization || [];
                    handleAnswer('languageSpecialization', isSelected ? current.filter((l: string) => l !== lang) : [...current, lang]);
                  }}>{lang}</div>
                )
              })}
            </div>
          </div>
        )
      }
      if (currentStep === 4) {
        const levels = ['Beginner', 'Intermediate', 'Advanced'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawGrades primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Teaching Levels</h2><p className="text-sm text-gray-600">Select all that apply</p></div>
            <div className="space-y-3">
              {levels.map(level => {
                const isSelected = answers.teachingLevel?.includes(level) || false;
                return (<div key={level} className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${isSelected ? 'bg-purple-50 border-purple-400 font-semibold' : 'bg-white border-gray-100 hover:border-purple-200'}`} onClick={() => {
                  const current = answers.teachingLevel || [];
                  handleAnswer('teachingLevel', isSelected ? current.filter((l: string) => l !== level) : [...current, level], true);
                }}>{level}</div>)
              })}
            </div>
          </div>
        )
      }
      if (currentStep === 5) {
        const styles = ["Structured – syllabus-driven lessons", "Conversational – real-world communication focus", "Flexible – tailored to each student's needs"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawCreativity primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Teaching Style</h2></div>
            <div className="space-y-3">
              {styles.map(style => (<div key={style} className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${answers.teachingApproach === style ? 'bg-purple-50 border-purple-400 font-semibold' : 'bg-white border-gray-100 hover:border-purple-200'}`} onClick={() => handleAnswer('teachingApproach', style, true)}>{style}</div>))}
            </div>
          </div>
        )
      }
      if (currentStep === 6) {
        const formats = ["Live one-on-one sessions", "Group classes", "Recorded video lessons"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawLiveCollaboration primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Lesson Format</h2></div>
            <div className="space-y-3">{formats.map(format => (<div key={format} className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${answers.lessonFormat === format ? 'bg-purple-50 border-purple-400 font-semibold' : 'bg-white border-gray-100 hover:border-purple-200'}`} onClick={() => handleAnswer('lessonFormat', format, true)}>{format}</div>))}</div>
          </div>
        )
      }
      if (currentStep === 7) {
        const availability = ['Weekdays', 'Weekends', 'Both'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawCalendar primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Availability</h2></div>
            <div className="space-y-3">{availability.map(avail => (<div key={avail} className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${answers.availability === avail ? 'bg-purple-50 border-purple-400 font-semibold' : 'bg-white border-gray-100 hover:border-purple-200'}`} onClick={() => handleAnswer('availability', avail, true)}>{avail}</div>))}</div>
          </div>
        )
      }
      if (currentStep === 8) {
        return (
          <div className="space-y-6">
            <Illustration><UndrawCalculator primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Hourly Rate ($)</h2><p className="text-sm text-gray-600">Range (e.g., 10 - 25)</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Rate</Label><Input type="number" value={answers.minRate || ""} onChange={(e) => handleAnswer('minRate', e.target.value)} className="mt-1" /></div>
              <div><Label>Max Rate</Label><Input type="number" value={answers.maxRate || ""} onChange={(e) => handleAnswer('maxRate', e.target.value)} className="mt-1" /></div>
            </div>
          </div>
        )
      }
      if (currentStep === 9) {
        return (
          <div className="text-center py-8 space-y-6">
            <Illustration><UndrawCelebration primaryColor='#9333ea' height='200px' /></Illustration>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">🎉 All set!</h2>
            {isDualPath ? (
              <>
                <p className="text-lg text-gray-600">Great! Now let's set up your IGCSE profile.</p>
                <Button onClick={nextStep} size="lg" className="w-full bg-blue-600 text-white rounded-full shadow-lg text-lg font-bold py-6 hover:bg-blue-700">Continue →</Button>
              </>
            ) : (
              <>
                <p className="text-lg text-gray-600">Your teaching profile is ready.</p>
                <Button onClick={nextStep} size="lg" className="w-full bg-black text-white rounded-full shadow-lg text-lg font-bold py-6 hover:bg-gray-800">Go to Dashboard →</Button>
              </>
            )}
          </div>
        );
      }
    }

    if (showIGCSEPath) {
      const effectiveStep = (isDualPath && currentStep > 9) ? currentStep - 7 : currentStep;
      if (effectiveStep === 3) {
        const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Business', 'Computer Science'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawScience primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">IGCSE Subjects</h2><p className="text-sm text-gray-600">Select all that apply</p></div>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map(subject => {
                const isSelected = answers.subjectSpecialization?.includes(subject) || false;
                return (<div key={subject} className={`p-2 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 text-sm ${isSelected ? 'bg-blue-50 border-blue-400 font-semibold text-blue-900' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'}`} onClick={() => {
                  const current = answers.subjectSpecialization || [];
                  handleAnswer('subjectSpecialization', isSelected ? current.filter((s: string) => s !== subject) : [...current, subject]);
                }}>{subject}</div>)
              })}
            </div>
          </div>
        )
      }
      if (effectiveStep === 4) {
        const grades = ['Year 9', 'Year 10', 'Year 11'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawGrades primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Grade Levels</h2></div>
            <div className="space-y-3">{grades.map(grade => (<div key={grade} className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${answers.gradeLevelFocus === grade ? 'bg-blue-50 border-blue-400 font-semibold' : 'bg-white border-gray-100 hover:border-blue-200'}`} onClick={() => handleAnswer('gradeLevelFocus', grade, true)}>{grade}</div>))}</div>
          </div>
        )
      }
      if (effectiveStep === 5) {
        const styles = ["Curriculum-based", "Conceptual & practice-focused", "Exam-oriented"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawCreativity primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Approach</h2></div>
            <div className="space-y-3">{styles.map(style => (<div key={style} className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${answers.teachingStyle === style ? 'bg-blue-50 border-blue-400 font-semibold' : 'bg-white border-gray-100 hover:border-blue-200'}`} onClick={() => handleAnswer('teachingStyle', style, true)}>{style}</div>))}</div>
          </div>
        )
      }
      if (effectiveStep === 6) {
        const types = ["One-on-one", "Group", "Recorded modules"];
        return (
          <div className="space-y-6">
            <Illustration><UndrawLiveCollaboration primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Class Format</h2></div>
            <div className="space-y-3">{types.map(type => (<div key={type} className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${answers.classType === type ? 'bg-blue-50 border-blue-400 font-semibold' : 'bg-white border-gray-100 hover:border-blue-200'}`} onClick={() => handleAnswer('classType', type, true)}>{type}</div>))}</div>
          </div>
        )
      }
      if (effectiveStep === 7) {
        const schedule = ['Weekdays', 'Weekends', 'Flexible'];
        return (
          <div className="space-y-6">
            <Illustration><UndrawCalendar primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Schedule</h2></div>
            <div className="space-y-3">{schedule.map(sched => (<div key={sched} className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${answers.schedule === sched ? 'bg-blue-50 border-blue-400 font-semibold' : 'bg-white border-gray-100 hover:border-blue-200'}`} onClick={() => handleAnswer('schedule', sched, true)}>{sched}</div>))}</div>
          </div>
        )
      }
      if (effectiveStep === 8) {
        return (
          <div className="space-y-6">
            <Illustration><UndrawCalculator primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Hourly Rate ($)</h2><p className="text-sm text-gray-600">Range (e.g., 8 - 20)</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Rate</Label><Input type="number" value={answers.minRate || ""} onChange={(e) => handleAnswer('minRate', e.target.value)} className="mt-1" /></div>
              <div><Label>Max Rate</Label><Input type="number" value={answers.maxRate || ""} onChange={(e) => handleAnswer('maxRate', e.target.value)} className="mt-1" /></div>
            </div>
          </div>
        )
      }
      if (effectiveStep === 9) {
        return (
          <div className="text-center py-8 space-y-6">
            <Illustration><UndrawCelebration primaryColor='#9333ea' height='200px' /></Illustration>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">🎉 All set!</h2>
            <p className="text-lg text-gray-600">Your IGCSE teaching profile is ready.</p>
            <Button onClick={nextStep} size="lg" className="w-full bg-black text-white rounded-full shadow-lg text-lg font-bold py-6 hover:bg-gray-800">Go to Dashboard →</Button>
          </div>
        );
      }
    }
    return null;
  };

  const renderParentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <Illustration><UndrawPresentation primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Guardian!</h2>
              <p className="text-gray-500 text-lg">Let's set up your profile to track progress.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 text-sm font-semibold mb-2 block">What's your name?</Label>
                <Input
                  autoFocus
                  placeholder="e.g. Sarah Connor"
                  value={answers.userName || ''}
                  onChange={(e) => handleAnswer('userName', e.target.value)}
                  className="w-full text-lg p-6 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <Illustration><UndrawChoose primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Details</h2>
              <p className="text-gray-500 text-lg">Help us personalize your experience.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 text-sm font-semibold mb-2 block">Gender</Label>
                <select
                  value={answers.gender || ''}
                  onChange={(e) => handleAnswer('gender', e.target.value)}
                  className="w-full text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 bg-white"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-700 text-sm font-semibold mb-2 block">Date of Birth</Label>
                <Input
                  type="date"
                  value={answers.dateOfBirth || ''}
                  onChange={(e) => handleAnswer('dateOfBirth', e.target.value)}
                  className="w-full text-lg p-6 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <Illustration><UndrawChat primaryColor='#9333ea' height='200px' /></Illustration>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Info</h2>
              <p className="text-gray-500 text-lg">How can teachers reach you?</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 text-sm font-semibold mb-2 block">Contact Number</Label>
                <Input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={answers.contactNumber || ''}
                  onChange={(e) => handleAnswer('contactNumber', e.target.value)}
                  className="w-full text-lg p-6 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const maxStep = getMaxStep();

  const renderDots = () => (
    <div className="flex justify-center space-x-2 mt-6">
      {Array.from({ length: maxStep }).map((_, i) => (
        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i + 1 === currentStep ? 'w-8 bg-purple-600' : 'w-2 bg-purple-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex justify-end mb-4">
            <select value={language} onChange={(e) => onChangeLanguage(e.target.value)} className="bg-transparent text-sm text-gray-500 focus:outline-none cursor-pointer">
              <option value="en" className="bg-white text-gray-900">English</option>
              <option value="id" className="bg-white text-gray-900">Indonesia</option>
            </select>
          </div>

          {role === 'student' ? renderStudentStep() : role === 'parent' ? renderParentStep() : renderTeacherStep()}

          {renderDots()}

          <div className="flex justify-between items-center mt-6">
            <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1} className={`text-gray-400 hover:text-gray-600 ${currentStep === 1 ? 'invisible' : ''}`}>Back</Button>

            {(() => {
              // Update showNext logic for Dual Path
              const getShowNext = () => {
                if (role === 'student' && answers.studyPath === 'Languages' && currentStep === 2 && answers.selectedLanguages?.length > 0) return true;
                if (role === 'student' && answers.studyPath === 'IGCSE' && currentStep === 2 && answers.selectedSubjects?.length > 0) return true;
                if (role === 'teacher' && currentStep === 2 && answers.teachingFocus?.length > 0) return true; // Focus
                if (role === 'teacher' && answers.teachingFocus?.includes('Languages')) {
                  if (currentStep === 3 && answers.languageSpecialization?.length > 0) return true;
                  if (currentStep === 4) return true;
                }
                // If IGCSE path is active
                if (role === 'teacher' && showIGCSEPath) {
                  const effectiveStep = (isDualPath && currentStep > 9) ? currentStep - 7 : currentStep;
                  if (effectiveStep === 3 && answers.subjectSpecialization?.length > 0) return true;
                }
                // Inputs
                if (role === 'teacher') {
                  if (answers.teachingFocus?.includes('Languages') && currentStep === 8) return true;
                  if (showIGCSEPath) {
                    const effectiveStep = (isDualPath && currentStep > 9) ? currentStep - 7 : currentStep;
                    if (effectiveStep === 8) return true;
                  }
                }
                if (role === 'parent') {
                  if (currentStep === 1 && answers.userName?.trim()) return true;
                  if (currentStep === 2 && answers.gender && answers.dateOfBirth) return true;
                  if (currentStep === 3 && answers.contactNumber?.trim()) return true;
                }
                return false;
              };

              if (getShowNext()) {
                return (
                  <Button onClick={nextStep} variant="ghost" className="text-purple-600 font-semibold hover:bg-purple-50">{currentStep === maxStep ? 'Complete' : 'Next →'}</Button>
                );
              }
              return null;
            })()}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;