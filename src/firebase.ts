import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  Community,
  Conversation,
  DirectMessage,
  EventAttendee,
  EventChatMessage,
  EventItem,
  UserProfile,
} from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sanitize objects for Firestore by removing undefined values and ensuring clean structures
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return data;
}

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return !snap.empty || true;
    } catch {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firestore is running in offline mode. Falling back to local state sync.');
      }
      return false;
    }
  }
}

// Sign-in anonymously if needed for prototype access
export async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch {
      // Ignored for prototype fallback
    }
  }
}

// Firestore operations for Events
export function subscribeToEvents(
  onUpdate: (events: EventItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const eventsCol = collection(db, 'events');
  return onSnapshot(
    eventsCol,
    (snapshot) => {
      const list: EventItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as EventItem);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Real-time events listener warning:', error.message);
      if (onError) onError(error);
    }
  );
}

// Subscribe to Attendees for an Event
export function subscribeToAttendees(
  eventId: string,
  onUpdate: (attendees: EventAttendee[]) => void
): Unsubscribe {
  const attendeesCol = collection(db, 'events', eventId, 'attendees');
  return onSnapshot(
    attendeesCol,
    (snapshot) => {
      const list: EventAttendee[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data() } as EventAttendee);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Attendees subscription warning:', error.message);
    }
  );
}

// Subscribe to Chat Messages in an Event
export function subscribeToMessages(
  eventId: string,
  onUpdate: (messages: EventChatMessage[]) => void
): Unsubscribe {
  const messagesCol = collection(db, 'events', eventId, 'messages');
  return onSnapshot(
    messagesCol,
    (snapshot) => {
      const list: EventChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data() } as EventChatMessage);
      });
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn('Messages subscription warning:', error.message);
    }
  );
}

// Save or Update Event in Firestore
export async function saveEventToFirestore(event: EventItem): Promise<void> {
  try {
    const clean = sanitizeForFirestore(event);
    await setDoc(doc(db, 'events', event.id), clean, { merge: true });
  } catch (error) {
    console.warn('Firestore write fallback:', error);
  }
}

// Delete Event from Firestore
export async function deleteEventFromFirestore(eventId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    console.warn('Firestore deleteEvent fallback:', error);
  }
}

// Join / Update Attendee in Firestore
export async function setAttendeeInFirestore(
  eventId: string,
  attendee: EventAttendee
): Promise<void> {
  try {
    const clean = sanitizeForFirestore(attendee);
    await setDoc(doc(db, 'events', eventId, 'attendees', attendee.userId), clean);
  } catch (error) {
    console.warn('Firestore setAttendee fallback:', error);
  }
}

// Remove Attendee from Firestore
export async function removeAttendeeFromFirestore(
  eventId: string,
  userId: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'events', eventId, 'attendees', userId));
  } catch (error) {
    console.warn('Firestore removeAttendee fallback:', error);
  }
}

// Send Message in Event Chat
export async function sendMessageToFirestore(message: EventChatMessage): Promise<void> {
  try {
    const clean = sanitizeForFirestore(message);
    await setDoc(doc(db, 'events', message.eventId, 'messages', message.id), clean);
  } catch (error) {
    console.warn('Firestore sendMessage fallback:', error);
  }
}

// Save User Profile directly into Firestore database
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  if (!user || !user.id) {
    throw new Error('User profile missing required ID.');
  }
  const cleanUser = sanitizeForFirestore(user);
  await setDoc(doc(db, 'users', cleanUser.id), cleanUser, { merge: true });
}

// Fetch single user by user ID from Firestore
export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('Firestore getUserProfile error:', error);
    return null;
  }
}

// Fetch single user by roll number from Firestore
export async function getUserByRollNumberFromFirestore(
  rollNumber: string
): Promise<UserProfile | null> {
  try {
    const q = query(collection(db, 'users'), where('rollNumber', '==', rollNumber));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { ...docSnap.data(), id: docSnap.id } as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('Firestore getUserByRollNumber error:', error);
    return null;
  }
}

// Fetch all registered users to check roll number uniqueness across the platform
export async function fetchAllUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as UserProfile);
    });
    return list;
  } catch (error) {
    console.warn('Firestore fetchAllUsers fallback:', error);
    return [];
  }
}

// Real-time listener for all registered users across devices
export function subscribeToUsers(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as UserProfile);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Users subscription warning:', error.message);
      if (onError) onError(error);
    }
  );
}

// Check if a roll number already exists in Firestore
export async function checkRollNumberInFirestore(
  rollNumber: string,
  excludeUserId?: string
): Promise<boolean> {
  try {
    const q = query(collection(db, 'users'), where('rollNumber', '==', rollNumber));
    const snap = await getDocs(q);
    let isTaken = false;
    snap.forEach((d) => {
      if (!excludeUserId || d.id !== excludeUserId) {
        isTaken = true;
      }
    });
    return isTaken;
  } catch (error) {
    console.warn('Firestore checkRollNumber warning:', error);
    return false;
  }
}

// Seed initial college data if Firestore is currently empty
export async function seedInitialDataToFirestore(
  sampleUsers: UserProfile[],
  defaultCommunities: Community[],
  initialEvents: EventItem[]
): Promise<void> {
  try {
    const userSnap = await getDocs(collection(db, 'users'));
    if (userSnap.empty) {
      for (const u of sampleUsers) {
        const clean = sanitizeForFirestore(u);
        await setDoc(doc(db, 'users', clean.id), clean, { merge: true });
      }
    }

    const commSnap = await getDocs(collection(db, 'communities'));
    if (commSnap.empty) {
      for (const c of defaultCommunities) {
        const clean = sanitizeForFirestore(c);
        await setDoc(doc(db, 'communities', clean.id), clean, { merge: true });
      }
    }

    const eventSnap = await getDocs(collection(db, 'events'));
    if (eventSnap.empty) {
      for (const e of initialEvents) {
        const clean = sanitizeForFirestore(e);
        await setDoc(doc(db, 'events', clean.id), clean, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Seeding initial data warning:', err);
  }
}

// Save Community to Firestore (Supervisors only)
export async function saveCommunityToFirestore(comm: Community): Promise<void> {
  try {
    const clean = sanitizeForFirestore(comm);
    await setDoc(doc(db, 'communities', comm.id), clean, { merge: true });
  } catch (error) {
    console.warn('Firestore saveCommunity fallback:', error);
  }
}

// Subscribe to Communities in Firestore
export function subscribeToCommunities(
  onUpdate: (communities: Community[]) => void
): Unsubscribe {
  const commCol = collection(db, 'communities');
  return onSnapshot(
    commCol,
    (snapshot) => {
      const list: Community[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Community);
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Communities subscription warning:', error.message);
    }
  );
}

// Direct Messages (1-on-1 Chat)
export async function sendDirectMessageToFirestore(msg: DirectMessage): Promise<void> {
  try {
    const clean = sanitizeForFirestore(msg);
    // Save to conversation subcollection
    await setDoc(doc(db, 'conversations', msg.conversationId, 'messages', msg.id), clean);
  } catch (error) {
    console.warn('Firestore sendDirectMessage fallback:', error);
  }
}

export function subscribeToDirectMessages(
  conversationId: string,
  onUpdate: (messages: DirectMessage[]) => void
): Unsubscribe {
  const msgCol = collection(db, 'conversations', conversationId, 'messages');
  return onSnapshot(
    msgCol,
    (snapshot) => {
      const list: DirectMessage[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data() } as DirectMessage);
      });
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn('Direct message subscription warning:', error.message);
    }
  );
}
