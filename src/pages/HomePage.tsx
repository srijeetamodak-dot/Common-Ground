import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Search,
  CheckCircle2,
  Hand,
  Compass,
  ArrowRight,
  Flame,
  Sparkles,
  GraduationCap,
  Building2,
  X,
  Filter,
  ArrowDownUp,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLLEGE_NAME } from '../data/mockData';
import { Avatar } from '../components/Avatar';

export type DateSortOption = 'soonest' | 'latest' | 'recently_added';
export type FormatFilterOption = 'all' | 'offline' | 'online';

export const HomePage: React.FC = () => {
  const {
    events,
    communities,
    currentUser,
    setSelectedEventId,
    joinEvent,
    isUserAttending,
    isUserHandRaised,
    setActiveTab,
    setIsCreateEventOpen,
  } = useApp();

  // Search input state and active search query
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Sorting & Filtering State
  const [sortByDate, setSortByDate] = useState<DateSortOption>('soonest');
  const [formatFilter, setFormatFilter] = useState<FormatFilterOption>('all');
  const [selectedClubCategory, setSelectedClubCategory] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'cross_course' | 'my_course'>('all');
  const [filterMode, setFilterMode] = useState<
    'all' | 'my_interests' | 'offline' | 'online' | 'my_course'
  >('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setActiveSearch('');
    setSortByDate('soonest');
    setFormatFilter('all');
    setSelectedClubCategory('all');
    setAudienceFilter('all');
    setFilterMode('all');
  };

  // Helper to parse event timestamp for date sorting
  const getEventTime = (event: typeof events[0]): number => {
    if (event.eventTimestamp) return event.eventTimestamp;
    try {
      const parsed = Date.parse(event.dateTime);
      if (!isNaN(parsed)) return parsed;
    } catch {
      // ignore
    }
    return 0;
  };

  // Filter and Sort events
  const filteredAndSortedEvents = useMemo(() => {
    const list = events.filter((evt) => {
      if (evt.status === 'cancelled') return false;

      // 1. Search Query Match
      if (activeSearch) {
        const query = activeSearch.toLowerCase();
        const matchesSearch =
          evt.title.toLowerCase().includes(query) ||
          evt.description.toLowerCase().includes(query) ||
          evt.communityName.toLowerCase().includes(query) ||
          (evt.locationName && evt.locationName.toLowerCase().includes(query)) ||
          (evt.creatorCourse && evt.creatorCourse.toLowerCase().includes(query)) ||
          (evt.societyAffiliation && evt.societyAffiliation.toLowerCase().includes(query)) ||
          evt.tags.some((t) => t.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // 2. Format Category Filter (Online vs Offline)
      if (formatFilter !== 'all') {
        if (evt.format !== formatFilter) return false;
      }

      // 3. Club / Community Category Filter
      if (selectedClubCategory !== 'all') {
        if (evt.communityName !== selectedClubCategory && evt.communityId !== selectedClubCategory) {
          return false;
        }
      }

      // 4. Audience Category Filter
      if (audienceFilter === 'cross_course') {
        if (evt.targetAudience === 'course_restricted') return false;
      } else if (audienceFilter === 'my_course') {
        const userCourseLower = currentUser.course.toLowerCase();
        const matchesCourse =
          (evt.courseRestriction && userCourseLower.includes(evt.courseRestriction.toLowerCase())) ||
          (evt.creatorCourse && userCourseLower.includes(evt.creatorCourse.toLowerCase()));
        if (!matchesCourse) return false;
      }

      // 5. Quick Filter Mode
      if (filterMode === 'my_interests') {
        const userInterests = currentUser.interests.map((i) => i.toLowerCase());
        const userSocieties = (currentUser.societies || []).map((s) => s.toLowerCase());
        const matchesInterest =
          userInterests.some((int) => evt.communityName.toLowerCase().includes(int)) ||
          (evt.societyAffiliation && userSocieties.some((soc) => evt.societyAffiliation?.toLowerCase().includes(soc))) ||
          evt.tags.some((t) => userInterests.includes(t.toLowerCase()));
        if (!matchesInterest) return false;
      } else if (filterMode === 'offline') {
        if (evt.format !== 'offline') return false;
      } else if (filterMode === 'online') {
        if (evt.format !== 'online') return false;
      } else if (filterMode === 'my_course') {
        const userCourseLower = currentUser.course.toLowerCase();
        const matchesCourse =
          (evt.courseRestriction && userCourseLower.includes(evt.courseRestriction.toLowerCase())) ||
          (evt.creatorCourse && userCourseLower.includes(evt.creatorCourse.toLowerCase()));
        if (!matchesCourse) return false;
      }

      return true;
    });

    // Sort by Date
    return list.sort((a, b) => {
      const timeA = getEventTime(a);
      const timeB = getEventTime(b);

      if (sortByDate === 'soonest') {
        // Soonest / upcoming first
        return timeA - timeB;
      } else if (sortByDate === 'latest') {
        // Latest / furthest out first
        return timeB - timeA;
      } else if (sortByDate === 'recently_added') {
        // Sort by creation date descending
        const createdA = a.createdAt ? Date.parse(a.createdAt) : 0;
        const createdB = b.createdAt ? Date.parse(b.createdAt) : 0;
        return createdB - createdA;
      }
      return 0;
    });
  }, [events, activeSearch, formatFilter, selectedClubCategory, audienceFilter, filterMode, sortByDate, currentUser]);

  const liveEvent = events.find((e) => e.status === 'live');
  const activeFiltersCount =
    (formatFilter !== 'all' ? 1 : 0) +
    (selectedClubCategory !== 'all' ? 1 : 0) +
    (audienceFilter !== 'all' ? 1 : 0) +
    (activeSearch ? 1 : 0) +
    (sortByDate !== 'soonest' ? 1 : 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* College Welcome & Events Banner - Warm Crimson & Rose Aesthetic */}
      <div className="relative rounded-3xl bg-gradient-to-br from-white via-rose-50/40 to-red-50/30 border border-stone-200/90 p-6 sm:p-8 overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            <Newspaper className="w-3.5 h-3.5 text-red-700" />
            <span>Welcome to Common Ground, @{currentUser.username || 'student'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
            Connect with college peers through shared events & interests.
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Exclusive to <strong>{COLLEGE_NAME}</strong>. Verified by student roll number.
            Currently enrolled in <strong>{currentUser.course}</strong> {currentUser.subCourse ? `(${currentUser.subCourse})` : ''} - {currentUser.year}.
            Zero fees, safe 1-on-1 messaging, offline campus meetups & live clubs.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Host an Event</span>
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-red-800 font-semibold text-xs sm:text-sm border border-red-200 transition-colors cursor-pointer"
            >
              Browse 9 College Clubs
            </button>
          </div>
        </div>

        {/* Decorative corner accents in warm red & amber */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Featured "Happening Now" Room if available */}
      {liveEvent && (
        <div
          onClick={() => setSelectedEventId(liveEvent.id)}
          className="relative rounded-2xl bg-gradient-to-r from-red-50 via-rose-50/70 to-amber-50 border border-red-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-red-300 transition-all group shadow-sm hover:shadow-md"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-700 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>Happening Right Now on Campus</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-red-800 transition-colors">
                {liveEvent.title}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                {liveEvent.locationName || liveEvent.communityName} • {liveEvent.attendeeCount} students gathered right now
              </p>
            </div>
          </div>

          <button className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-red-700/20 transition-colors cursor-pointer">
            <span>Join Live Event</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FILTER & SORT SYSTEM FOR EVENTS */}
      <div className="space-y-3 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
        {/* Top Search Bar */}
        <form onSubmit={handleExecuteSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search events by title, club, campus spot, course, or society..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                title="Clear search"
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
          <button
            type="button"
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              isFilterPanelOpen || activeFiltersCount > 0
                ? 'bg-red-50 text-red-800 border-red-300 ring-2 ring-red-100'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
            title="Toggle advanced filter controls"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>

        {/* Filter Controls Bar: Sort by Date & Filter by Category */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Segmented Format Filter (Online / Offline / All) */}
          <div className="flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-2xl border border-stone-200">
            <span className="text-[11px] font-bold text-stone-500 uppercase px-2">Format:</span>
            <button
              onClick={() => {
                setFormatFilter('all');
                if (filterMode === 'offline' || filterMode === 'online') setFilterMode('all');
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                formatFilter === 'all'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => {
                setFormatFilter('offline');
                setFilterMode('offline');
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                formatFilter === 'offline'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Offline (Campus)</span>
            </button>
            <button
              onClick={() => {
                setFormatFilter('online');
                setFilterMode('online');
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                formatFilter === 'online'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Online Room</span>
            </button>
          </div>

          {/* Sort By Date Dropdown / Control */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1">
              <ArrowDownUp className="w-3.5 h-3.5 text-red-700" />
              <span>Sort by Date:</span>
            </span>
            <select
              value={sortByDate}
              onChange={(e) => setSortByDate(e.target.value as DateSortOption)}
              className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              <option value="soonest">📅 Soonest First (Upcoming)</option>
              <option value="latest">🗓️ Furthest Out (Latest)</option>
              <option value="recently_added">⚡ Recently Added</option>
            </select>
          </div>
        </div>

        {/* Expandable Advanced Filter Panel (Category, Club, Audience) */}
        {isFilterPanelOpen && (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                <Filter className="w-4 h-4 text-red-700" />
                <span>Filter by Category & Community</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Category / Club Filter */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  Club / Category
                </label>
                <select
                  value={selectedClubCategory}
                  onChange={(e) => setSelectedClubCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-red-600 cursor-pointer"
                >
                  <option value="all">All 9 JMC Clubs</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Format Category */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  Format (Online / Offline)
                </label>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value as FormatFilterOption)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-red-600 cursor-pointer"
                >
                  <option value="all">All Formats</option>
                  <option value="offline">Offline (Campus Meetup)</option>
                  <option value="online">Online (Video/Voice Room)</option>
                </select>
              </div>

              {/* 3. Audience Category */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  Audience Scope
                </label>
                <select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-red-600 cursor-pointer"
                >
                  <option value="all">All Audiences</option>
                  <option value="cross_course">🌐 Cross-Course Only</option>
                  <option value="my_course">🎓 My Course Only ({currentUser.course ? currentUser.course.split('(')[0] : 'My Course'})</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Quick Filter Pill Buttons (Warm Crimson Theme) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
          <button
            onClick={() => {
              setFilterMode('all');
              setFormatFilter('all');
              setSelectedClubCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'all' && formatFilter === 'all' && selectedClubCategory === 'all'
                ? 'bg-red-700 text-white shadow-xs font-bold'
                : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-red-50 hover:text-red-800'
            }`}
          >
            All Events ({events.filter((e) => e.status !== 'cancelled').length})
          </button>

          <button
            onClick={() => setFilterMode('my_interests')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              filterMode === 'my_interests'
                ? 'bg-red-700 text-white shadow-xs font-bold'
                : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-red-50 hover:text-red-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>My Clubs & Passions</span>
          </button>

          <button
            onClick={() => {
              setAudienceFilter(audienceFilter === 'cross_course' ? 'all' : 'cross_course');
            }}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              audienceFilter === 'cross_course'
                ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-xs font-bold'
                : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-red-50 hover:text-red-800'
            }`}
          >
            <span>🌐 Cross-Course</span>
          </button>

          <button
            onClick={() => {
              setAudienceFilter(audienceFilter === 'my_course' ? 'all' : 'my_course');
            }}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              audienceFilter === 'my_course'
                ? 'bg-red-800 text-white shadow-xs font-bold'
                : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-rose-50 hover:text-rose-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>My Course Only</span>
          </button>

          <button
            onClick={() => {
              setFormatFilter('offline');
              setFilterMode('offline');
            }}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              formatFilter === 'offline'
                ? 'bg-red-700 text-white shadow-xs font-bold'
                : 'bg-stone-50 text-red-800 border border-red-200 hover:bg-red-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>On-Campus</span>
          </button>

          <button
            onClick={() => {
              setFormatFilter('online');
              setFilterMode('online');
            }}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              formatFilter === 'online'
                ? 'bg-red-700 text-white shadow-xs font-bold'
                : 'bg-stone-50 text-rose-800 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Online</span>
          </button>
        </div>

        {/* Active Filter or Search Notification */}
        {(activeSearch || activeFiltersCount > 0) && (
          <div className="flex items-center justify-between text-xs text-stone-700 p-2.5 rounded-2xl bg-red-50/70 border border-red-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-red-800">Filtered Events:</span>
              <span>Showing {filteredAndSortedEvents.length} events</span>
              {activeSearch && <span>matching "<strong>{activeSearch}</strong>"</span>}
              {formatFilter !== 'all' && <span className="bg-white px-2 py-0.5 rounded-md border border-red-200 text-red-800 font-semibold">{formatFilter === 'offline' ? 'Offline' : 'Online'}</span>}
              {selectedClubCategory !== 'all' && <span className="bg-white px-2 py-0.5 rounded-md border border-red-200 text-red-800 font-semibold">{selectedClubCategory}</span>}
              {sortByDate !== 'soonest' && (
                <span className="bg-white px-2 py-0.5 rounded-md border border-red-200 text-stone-700">
                  Sorted: {sortByDate === 'latest' ? 'Furthest Out' : 'Recently Added'}
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-red-700 font-bold hover:underline cursor-pointer shrink-0 ml-2"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {filteredAndSortedEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 space-y-3 shadow-xs">
          <Compass className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800 font-serif">
            No events match your criteria
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your date sorting or category filters, or host a new gathering for your club!
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 hover:bg-red-100 font-bold cursor-pointer"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-700 text-white hover:bg-red-800 text-xs font-bold cursor-pointer shadow-sm shadow-red-700/20"
            >
              Host an Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedEvents.map((evt) => {
            const isAttending = isUserAttending(evt.id);
            const isHandRaised = isUserHandRaised(evt.id);

            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className="group rounded-3xl bg-white border border-stone-200 hover:border-red-400 hover:shadow-xl cursor-pointer overflow-hidden shadow-xs transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Cover */}
                <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={
                      evt.coverImage ||
                      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-black/20" />

                  {/* Format & Audience Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-md ${
                        evt.format === 'online'
                          ? 'bg-rose-700 text-white'
                          : 'bg-red-700 text-white'
                      }`}
                    >
                      {evt.format === 'online' ? (
                        <>
                          <Video className="w-3 h-3" />
                          <span>Online</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>Offline</span>
                        </>
                      )}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md ${
                        evt.targetAudience === 'course_restricted'
                          ? 'bg-stone-900 text-white border border-stone-700'
                          : 'bg-gradient-to-r from-red-700 to-amber-600 text-white'
                      }`}
                    >
                      {evt.targetAudience === 'course_restricted'
                        ? '🎓 Course Only'
                        : '🌐 Cross-Course'}
                    </span>
                  </div>

                  {/* Date & Time pill bottom */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-stone-900/80 px-2.5 py-1 rounded-xl backdrop-blur-md border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-rose-300" />
                    <span>{evt.dateTime}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Club Name */}
                    <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-1">
                      {evt.communityName}
                    </div>

                    <h3 className="font-bold font-serif text-base sm:text-lg text-stone-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                      {evt.title}
                    </h3>

                    {/* Venue / Spot */}
                    {evt.locationName && (
                      <div className="flex items-center gap-1 text-xs text-red-800 font-medium mt-1">
                        <MapPin className="w-3 h-3 shrink-0 text-red-700" />
                        <span className="truncate">{evt.locationName}</span>
                      </div>
                    )}

                    <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Society Affiliation Tag if present */}
                  {evt.societyAffiliation && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded-md w-fit border border-red-100">
                      <Building2 className="w-3 h-3 text-red-700" />
                      <span>{evt.societyAffiliation}</span>
                    </div>
                  )}

                  {/* Host snippet & Attendee counter */}
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
                      <div className="truncate">
                        <span className="font-semibold text-stone-700 block truncate">
                          @{evt.creatorUsername || evt.creatorName || 'host'}
                        </span>
                        {evt.creatorCourse && (
                          <span className="text-[10px] text-stone-400 block truncate">
                            {evt.creatorCourse.split('(')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-stone-700 font-semibold shrink-0">
                      <Users className="w-3.5 h-3.5 text-red-700" />
                      <span>{evt.attendeeCount} students</span>
                    </div>
                  </div>

                  {/* Action Buttons (Crimson & Rose) */}
                  <div
                    className="pt-1 flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isAttending ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-700" />
                        <span>You're Attending</span>
                      </div>
                    ) : isHandRaised ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                        <Hand className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hand Raised (Interested)</span>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => joinEvent(evt.id, true)}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-red-800 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Raise hand to express interest"
                        >
                          <Hand className="w-3.5 h-3.5 text-red-700" />
                          <span>Raise Hand</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => joinEvent(evt.id, false)}
                          className="flex-1 py-2 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition-colors shadow-sm shadow-red-700/20 cursor-pointer"
                        >
                          Join Event
                        </button>
                      </>
                    )}
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
