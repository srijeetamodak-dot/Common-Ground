import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Calendar,
  Lock,
  Building2,
  Users2,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';
import { Avatar } from './Avatar';
import { COLLEGE_NAME } from '../data/mockData';

interface BumbleProfileCardProps {
  user: UserProfile;
  onClose?: () => void;
  isSelf?: boolean;
}

export const BumbleProfileCard: React.FC<BumbleProfileCardProps> = ({
  user,
  onClose,
  isSelf = false,
}) => {
  const {
    setIsEditProfileOpen,
    events,
    setSelectedEventId,
    openDirectChatWithUser,
    currentUser,
  } = useApp();
  const [photoIndex, setPhotoIndex] = useState(0);

  const isActuallySelf = isSelf || user.id === currentUser.id;
  const photos = user.photos && user.photos.length > 0 ? user.photos : [];
  const hasPhotos = !user.useStandardAvatar && photos.length > 0;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 0) {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 0) {
      setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  // Find events hosted by this user
  const userEvents = events.filter((evt) => evt.creatorId === user.id);

  return (
    <div className="relative w-full max-w-md mx-auto bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col">
      {/* Top Close Button if inside modal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-slate-700 flex items-center justify-center hover:bg-white transition-colors shadow-md border border-slate-200"
          aria-label="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Main Card Header / Photo Section */}
      {hasPhotos ? (
        <div className="relative h-80 sm:h-96 w-full bg-slate-900 overflow-hidden select-none">
          {/* Segmented photo indicators at top */}
          {photos.length > 1 && (
            <div className="absolute top-3 left-4 right-4 z-10 flex gap-1.5">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-white/40 backdrop-blur-sm cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(idx);
                  }}
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      idx === photoIndex ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Active Photo */}
          <img
            src={photos[photoIndex]}
            alt={`@${user.username}'s photo`}
            className="w-full h-full object-cover"
          />

          {/* Left / Right click zones */}
          {photos.length > 1 && (
            <>
              <div
                onClick={handlePrevPhoto}
                className="absolute inset-y-0 left-0 w-1/2 cursor-pointer flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="p-1 rounded-full bg-black/40 text-white">
                  <ChevronLeft className="w-6 h-6" />
                </div>
              </div>
              <div
                onClick={handleNextPhoto}
                className="absolute inset-y-0 right-0 w-1/2 cursor-pointer flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="p-1 rounded-full bg-black/40 text-white">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </>
          )}

          {/* Vignette Gradient & Overlaid Identity */}
          <div className="absolute inset-x-0 bottom-0 pt-20 pb-4 px-5 bg-gradient-to-t from-stone-950 via-stone-950/75 to-transparent">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
                @{user.username}
              </h2>

              {user.isVerified && (
                <div
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-700 text-white text-[11px] font-semibold shadow-sm"
                  title="Verified Student ID"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>JMC Verified</span>
                </div>
              )}
            </div>

            <div className="text-xs text-stone-200 mt-1 font-medium flex items-center gap-1.5 flex-wrap">
              <span className="text-rose-200 font-semibold">{user.course}</span>
              {user.subCourse && (
                <>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-200">{user.subCourse}</span>
                </>
              )}
              <span className="text-stone-400">•</span>
              <span>{user.year}</span>
            </div>
          </div>
        </div>
      ) : (
        // Standard White Circle (No Photo) Profile Banner
        <div className="p-6 pb-4 bg-gradient-to-b from-red-50/60 via-rose-50/30 to-white border-b border-stone-100 flex flex-col items-center text-center">
          <Avatar
            username={user.username}
            name={user.username}
            useStandardAvatar={true}
            size="2xl"
            isVerified={user.isVerified}
            showBadge
            className="mb-3"
          />

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              @{user.username}
            </h2>

            {user.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
                <span>Verified Student</span>
              </span>
            )}
          </div>

          <div className="text-xs text-slate-600 mt-1.5 font-medium flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-red-700 font-bold">{user.course}</span>
            {user.subCourse && (
              <>
                <span className="text-stone-300">•</span>
                <span>{user.subCourse}</span>
              </>
            )}
            <span className="text-stone-300">•</span>
            <span>{user.year}</span>
          </div>
        </div>
      )}

      {/* Profile Details Scroll Area */}
      <div className="p-5 space-y-4 bg-white overflow-y-auto max-h-[380px]">
        {/* Private Student Registration Info Box (ONLY visible if self) */}
        {isActuallySelf && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-red-700" />
                <span>Private Registration Info (Hidden from others)</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Confidential</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Real Name:</span>
              <span className="font-semibold text-slate-900">{user.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">College Email:</span>
              <span className="font-mono text-slate-900">{user.email}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">6-Digit Roll Number:</span>
              <span className="font-mono text-red-700 font-bold">{user.rollNumber}</span>
            </div>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic font-serif">
              "{user.bio}"
            </p>
          </div>
        )}

        {/* Cross Course Preference Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              user.crossCoursePreference === 'cross_course'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-stone-100 border border-stone-200 text-stone-800'
            }`}
          >
            <span>{user.crossCoursePreference === 'cross_course' ? '🌐' : '🎓'}</span>
            <span>
              {user.crossCoursePreference === 'cross_course'
                ? 'Open to Cross-Course Events'
                : 'Only Events for My Course'}
            </span>
          </span>
        </div>

        {/* Societies */}
        {user.societies && user.societies.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Building2 className="w-3.5 h-3.5 text-rose-700" />
              Campus Societies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user.societies.map((soc) => (
                <span
                  key={soc}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
                >
                  {soc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Campus Vibes & Preferences */}
        {user.preferences && user.preferences.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Campus Vibes & Hangouts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user.preferences.map((pref) => (
                <span
                  key={pref}
                  className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
                >
                  📍 {pref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Events Hosted by this student */}
        {userEvents.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-red-700" />
              Events Hosted at JMC ({userEvents.length})
            </span>
            <div className="space-y-2">
              {userEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    if (onClose) onClose();
                    setSelectedEventId(evt.id);
                  }}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-red-300 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-semibold text-slate-900 truncate">{evt.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {evt.dateTime} • {evt.attendeeCount} students
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-800 font-semibold border border-red-200 shrink-0">
                    View
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          {isActuallySelf ? (
            <button
              onClick={() => {
                if (onClose) onClose();
                setIsEditProfileOpen(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-red-700/20 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit My Profile & Preferences</span>
            </button>
          ) : (
            // Message Button for 1-on-1 Direct Chat (NO CALLS)
            <button
              onClick={() => {
                if (onClose) onClose();
                openDirectChatWithUser(user);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-700/25 transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message @{user.username} (1-on-1 Chat)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
