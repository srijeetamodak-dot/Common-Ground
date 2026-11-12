export const SUPERVISOR_EMAILS = [
  'srijeeta.modak@gmail.com',
  'avishigoel10@gmail.com',
  'mehrakhushi054@gmail.com',
  'jhanviarora1808@gmail.com',
  'k.riddhima134@gmail.com',
  'dishadisha8416@gmail.com',
];

export type CrossCoursePreference = 'cross_course' | 'my_course_only';

export interface UserProfile {
  id: string;
  username: string; // Displayed to other students on profile & app
  name: string; // Full name taken for registration (confidential, not shown to other students)
  realName?: string; // Explicit alias for confidential real name
  email: string; // Taken for registration (confidential, not shown to other students)
  rollNumber: string; // Mandatory 6-digit roll number starting with '2' (e.g. 241042)
  course: string; // One of BA(Hons.), BAP, B.Com(P), B.Com(Hons.), B.Voc, B.El.ed.
  subCourse?: string; // Open-ended Sub-Course / Specialisation
  year: string; // 1st Year, 2nd Year, 3rd Year, 4th Year
  societies: string[]; // Optional campus societies
  crossCoursePreference: CrossCoursePreference;
  preferences: string[]; // Campus vibes & preferences (Canteen, Amphitheatre, etc.)
  bio: string;
  avatarUrl: string;
  useStandardAvatar?: boolean; // Standard white circle no-photo option
  photos: string[];
  interests: string[];
  isVerified: boolean;
  verificationType: 'roll_number';
  verificationHash?: string;
  maskedIdNumber?: string;
  joinedAt: string;
  isSupervisor?: boolean;
}

export interface Community {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  themeColor: string;
  coverImage: string;
  memberCount?: number;
  createdById?: string;
  createdAt?: string;
}

export type EventFormat = 'online' | 'offline';
export type OnlineFormatType = 'video' | 'voice' | 'chat';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  communityId: string;
  communityName: string;
  format: EventFormat;
  onlineFormatType?: OnlineFormatType;
  locationName?: string; // Campus location (only for offline events)
  locationAddress?: string;
  locationMeetingPoint?: string;
  dateTime: string;
  eventTimestamp?: number; // Epoch timestamp for 3-hour cancellation rule
  durationMinutes: number;
  creatorId: string;
  creatorUsername: string; // Displayed instead of real name
  creatorName?: string; // Confidential
  creatorAvatar: string;
  creatorUseStandardAvatar?: boolean;
  creatorCourse?: string;
  creatorYear?: string;
  creatorBio?: string;
  targetAudience?: 'all_courses' | 'course_restricted';
  courseRestriction?: string;
  societyAffiliation?: string;
  attendeeCount: number;
  maxAttendees?: number | null; // null means 'No Limit'
  coverImage?: string;
  icebreaker?: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  cancellationReason?: string;
  tags: string[];
  createdAt: string;
}

export interface EventAttendee {
  userId: string;
  username: string; // Displayed publicly
  userName?: string; // Convenient alias
  realName?: string; // Kept private
  userAvatar: string;
  userUseStandardAvatar?: boolean;
  userBio?: string;
  userCourse?: string;
  userSubCourse?: string;
  userYear?: string;
  userRollNumber?: string;
  userSocieties?: string[];
  userCrossCoursePreference?: CrossCoursePreference;
  userPreferences?: string[];
  userInterests?: string[];
  status?: 'confirmed' | 'interested' | 'rejected' | 'joined' | 'raised_hand';
  joinedAt: string;
}

export interface EventChatMessage {
  id: string;
  eventId: string;
  senderId: string;
  senderUsername: string;
  senderName?: string; // Convenient alias
  senderAvatar: string;
  senderUseStandardAvatar?: boolean;
  text: string;
  createdAt: string;
}

export type MessageType = 'text' | 'voice' | 'image' | 'document';

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string;
  senderUseStandardAvatar?: boolean;
  recipientId: string;
  recipientUsername: string;
  text: string;
  type: MessageType;
  attachmentUrl?: string; // Base64 data or media URL
  attachmentName?: string;
  attachmentSize?: string;
  audioDuration?: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: Record<
    string,
    {
      username: string;
      avatarUrl: string;
      useStandardAvatar?: boolean;
      course?: string;
      year?: string;
    }
  >;
  lastMessageText: string;
  lastMessageAt: string;
  lastMessageType?: MessageType;
  unreadCount?: number;
}
