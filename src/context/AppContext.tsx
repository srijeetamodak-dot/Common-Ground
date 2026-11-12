import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Community,
  Conversation,
  DirectMessage,
  EventAttendee,
  EventChatMessage,
  EventItem,
  MessageType,
  SUPERVISOR_EMAILS,
  UserProfile,
} from '../types';
import {
  CURRENT_USER,
  DEFAULT_COMMUNITIES,
  INITIAL_EVENTS,
  SAMPLE_MEMBERS,
} from '../data/mockData';
import {
  checkRollNumberInFirestore,
  deleteEventFromFirestore,
  ensureAuth,
  fetchAllUsersFromFirestore,
  getUserByRollNumberFromFirestore,
  getUserProfileFromFirestore,
  removeAttendeeFromFirestore,
  saveCommunityToFirestore,
  saveEventToFirestore,
  saveUserProfileToFirestore,
  seedInitialDataToFirestore,
  sendDirectMessageToFirestore,
  sendMessageToFirestore,
  setAttendeeInFirestore,
  subscribeToAttendees,
  subscribeToCommunities,
  subscribeToDirectMessages,
  subscribeToEvents,
  subscribeToMessages,
  subscribeToUsers,
  testFirestoreConnection,
} from '../firebase';

interface AppContextType {
  currentUser: UserProfile;
  isSupervisor: boolean;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  signOut: () => void;
  registerOrSignIn: (userData: {
    name: string;
    username: string;
    email: string;
    rollNumber: string;
    course: string;
    subCourse?: string;
    year: string;
    societies?: string[];
    preferences?: string[];
    crossCoursePreference?: 'cross_course' | 'my_course_only';
    avatarUrl?: string;
    useStandardAvatar?: boolean;
    bio?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  // Navigation & Modals
  activeTab: 'feed' | 'communities' | 'discover' | 'my-events' | 'messages' | 'supervisor' | 'profile';
  setActiveTab: (tab: 'feed' | 'communities' | 'discover' | 'my-events' | 'messages' | 'supervisor' | 'profile' | any) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  selectedProfileUser: UserProfile | null;
  setSelectedProfileUser: (user: UserProfile | null) => void;
  isCreateEventOpen: boolean;
  setIsCreateEventOpen: (open: boolean) => void;
  isVerificationOpen: boolean;
  setIsVerificationOpen: (open: boolean) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  
  // Communities
  communities: Community[];
  selectedCommunity: Community | null;
  setSelectedCommunity: (comm: Community | null) => void;
  joinedCommunityIds: Set<string>;
  toggleJoinCommunity: (commId: string) => void;
  addCommunity: (name: string, description: string, icon: string, coverImage: string, category: string) => boolean;

  // Events
  events: EventItem[];
  createEvent: (eventData: Omit<EventItem, 'id' | 'createdAt' | 'attendeeCount' | 'creatorId' | 'creatorUsername' | 'creatorAvatar'>) => void;
  cancelEvent: (eventId: string, reason?: string) => { success: boolean; error?: string };
  canCancelEvent: (eventId: string) => boolean;
  removeEvent: (eventId: string) => void;
  
  // Attendees & Host Approvals
  currentEventAttendees: EventAttendee[];
  isUserAttending: (eventId: string) => boolean;
  isUserInterested: (eventId: string) => boolean;
  isUserHandRaised: (eventId: string) => boolean;
  joinEvent: (eventId: string, asInterestedOnly?: boolean) => void;
  leaveEvent: (eventId: string) => void;
  acceptAttendee: (eventId: string, targetUserId: string) => void;
  acceptParticipant: (eventId: string, targetUserId: string) => void;
  rejectAttendee: (eventId: string, targetUserId: string) => void;
  rejectParticipant: (eventId: string, targetUserId: string) => void;
  removeParticipantAsCreator: (eventId: string, targetUserId: string) => void;

  // Event Room Chat (for online events)
  currentEventMessages: EventChatMessage[];
  sendEventMessage: (eventId: string, text: string) => void;

  // Direct Messages (1-on-1 Chat)
  activeDirectChatUser: UserProfile | null;
  openDirectChatWithUser: (user: UserProfile) => void;
  openDirectChat: (user: UserProfile) => void;
  closeDirectChat: () => void;
  conversations: Conversation[];
  activeConversationMessages: DirectMessage[];
  sendDirectMessage: (
    recipientId: string,
    recipientUsername: string,
    text: string,
    type?: MessageType,
    attachment?: { url: string; name: string; size?: string; audioDuration?: number }
  ) => void;

  // Supervisor Directory
  allUsers: UserProfile[];
  
  // Filters & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  communitySearchQuery: string;
  setCommunitySearchQuery: (q: string) => void;
  selectedCommunityFilter: string;
  setSelectedCommunityFilter: (comm: string) => void;
  formatFilter: 'all' | 'online' | 'offline';
  setFormatFilter: (f: 'all' | 'online' | 'offline') => void;
  audienceFilter: 'all' | 'cross_course' | 'my_course_only';
  setAudienceFilter: (f: 'all' | 'cross_course' | 'my_course_only') => void;

  // Helpers
  getCommunityById: (id: string) => Community | undefined;
  getUserById: (id: string) => UserProfile | undefined;
  isFirestoreLive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if email belongs to supervisor list
  const checkIsSupervisor = (email: string) => {
    return SUPERVISOR_EMAILS.includes(email.trim().toLowerCase());
  };

  // Load saved user or fallback
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('common_ground_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isSupervisor: checkIsSupervisor(parsed.email || ''),
        };
      }
      return {
        ...CURRENT_USER,
        isSupervisor: checkIsSupervisor(CURRENT_USER.email),
      };
    } catch {
      return {
        ...CURRENT_USER,
        isSupervisor: checkIsSupervisor(CURRENT_USER.email),
      };
    }
  });

  const isSupervisor = useMemo(() => {
    return checkIsSupervisor(currentUser.email);
  }, [currentUser.email]);

  // All Registered Users on the platform (loaded and synchronized directly with Firestore database)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(SAMPLE_MEMBERS);

  const [activeTab, setActiveTab] = useState<
    'feed' | 'communities' | 'my-events' | 'messages' | 'supervisor' | 'profile'
  >('feed');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Communities (only supervisors can add)
  const [communities, setCommunities] = useState<Community[]>(DEFAULT_COMMUNITIES);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<Set<string>>(
    () => new Set(['comm-music', 'comm-movie', 'comm-reading', 'comm-boardgame'])
  );

  // Events
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);

  // Event Attendees Map
  const [attendeeMap, setAttendeeMap] = useState<Record<string, EventAttendee[]>>({
    'evt-1': [
      {
        userId: CURRENT_USER.id,
        username: CURRENT_USER.username,
        realName: CURRENT_USER.name,
        userAvatar: CURRENT_USER.avatarUrl,
        userUseStandardAvatar: CURRENT_USER.useStandardAvatar,
        userBio: CURRENT_USER.bio,
        userCourse: CURRENT_USER.course,
        userSubCourse: CURRENT_USER.subCourse,
        userYear: CURRENT_USER.year,
        userSocieties: CURRENT_USER.societies,
        userCrossCoursePreference: CURRENT_USER.crossCoursePreference,
        userPreferences: CURRENT_USER.preferences,
        status: 'confirmed',
        joinedAt: '2 hours ago',
      },
      ...SAMPLE_MEMBERS.slice(1, 4).map((m) => ({
        userId: m.id,
        username: m.username,
        realName: m.name,
        userAvatar: m.avatarUrl,
        userUseStandardAvatar: m.useStandardAvatar,
        userBio: m.bio,
        userCourse: m.course,
        userSubCourse: m.subCourse,
        userYear: m.year,
        userSocieties: m.societies,
        userCrossCoursePreference: m.crossCoursePreference,
        userPreferences: m.preferences,
        status: 'confirmed' as const,
        joinedAt: '1 day ago',
      })),
      {
        userId: SAMPLE_MEMBERS[4].id,
        username: SAMPLE_MEMBERS[4].username,
        realName: SAMPLE_MEMBERS[4].name,
        userAvatar: SAMPLE_MEMBERS[4].avatarUrl,
        userUseStandardAvatar: SAMPLE_MEMBERS[4].useStandardAvatar,
        userBio: SAMPLE_MEMBERS[4].bio,
        userCourse: SAMPLE_MEMBERS[4].course,
        userSubCourse: SAMPLE_MEMBERS[4].subCourse,
        userYear: SAMPLE_MEMBERS[4].year,
        userSocieties: SAMPLE_MEMBERS[4].societies,
        userCrossCoursePreference: SAMPLE_MEMBERS[4].crossCoursePreference,
        userPreferences: SAMPLE_MEMBERS[4].preferences,
        status: 'interested' as const,
        joinedAt: '30 minutes ago',
      },
    ],
    'evt-2': [
      {
        userId: CURRENT_USER.id,
        username: CURRENT_USER.username,
        realName: CURRENT_USER.name,
        userAvatar: CURRENT_USER.avatarUrl,
        userUseStandardAvatar: CURRENT_USER.useStandardAvatar,
        userBio: CURRENT_USER.bio,
        userCourse: CURRENT_USER.course,
        userSubCourse: CURRENT_USER.subCourse,
        userYear: CURRENT_USER.year,
        userSocieties: CURRENT_USER.societies,
        userCrossCoursePreference: CURRENT_USER.crossCoursePreference,
        userPreferences: CURRENT_USER.preferences,
        status: 'interested',
        joinedAt: '3 hours ago',
      },
      ...SAMPLE_MEMBERS.slice(1, 5).map((m) => ({
        userId: m.id,
        username: m.username,
        realName: m.name,
        userAvatar: m.avatarUrl,
        userUseStandardAvatar: m.useStandardAvatar,
        userBio: m.bio,
        userCourse: m.course,
        userSubCourse: m.subCourse,
        userYear: m.year,
        userSocieties: m.societies,
        userCrossCoursePreference: m.crossCoursePreference,
        userPreferences: m.preferences,
        status: 'confirmed' as const,
        joinedAt: '4 hours ago',
      })),
    ],
  });

  // Event Room Chat Messages
  const [currentEventMessages, setCurrentEventMessages] = useState<EventChatMessage[]>([
    {
      id: 'msg-1',
      eventId: 'evt-4',
      senderId: 'user-priya',
      senderUsername: 'priya_com',
      senderAvatar: '',
      senderUseStandardAvatar: true,
      text: 'Hey everyone! Welcome to our coding circle. Drop what stack you are exploring in the chat!',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'msg-2',
      eventId: 'evt-4',
      senderId: 'user-srijeeta',
      senderUsername: 'srijeeta_m',
      senderAvatar: CURRENT_USER.avatarUrl,
      senderUseStandardAvatar: false,
      text: 'Hi Priya! Excited to brainstorm hackathon ideas for JMC!',
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
  ]);

  // Direct Messages (1-on-1 Chat) State
  const [activeDirectChatUser, setActiveDirectChatUser] = useState<UserProfile | null>(null);
  const [directMessagesMap, setDirectMessagesMap] = useState<Record<string, DirectMessage[]>>({
    'user-srijeeta_user-ananya': [
      {
        id: 'dm-1',
        conversationId: 'user-ananya_user-srijeeta',
        senderId: 'user-ananya',
        senderUsername: 'ananya_reads',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        recipientId: CURRENT_USER.id,
        recipientUsername: CURRENT_USER.username,
        text: 'Hey! Are you going to be at Thevenet stairs for the sunset jam today?',
        type: 'text',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'dm-2',
        conversationId: 'user-ananya_user-srijeeta',
        senderId: CURRENT_USER.id,
        senderUsername: CURRENT_USER.username,
        senderAvatar: CURRENT_USER.avatarUrl,
        recipientId: 'user-ananya',
        recipientUsername: 'ananya_reads',
        text: 'Yes definitely! Bringing my acoustic guitar and song chords. See you there around 5!',
        type: 'text',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'cross_course' | 'my_course_only'>('all');
  const [isFirestoreLive, setIsFirestoreLive] = useState(false);

  // Initialize Firebase and Realtime listeners
  useEffect(() => {
    let isMounted = true;
    let unsubUsers: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;
    let unsubCommunities: (() => void) | undefined;

    async function init() {
      await ensureAuth();
      const connected = await testFirestoreConnection();
      if (isMounted) {
        setIsFirestoreLive(connected);
      }

      if (connected) {
        // Seed initial known college directory to Firestore if empty
        await seedInitialDataToFirestore(SAMPLE_MEMBERS, DEFAULT_COMMUNITIES, INITIAL_EVENTS);

        // Real-time subscribe to all registered users directly from Firestore database
        unsubUsers = subscribeToUsers(
          (remoteUsers) => {
            if (isMounted && remoteUsers.length > 0) {
              setAllUsers(remoteUsers);

              // If currentUser is verified/saved, synchronize it with the live Firestore database record
              setCurrentUser((current) => {
                const liveMatch = remoteUsers.find(
                  (u) => u.id === current.id || (u.rollNumber && u.rollNumber === current.rollNumber)
                );
                if (liveMatch) {
                  localStorage.setItem('common_ground_user', JSON.stringify(liveMatch));
                  return liveMatch;
                }
                return current;
              });
            }
          },
          (err) => console.warn('Users listener error:', err)
        );

        // Subscribe to Events
        unsubEvents = subscribeToEvents((remoteEvents) => {
          if (remoteEvents.length > 0 && isMounted) {
            setEvents(remoteEvents);
          }
        });

        // Subscribe to Communities
        unsubCommunities = subscribeToCommunities((remoteComms) => {
          if (remoteComms.length > 0 && isMounted) {
            setCommunities(remoteComms);
          }
        });
      }
    }

    init();

    return () => {
      isMounted = false;
      if (unsubUsers) unsubUsers();
      if (unsubEvents) unsubEvents();
      if (unsubCommunities) unsubCommunities();
    };
  }, []);

  // Listen to attendees and chat when an event is selected
  useEffect(() => {
    if (!selectedEventId || !isFirestoreLive) return;

    const unsubAttendees = subscribeToAttendees(selectedEventId, (list) => {
      if (list.length > 0) {
        setAttendeeMap((prev) => ({ ...prev, [selectedEventId]: list }));
      }
    });

    const unsubMessages = subscribeToMessages(selectedEventId, (msgs) => {
      if (msgs.length > 0) {
        setCurrentEventMessages(msgs);
      }
    });

    return () => {
      unsubAttendees();
      unsubMessages();
    };
  }, [selectedEventId, isFirestoreLive]);

  // Listen to 1-on-1 Direct Messages when a conversation is open
  useEffect(() => {
    if (!activeDirectChatUser || !isFirestoreLive) return;

    const convId = [currentUser.id, activeDirectChatUser.id].sort().join('_');
    const unsub = subscribeToDirectMessages(convId, (messages) => {
      if (messages.length > 0) {
        setDirectMessagesMap((prev) => ({ ...prev, [convId]: messages }));
      }
    });

    return () => {
      unsub();
    };
  }, [activeDirectChatUser, currentUser.id, isFirestoreLive]);

  // Persist Current User
  const updateCurrentUser = async (updates: Partial<UserProfile>) => {
    // Rule: Cannot update roll number once registered
    const { rollNumber: _, ...safeUpdates } = updates;

    const updated: UserProfile = {
      ...currentUser,
      ...safeUpdates,
      isSupervisor: checkIsSupervisor(safeUpdates.email || currentUser.email),
    };

    setCurrentUser(updated);
    localStorage.setItem('common_ground_user', JSON.stringify(updated));

    // Save directly to Firestore database
    try {
      await saveUserProfileToFirestore(updated);
    } catch (err) {
      console.warn('Failed to save profile updates to Firestore:', err);
    }

    // Optimistically update in allUsers list as well
    setAllUsers((users) => users.map((u) => (u.id === updated.id ? updated : u)));
  };

  // Sign out current session
  const signOut = () => {
    localStorage.removeItem('common_ground_user');
    setCurrentUser({
      ...CURRENT_USER,
      isSupervisor: checkIsSupervisor(CURRENT_USER.email),
    });
  };

  // Rule 2: Roll number is mandatory. Unique 6-digit roll number starting with 2.
  // Stores newly joined users directly in Cloud Firestore database.
  const registerOrSignIn = async (userData: {
    name: string;
    username: string;
    email: string;
    rollNumber: string;
    course: string;
    subCourse?: string;
    year: string;
    societies?: string[];
    preferences?: string[];
    crossCoursePreference?: 'cross_course' | 'my_course_only';
    avatarUrl?: string;
    useStandardAvatar?: boolean;
    bio?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const rawRoll = (userData.rollNumber || '').trim();

    // Check mandatory 6-digit roll number starting with 2
    if (!/^2\d{5}$/.test(rawRoll)) {
      return {
        success: false,
        error: 'Roll number must be a 6-digit number starting with 2 (e.g. 240102).',
      };
    }

    const cleanUsername = (userData.username || '')
      .trim()
      .replace(/^@/, '')
      .toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      return {
        success: false,
        error: 'Please choose a valid username with at least 3 characters.',
      };
    }

    const cleanEmail = userData.email.trim().toLowerCase();
    const isSup = checkIsSupervisor(cleanEmail);

    // Look for existing user with this roll number in loaded allUsers or Firestore
    let existingUser = allUsers.find((u) => u.rollNumber === rawRoll);
    if (!existingUser) {
      existingUser = (await getUserByRollNumberFromFirestore(rawRoll)) || undefined;
    }

    // Check if the current logged-in user is editing their own profile with the same roll
    const isEditingSelf = currentUser.rollNumber === rawRoll;

    if (existingUser && !isEditingSelf) {
      // If someone enters a roll number that is already registered on Common Ground:
      // Verify if the email matches the registered student email for this roll number
      const existingEmail = (existingUser.email || '').trim().toLowerCase();
      if (existingEmail && existingEmail !== cleanEmail) {
        return {
          success: false,
          error: `Roll number ${rawRoll} is already registered on Common Ground with another email address. Each student at Jesus and Mary College has a unique roll number. If this is your account, please enter your registered email to sign in.`,
        };
      }
    }

    // Target User ID: keep existing if user exists or updating self, otherwise assign unique student-ROLL
    const userId = existingUser
      ? existingUser.id
      : isEditingSelf
      ? currentUser.id
      : `student-${rawRoll}`;

    const profile: UserProfile = {
      ...(existingUser || {}),
      id: userId,
      name: userData.name.trim(),
      realName: userData.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      rollNumber: rawRoll,
      course: userData.course || existingUser?.course || 'BA(Hons.)',
      subCourse: (userData.subCourse !== undefined ? userData.subCourse : existingUser?.subCourse || '').trim(),
      year: userData.year || existingUser?.year || '1st Year',
      societies: userData.societies || existingUser?.societies || [],
      preferences: userData.preferences || existingUser?.preferences || ['Thevenet stairs', 'Canteen'],
      crossCoursePreference: userData.crossCoursePreference || existingUser?.crossCoursePreference || 'cross_course',
      bio: (userData.bio !== undefined ? userData.bio : existingUser?.bio || '').trim(),
      avatarUrl: userData.useStandardAvatar
        ? ''
        : userData.avatarUrl || existingUser?.avatarUrl || currentUser.avatarUrl || '',
      useStandardAvatar: userData.useStandardAvatar ?? existingUser?.useStandardAvatar ?? false,
      photos: userData.useStandardAvatar
        ? []
        : userData.avatarUrl
        ? [userData.avatarUrl]
        : existingUser?.photos || currentUser.photos || [],
      interests: existingUser?.interests || [],
      isVerified: true,
      verificationType: 'roll_number',
      verificationHash: existingUser?.verificationHash || `JMC-HASH:${rawRoll}-VERIFIED`,
      maskedIdNumber: `ROLL:${rawRoll}`,
      joinedAt: existingUser?.joinedAt || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isSupervisor: isSup,
    };

    // SAVE DIRECTLY TO FIRESTORE DATABASE
    try {
      await saveUserProfileToFirestore(profile);
    } catch (saveErr: any) {
      console.error('Failed to store newly joined user in Firestore database:', saveErr);
      return {
        success: false,
        error: `Could not save user to Firestore database: ${saveErr?.message || 'Database error'}. Please verify connection and try again.`,
      };
    }

    // Set current active user state & device session
    setCurrentUser(profile);
    localStorage.setItem('common_ground_user', JSON.stringify(profile));

    // Update in allUsers list (real-time listener will also automatically sync from Firestore)
    setAllUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== profile.id && u.rollNumber !== rawRoll);
      return [profile, ...filtered];
    });

    return { success: true };
  };

  // Rule 11 & 12: Communities management (Only supervisors can add communities)
  const addCommunity = (
    name: string,
    description: string,
    icon: string,
    coverImage: string,
    category: string
  ): boolean => {
    if (!isSupervisor) {
      alert('Only supervisors of Common Ground can add new communities.');
      return false;
    }

    const newComm: Community = {
      id: `comm-${Date.now()}`,
      name: name.trim(),
      category: category?.trim() || 'College Club',
      description: description.trim(),
      icon: icon || 'Sparkles',
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
      themeColor: 'from-red-700 to-rose-800',
      memberCount: 1,
      createdById: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    setCommunities((prev) => [newComm, ...prev]);
    saveCommunityToFirestore(newComm);
    return true;
  };

  const toggleJoinCommunity = (commId: string) => {
    setJoinedCommunityIds((prev) => {
      const next = new Set(prev);
      if (next.has(commId)) {
        next.delete(commId);
      } else {
        next.add(commId);
      }
      return next;
    });
  };

  // Rule 14: Events & Hosting
  const createEvent = (
    eventData: Omit<
      EventItem,
      'id' | 'createdAt' | 'attendeeCount' | 'creatorId' | 'creatorUsername' | 'creatorAvatar'
    >
  ) => {
    const newEvent: EventItem = {
      ...eventData,
      id: `evt-${Date.now()}`,
      creatorId: currentUser.id,
      creatorUsername: currentUser.username,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatarUrl,
      creatorUseStandardAvatar: currentUser.useStandardAvatar,
      creatorCourse: `${currentUser.course}${currentUser.subCourse ? ` (${currentUser.subCourse})` : ''}`,
      creatorYear: currentUser.year,
      creatorBio: currentUser.bio,
      attendeeCount: 1,
      createdAt: new Date().toISOString(),
      eventTimestamp: eventData.eventTimestamp || Date.now() + 24 * 3600000,
    };

    setEvents((prev) => [newEvent, ...prev]);
    saveEventToFirestore(newEvent);

    // Host automatically joined as confirmed attendee
    const creatorAttendee: EventAttendee = {
      userId: currentUser.id,
      username: currentUser.username,
      realName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      userUseStandardAvatar: currentUser.useStandardAvatar,
      userBio: currentUser.bio,
      userCourse: currentUser.course,
      userSubCourse: currentUser.subCourse,
      userYear: currentUser.year,
      userSocieties: currentUser.societies,
      userCrossCoursePreference: currentUser.crossCoursePreference,
      userPreferences: currentUser.preferences,
      status: 'confirmed',
      joinedAt: 'Just now',
    };

    setAttendeeMap((prev) => ({
      ...prev,
      [newEvent.id]: [creatorAttendee],
    }));
    setAttendeeInFirestore(newEvent.id, creatorAttendee);
  };

  // Rule 14: Host can cancel up till 3 hours before event takes place, writing an optional reason
  const cancelEvent = (
    eventId: string,
    reason?: string
  ): { success: boolean; error?: string } => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, error: 'Event not found.' };

    if (event.creatorId !== currentUser.id && !isSupervisor) {
      return { success: false, error: 'Only the host or a supervisor can cancel this event.' };
    }

    // 3-hour check rule
    if (event.eventTimestamp) {
      const hoursRemaining = (event.eventTimestamp - Date.now()) / (1000 * 60 * 60);
      if (hoursRemaining < 3 && hoursRemaining > -2) {
        return {
          success: false,
          error:
            'Events cannot be cancelled within 3 hours of the scheduled time. Please attend or post an update in the event chat.',
        };
      }
    }

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updated: EventItem = {
            ...e,
            status: 'cancelled',
            cancellationReason: reason?.trim() || 'Cancelled by host',
          };
          saveEventToFirestore(updated);
          return updated;
        }
        return e;
      })
    );

    return { success: true };
  };

  const removeEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    deleteEventFromFirestore(eventId);
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
    }
  };

  // Rule 14: Attendee controls & Host Acceptance/Rejection
  const currentEventAttendees = selectedEventId ? attendeeMap[selectedEventId] || [] : [];

  const isUserAttending = (eventId: string): boolean => {
    const list = attendeeMap[eventId] || [];
    return list.some((a) => a.userId === currentUser.id && a.status === 'confirmed');
  };

  const isUserInterested = (eventId: string): boolean => {
    const list = attendeeMap[eventId] || [];
    return list.some((a) => a.userId === currentUser.id && a.status === 'interested');
  };

  const canCancelEvent = (eventId: string): boolean => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return false;
    if (event.eventTimestamp) {
      const hoursRemaining = (event.eventTimestamp - Date.now()) / (1000 * 60 * 60);
      if (hoursRemaining < 3 && hoursRemaining > -2) {
        return false;
      }
    }
    return true;
  };

  const joinEvent = (eventId: string, asInterestedOnly: boolean = false) => {
    const targetEvent = events.find((e) => e.id === eventId);
    const isCreator = targetEvent?.creatorId === currentUser.id;

    // If student is joining, they become 'interested' (pending host approval) or 'confirmed' if host or direct
    const initialStatus = isCreator ? 'confirmed' : (asInterestedOnly ? 'interested' : 'confirmed');

    const attendee: EventAttendee = {
      userId: currentUser.id,
      username: currentUser.username,
      realName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      userUseStandardAvatar: currentUser.useStandardAvatar,
      userBio: currentUser.bio,
      userCourse: currentUser.course,
      userSubCourse: currentUser.subCourse,
      userYear: currentUser.year,
      userSocieties: currentUser.societies,
      userCrossCoursePreference: currentUser.crossCoursePreference,
      userPreferences: currentUser.preferences,
      status: initialStatus,
      joinedAt: 'Just now',
    };

    setAttendeeMap((prev) => {
      const existing = prev[eventId] || [];
      const filtered = existing.filter((a) => a.userId !== currentUser.id);
      return {
        ...prev,
        [eventId]: [...filtered, attendee],
      };
    });

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const newCount = e.attendeeCount + 1;
          const updated = { ...e, attendeeCount: newCount };
          saveEventToFirestore(updated);
          return updated;
        }
        return e;
      })
    );

    setAttendeeInFirestore(eventId, attendee);
  };

  const leaveEvent = (eventId: string) => {
    setAttendeeMap((prev) => {
      const existing = prev[eventId] || [];
      return {
        ...prev,
        [eventId]: existing.filter((a) => a.userId !== currentUser.id),
      };
    });

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const newCount = Math.max(1, e.attendeeCount - 1);
          const updated = { ...e, attendeeCount: newCount };
          saveEventToFirestore(updated);
          return updated;
        }
        return e;
      })
    );

    removeAttendeeFromFirestore(eventId, currentUser.id);
  };

  // Host accepts interested attendee
  const acceptAttendee = (eventId: string, targetUserId: string) => {
    setAttendeeMap((prev) => {
      const existing = prev[eventId] || [];
      const updated = existing.map((a) =>
        a.userId === targetUserId ? { ...a, status: 'confirmed' as const } : a
      );
      const target = updated.find((a) => a.userId === targetUserId);
      if (target) {
        setAttendeeInFirestore(eventId, target);
      }
      return {
        ...prev,
        [eventId]: updated,
      };
    });
  };

  // Host rejects interested attendee
  const rejectAttendee = (eventId: string, targetUserId: string) => {
    setAttendeeMap((prev) => {
      const existing = prev[eventId] || [];
      return {
        ...prev,
        [eventId]: existing.filter((a) => a.userId !== targetUserId),
      };
    });
    removeAttendeeFromFirestore(eventId, targetUserId);
  };

  // Host removes someone from the event
  const removeParticipantAsCreator = (eventId: string, targetUserId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event || event.creatorId !== currentUser.id) {
      alert('Only the host of this event can remove a participant.');
      return;
    }

    setAttendeeMap((prev) => {
      const existing = prev[eventId] || [];
      return {
        ...prev,
        [eventId]: existing.filter((a) => a.userId !== targetUserId),
      };
    });

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const newCount = Math.max(1, e.attendeeCount - 1);
          const updated = { ...e, attendeeCount: newCount };
          saveEventToFirestore(updated);
          return updated;
        }
        return e;
      })
    );

    removeAttendeeFromFirestore(eventId, targetUserId);
  };

  // Event Room Chat (for online sessions)
  const sendEventMessage = (eventId: string, text: string) => {
    const newMsg: EventChatMessage = {
      id: `msg-${Date.now()}`,
      eventId,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      senderAvatar: currentUser.avatarUrl,
      senderUseStandardAvatar: currentUser.useStandardAvatar,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setCurrentEventMessages((prev) => [...prev, newMsg]);
    sendMessageToFirestore(newMsg);
  };

  // Rule 16: Direct 1-on-1 Messages (NO CALLS)
  const getConversationId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  };

  const openDirectChatWithUser = (user: UserProfile) => {
    if (user.id === currentUser.id) return;
    setActiveDirectChatUser(user);
    setActiveTab('messages');
  };

  const closeDirectChat = () => {
    setActiveDirectChatUser(null);
  };

  const activeConvId = activeDirectChatUser
    ? getConversationId(currentUser.id, activeDirectChatUser.id)
    : '';

  const activeConversationMessages = activeConvId
    ? directMessagesMap[activeConvId] || []
    : [];

  const sendDirectMessage = (
    recipientId: string,
    recipientUsername: string,
    text: string,
    type: MessageType = 'text',
    attachment?: { url: string; name: string; size?: string; audioDuration?: number }
  ) => {
    const convId = getConversationId(currentUser.id, recipientId);

    const newMsg: DirectMessage = {
      id: `dm-${Date.now()}`,
      conversationId: convId,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      senderAvatar: currentUser.avatarUrl,
      senderUseStandardAvatar: currentUser.useStandardAvatar,
      recipientId,
      recipientUsername,
      text: text.trim(),
      type,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentSize: attachment?.size,
      audioDuration: attachment?.audioDuration,
      createdAt: new Date().toISOString(),
    };

    setDirectMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg],
    }));

    sendDirectMessageToFirestore(newMsg);
  };

  // Compute conversation thread previews
  const conversations: Conversation[] = useMemo(() => {
    const threads: Conversation[] = [];

    // For every entry in directMessagesMap involving currentUser
    Object.entries(directMessagesMap).forEach(([convId, msgs]) => {
      const parts = convId.split('_');
      if (!parts.includes(currentUser.id) || msgs.length === 0) return;

      const otherUserId = parts[0] === currentUser.id ? parts[1] : parts[0];
      const otherUser =
        allUsers.find((u) => u.id === otherUserId) ||
        SAMPLE_MEMBERS.find((u) => u.id === otherUserId);

      const lastMsg = msgs[msgs.length - 1];

      threads.push({
        id: convId,
        participants: parts,
        participantDetails: {
          [otherUserId]: {
            username: otherUser?.username || lastMsg.senderUsername,
            avatarUrl: otherUser?.avatarUrl || '',
            useStandardAvatar: otherUser?.useStandardAvatar,
            course: otherUser?.course,
            year: otherUser?.year,
          },
          [currentUser.id]: {
            username: currentUser.username,
            avatarUrl: currentUser.avatarUrl,
            useStandardAvatar: currentUser.useStandardAvatar,
            course: currentUser.course,
            year: currentUser.year,
          },
        },
        lastMessageText:
          lastMsg.type === 'voice'
            ? '🎤 Voice Message'
            : lastMsg.type === 'image'
            ? '📷 Photo'
            : lastMsg.type === 'document'
            ? `📄 ${lastMsg.attachmentName || 'Document'}`
            : lastMsg.text,
        lastMessageAt: lastMsg.createdAt,
        lastMessageType: lastMsg.type,
      });
    });

    return threads.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [directMessagesMap, currentUser.id, allUsers]);

  // Helper lookup functions
  const getCommunityById = (id: string) => communities.find((c) => c.id === id);
  const getUserById = (id: string) => allUsers.find((u) => u.id === id);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isSupervisor,
        updateCurrentUser,
        signOut,
        registerOrSignIn,
        activeTab,
        setActiveTab,
        selectedEventId,
        setSelectedEventId,
        selectedProfileUser,
        setSelectedProfileUser,
        isCreateEventOpen,
        setIsCreateEventOpen,
        isVerificationOpen,
        setIsVerificationOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,
        communities,
        selectedCommunity,
        setSelectedCommunity,
        joinedCommunityIds,
        toggleJoinCommunity,
        addCommunity,
        events,
        createEvent,
        cancelEvent,
        canCancelEvent,
        removeEvent,
        currentEventAttendees,
        isUserAttending,
        isUserInterested,
        isUserHandRaised: isUserInterested,
        joinEvent,
        leaveEvent,
        acceptAttendee,
        acceptParticipant: acceptAttendee,
        rejectAttendee,
        rejectParticipant: rejectAttendee,
        removeParticipantAsCreator,
        currentEventMessages,
        sendEventMessage,
        activeDirectChatUser,
        openDirectChatWithUser,
        openDirectChat: openDirectChatWithUser,
        closeDirectChat,
        conversations,
        activeConversationMessages,
        sendDirectMessage,
        allUsers,
        searchQuery,
        setSearchQuery,
        communitySearchQuery,
        setCommunitySearchQuery,
        selectedCommunityFilter,
        setSelectedCommunityFilter,
        formatFilter,
        setFormatFilter,
        audienceFilter,
        setAudienceFilter,
        getCommunityById,
        getUserById,
        isFirestoreLive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
