/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MoodType =
  | 'happy'
  | 'calm'
  | 'sad'
  | 'stressed'
  | 'motivated'
  | 'tired'
  | 'angry'
  | 'missing_you'
  | 'loved'
  | 'grateful'
  | 'excited'
  | 'sleepy'
  | 'lonely'
  | 'anxious'
  | 'moody'
  | 'overwhelmed'
  | 'custom';

export interface Mood {
  type: MoodType;
  emoji: string;
  note: string;
  timestamp: string;
}

export type ActivityType =
  | 'studying'
  | 'working'
  | 'eating'
  | 'sleeping'
  | 'relaxing'
  | 'travelling'
  | 'busy'
  | 'free';

export interface LiveStatus {
  activity: ActivityType;
  customStatus: string;
  estimatedFinishTime: string; // HH:MM or custom text
  focusMode: boolean;
  silentNotifications: boolean;
  updatedAt: string;
  feeling?: string;
  feelingEmoji?: string;
  feelingUpdatedAt?: string;
  online?: boolean;
}

export type CheckInType =
  | 'wake_up'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'water'
  | 'workout'
  | 'study_start'
  | 'study_end'
  | 'work_start'
  | 'work_end'
  | 'sleep';

export interface CheckInLog {
  type: CheckInType;
  label: string;
  timestamp: string;
  emoji?: string;
}

export interface Goal {
  id: string;
  text: string;
  scope: 'today' | 'weekly' | 'monthly';
  category: 'general' | 'study' | 'work' | 'dream';
  completed: boolean;
  timestamp: string;
  color?: string;
  icon?: string;
  reminderTime?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  streak: number;
  completedToday: boolean;
  history: string[]; // dates of completion (YYYY-MM-DD)
  color?: string;
  reminderTime?: string;
}

export interface ActivityTimelineItem {
  id: string;
  uploaderId: string;
  text: string;
  emoji: string;
  timestamp: string;
}

export interface Memory {
  id: string;
  url: string; // Base64 or standard asset url
  caption: string;
  album: 'all' | 'favorites' | 'trips' | 'daily' | 'achievements';
  isFavorite: boolean;
  timestamp: string;
  uploaderId: string;
}

export interface VoiceNote {
  id: string;
  transcript: string;
  duration: number; // in seconds
  timestamp: string;
  isFavorite: boolean;
  uploaderId: string;
  audioData?: string; // Base64 data URI of recorded voice note
}

export interface TwistOfDay {
  prompt: string;
  userAResponse?: string;
  userBResponse?: string;
  userAReaction?: string;
  userBReaction?: string;
  date: string; // YYYY-MM-DD
}

export interface IHaveYouAction {
  id: string;
  senderId: string;
  type: 'hug' | 'comfort' | 'motivation' | 'call' | 'advice' | 'emergency';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface DreamCard {
  id: string;
  title: string;
  type: 'countdown' | 'revenue' | 'milestone' | 'savings' | 'vision' | 'bucket';
  value: string; // current state (e.g. "95 days left", "$12K MRR", "Phase 1")
  targetValue?: string;
  targetDate?: string;
  progress?: number; // 0-100
  description: string;
  completed?: boolean; // toggle state for bucket list items
}

export interface TimeCapsule {
  id: string;
  title: string;
  message: string;
  unlockType: 'one_month' | 'after_jee' | 'chatgro_milestone' | 'hasmol_launch' | 'one_year' | 'custom';
  targetDate?: string; // Unlock date
  unlockTriggerText?: string; // Event based triggers
  unlocked: boolean;
  createdAt: string;
  creatorId: string;
}

export interface RelationshipMilestone {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: 'anniversary' | 'special_date' | 'milestone' | 'quote';
  image?: string;
}

export interface Meme {
  id: string;
  url: string;
  caption: string;
  uploaderId: string;
  laughCount: number;
  reactions: { [userId: string]: string }; // userId -> emoji reaction
  timestamp: string;
}

export interface NightReflection {
  date: string; // YYYY-MM-DD
  bestMoment: string;
  hardestMoment: string;
  gratefulFor: string;
  achievement: string;
  improvement: string;
  beforeSleepMessage: string;
  completedBy: string; // userId
}

export interface Profile {
  id: string;
  nickname: string;
  avatar: string; // Avatar template name or Base64
  color: string; // Primary accent hex/class
}

export interface CompanionState {
  userA: Profile;
  userB: Profile;
  relationshipStartDate: string;
  relationshipGoals: string[];
}

export interface FullHEMOState {
  settings: CompanionState;
  userAMoods: Mood[];
  userBMoods: Mood[];
  userAStatus: LiveStatus;
  userBStatus: LiveStatus;
  userACheckIns: CheckInLog[];
  userBCheckIns: CheckInLog[];
  userAGoals: Goal[];
  userBGoals: Goal[];
  habitsA: Habit[];
  habitsB: Habit[];
  memories: Memory[];
  voiceNotes: VoiceNote[];
  twists: TwistOfDay[];
  actions: IHaveYouAction[];
  dreams: DreamCard[];
  capsules: TimeCapsule[];
  milestones: RelationshipMilestone[];
  memes: Meme[];
  reflections: NightReflection[];
  activityTimeline?: ActivityTimelineItem[];
}
