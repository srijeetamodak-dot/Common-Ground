import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Plus,
  Calendar,
  Check,
  MapPin,
  Video,
  Users,
  Search,
  X,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';

export const DiscoverPage: React.FC = () => {
  const {
    communities,
    selectedCommunity,
    setSelectedCommunity,
    events,
    setSelectedEventId,
    setIsCreateEventOpen,
    currentUser,
    updateCurrentUser,
    allUsers,
    openDirectChat,
    setSelectedProfileUser,
  } = useApp();

  const [activeCommunityId, setActiveCommunityId] = useState<string>(
    selectedCommunity?.id || communities[0]?.id || 'comm-movie'
  );

  // Search functionality with active Search button
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const activeCommunity =
    communities.find((c) => c.id === activeCommunityId) || communities[0];

  // User membership in this community
  const isUserMember = currentUser.interests.includes(activeCommunity.name);

  const handleToggleJoinCommunity = () => {
    const updatedInterests = isUserMember
      ? currentUser.interests.filter((i) => i !== activeCommunity.name)
      : [...currentUser.interests, activeCommunity.name];
    updateCurrentUser({ interests: updatedInterests });
  };

  // Filtered communities based on search
  const visibleCommunities = communities.filter((c) => {
    if (!activeSearch) return true;
    return (
      c.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(activeSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(activeSearch.toLowerCase())
    );
  });

  // Events under this community
  const communityEvents = events.filter((evt) => {
    if (evt.status === 'cancelled') return false;
    return evt.communityId === activeCommunity.id || evt.communityName === activeCommunity.name;
  });

  // Members of this community (from all registered users)
  const communityMembers = allUsers.filter((u) =>
    (u.interests || []).includes(activeCommunity.name)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 flex items-center gap-2.5">
              <Compass className="w-7 h-7 text-red-700" />
              <span>Campus Clubs & Communities</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              9 official interest clubs for Jesus and Mary College. Connect with peers, view member cards, message 1-on-1, and host club events!
            </p>
          </div>

          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/20 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Host in this Club</span>
          </button>
        </div>
      </div>

      {/* Search Bar with active button */}
      <form onSubmit={handleExecuteSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search clubs by name, passion, or keyword..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </form>

      {/* Community Selector Pills / Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {visibleCommunities.map((comm) => {
          const isActive = comm.id === activeCommunityId;
          const isMember = currentUser.interests.includes(comm.name);

          return (
            <button
              key={comm.id}
              onClick={() => {
                setActiveCommunityId(comm.id);
                setSelectedCommunity(comm);
              }}
              className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-700 text-white shadow-sm scale-102 font-bold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-red-50/70 hover:text-red-800 shadow-xs'
              }`}
            >
              <span>{comm.name}</span>
              {isMember && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-red-100 text-red-800'
                  }`}
                >
                  Member
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Community Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-sm">
        <div className="h-48 sm:h-60 relative w-full bg-stone-900">
          <img
            src={activeCommunity.coverImage}
            alt={activeCommunity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/50 to-black/30" />

          <div className="absolute bottom-5 left-5 right-5 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-rose-300">
                {activeCommunity.category} • Official JMC Club
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1">
                {activeCommunity.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 max-w-2xl mt-1 leading-relaxed">
                {activeCommunity.description}
              </p>
            </div>

            {/* Join / Leave Voluntary Club Membership */}
            <button
              onClick={handleToggleJoinCommunity}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isUserMember
                  ? 'bg-white text-red-800 hover:bg-stone-100'
                  : 'bg-gradient-to-r from-red-700 to-rose-700 text-white hover:from-red-800 hover:to-rose-800 shadow-red-700/30'
              }`}
            >
              {isUserMember ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Joined Club (Click to Leave)</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Join {activeCommunity.name}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Club Members Showcase (Discover peers and message 1-on-1) */}
        <div className="p-5 sm:p-7 border-b border-stone-200 bg-stone-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-700" />
                <span>Club Members ({communityMembers.length})</span>
              </h3>
              <p className="text-xs text-stone-500">
                Fellow students who joined this club. Tap "Message" to start a private 1-on-1 chat!
              </p>
            </div>
          </div>

          {communityMembers.length === 0 ? (
            <p className="text-xs text-stone-500 italic">
              No students have joined this club yet. Be the first to join above!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {communityMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-2xl bg-white border border-stone-200 flex items-center justify-between shadow-xs hover:border-red-300 transition-all"
                >
                  <div
                    onClick={() => setSelectedProfileUser(member)}
                    className="flex items-center gap-2.5 truncate mr-2 cursor-pointer group"
                  >
                    <Avatar user={member} size="md" showRollStatus />
                    <div className="truncate">
                      <div className="text-xs font-bold text-stone-900 group-hover:text-red-700 truncate">
                        @{member.username} {member.id === currentUser.id ? '(You)' : ''}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {member.course ? member.course.split('(')[0] : 'JMC'} • {member.year || ''}
                      </div>
                    </div>
                  </div>

                  {member.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={() => openDirectChat(member)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                      title={`Message @${member.username}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-red-700" />
                      <span>Message</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Club Events Area */}
        <div className="p-5 sm:p-7 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900">
                Active Events in {activeCommunity.name} ({communityEvents.length})
              </h3>
              <p className="text-xs text-stone-500">
                Students organize offline campus meetups or online chat rooms here.
              </p>
            </div>

            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
            >
              + Host an Event
            </button>
          </div>

          {communityEvents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <Calendar className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">
                No events planned in {activeCommunity.name} right now. Start the first one!
              </p>
              <button
                onClick={() => setIsCreateEventOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-sm shadow-red-700/20 cursor-pointer"
              >
                Host an Event Here
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-red-400 cursor-pointer transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          evt.format === 'online'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {evt.format === 'online' ? (
                          <Video className="w-3 h-3 text-rose-700" />
                        ) : (
                          <MapPin className="w-3 h-3 text-red-700" />
                        )}
                        <span>{evt.format === 'online' ? 'Online Room' : 'Offline Campus'}</span>
                      </span>

                      <span className="text-[11px] text-stone-500 font-medium">{evt.dateTime}</span>
                    </div>

                    <h4 className="font-bold font-serif text-sm text-stone-900 group-hover:text-red-700 transition-colors line-clamp-2">
                      {evt.title}
                    </h4>

                    {evt.locationName && (
                      <div className="flex items-center gap-1 text-xs text-red-800 font-medium mt-1">
                        <MapPin className="w-3 h-3 shrink-0 text-red-700" />
                        <span className="truncate">{evt.locationName}</span>
                      </div>
                    )}

                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-2 truncate mr-2">
                      <Avatar
                        user={{
                          id: evt.creatorId,
                          name: evt.creatorName || evt.creatorUsername || 'Host',
                          username: evt.creatorUsername || (evt.creatorName ? evt.creatorName.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'host'),
                          avatarUrl: evt.creatorAvatar,
                        }}
                        size="sm"
                      />
                      <span className="text-stone-700 truncate max-w-[110px] font-medium">
                        @{evt.creatorUsername || evt.creatorName || 'host'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-700 font-semibold shrink-0">
                      <Users className="w-3.5 h-3.5 text-red-700" />
                      <span>{evt.attendeeCount} joined</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
