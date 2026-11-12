import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Sparkles,
  Hand,
  CheckCircle2,
  Trash2,
  UserX,
  ShieldCheck,
  Share2,
  GraduationCap,
  Building2,
  AlertCircle,
  MessageSquare,
  Check,
  Ban,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OnlineEventRoom } from './OnlineEventRoom';
import { Avatar } from './Avatar';
import { UserProfile } from '../types';

export const EventDetailModal: React.FC = () => {
  const {
    selectedEventId,
    setSelectedEventId,
    events,
    currentUser,
    currentEventAttendees,
    isUserAttending,
    isUserHandRaised,
    joinEvent,
    leaveEvent,
    removeParticipantAsCreator,
    acceptParticipant,
    rejectParticipant,
    cancelEvent,
    canCancelEvent,
    setSelectedProfileUser,
    openDirectChat,
    getUserById,
  } = useApp();

  const [isInOnlineRoom, setIsInOnlineRoom] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  if (!selectedEventId) return null;

  const event = events.find((e) => e.id === selectedEventId);
  if (!event) return null;

  const isAttending = isUserAttending(event.id);
  const isHandRaised = isUserHandRaised(event.id);
  const isCreator = event.creatorId === currentUser.id;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // If online event room is opened
  if (isInOnlineRoom) {
    return <OnlineEventRoom event={event} onClose={() => setIsInOnlineRoom(false)} />;
  }

  const handleOpenUserProfile = (userId: string, defaultName: string = 'Student', defaultAvatar: string = '') => {
    const existing = getUserById(userId);
    if (existing) {
      setSelectedProfileUser(existing);
      return;
    }

    const placeholderUser: UserProfile = {
      id: userId,
      name: defaultName || 'Student',
      username: (defaultName || 'student').toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: 'student@jmc.du.ac.in',
      course: event.creatorId === userId ? (event.creatorCourse || 'BA(Hons.)') : 'Jesus and Mary College',
      subCourse: '',
      year: event.creatorId === userId ? (event.creatorYear || '2nd Year') : 'Student',
      rollNumber: '240000',
      societies: event.societyAffiliation ? [event.societyAffiliation] : [],
      crossCoursePreference: event.targetAudience === 'all_courses' ? 'cross_course' : 'my_course_only',
      preferences: ['Canteen', 'Amphitheatre'],
      bio: event.creatorId === userId ? (event.creatorBio || 'Host on Common Ground') : 'Common Ground member',
      avatarUrl: defaultAvatar,
      photos: [defaultAvatar],
      interests: [event.communityName],
      isVerified: true,
      verificationType: 'roll_number',
      joinedAt: 'Recent',
      useStandardAvatar: !defaultAvatar,
    };
    setSelectedProfileUser(placeholderUser);
  };

  const handleStartCancel = () => {
    setCancelError('');
    const allowed = canCancelEvent(event.id);
    if (!allowed) {
      setCancelError('Events can only be cancelled up till 3 hours before start time. The 3-hour window has passed.');
      return;
    }
    setShowCancelPrompt(true);
  };

  const handleConfirmCancel = () => {
    const result = cancelEvent(event.id, cancellationReason.trim());
    if (!result.success) {
      setCancelError(result.error || 'Failed to cancel event.');
      return;
    }
    setShowCancelPrompt(false);
  };

  // Filter attendees into confirmed vs interested
  const confirmedAttendees = currentEventAttendees.filter(
    (a) => a.status === 'confirmed' || !a.status
  );
  const interestedAttendees = currentEventAttendees.filter(
    (a) => a.status === 'interested' || a.status === 'raised_hand'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        {/* Cover Image & Header Banner */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={
              event.coverImage ||
              'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80'
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />

          {/* Close & Share Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/85 hover:bg-white text-slate-700 transition-colors backdrop-blur-md shadow-sm cursor-pointer"
              title="Copy event link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedEventId(null)}
              className="p-2 rounded-full bg-white/85 hover:bg-white text-slate-700 transition-colors backdrop-blur-md shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Badges on Cover */}
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md ${
                event.format === 'online'
                  ? 'bg-rose-700 text-white'
                  : 'bg-red-700 text-white'
              }`}
            >
              {event.format === 'online' ? (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>Online Room</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Offline Campus</span>
                </>
              )}
            </span>

            {/* Target Audience */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                event.targetAudience === 'course_restricted'
                  ? 'bg-stone-800 text-white'
                  : 'bg-gradient-to-r from-red-700 to-rose-700 text-white'
              }`}
            >
              {event.targetAudience === 'course_restricted'
                ? `🎓 ${event.courseRestriction || 'Course Only'}`
                : '🌐 Open to All Courses'}
            </span>

            {event.societyAffiliation && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-rose-800 border border-rose-200 flex items-center gap-1 backdrop-blur-sm">
                <Building2 className="w-3 h-3 text-rose-700" />
                <span>{event.societyAffiliation}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Cancellation Notice if Cancelled */}
          {event.status === 'cancelled' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>This event has been cancelled by the host.</span>
              </div>
              {event.cancellationReason && (
                <p className="text-xs text-rose-700 italic">
                  Reason: "{event.cancellationReason}"
                </p>
              )}
            </div>
          )}

          {cancelError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cancelError}</span>
            </div>
          )}

          {/* Cancellation Prompt Modal Section */}
          {showCancelPrompt && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
              <div className="text-xs font-bold text-amber-900">
                Cancel Event (Allowed up till 3 hours before start time)
              </div>
              <p className="text-xs text-amber-800">
                Are you sure? You can optionally enter a reason for cancelling this event:
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Optional reason for cancellation..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
                >
                  Keep Event
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          )}

          {/* Title & Hub info */}
          <div>
            <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
              {event.communityName}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 leading-tight">
              {event.title}
            </h2>
          </div>

          {/* Key Event Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">{event.dateTime}</div>
                <div className="text-slate-500">{event.durationMinutes} mins duration</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                {event.format === 'online' ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                  {event.format === 'online'
                    ? 'Built-in Interactive Chat Room'
                    : event.locationName || 'Campus Venue'}
                </div>
                <div className="text-slate-500 truncate max-w-[200px]">
                  {event.format === 'online'
                    ? 'Group conversation & text exchange'
                    : event.locationAddress || 'Jesus and Mary College'}
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Point if Offline */}
          {event.format === 'offline' && event.locationMeetingPoint && (
            <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-xs text-red-950 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div>
                <strong>Campus Meeting Point: </strong>
                {event.locationMeetingPoint}
              </div>
            </div>
          )}

          {/* Host Card */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Event Host
            </span>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div
                onClick={() => handleOpenUserProfile(event.creatorId, event.creatorName || event.creatorUsername || 'Host', event.creatorAvatar)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Avatar
                  user={{
                    id: event.creatorId,
                    name: event.creatorName || event.creatorUsername || 'Host',
                    username: event.creatorUsername || (event.creatorName ? event.creatorName.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'host'),
                    avatarUrl: event.creatorAvatar,
                  }}
                  size="md"
                  showRollStatus
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 group-hover:text-red-700">
                    <span>@{event.creatorUsername || event.creatorName || 'host'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-100 text-red-800 font-bold">
                      Host
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {event.creatorCourse ? `${event.creatorCourse} • ${event.creatorYear || ''}` : 'JMC Student'}
                  </div>
                </div>
              </div>

              {/* Message Host button if not self */}
              {event.creatorId !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => {
                    const hostUser = getUserById(event.creatorId) || {
                      id: event.creatorId,
                      name: event.creatorName || event.creatorUsername || 'Host',
                      username: event.creatorUsername || (event.creatorName ? event.creatorName.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'host'),
                      avatarUrl: event.creatorAvatar,
                      course: event.creatorCourse || 'BA(Hons.)',
                      year: event.creatorYear || '2nd Year',
                      rollNumber: '240000',
                      societies: [],
                      preferences: [],
                      interests: [],
                      isVerified: true,
                    };
                    openDirectChat(hostUser as UserProfile);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Host</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              About This Event
            </span>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Host Dashboard: Interested Participants (Accept / Reject) */}
          {isCreator && interestedAttendees.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Hand className="w-4 h-4 text-rose-700" />
                  Interested Students Awaiting Host Approval ({interestedAttendees.length})
                </span>
              </div>
              <p className="text-xs text-slate-600">
                As the host, you can accept or decline student participation:
              </p>

              <div className="space-y-2">
                {interestedAttendees.map((att) => (
                  <div
                    key={att.userId}
                    className="p-2.5 rounded-xl bg-white border border-pink-200 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <Avatar
                        user={{
                          id: att.userId,
                          name: att.userName || att.username || 'Student',
                          username: att.username || (att.userName ? att.userName.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'student'),
                          avatarUrl: att.userAvatar,
                        }}
                        size="sm"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          @{att.username || att.userName || 'student'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {att.userCourse || 'Student'} • Raised Hand
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => acceptParticipant(event.id, att.userId)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Accept into event"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectParticipant(event.id, att.userId)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        title="Decline"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Attendees List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-700" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Confirmed Students ({confirmedAttendees.length || event.attendeeCount})
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {event.maxAttendees ? `Max: ${event.maxAttendees} students` : 'Capacity: No Limit'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {confirmedAttendees.map((att) => (
                <div
                  key={att.userId}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                >
                  <div
                    onClick={() => handleOpenUserProfile(att.userId, att.userName || att.username || 'Student', att.userAvatar)}
                    className="flex items-center gap-2.5 truncate mr-2 cursor-pointer group"
                  >
                    <Avatar
                      user={{
                        id: att.userId,
                        name: att.userName || att.username || 'Student',
                        username: att.username || (att.userName ? att.userName.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'student'),
                        avatarUrl: att.userAvatar,
                      }}
                      size="sm"
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-red-700 truncate">
                        @{att.username || att.userName || 'student'} {att.userId === currentUser.id ? '(You)' : ''}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {att.userCourse ? att.userCourse.split('(')[0] : 'Student'} • Confirmed
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Message 1-on-1 button */}
                    {att.userId !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => {
                          const userObj = getUserById(att.userId) || {
                            id: att.userId,
                            name: att.userName || att.username || 'Student',
                            username: att.username || (att.userName ? att.userName.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'student'),
                            avatarUrl: att.userAvatar,
                            course: att.userCourse || 'BA(Hons.)',
                            year: '2nd Year',
                            rollNumber: '240000',
                            societies: [],
                            preferences: [],
                            interests: [],
                            isVerified: true,
                          };
                          openDirectChat(userObj as UserProfile);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title={`Message @${att.userName}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Creator Moderation control: remove participant */}
                    {isCreator && att.userId !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => removeParticipantAsCreator(event.id, att.userId)}
                        className="text-slate-400 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove participant from event"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3">
          {/* Creator Cancel Event Button */}
          {isCreator ? (
            <button
              onClick={handleStartCancel}
              disabled={event.status === 'cancelled'}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancel Event</span>
            </button>
          ) : isAttending ? (
            <button
              onClick={() => leaveEvent(event.id)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Leave Event
            </button>
          ) : (
            <button
              onClick={() => setSelectedEventId(null)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}

          {/* Main Action (Join / Raise Hand / Enter Live Room) */}
          <div className="flex items-center gap-2">
            {event.format === 'online' && isAttending && event.status !== 'cancelled' && (
              <button
                onClick={() => setIsInOnlineRoom(true)}
                className="py-2.5 px-5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/20 transition-all flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Enter Live Room</span>
              </button>
            )}

            {!isAttending && !isHandRaised && event.status !== 'cancelled' && (
              <>
                <button
                  onClick={() => joinEvent(event.id, true)}
                  className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Hand className="w-3.5 h-3.5 text-rose-700" />
                  <span>Raise Hand</span>
                </button>
                <button
                  onClick={() => joinEvent(event.id, false)}
                  className="py-2.5 px-6 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/20 transition-all cursor-pointer"
                >
                  Join Event
                </button>
              </>
            )}

            {isHandRaised && !isAttending && event.status !== 'cancelled' && (
              <div className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5 text-rose-700" />
                <span>Hand Raised (Awaiting Host Approval)</span>
              </div>
            )}

            {isAttending && event.format !== 'online' && (
              <div className="py-2 px-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-red-700" />
                <span>Attending</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
