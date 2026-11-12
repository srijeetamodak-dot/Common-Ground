import React from 'react';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Sparkles,
  Heart,
  Info,
  GraduationCap,
  Building2,
  Users2,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BumbleProfileCard } from '../components/BumbleProfileCard';
import { COLLEGE_NAME } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const { currentUser, setIsEditProfileOpen, setIsVerificationOpen, updateCurrentUser, signOut } = useApp();

  const toggleCrossCourse = () => {
    const nextPref =
      currentUser.crossCoursePreference === 'cross_course' ? 'my_course_only' : 'cross_course';
    updateCurrentUser({ crossCoursePreference: nextPref });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-red-700" />
            <span>My Student Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Your Bumble-style student card as seen by peers in {COLLEGE_NAME}.
          </p>
        </div>

        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/20 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile & Preferences</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Bumble Profile Card Preview */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full text-center mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Bumble-Style Student Card Preview
            </span>
            <p className="text-[11px] text-slate-400">
              Only your @{currentUser.username} is visible to peers (Real name & email are kept private)
            </p>
          </div>

          <BumbleProfileCard user={currentUser} isSelf={true} />
        </div>

        {/* Right Column: Student Verification, Cross-Course Preference & Principles */}
        <div className="lg:col-span-6 space-y-5">
          {/* Student Roll Number Verification Status Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentUser.isVerified
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                    }`}
                >
                  {currentUser.isVerified ? (
                    <GraduationCap className="w-7 h-7" />
                  ) : (
                    <ShieldAlert className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold font-serif text-slate-900 text-base sm:text-lg">
                    {currentUser.isVerified ? 'Verified JMC Student' : 'Roll Not Yet Verified'}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {currentUser.isVerified
                      ? `${COLLEGE_NAME} • Roll: ${currentUser.rollNumber}`
                      : 'Register your 6-digit roll starting with 2'}
                  </div>
                </div>
              </div>

              {!currentUser.isVerified ? (
                <button
                  onClick={() => setIsVerificationOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-red-700 hover:bg-red-800 text-white shadow-md shadow-red-700/20 cursor-pointer"
                >
                  Verify Student Roll
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
                    <span>Verified</span>
                  </div>
                  <button
                    onClick={() => setIsVerificationOpen(true)}
                    className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                    title="Register or sign in with another student roll number"
                  >
                    Switch / Register
                  </button>
                  <button
                    onClick={signOut}
                    className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                    title="Sign out of current account"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Confidential Registration Details (Only for you) */}
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 space-y-2.5">
              <div className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-700" />
                <span>Confidential Record (Visible Only To You)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Public Handle:</span>
                  <span className="font-bold text-red-800">@{currentUser.username}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Roll Number:</span>
                  <span className="font-mono font-bold text-slate-800">{currentUser.rollNumber} (Locked)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Real Name:</span>
                  <span className="font-semibold text-slate-800">{currentUser.realName || currentUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Email ID:</span>
                  <span className="font-semibold text-slate-800 truncate block">{currentUser.email}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-2 pt-1 border-t border-stone-100">
              <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong>College Trust Rule:</strong> We only verify 6-digit roll numbers starting with 2 to ensure all members are verified Jesus and Mary College students. Roll numbers cannot be modified once signed in.
              </span>
            </div>
          </div>

          {/* Cross-Course Preference Toggle Box */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold font-serif text-slate-900">
                <Users2 className="w-4 h-4 text-rose-700" />
                <span>Cross-Course Group Preference</span>
              </div>
              <button
                onClick={toggleCrossCourse}
                className="text-xs px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Switch
              </button>
            </div>

            <div
              onClick={toggleCrossCourse}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${currentUser.crossCoursePreference === 'cross_course'
                  ? 'bg-gradient-to-br from-red-50/70 to-rose-50/70 border-red-200'
                  : 'bg-stone-50 border-stone-300'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {currentUser.crossCoursePreference === 'cross_course' ? '🌐' : '🎓'}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {currentUser.crossCoursePreference === 'cross_course'
                        ? 'Looking for Cross-Course Groups'
                        : 'Only Looking for People From My Course'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {currentUser.crossCoursePreference === 'cross_course'
                        ? 'You are actively open to meeting friends across all academic departments at JMC.'
                        : `You prefer connecting strictly with classmates in ${currentUser.course}.`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* College Societies Joined */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-serif text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rose-700" />
                <span>My Societies ({currentUser.societies?.length || 0})</span>
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="text-xs text-red-700 hover:underline font-semibold cursor-pointer"
              >
                + Manage
              </button>
            </div>

            {currentUser.societies && currentUser.societies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {currentUser.societies.map((soc) => (
                  <span
                    key={soc}
                    className="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
                  >
                    🏛️ {soc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No societies selected yet. Select any of the 31 JMC societies or add an unlisted one!
              </p>
            )}
          </div>

          {/* Common Ground Principles */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-4 shadow-sm">
            <h3 className="font-bold font-serif text-slate-900 text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600/20" />
              <span>Common Ground Student Principles</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-900">100% Free:</strong> Zero monetary transactions anywhere in the product. No paid features or subscriptions.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-900">Safe 1-on-1 Student Chat:</strong> Discover members via clubs and events. Send text, voice notes, photos, and files with zero phone calls. Completely private between students (supervisors cannot view personal chats).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-900">Zero Forced Membership:</strong> Every join and leave action is voluntarily initiated by the student.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="text-slate-900">Host Scoped Moderation:</strong> Only the event host can manage participants and accept or reject requests. Events can be cancelled up till 3 hours before start time.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
