import React, { useState } from 'react';
import {
  X,
  MapPin,
  Video,
  Sparkles,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  Infinity,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventFormat, OnlineFormatType } from '../types';
import { CAMPUS_SPOTS, CAMPUS_SOCIETIES } from '../data/mockData';

export const CreateEventModal: React.FC = () => {
  const {
    isCreateEventOpen,
    setIsCreateEventOpen,
    communities,
    createEvent,
    currentUser,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [communityId, setCommunityId] = useState(communities[0]?.id || 'comm-movie');
  
  // Format comes FIRST
  const [format, setFormat] = useState<EventFormat>('offline');
  const [onlineFormatType, setOnlineFormatType] = useState<OnlineFormatType>('chat');

  // Location only comes if offline
  const [locationName, setLocationName] = useState(CAMPUS_SPOTS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [locationMeetingPoint, setLocationMeetingPoint] = useState('');

  // Target audience
  const [targetAudience, setTargetAudience] = useState<'all_courses' | 'course_restricted'>(
    currentUser.crossCoursePreference === 'my_course_only' ? 'course_restricted' : 'all_courses'
  );
  const [societyAffiliation, setSocietyAffiliation] = useState<string>('');

  // Date and Time picker
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  const [eventDate, setEventDate] = useState(defaultDateStr);
  const [eventTime, setEventTime] = useState('16:00');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Max students with "No Limit" option
  const [isNoLimit, setIsNoLimit] = useState(true);
  const [maxAttendees, setMaxAttendees] = useState<number>(15);

  const [icebreaker, setIcebreaker] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCreateEventOpen) return null;

  const currentCommunity = communities.find((c) => c.id === communityId) || communities[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide both an event title and description.');
      return;
    }

    // Build event timestamp
    let eventTimestamp = Date.now() + 24 * 3600 * 1000;
    try {
      const parsed = new Date(`${eventDate}T${eventTime}:00`);
      if (!isNaN(parsed.getTime())) {
        eventTimestamp = parsed.getTime();
      }
    } catch {
      // fallback
    }

    const finalLocation = format === 'offline' 
      ? (customLocation.trim() || locationName.trim() || 'JMC Campus')
      : undefined;

    // Readable date time string
    const dateObj = new Date(eventTimestamp);
    const readableDateTime = `${dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })}, ${dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;

    createEvent({
      title: title.trim(),
      description: description.trim(),
      communityId,
      communityName: currentCommunity?.name || 'College Club',
      format,
      onlineFormatType: format === 'online' ? onlineFormatType : undefined,
      locationName: finalLocation,
      locationAddress: format === 'offline' ? 'Jesus and Mary College, Chanakyapuri, New Delhi' : undefined,
      locationMeetingPoint: format === 'offline' ? locationMeetingPoint.trim() : undefined,
      targetAudience,
      courseRestriction: targetAudience === 'course_restricted' ? currentUser.course : undefined,
      societyAffiliation: societyAffiliation ? societyAffiliation : undefined,
      dateTime: readableDateTime,
      eventTimestamp,
      durationMinutes: Number(durationMinutes) || 60,
      maxAttendees: isNoLimit ? null : Number(maxAttendees) || 15,
      icebreaker: icebreaker.trim() || 'What makes you excited to join this event?',
      status: 'upcoming',
      tags: [currentCommunity?.name || 'Event', format === 'offline' ? 'On-Campus' : 'Online Room'],
      coverImage: currentCommunity?.coverImage,
    });

    setIsCreateEventOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-700 via-rose-700 to-amber-700 flex items-center justify-center text-white shadow-md shadow-red-700/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Host an Event
              </h2>
              <p className="text-xs text-slate-500">
                Organize an offline or online event under one of the JMC clubs
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateEventOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Format Choice (FIRST before Location) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Event Format *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('offline')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  format === 'offline'
                    ? 'bg-red-700 text-white border-red-700 shadow-md shadow-red-700/20 ring-2 ring-red-700/30'
                    : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Offline (On Campus)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('online')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  format === 'online'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-700/20 ring-2 ring-rose-700/30'
                    : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Online (Chat Room)</span>
              </button>
            </div>
          </div>

          {/* 2. Event Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acoustic Jam & Songwriting Circle at Purple Wall"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              required
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Mention any specific theme or topic in the title itself.
            </span>
          </div>

          {/* 3. Community / Club */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Community / Club
            </label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 cursor-pointer"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Location Fields (ONLY IF OFFLINE) */}
          {format === 'offline' && (
            <div className="space-y-3 p-4 rounded-2xl bg-red-50/50 border border-red-200">
              <label className="block text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-700" />
                Campus Location (JMC Spots)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CAMPUS_SPOTS.map((spot) => (
                  <button
                    type="button"
                    key={spot}
                    onClick={() => {
                      setLocationName(spot);
                      setCustomLocation('');
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs truncate text-left transition-colors cursor-pointer ${
                      locationName === spot && !customLocation
                        ? 'bg-red-700 text-white font-bold shadow-xs'
                        : 'bg-white text-slate-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {spot}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Custom Location (If not in list above)
                </label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. Near Mother Dairy kiosk or Library reading room"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Exact Landmark / Meeting Point
                </label>
                <input
                  type="text"
                  value={locationMeetingPoint}
                  onChange={(e) => setLocationMeetingPoint(e.target.value)}
                  placeholder="e.g. Under the shade by Thevenet stairs"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>
            </div>
          )}

          {/* 5. Target Audience: Cross Course vs Course Only */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Audience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTargetAudience('all_courses')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  targetAudience === 'all_courses'
                    ? 'bg-red-50 border-red-600 ring-2 ring-red-600/20'
                    : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🌐</span>
                  <span>Open to All Courses</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Students from any department or year at JMC can join.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('course_restricted')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  targetAudience === 'course_restricted'
                    ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-600/20'
                    : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-rose-700" />
                  <span>Only My Course</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Restricted to peers in {currentUser.course}.
                </div>
              </button>
            </div>
          </div>

          {/* 6. Society Affiliation (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-rose-700" />
              <span>Society Affiliation (Optional)</span>
            </label>
            <select
              value={societyAffiliation}
              onChange={(e) => setSocietyAffiliation(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              <option value="">None (Independent Student Event)</option>
              {CAMPUS_SOCIETIES.map((soc) => (
                <option key={soc} value={soc}>
                  {soc}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Date, Time & Max Students (With "No Limit" option) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Start Time
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Max Students
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isNoLimit}
                    onChange={(e) => setIsNoLimit(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-red-700 focus:ring-red-600"
                  />
                  <span>No Limit (Open)</span>
                </label>

                {!isNoLimit && (
                  <input
                    type="number"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(Number(e.target.value))}
                    min={2}
                    max={100}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-red-600"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 8. Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Event Description & Agenda *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will happen? (e.g. Meet up to exchange notes, discuss the latest book/movie, or rehearse choreography together)."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              required
            />
          </div>

          {/* Host Moderation Notice */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900">Host Responsibilities & Rules:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
              <li>Only you (the host) can manage and accept/reject/remove participants.</li>
              <li>Events can be cancelled up to <strong>3 hours before</strong> start time.</li>
              <li>No one can be force-added to the event.</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateEventOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/25 transition-all active:scale-95 cursor-pointer"
            >
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
