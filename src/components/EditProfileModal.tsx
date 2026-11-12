import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  GraduationCap,
  Building2,
  Check,
  Lock,
  Upload,
  User,
  AtSign,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CrossCoursePreference } from '../types';
import {
  CAMPUS_PREFERENCES,
  CAMPUS_SOCIETIES,
  COLLEGE_YEARS,
  POPULAR_COURSES,
  COLLEGE_NAME,
} from '../data/mockData';

export const EditProfileModal: React.FC = () => {
  const {
    isEditProfileOpen,
    setIsEditProfileOpen,
    currentUser,
    updateCurrentUser,
  } = useApp();

  const [username, setUsername] = useState(currentUser.username || '');
  const [realName, setRealName] = useState(currentUser.realName || currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [course, setCourse] = useState(currentUser.course || POPULAR_COURSES[0]);
  const [subCourse, setSubCourse] = useState(currentUser.subCourse || '');
  const [year, setYear] = useState(currentUser.year || COLLEGE_YEARS[1]);
  const [crossCoursePref, setCrossCoursePref] = useState<CrossCoursePreference>(
    currentUser.crossCoursePreference || 'cross_course'
  );

  const [useStandardAvatar, setUseStandardAvatar] = useState(currentUser.useStandardAvatar ?? false);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl || '');

  const [societies, setSocieties] = useState<string[]>(currentUser.societies || []);
  const [hasOtherSociety, setHasOtherSociety] = useState(
    currentUser.societies?.some((s) => !CAMPUS_SOCIETIES.includes(s)) || false
  );
  const [otherSocietyName, setOtherSocietyName] = useState(
    currentUser.societies?.find((s) => !CAMPUS_SOCIETIES.includes(s)) || ''
  );

  const [preferences, setPreferences] = useState<string[]>(currentUser.preferences || []);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isEditProfileOpen) return null;

  const handleToggleSociety = (soc: string) => {
    setSocieties((prev) =>
      prev.includes(soc) ? prev.filter((s) => s !== soc) : [...prev, soc]
    );
  };

  const handleTogglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim().toLowerCase().replace(/^@+/, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }

    if (hasOtherSociety && !otherSocietyName.trim()) {
      setErrorMessage('Please specify the name of your "Other" society, or uncheck the Other option.');
      return;
    }

    const finalSocieties = [...societies.filter((s) => CAMPUS_SOCIETIES.includes(s))];
    if (hasOtherSociety && otherSocietyName.trim()) {
      finalSocieties.push(otherSocietyName.trim());
    }

    updateCurrentUser({
      username: cleanUsername,
      name: cleanUsername,
      realName: realName.trim(),
      email: email.trim().toLowerCase(),
      course: course.trim(),
      subCourse: subCourse.trim(),
      year: year.trim(),
      crossCoursePreference: crossCoursePref,
      societies: finalSocieties,
      preferences,
      bio: bio.trim(),
      useStandardAvatar,
      avatarUrl: useStandardAvatar ? '' : avatarPreview || currentUser.avatarUrl,
    });

    setIsEditProfileOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-700 via-rose-700 to-amber-700 flex items-center justify-center text-white shadow-md shadow-red-700/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Edit Student Profile
              </h2>
              <p className="text-xs text-slate-500">
                {COLLEGE_NAME} • Manage your handle, societies & campus preferences
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditProfileOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Profile Photo & Standard White Circle */}
          <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-red-700" />
                Profile Photo Options
              </label>
            </div>

            <div className="flex items-center gap-4">
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
                  <span>Upload New Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useStandardAvatar}
                    onChange={(e) => setUseStandardAvatar(e.target.checked)}
                    className="w-4 h-4 rounded text-red-700 border-stone-300 focus:ring-red-600"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Use standard white circle (No photo profile)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Identity & Locked Roll Number */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5 text-red-700" />
                  Public Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Displayed to other students across clubs and events.
                </span>
              </div>

              {/* Locked Roll Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Roll Number (Locked)
                </label>
                <input
                  type="text"
                  value={currentUser.rollNumber}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-slate-600 font-mono text-sm font-bold tracking-widest cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Cannot update roll number once registered.
                </span>
              </div>
            </div>

            {/* Confidential Real Name & Email */}
            <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100 space-y-3">
              <div className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                <span>🔒 Confidential Information (Visible Only to You & College Supervisors)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Real Full Name
                  </label>
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Course & Sub-Course */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                {POPULAR_COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Sub-Course / Specialisation
              </label>
              <input
                type="text"
                value={subCourse}
                onChange={(e) => setSubCourse(e.target.value)}
                placeholder="e.g. English, Psychology, Retail..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Year of Study
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                {COLLEGE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Cross-Course Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Cross-Course Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setCrossCoursePref('cross_course')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  crossCoursePref === 'cross_course'
                    ? 'bg-red-50 border-red-600 ring-2 ring-red-600/20'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 mb-0.5">
                  🌐 Open to Cross-Course Groups
                </div>
                <p className="text-[11px] text-slate-600">
                  Connect across all departments at JMC.
                </p>
              </div>

              <div
                onClick={() => setCrossCoursePref('my_course_only')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  crossCoursePref === 'my_course_only'
                    ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-600/20'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 mb-0.5">
                  🎓 Just From My Course
                </div>
                <p className="text-[11px] text-slate-600">
                  Prefer connecting with classmates in {course}.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Societies (Optional + Other mandatory text) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-rose-700" />
                Societies & Campus Clubs (Optional)
              </label>
              <span className="text-[11px] text-slate-500">
                {societies.length + (hasOtherSociety && otherSocietyName ? 1 : 0)} chosen
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1.5 border border-stone-200 rounded-2xl bg-stone-50/50">
              {CAMPUS_SOCIETIES.map((soc) => {
                const isSelected = societies.includes(soc);
                return (
                  <button
                    type="button"
                    key={soc}
                    onClick={() => handleToggleSociety(soc)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
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

            {/* Other Society */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
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
                <input
                  type="text"
                  value={otherSocietyName}
                  onChange={(e) => setOtherSocietyName(e.target.value)}
                  placeholder="Specify other society name..."
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-600"
                  required={hasOtherSociety}
                />
              )}
            </div>
          </div>

          {/* Section 6: Campus Preferences (10 spots) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                Campus Vibes & Hangout Spots
              </label>
              <span className="text-[11px] text-slate-500">{preferences.length} chosen</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-stone-200 rounded-2xl bg-stone-50/50">
              {CAMPUS_PREFERENCES.map((pref) => {
                const isSelected = preferences.includes(pref);
                return (
                  <button
                    type="button"
                    key={pref}
                    onClick={() => handleTogglePreference(pref)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-white hover:bg-stone-100 text-slate-700 border border-stone-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{pref}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 7: Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Personal Bio / Campus Theme Line
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Literature enthusiast, coffee lover, always found near the Purple Wall or reading by L Park."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/25 transition-all active:scale-95 cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
