import React from 'react';
import {
  Compass,
  Calendar,
  User,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Newspaper,
  GraduationCap,
  Sparkles,
  MessageSquare,
  ShieldHalf,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLLEGE_NAME } from '../data/mockData';
import { Avatar } from './Avatar';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setIsCreateEventOpen,
    setIsVerificationOpen,
    setSelectedProfileUser,
    conversations,
  } = useApp();

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-800 shadow-xs">
      {/* 100% Free College Platform Reassurance Ribbon - Warm Crimson / Rose Tone */}
      <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border-b border-red-100 px-4 py-1.5 text-center text-xs text-stone-700 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
        <span className="truncate">
          <strong className="text-red-800 font-semibold">Common Ground:</strong> Exclusive to {COLLEGE_NAME}. Zero fees, student roll-verified, private 1-on-1 messaging.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('feed')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-700 via-rose-700 to-amber-600 flex items-center justify-center shadow-md shadow-red-700/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                    Common Ground
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200">
                    JMC DU
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium truncate max-w-[210px] sm:max-w-xs">
                  <span className="text-red-700 font-semibold truncate">@{currentUser.username || 'student'}</span>
                  <span>•</span>
                  <span className="truncate">{currentUser.course ? currentUser.course.split('(')[0] : 'JMC'}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100/90 p-1.5 rounded-full border border-stone-200">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Events Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'discover' || activeTab === 'communities'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Communities</span>
            </button>

            <button
              onClick={() => setActiveTab('my-events')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'my-events'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Events</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
              {totalUnread > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            {currentUser.isSupervisor && (
              <button
                onClick={() => setActiveTab('supervisor')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'supervisor'
                    ? 'bg-gradient-to-r from-red-800 to-rose-700 text-white shadow-sm'
                    : 'text-rose-800 hover:text-rose-950 hover:bg-rose-100/70'
                }`}
              >
                <ShieldHalf className="w-4 h-4" />
                <span>Supervisor</span>
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Roll Verification Status Pill */}
            {currentUser.isVerified ? (
              <button
                onClick={() => setIsVerificationOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                title={`Verified Student Roll No: ${currentUser.rollNumber}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
                <span>Roll: {currentUser.rollNumber}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsVerificationOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                title="Register your 6-digit roll number starting with 2"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Verify Roll No</span>
              </button>
            )}

            {/* Host Event Button (Crimson & Rose) */}
            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-700/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Host an Event</span>
            </button>

            {/* User Avatar with Profile Modal */}
            <button
              onClick={() => setSelectedProfileUser(currentUser)}
              className="relative p-0.5 rounded-full hover:ring-2 hover:ring-red-400 transition-all cursor-pointer"
              title="View my student profile card"
            >
              <Avatar user={currentUser} size="sm" showRollStatus />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[11px] font-semibold cursor-pointer ${
            activeTab === 'feed' ? 'text-red-700 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span>Events</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[11px] font-semibold cursor-pointer ${
            activeTab === 'discover' || activeTab === 'communities' ? 'text-red-700 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Clubs</span>
        </button>

        <button
          onClick={() => setActiveTab('my-events')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[11px] font-semibold cursor-pointer ${
            activeTab === 'my-events' ? 'text-red-700 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>My Events</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[11px] font-semibold cursor-pointer ${
            activeTab === 'messages' ? 'text-red-700 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
          {totalUnread > 0 && (
            <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[11px] font-semibold cursor-pointer ${
            activeTab === 'profile' ? 'text-red-700 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>

        {currentUser.isSupervisor && (
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[11px] font-semibold cursor-pointer ${
              activeTab === 'supervisor' ? 'text-rose-800 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldHalf className="w-5 h-5" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
