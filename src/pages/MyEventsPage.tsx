import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  MapPin,
  Video,
  Users,
  Hand,
  CheckCircle2,
  ArrowRight,
  Plus,
  Ban,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MyEventsPage: React.FC = () => {
  const {
    events,
    currentUser,
    isUserAttending,
    isUserHandRaised,
    setSelectedEventId,
    leaveEvent,
    setIsCreateEventOpen,
    setActiveTab,
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'joined' | 'hosting' | 'raised_hand'>('joined');

  const joinedEvents = events.filter((e) => isUserAttending(e.id));
  const hostingEvents = events.filter((e) => e.creatorId === currentUser.id);
  const raisedHandEvents = events.filter((e) => isUserHandRaised(e.id));

  const currentList =
    activeTab === 'joined'
      ? joinedEvents
      : activeTab === 'hosting'
      ? hostingEvents
      : raisedHandEvents;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-red-700" />
            <span>My Events</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track confirmed events, manage events you are hosting, and review pending hand-raises.
          </p>
        </div>

        <button
          onClick={() => setIsCreateEventOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/20 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Host an Event</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTabState('joined')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'joined'
              ? 'bg-red-700 text-white shadow-sm font-bold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Attending ({joinedEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTabState('hosting')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'hosting'
              ? 'bg-rose-700 text-white shadow-sm font-bold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hosting ({hostingEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTabState('raised_hand')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'raised_hand'
              ? 'bg-amber-700 text-white shadow-sm font-bold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Hand className="w-4 h-4" />
          <span>Interested ({raisedHandEvents.length})</span>
        </button>
      </div>

      {/* Events List */}
      {currentList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 space-y-4 shadow-xs">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold font-serif text-stone-800">
              {activeTab === 'joined'
                ? "You haven't joined any events yet"
                : activeTab === 'hosting'
                ? "You haven't hosted any events yet"
                : "No pending hand-raises right now"}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Explore your events feed or check out the clubs to find study sessions, jams, and
              hangouts with fellow JMC students.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('feed')}
            className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-700/20 transition-colors cursor-pointer"
          >
            Explore Events Feed
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEventId(evt.id)}
              className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-red-400 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                        evt.format === 'online'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {evt.format === 'online' ? (
                        <Video className="w-3.5 h-3.5 text-rose-700" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-red-700" />
                      )}
                      <span>{evt.format === 'online' ? 'Online' : 'Offline'}</span>
                    </span>

                    {evt.status === 'cancelled' && (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-stone-700 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                    {evt.dateTime}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-0.5">
                  {evt.communityName}
                </div>

                <h3 className="font-bold font-serif text-base sm:text-lg text-stone-900 group-hover:text-red-700 transition-colors">
                  {evt.title}
                </h3>

                <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>

                {evt.format === 'offline' && evt.locationName && (
                  <div className="mt-2 text-xs text-stone-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                    <span className="truncate">{evt.locationName}</span>
                  </div>
                )}
              </div>

              <div
                className="pt-3 border-t border-stone-100 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Users className="w-3.5 h-3.5 text-red-700" />
                  <span>{evt.attendeeCount} confirmed</span>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab !== 'hosting' && (
                    <button
                      onClick={() => leaveEvent(evt.id)}
                      className="text-xs text-stone-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Leave
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEventId(evt.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold border border-red-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{activeTab === 'hosting' ? 'Manage Event' : 'View Event'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
