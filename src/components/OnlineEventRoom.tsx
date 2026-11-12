import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  Users,
  Sparkles,
  Send,
  UserX,
  Volume2,
} from 'lucide-react';
import { EventItem, EventAttendee } from '../types';
import { useApp } from '../context/AppContext';

interface OnlineEventRoomProps {
  event: EventItem;
  onClose: () => void;
}

export const OnlineEventRoom: React.FC<OnlineEventRoomProps> = ({ event, onClose }) => {
  const {
    currentUser,
    currentEventAttendees,
    currentEventMessages,
    sendEventMessage,
    removeParticipantAsCreator,
    setSelectedProfileUser,
    leaveEvent,
  } = useApp();

  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'chat'>('stream');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const isCreator = event.creatorId === currentUser.id;

  // Attempt WebRTC getUserMedia when video or audio is enabled
  useEffect(() => {
    async function startMedia() {
      if (isVideoOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: isAudioOn,
          });
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setMediaError(null);
        } catch (err) {
          console.warn('Media capture error:', err);
          setMediaError('Camera permission was not granted or camera is in use.');
          setIsVideoOn(false);
        }
      } else {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getVideoTracks().forEach((track) => track.stop());
        }
      }
    }

    startMedia();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn, isAudioOn]);

  // Screen share handler
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && mediaStreamRef.current) {
            localVideoRef.current.srcObject = mediaStreamRef.current;
          }
        };
      } catch (err) {
        console.warn('Screen share cancelled/failed', err);
      }
    } else {
      setIsScreenSharing(false);
      if (localVideoRef.current && mediaStreamRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current;
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendEventMessage(event.id, chatMessage.trim());
    setChatMessage('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuickIcebreaker = (phrase: string) => {
    sendEventMessage(event.id, phrase);
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLeaveAndExit = () => {
    leaveEvent(event.id);
    onClose();
  };

  // Filter attendees for this event
  const attendees: EventAttendee[] = currentEventAttendees.length > 0 ? currentEventAttendees : [
    {
      userId: currentUser.id,
      username: currentUser.username,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      userBio: currentUser.bio,
      userCourse: currentUser.course,
      userYear: currentUser.year,
      userRollNumber: currentUser.rollNumber,
      userSocieties: currentUser.societies,
      userCrossCoursePreference: currentUser.crossCoursePreference,
      userPreferences: currentUser.preferences,
      userInterests: currentUser.interests,
      status: 'confirmed' as const,
      joinedAt: 'Just now',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col text-slate-900 overflow-hidden animate-fade-in">
      {/* Top Bar */}
      <div className="h-16 px-4 sm:px-6 bg-white border-b border-stone-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-200">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-800">
              Live Circle Room
            </span>
          </div>
          <span className="text-stone-300 hidden sm:inline">|</span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
            {event.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700">
            <Users className="w-3.5 h-3.5 text-red-700" />
            <span>{attendees.length} in circle</span>
          </div>

          <button
            onClick={handleLeaveAndExit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave Circle</span>
          </button>
        </div>
      </div>

      {/* Icebreaker Prompt Banner */}
      {event.icebreaker && (
        <div className="bg-gradient-to-r from-red-50/70 via-stone-50 to-rose-50/70 border-b border-stone-200 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="w-4 h-4 text-red-700 shrink-0" />
            <span>
              <strong className="text-red-800">Today's Icebreaker:</strong> "{event.icebreaker}"
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden md:inline">
            Host: {event.creatorName}
          </span>
        </div>
      )}

      {/* Main Content: Video Grid & Live Chat */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Video / Audio Grid */}
        <div
          className={`flex-1 p-4 overflow-y-auto bg-stone-100 flex flex-col justify-between ${
            activeTab === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {mediaError && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {mediaError} You can still participate via voice and live event chat!
            </div>
          )}

          {/* Grid of Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 flex-1 content-start">
            {/* Current User Video / Audio Tile */}
            <div className="relative aspect-video rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm flex items-center justify-center group">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-red-500/20"
                    />
                    {isAudioOn && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-700 flex items-center justify-center text-white">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Voice Tile</span>
                </div>
              )}

              {/* Name pill & Mic status */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-white text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold truncate">
                    {currentUser.name} (You)
                  </span>
                  <span className="text-rose-300 font-bold">✓</span>
                </div>
                <div className="flex items-center gap-1">
                  {isAudioOn ? (
                    <Mic className="w-3 h-3 text-red-300" />
                  ) : (
                    <MicOff className="w-3 h-3 text-rose-300" />
                  )}
                </div>
              </div>
            </div>

            {/* Other Attendees Tiles */}
            {attendees
              .filter((a) => a.userId !== currentUser.id)
              .map((att, index) => {
                const isSpeakingSimulated = index % 2 === 0;
                return (
                  <div
                    key={att.userId}
                    onClick={() => {
                      setSelectedProfileUser({
                        id: att.userId,
                        name: att.userName || (att as any).username || 'Student',
                        username: (att as any).username || (att.userName || 'student').toLowerCase().replace(/[^a-z0-9_]/g, ''),
                        email: 'student@jmc.du.ac.in',
                        course: (att as any).userCourse || 'BA(Hons.)',
                        subCourse: (att as any).userSubCourse || '',
                        year: (att as any).userYear || '2nd Year',
                        rollNumber: (att as any).userRollNumber || '240101',
                        societies: (att as any).userSocieties || [],
                        crossCoursePreference: (att as any).userCrossCoursePreference || 'cross_course',
                        preferences: (att as any).userPreferences || [],
                        bio: att.userBio || 'Student at Jesus and Mary College',
                        avatarUrl: att.userAvatar,
                        photos: [att.userAvatar],
                        interests: [event.communityName],
                        isVerified: true,
                        verificationType: 'roll_number',
                        joinedAt: 'Recent',
                      });
                    }}
                    className="relative aspect-video rounded-2xl bg-white border border-stone-200 hover:border-red-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md flex items-center justify-center group transition-all"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <img
                          src={att.userAvatar}
                          alt={att.userName || (att as any).username}
                          className={`w-16 h-16 rounded-full object-cover ${
                            isSpeakingSimulated ? 'ring-4 ring-red-500/60' : 'ring-2 ring-stone-200'
                          }`}
                        />
                        {isSpeakingSimulated && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center">
                            <Volume2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">Click to view profile</span>
                    </div>

                    {/* Attendee Name & Status Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-white text-[11px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold truncate">
                          {att.userName || (att as any).username}
                        </span>
                        {(att.status === 'raised_hand' || att.status === 'interested') && (
                          <span className="text-rose-400" title="Hand raised">
                            ✋
                          </span>
                        )}
                      </div>

                      {/* Creator Moderation: Remove Attendee if needed */}
                      {isCreator && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeParticipantAsCreator(event.id, att.userId);
                          }}
                          className="text-stone-300 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                          title="Remove participant from this event"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Controls Bar at Bottom */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`p-3.5 rounded-2xl flex items-center gap-2 font-semibold text-xs shadow-sm transition-all cursor-pointer ${
                isAudioOn
                  ? 'bg-white hover:bg-stone-50 text-slate-800 border border-stone-200'
                  : 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800'
              }`}
            >
              {isAudioOn ? <Mic className="w-5 h-5 text-red-700" /> : <MicOff className="w-5 h-5 text-rose-700" />}
              <span className="hidden sm:inline">{isAudioOn ? 'Mute' : 'Unmute'}</span>
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3.5 rounded-2xl flex items-center gap-2 font-semibold text-xs shadow-sm transition-all cursor-pointer ${
                isVideoOn
                  ? 'bg-red-700 hover:bg-red-800 text-white'
                  : 'bg-white hover:bg-stone-50 text-slate-800 border border-stone-200'
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5" />}
              <span className="hidden sm:inline">{isVideoOn ? 'Camera On' : 'Turn On Video'}</span>
            </button>

            <button
              onClick={handleToggleScreenShare}
              className={`p-3.5 rounded-2xl flex items-center gap-2 font-semibold text-xs shadow-sm transition-all cursor-pointer ${
                isScreenSharing
                  ? 'bg-rose-700 text-white'
                  : 'bg-white hover:bg-stone-50 text-slate-800 border border-stone-200'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="hidden sm:inline">
                {isScreenSharing ? 'Stop Share' : 'Share Screen'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'stream' ? 'chat' : 'stream')}
              className="md:hidden p-3.5 rounded-2xl bg-white text-slate-800 border border-stone-200 text-xs flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-red-700" />
              <span>Chat</span>
            </button>
          </div>
        </div>

        {/* Right: Live Event Group Chat */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white border-l border-stone-200 flex flex-col ${
            activeTab === 'stream' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Chat Header */}
          <div className="p-3.5 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Circle Group Chat
              </span>
            </div>
            <span className="text-[10px] text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
              Scoped to this event
            </span>
          </div>

          {/* Quick Icebreaker Suggestions */}
          <div className="p-2.5 bg-stone-50 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-500 shrink-0">Icebreakers:</span>
            <button
              onClick={() => handleQuickIcebreaker('👋 Hi everyone! Happy to be here.')}
              className="px-2.5 py-0.5 rounded-full bg-white hover:bg-red-50 text-red-800 border border-stone-200 whitespace-nowrap transition-colors font-medium cursor-pointer"
            >
              👋 Say hello
            </button>
            <button
              onClick={() =>
                handleQuickIcebreaker(
                  event.icebreaker
                    ? `My answer to the icebreaker: ${event.icebreaker.slice(0, 30)}...`
                    : 'Loved this theme!'
                )
              }
              className="px-2.5 py-0.5 rounded-full bg-white hover:bg-rose-50 text-rose-800 border border-stone-200 whitespace-nowrap transition-colors font-medium cursor-pointer"
            >
              ✨ Answer icebreaker
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-white">
            {currentEventMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderUsername || msg.senderName || 'Student'}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div
                    className={`max-w-[78%] rounded-2xl p-3 text-xs shadow-xs ${
                      isMe
                        ? 'bg-red-700 text-white font-medium rounded-tr-none'
                        : 'bg-stone-100 text-slate-800 rounded-tl-none border border-stone-200'
                    }`}
                  >
                    {!isMe && (
                      <div className="font-semibold text-[10px] text-rose-700 mb-0.5">
                        @{msg.senderUsername || msg.senderName || 'student'}
                      </div>
                    )}
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    <span className="block text-[9px] opacity-75 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-stone-50 border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Share thoughts with the circle..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim()}
              className="p-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
