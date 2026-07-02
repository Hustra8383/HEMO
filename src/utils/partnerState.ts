/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FullHEMOState, Meme, VoiceNote, Mood, CheckInLog, LiveStatus, Profile } from '../types';

export interface AggregatedCheckIn {
  id: string;
  statusText: string;
  emoji: string;
  timestamp: string;
  userId: 'user_a' | 'user_b';
}

export interface AggregatedMood {
  type: string;
  emoji: string;
  note: string;
  timestamp: string;
  userId: 'user_a' | 'user_b';
}

export interface PartnerState {
  userA: Profile;
  userB: Profile;
  relationshipStartDate: string;
  
  userAStatus: LiveStatus;
  userBStatus: LiveStatus;
  
  memes: Meme[];
  voiceNotes: VoiceNote[];
  checkIns: AggregatedCheckIn[];
  moods: AggregatedMood[];
  
  goals: {
    userA: any[];
    userB: any[];
    combined: any[];
  };
  habits: {
    userA: any[];
    userB: any[];
  };
}

/**
 * Aggregates separate user A and user B state fields into a single, unified partnerState object.
 * Because the backend (mapStateForUser) transparently maps the logged-in user as 'user_a' and 
 * the partner as 'user_b', we can consistently rely on these identifiers on the client-side.
 */
export function getPartnerState(state: FullHEMOState | null): PartnerState | null {
  if (!state) return null;

  const {
    settings,
    userAMoods,
    userBMoods,
    userAStatus,
    userBStatus,
    userACheckIns,
    userBCheckIns,
    userAGoals,
    userBGoals,
    habitsA,
    habitsB,
    memes,
    voiceNotes,
  } = state;

  const checkIns: AggregatedCheckIn[] = [
    ...(userACheckIns || []).map((c) => ({
      id: c.timestamp,
      statusText: c.label,
      emoji: c.emoji || '📍',
      timestamp: c.timestamp,
      userId: 'user_a' as const,
    })),
    ...(userBCheckIns || []).map((c) => ({
      id: c.timestamp,
      statusText: c.label,
      emoji: c.emoji || '📍',
      timestamp: c.timestamp,
      userId: 'user_b' as const,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const moods: AggregatedMood[] = [
    ...(userAMoods || []).map((m) => ({ ...m, userId: 'user_a' as const })),
    ...(userBMoods || []).map((m) => ({ ...m, userId: 'user_b' as const })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    userA: settings.userA,
    userB: settings.userB,
    relationshipStartDate: settings.relationshipStartDate,
    userAStatus,
    userBStatus,
    memes: memes || [],
    voiceNotes: voiceNotes || [],
    checkIns,
    moods,
    goals: {
      userA: userAGoals || [],
      userB: userBGoals || [],
      combined: [
        ...(userAGoals || []).map((g) => ({ ...g, userId: 'user_a' as const })),
        ...(userBGoals || []).map((g) => ({ ...g, userId: 'user_b' as const })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    },
    habits: {
      userA: habitsA || [],
      userB: habitsB || [],
    },
  };
}
