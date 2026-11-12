/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { SupervisorPage } from './pages/SupervisorPage';
import { VerificationModal } from './components/VerificationModal';
import { CreateEventModal } from './components/CreateEventModal';
import { EditProfileModal } from './components/EditProfileModal';
import { EventDetailModal } from './components/EventDetailModal';
import { DirectChatModal } from './components/DirectChatModal';
import { BumbleProfileCard } from './components/BumbleProfileCard';
import { FooterNotice } from './components/FooterNotice';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    selectedProfileUser,
    setSelectedProfileUser,
    currentUser,
  } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 flex flex-col font-sans selection:bg-red-700 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'feed' && <HomePage />}
        {activeTab === 'discover' && <DiscoverPage />}
        {activeTab === 'my-events' && <MyEventsPage />}
        {activeTab === 'messages' && <MessagesPage />}
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'supervisor' && currentUser.isSupervisor && <SupervisorPage />}
      </main>

      {/* Footer Notice */}
      <FooterNotice />

      {/* Global Modals & Sheets */}
      <VerificationModal />
      <CreateEventModal />
      <EditProfileModal />
      <EventDetailModal />
      <DirectChatModal />

      {/* Bumble-Style Member Card Modal when any attendee/member is clicked */}
      {selectedProfileUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProfileUser(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <BumbleProfileCard
              user={selectedProfileUser}
              onClose={() => setSelectedProfileUser(null)}
              isSelf={selectedProfileUser.id === currentUser.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
