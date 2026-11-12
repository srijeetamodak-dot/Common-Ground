import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Building2,
  Check,
  AlertCircle,
  Upload,
  User,
  Mail,
  Hash,
  AtSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  POPULAR_COURSES,
  COLLEGE_YEARS,
  CAMPUS_SOCIETIES,
  CAMPUS_PREFERENCES,
  COLLEGE_NAME,
} from '../data/mockData';
import { CrossCoursePreference } from '../types';

export const VerificationModal: React.FC = () => {
  const {
    isVerificationOpen,
    setIsVerificationOpen,
    currentUser,
    registerOrSignIn,
  } = useApp();

  const [step, setStep] = useState<'creds' | 'academics' | 'societies' | 'success'>('creds');

  const isDefaultDemo = currentUser.id === 'user-srijeeta' && !localStorage.getItem('common_ground_user');

  // Registration credentials
  const [username, setUsername] = useState(isDefaultDemo ? '' : currentUser.username || '');
  const [realName, setRealName] = useState(isDefaultDemo ? '' : currentUser.realName || currentUser.name || '');
  const [email, setEmail] = useState(isDefaultDemo ? '' : currentUser.email || '');
  const [rollNumber, setRollNumber] = useState(isDefaultDemo ? '' : currentUser.rollNumber || '');

  // Photo & avatar options
  const [useStandardAvatar, setUseStandardAvatar] = useState(currentUser.useStandardAvatar ?? false);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl || '');

  // Academics
  const [course, setCourse] = useState(currentUser.course || POPULAR_COURSES[0]);
  const [subCourse, setSubCourse] = useState(currentUser.subCourse || '');
  const [year, setYear] = useState(currentUser.year || COLLEGE_YEARS[1]);
  const [crossCoursePref, setCrossCoursePref] = useState<CrossCoursePreference>(
    currentUser.crossCoursePreference || 'cross_course'
  );

  // Societies & Preferences
  const [selectedSocieties, setSelectedSocieties] = useState<string[]>(
    currentUser.societies || []
  );
  const [hasOtherSociety, setHasOtherSociety] = useState(false);
  const [otherSocietyName, setOtherSocietyName] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    currentUser.preferences || []
  );

  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (isVerificationOpen) {
      setStep('creds');
      setErrorMessage('');
      const isDemo = currentUser.id === 'user-srijeeta' && !localStorage.getItem('common_ground_user');
      setUsername(isDemo ? '' : currentUser.username || '');
      setRealName(isDemo ? '' : currentUser.realName || currentUser.name || '');
      setEmail(isDemo ? '' : currentUser.email || '');
      setRollNumber(isDemo ? '' : currentUser.rollNumber || '');
      setAvatarPreview(isDemo ? '' : currentUser.avatarUrl || '');
    }
  }, [isVerificationOpen, currentUser]);

  if (!isVerificationOpen) return null;

  // Photo file picker
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Profile image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
        setUseStandardAvatar(false);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFillDemo = () => {
    // Generate valid 6-digit roll starting with 2
    const randomSuffix = Math.floor(10000 + Math.random() * 89999);
    const demoRoll = `2${randomSuffix}`;
    const demoUser = `jmc_star${Math.floor(Math.random() * 90 + 10)}`;

    setUsername(demoUser);
    setRealName('Ananya Kashyap');
    setEmail('ananya.kashyap@jmc.du.ac.in');
    setRollNumber(demoRoll);
    setCourse('BA(Hons.)');
    setSubCourse('English Literature');
    setYear('2nd Year');
    setCrossCoursePref('cross_course');
    setSelectedSocieties(['Debate Society', 'Fine Arts Society', 'Mental Health Society']);
    setSelectedPreferences(['Amphitheatre', 'Mother Dairy', 'Thevenet stairs']);
    setUseStandardAvatar(false);
    setErrorMessage('');
  };

  const toggleSociety = (soc: string) => {
    setSelectedSocieties((prev) =>
      prev.includes(soc) ? prev.filter((s) => s !== soc) : [...prev, soc]
    );
  };

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  // Step 1: Validate username, real name, email, roll number, and avatar
  const handleProceedToAcademics = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim().toLowerCase().replace(/^@+/, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      setErrorMessage('Username can only contain letters, numbers, underscores, and dots.');
      return;
    }

    if (!realName.trim()) {
      setErrorMessage('Please enter your full name as registered in college records.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid student email address.');
      return;
    }

    const cleanRoll = rollNumber.trim();
    if (!/^2\d{5}$/.test(cleanRoll)) {
      setErrorMessage('Roll number must be exactly 6 digits starting with 2 (e.g. 240102).');
      return;
    }

    setStep('academics');
  };

  // Step 2: Academics
  const handleProceedToSocieties = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('societies');
  };

  // Step 3: Societies & Preferences -> Register
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (hasOtherSociety && !otherSocietyName.trim()) {
      setErrorMessage('Please specify the name of your "Other" society, or uncheck the Other option.');
      return;
    }

    setIsVerifying(true);

    const finalSocieties = [...selectedSocieties];
    if (hasOtherSociety && otherSocietyName.trim()) {
      if (!finalSocieties.includes(otherSocietyName.trim())) {
        finalSocieties.push(otherSocietyName.trim());
      }
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@+/, '');
    const cleanRoll = rollNumber.trim();

    const result = await registerOrSignIn({
      name: realName.trim(),
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      rollNumber: cleanRoll,
      course,
      subCourse: subCourse.trim(),
      year,
      societies: finalSocieties,
      preferences: selectedPreferences,
      crossCoursePreference: crossCoursePref,
      useStandardAvatar,
      avatarUrl: useStandardAvatar ? '' : avatarPreview || currentUser.avatarUrl,
    });

    setIsVerifying(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to register with this roll number.');
      setStep('creds');
      return;
    }

    setStep('success');
  };

  const resetAndClose = () => {
    setStep('creds');
    setErrorMessage('');
    setIsVerificationOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-700 via-rose-700 to-amber-700 flex items-center justify-center text-white shadow-md shadow-red-700/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif text-slate-900">
                  Student Verification
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  JMC DU Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {COLLEGE_NAME} • Private & Roll-verified
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'creds' ? 'bg-red-700 text-white' : 'bg-emerald-600 text-white'
                }`}
            >
              {step === 'creds' ? '1' : '✓'}
            </span>
            <span className={step === 'creds' ? 'text-red-800 font-bold' : 'text-slate-600'}>
              Account & Roll No
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'academics'
                  ? 'bg-red-700 text-white'
                  : step === 'societies' || step === 'success'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}
            >
              {step === 'societies' || step === 'success' ? '✓' : '2'}
            </span>
            <span className={step === 'academics' ? 'text-red-800 font-bold' : 'text-slate-500'}>
              Course & Spec
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'societies'
                  ? 'bg-rose-700 text-white'
                  : step === 'success'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}
            >
              {step === 'success' ? '✓' : '3'}
            </span>
            <span className={step === 'societies' ? 'text-rose-800 font-bold' : 'text-slate-500'}>
              Societies & Vibes
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Account credentials & Roll No */}
          {step === 'creds' && (
            <form onSubmit={handleProceedToAcademics} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-950">
                  <ShieldCheck className="w-4 h-4 text-red-700 shrink-0" />
                  <span>Student Confidentiality Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Your <strong>Full Name</strong> and <strong>Email ID</strong> are kept private and never shown to other students. Only your <strong>@username</strong> is displayed on profiles. Roll number must be a unique <strong>6-digit number starting with 2</strong> (e.g. 240102).
                </p>
              </div>

              {/* Demo Auto-fill Button */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-xs text-slate-600">
                  Quick test? Generate valid JMC student demo:
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  ⚡ Auto-fill Demo
                </button>
              </div>

              {/* Username (Public) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-red-700" />
                  Public Username (Displayed on profile)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    placeholder="student_handle"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Other students will only see this handle. No spaces allowed.
                </span>
              </div>

              {/* Roll Number (Mandatory 6-digit starting with 2) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-rose-700" />
                  Mandatory 6-Digit Roll Number (Starts with 2)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 240102"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 font-mono text-base font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-rose-600"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Must be 6 digits starting with 2. Cannot be edited once signed in. Duplicate roll numbers cannot sign in.
                </span>
              </div>

              {/* Real Full Name (Confidential) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Full Real Name (Confidential College Record)
                </label>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="e.g. Tanya Verma"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  required
                />
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                  🔒 Hidden from other students and profile visitors.
                </span>
              </div>

              {/* Email Address (Confidential) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  College / Personal Email (Confidential)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@jmc.du.ac.in"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  required
                />
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                  🔒 Hidden from public profile.
                </span>
              </div>

              {/* Profile Photo Upload & Standard White Circle Toggle */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Profile Photo Option
                </label>

                <div className="flex items-center gap-4">
                  {/* Avatar preview */}
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-stone-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {useStandardAvatar ? (
                      <div className="w-full h-full bg-white flex items-center justify-center text-slate-400 font-bold text-xs uppercase border border-stone-200">
                        No Photo
                      </div>
                    ) : avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-stone-300" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Profile Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Standard White Circle toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useStandardAvatar}
                        onChange={(e) => setUseStandardAvatar(e.target.checked)}
                        className="w-4 h-4 rounded text-red-700 border-stone-300 focus:ring-red-600"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        Standard white circle (No photo profile)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Academic Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Academics */}
          {step === 'academics' && (
            <form onSubmit={handleProceedToSocieties} className="space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                >
                  {POPULAR_COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Open ended Sub-Course / Specialisation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sub-Course / Specialisation
                </label>
                <input
                  type="text"
                  value={subCourse}
                  onChange={(e) => setSubCourse(e.target.value)}
                  placeholder="e.g. Economics, Psychology, Retail & IT, English..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Leave open-ended or specify your honours subject, discipline, or elective.
                </span>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Year of Study
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                >
                  {COLLEGE_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cross Course Preference Choice */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Are you looking for cross-course groups or just from your course?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setCrossCoursePref('cross_course')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${crossCoursePref === 'cross_course'
                        ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-600 ring-2 ring-red-600/30'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-xs font-bold">
                        🌐
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        Cross-Course Groups
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Open to connecting with peers across all departments and programs at JMC.
                    </p>
                  </div>

                  <div
                    onClick={() => setCrossCoursePref('my_course_only')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${crossCoursePref === 'my_course_only'
                        ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-600/30'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-rose-700 text-white flex items-center justify-center text-xs font-bold">
                        🎓
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        Just From My Course
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Prefer circles and study partners strictly from my course/department.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('creds')}
                  className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Next: Societies & Vibes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Societies & Campus Vibes */}
          {step === 'societies' && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              {/* Societies Selection (Optional, 31 societies + Other) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-rose-700" />
                    Societies & Clubs You Are Part Of (Optional)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {selectedSocieties.length + (hasOtherSociety && otherSocietyName ? 1 : 0)} chosen
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Select any JMC societies you belong to, or leave blank if none.
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50/50">
                  {CAMPUS_SOCIETIES.map((soc) => {
                    const isSelected = selectedSocieties.includes(soc);
                    return (
                      <button
                        type="button"
                        key={soc}
                        onClick={() => toggleSociety(soc)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${isSelected
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-slate-700 border border-stone-200'
                          }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{soc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Other Option (Writing name is mandatory if checked) */}
                <div className="mt-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasOtherSociety}
                      onChange={(e) => setHasOtherSociety(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-700 border-stone-300 focus:ring-rose-600"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Other Society (Not in list)
                    </span>
                  </label>

                  {hasOtherSociety && (
                    <div>
                      <input
                        type="text"
                        value={otherSocietyName}
                        onChange={(e) => setOtherSocietyName(e.target.value)}
                        placeholder="Write society name (mandatory)..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-600"
                        required={hasOtherSociety}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Campus Vibes & Preferences (10 spots) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    Campus Vibes & Hangout Spots
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {selectedPreferences.length} chosen
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Favorite spots on Jesus and Mary College campus:
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {CAMPUS_PREFERENCES.map((spot) => {
                    const isSelected = selectedPreferences.includes(spot);
                    return (
                      <button
                        type="button"
                        key={spot}
                        onClick={() => togglePreference(spot)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${isSelected
                            ? 'bg-red-700 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200'
                          }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{spot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('academics')}
                  className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-red-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <span>Verifying 6-digit Roll...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Complete JMC Registration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 'success' && (
            <div className="py-4 text-center space-y-4 animate-scale-up">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  Welcome to Common Ground!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  Roll number <strong>{currentUser.rollNumber}</strong> verified for @{currentUser.username}.
                </p>
              </div>

              {/* Student Identity Card Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-rose-200 max-w-sm mx-auto text-left space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="text-red-800 font-mono">@{currentUser.username}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Verified JMC Student
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div>Course: <span className="font-semibold text-slate-800">{currentUser.course}</span> {currentUser.subCourse && `(${currentUser.subCourse})`}</div>
                  <div>Year: {currentUser.year}</div>
                  <div>Roll: <span className="font-mono font-bold text-slate-800">{currentUser.rollNumber}</span> (Locked)</div>
                  <div className="pt-1 text-[11px] text-rose-800 font-semibold">
                    {currentUser.crossCoursePreference === 'cross_course'
                      ? '🌐 Open to Cross-Course Groups'
                      : '🎓 Strictly Course Mates'}
                  </div>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full max-w-xs py-3 px-6 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-700/20 transition-all mx-auto cursor-pointer"
              >
                Enter Common Ground
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
