import React from 'react';
import { MessageSquare, Users, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { COLLEGE_NAME } from '../data/mockData';

export const MessagesPage: React.FC = () => {
  const {
    conversations,
    openDirectChatWithUser,
    allUsers,
    currentUser,
    setActiveTab,
  } = useApp();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5 text-red-700" />
            <span>Private Peer Messaging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-red-700" />
            <span>Direct Messages</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            1-on-1 chats with fellow {COLLEGE_NAME} students. Voice notes, photos, documents, and text.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('discover')}
          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-red-800 border border-red-200 text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Find Peers in Clubs</span>
        </button>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-serif text-stone-800">
              No conversations yet
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You can start 1-on-1 chats directly with fellow students from any club in Communities or from events you are joining!
            </p>
          </div>
          <button
            onClick={() => setActiveTab('discover')}
            className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-700/20 transition-all cursor-pointer"
          >
            Explore Clubs & Members
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
          {conversations.map((thread) => {
            const otherUserId = thread.participants.find((p) => p !== currentUser.id) || '';
            const otherUser = allUsers.find((u) => u.id === otherUserId);
            const otherDetails = thread.participantDetails[otherUserId] || {
              username: otherUser?.username || 'student',
              avatarUrl: otherUser?.avatarUrl || '',
              useStandardAvatar: otherUser?.useStandardAvatar,
              course: otherUser?.course,
              year: otherUser?.year,
            };

            return (
              <div
                key={thread.id}
                onClick={() => {
                  if (otherUser) {
                    openDirectChatWithUser(otherUser);
                  } else {
                    openDirectChatWithUser({
                      id: otherUserId,
                      username: otherDetails.username,
                      name: otherDetails.username,
                      email: '',
                      rollNumber: '240000',
                      course: otherDetails.course || 'BA(Hons.)',
                      year: otherDetails.year || 'Student',
                      societies: [],
                      preferences: [],
                      crossCoursePreference: 'cross_course',
                      bio: '',
                      avatarUrl: otherDetails.avatarUrl,
                      useStandardAvatar: otherDetails.useStandardAvatar || false,
                      photos: [],
                      interests: [],
                      isVerified: true,
                      verificationType: 'roll_number',
                      joinedAt: 'Recent',
                    });
                  }
                }}
                className="p-4 sm:p-5 hover:bg-red-50/40 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar
                    user={{
                      id: otherUserId,
                      name: otherDetails.username,
                      username: otherDetails.username,
                      avatarUrl: otherDetails.avatarUrl,
                      useStandardAvatar: otherDetails.useStandardAvatar,
                    }}
                    size="md"
                    showRollStatus
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 group-hover:text-red-700 transition-colors truncate">
                        @{otherDetails.username}
                      </span>
                      {otherDetails.course && (
                        <span className="text-[11px] text-stone-400 truncate">
                          • {otherDetails.course.split('(')[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 truncate mt-0.5 max-w-md">
                      {thread.lastMessageType === 'voice'
                        ? '🎙️ Voice note'
                        : thread.lastMessageType === 'image'
                        ? '📷 Photo'
                        : thread.lastMessageType === 'document'
                        ? '📄 Document attachment'
                        : thread.lastMessageText || 'Start conversation...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-stone-400">
                    {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleDateString() : ''}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-red-700 group-hover:text-white text-stone-400 flex items-center justify-center transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
