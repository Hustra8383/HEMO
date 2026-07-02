/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { 
  FullHEMOState, 
  Mood, 
  LiveStatus, 
  Goal, 
  Habit, 
  Memory, 
  VoiceNote, 
  TwistOfDay, 
  IHaveYouAction, 
  DreamCard, 
  TimeCapsule, 
  RelationshipMilestone, 
  Meme, 
  NightReflection,
  Profile,
  CompanionState
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY || '';
const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

let ai: GoogleGenAI | null = null;
if (hasGeminiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// File Path for Local persistence
const DB_FILE = path.join(process.cwd(), 'hemo_db.json');

interface UserAccount {
  id: string;
  username: string;
  passwordHash: string; // Plain password stored safely in simple JSON file
  nickname: string;
  avatar: string;
  color: string;
  partnerId: string | null;
  groupId: string | null;
  inviteCode: string | null;
}

interface DBStructure {
  users: Record<string, UserAccount>;
  groups: Record<string, FullHEMOState>;
}

// Global DB state
let db: DBStructure = {
  users: {},
  groups: {}
};

const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      // Migrate older structure if it has settings but not users/groups
      if (parsed && parsed.users && parsed.groups) {
        db = parsed;
      } else {
        // Start fresh for authentication and pairing
        db = { users: {}, groups: {} };
        saveDB();
      }
    } else {
      db = { users: {}, groups: {} };
      saveDB();
    }
  } catch (err) {
    console.error('Failed reading DB file, starting fresh', err);
    db = { users: {}, groups: {} };
  }
};

const saveDB = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed writing DB file', err);
  }
};

// Initial load
loadDB();

// Active SSE clients map
const clients = new Map<string, any>(); // userId -> Express Response object

// Realtime notification helper
const notifyPartner = (groupId: string, senderId: string, payload: any) => {
  const group = db.groups[groupId];
  if (!group) return;
  const partnerId = group.settings.userA.id === senderId ? group.settings.userB.id : group.settings.userA.id;
  const partnerRes = clients.get(partnerId);
  if (partnerRes) {
    try {
      partnerRes.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      console.error('Failed writing to partner SSE:', err);
    }
  }
};

// Helper to create empty group state (No demo data loaded anywhere!)
const createEmptyGroupState = (userA: Profile, userB: Profile): FullHEMOState => {
  return {
    settings: {
      userA,
      userB,
      relationshipStartDate: new Date().toISOString().split('T')[0],
      relationshipGoals: [],
    },
    userAMoods: [],
    userBMoods: [],
    userAStatus: {
      activity: 'free',
      customStatus: '',
      estimatedFinishTime: '',
      focusMode: false,
      silentNotifications: false,
      updatedAt: new Date().toISOString(),
    },
    userBStatus: {
      activity: 'free',
      customStatus: '',
      estimatedFinishTime: '',
      focusMode: false,
      silentNotifications: false,
      updatedAt: new Date().toISOString(),
    },
    userACheckIns: [],
    userBCheckIns: [],
    userAGoals: [],
    userBGoals: [],
    habitsA: [],
    habitsB: [],
    memories: [],
    voiceNotes: [],
    twists: [],
    actions: [],
    dreams: [],
    capsules: [],
    milestones: [],
    memes: [],
    reflections: [],
    activityTimeline: [],
  };
};

// State mapping function (swaps perspectives transparently if the requesting user is User B)
const mapStateForUser = (groupState: FullHEMOState, userId: string): FullHEMOState => {
  // If requesting user is User A, return unmodified state
  if (groupState.settings.userA.id === userId) {
    // Keep internal user A as user_a for frontend and user B as user_b
    return {
      ...groupState,
      settings: {
        ...groupState.settings,
        userA: { ...groupState.settings.userA, id: 'user_a' },
        userB: { ...groupState.settings.userB, id: 'user_b' }
      },
      userAStatus: {
        ...groupState.userAStatus,
        online: clients.has(groupState.settings.userA.id)
      },
      userBStatus: {
        ...groupState.userBStatus,
        online: clients.has(groupState.settings.userB.id)
      },
      memories: groupState.memories.map(m => ({
        ...m,
        uploaderId: m.uploaderId === userId ? 'user_a' : 'user_b'
      })),
      voiceNotes: groupState.voiceNotes.map(v => ({
        ...v,
        uploaderId: v.uploaderId === userId ? 'user_a' : 'user_b'
      })),
      actions: groupState.actions.map(a => ({
        ...a,
        senderId: a.senderId === userId ? 'user_a' : 'user_b'
      })),
      capsules: groupState.capsules.map(c => ({
        ...c,
        creatorId: c.creatorId === userId ? 'user_a' : 'user_b'
      })),
      memes: groupState.memes.map(m => {
        const reactions: Record<string, string> = {};
        for (const [uid, emoji] of Object.entries(m.reactions || {})) {
          reactions[uid === userId ? 'user_a' : 'user_b'] = emoji;
        }
        return {
          ...m,
          uploaderId: m.uploaderId === userId ? 'user_a' : 'user_b',
          reactions
        };
      }),
      reflections: groupState.reflections.map(r => ({
        ...r,
        completedBy: r.completedBy === userId ? 'user_a' : 'user_b'
      })),
      activityTimeline: (groupState.activityTimeline || []).map(item => ({
        ...item,
        uploaderId: item.uploaderId === userId ? 'user_a' : 'user_b'
      }))
    };
  }

  // If requesting user is User B, we must swap perspectives so they see themselves as user_a
  const swapped: FullHEMOState = {
    settings: {
      userA: { ...groupState.settings.userB, id: 'user_a' },
      userB: { ...groupState.settings.userA, id: 'user_b' },
      relationshipStartDate: groupState.settings.relationshipStartDate,
      relationshipGoals: groupState.settings.relationshipGoals,
    },
    userAMoods: groupState.userBMoods,
    userBMoods: groupState.userAMoods,
    userAStatus: {
      ...groupState.userBStatus,
      online: clients.has(groupState.settings.userB.id)
    },
    userBStatus: {
      ...groupState.userAStatus,
      online: clients.has(groupState.settings.userA.id)
    },
    userACheckIns: groupState.userBCheckIns,
    userBCheckIns: groupState.userACheckIns,
    userAGoals: groupState.userBGoals,
    userBGoals: groupState.userAGoals,
    habitsA: groupState.habitsB,
    habitsB: groupState.habitsA,
    memories: groupState.memories.map(m => ({
      ...m,
      uploaderId: m.uploaderId === userId ? 'user_a' : 'user_b'
    })),
    voiceNotes: groupState.voiceNotes.map(v => ({
      ...v,
      uploaderId: v.uploaderId === userId ? 'user_a' : 'user_b'
    })),
    twists: groupState.twists.map(t => ({
      prompt: t.prompt,
      userAResponse: t.userBResponse,
      userBResponse: t.userAResponse,
      userAReaction: t.userBReaction,
      userBReaction: t.userAReaction,
      date: t.date
    })),
    actions: groupState.actions.map(a => ({
      ...a,
      senderId: a.senderId === userId ? 'user_a' : 'user_b'
    })),
    dreams: groupState.dreams,
    capsules: groupState.capsules.map(c => ({
      ...c,
      creatorId: c.creatorId === userId ? 'user_a' : 'user_b'
    })),
    milestones: groupState.milestones,
    memes: groupState.memes.map(m => {
      const reactions: Record<string, string> = {};
      for (const [uid, emoji] of Object.entries(m.reactions || {})) {
        reactions[uid === userId ? 'user_a' : 'user_b'] = emoji;
      }
      return {
        ...m,
        uploaderId: m.uploaderId === userId ? 'user_a' : 'user_b',
        reactions
      };
    }),
    reflections: groupState.reflections.map(r => ({
      ...r,
      completedBy: r.completedBy === userId ? 'user_a' : 'user_b'
    })),
    activityTimeline: (groupState.activityTimeline || []).map(item => ({
      ...item,
      uploaderId: item.uploaderId === userId ? 'user_a' : 'user_b'
    })),
  };
  return swapped;
};

// Authentication Middlewares/Helpers
const getAuthenticatedUser = (req: express.Request): UserAccount | null => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return null;
  return db.users[userId] || null;
};

// API ENDPOINTS

// 1. Register User
app.post('/api/auth/register', (req, res) => {
  const { username, password, nickname, avatar, color } = req.body;
  if (!username || !password || !nickname) {
    return res.status(400).json({ error: 'Missing required registration parameters' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const userExists = Object.values(db.users).some(u => u.username === cleanUsername);
  if (userExists) {
    return res.status(400).json({ error: 'Username already registered' });
  }

  const userId = 'u_' + Math.random().toString(36).substring(2, 9);
  const newUser: UserAccount = {
    id: userId,
    username: cleanUsername,
    passwordHash: password, // Simple plain password for a local preview file database
    nickname: nickname.trim(),
    avatar: avatar || 'lotus_zen',
    color: color || '#EC4899',
    partnerId: null,
    groupId: null,
    inviteCode: null
  };

  db.users[userId] = newUser;
  saveDB();

  res.json({ success: true, userId, user: newUser });
});

// 2. Login User
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const user = Object.values(db.users).find(u => u.username === cleanUsername && u.passwordHash === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({ success: true, userId: user.id, user });
});

// 3. Get Current User Status
app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  res.json({ success: true, user });
});

// 4. Generate Pairing Invite Code
app.post('/api/pair/generate', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (user.partnerId || user.groupId) {
    return res.status(400).json({ error: 'You are already paired' });
  }

  // Generate a random 6 character code like HM-3A9B
  const code = 'HM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  user.inviteCode = code;
  saveDB();

  res.json({ success: true, code });
});

// 5. Join via Partner Invite Code
app.post('/api/pair/join', (req, res) => {
  const userB = getAuthenticatedUser(req);
  if (!userB) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (userB.partnerId || userB.groupId) {
    return res.status(400).json({ error: 'You are already paired' });
  }

  const { inviteCode } = req.body;
  if (!inviteCode) {
    return res.status(400).json({ error: 'Invite code is required' });
  }

  let cleanCode = inviteCode.trim().replace(/\s+/g, '').toUpperCase();
  if (cleanCode && !cleanCode.startsWith('HM-') && cleanCode.length === 4) {
    cleanCode = 'HM-' + cleanCode;
  }

  const userA = Object.values(db.users).find(u => {
    if (!u.inviteCode) return false;
    const dbCode = u.inviteCode.trim().replace(/\s+/g, '').toUpperCase();
    return dbCode === cleanCode;
  });

  if (!userA) {
    return res.status(400).json({ error: 'Invalid invitation code or partner already paired' });
  }
  if (userA.id === userB.id) {
    return res.status(400).json({ error: 'You cannot connect with your own code!' });
  }

  // Create a new companion group database structure
  const groupId = 'g_' + Math.random().toString(36).substring(2, 9);

  // Mark both users as permanently paired
  userA.partnerId = userB.id;
  userA.groupId = groupId;
  userA.inviteCode = null; // Consume code

  userB.partnerId = userA.id;
  userB.groupId = groupId;
  userB.inviteCode = null;

  // Initialize group with zero preloaded/placeholder data
  db.groups[groupId] = createEmptyGroupState(
    { id: userA.id, nickname: userA.nickname, avatar: userA.avatar, color: userA.color },
    { id: userB.id, nickname: userB.nickname, avatar: userB.avatar, color: userB.color }
  );

  saveDB();

  res.json({ success: true, user: userB });
});

// 6. Fetch full companion state
app.get('/api/state', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!user.groupId) {
    return res.status(400).json({ error: 'No companion pair registered' });
  }

  const groupState = db.groups[user.groupId];
  if (!groupState) {
    return res.status(404).json({ error: 'Workspace state not found' });
  }

  // Map state to be transparently consumed (the requesting user is ALWAYS represented as userA)
  res.json(mapStateForUser(groupState, user.id));
});

// SSE Live Connection for real-time state synchronization
app.get('/api/state/live', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId || !db.users[userId]) {
    return res.status(401).send('Unauthorized');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.set(userId, res);

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Periodic ping to keep Cloud Run container connection alive (prevents idle timeout)
  const pingInterval = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
    } catch (err) {
      // Connection closed/unreachable
    }
  }, 25000);

  // Notify partner that user has joined (online status changed)
  const user = db.users[userId];
  if (user && user.groupId) {
    const group = db.groups[user.groupId];
    if (group) {
      const partnerId = group.settings.userA.id === userId ? group.settings.userB.id : group.settings.userA.id;
      const partnerRes = clients.get(partnerId);
      if (partnerRes) {
        try {
          partnerRes.write(`data: ${JSON.stringify({ type: 'update' })}\n\n`);
        } catch (e) {
          // ignore
        }
      }
    }
  }

  req.on('close', () => {
    clearInterval(pingInterval);
    clients.delete(userId);

    // Notify partner that user has left (offline status changed)
    if (user && user.groupId) {
      const group = db.groups[user.groupId];
      if (group) {
        const partnerId = group.settings.userA.id === userId ? group.settings.userB.id : group.settings.userA.id;
        const partnerRes = clients.get(partnerId);
        if (partnerRes) {
          try {
            partnerRes.write(`data: ${JSON.stringify({ type: 'update' })}\n\n`);
          } catch (e) {
            // ignore
          }
        }
      }
    }
  });
});

// 7. Update specific companion state fields
app.post('/api/state', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!user.groupId) {
    return res.status(400).json({ error: 'No companion pair registered' });
  }

  const groupState = db.groups[user.groupId];
  if (!groupState) {
    return res.status(404).json({ error: 'Workspace state not found' });
  }

  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Missing key parameter' });
    }

    const isA = groupState.settings.userA.id === user.id;

    // Symmetric reverse mapping from client-perspective keys ('user_a', 'user_b') to actual DB identifiers
    if (isA) {
      if (key === 'settings') {
        groupState.settings = value;
      } else if (key === 'userAMoods') {
        groupState.userAMoods = value;
      } else if (key === 'userBMoods') {
        groupState.userBMoods = value;
      } else if (key === 'userAStatus') {
        groupState.userAStatus = value;
      } else if (key === 'userBStatus') {
        groupState.userBStatus = value;
      } else if (key === 'userACheckIns') {
        groupState.userACheckIns = value;
      } else if (key === 'userBCheckIns') {
        groupState.userBCheckIns = value;
      } else if (key === 'userAGoals') {
        groupState.userAGoals = value;
      } else if (key === 'userBGoals') {
        groupState.userBGoals = value;
      } else if (key === 'habitsA') {
        groupState.habitsA = value;
      } else if (key === 'habitsB') {
        groupState.habitsB = value;
      } else if (key === 'memories') {
        groupState.memories = value.map((m: any) => ({
          ...m,
          uploaderId: m.uploaderId === 'user_a' ? groupState.settings.userA.id : groupState.settings.userB.id
        }));
      } else if (key === 'voiceNotes') {
        groupState.voiceNotes = value.map((v: any) => ({
          ...v,
          uploaderId: v.uploaderId === 'user_a' ? groupState.settings.userA.id : groupState.settings.userB.id
        }));
      } else if (key === 'twists') {
        groupState.twists = value;
      } else if (key === 'actions') {
        groupState.actions = value.map((a: any) => ({
          ...a,
          senderId: a.senderId === 'user_a' ? groupState.settings.userA.id : groupState.settings.userB.id
        }));
      } else if (key === 'dreams') {
        groupState.dreams = value;
      } else if (key === 'capsules') {
        groupState.capsules = value.map((c: any) => ({
          ...c,
          creatorId: c.creatorId === 'user_a' ? groupState.settings.userA.id : groupState.settings.userB.id
        }));
      } else if (key === 'milestones') {
        groupState.milestones = value;
      } else if (key === 'memes') {
        groupState.memes = value.map((m: any) => {
          const reactions: Record<string, string> = {};
          for (const [uid, emoji] of Object.entries(m.reactions || {})) {
            reactions[uid === 'user_a' ? groupState.settings.userA.id : groupState.settings.userB.id] = emoji as string;
          }
          return {
            ...m,
            uploaderId: m.uploaderId === 'user_a' ? groupState.settings.userA.id : groupState.settings.userB.id,
            reactions
          };
        });
      } else if (key === 'reflections') {
        groupState.reflections = value.map((r: any) => ({
          ...r,
          completedBy: r.completedBy === 'user_a' ? groupState.settings.userA.id : groupState.settings.userB.id
        }));
      } else if (key === 'activityTimeline') {
        groupState.activityTimeline = value.map((item: any) => ({
          ...item,
          uploaderId: item.uploaderId === 'user_a' ? groupState.settings.userA.id : groupState.settings.userB.id
        }));
      }
    } else {
      // For User B, swap perspective back
      if (key === 'settings') {
        groupState.settings = {
          userA: value.userB,
          userB: value.userA,
          relationshipStartDate: value.relationshipStartDate,
          relationshipGoals: value.relationshipGoals,
        };
      } else if (key === 'userAMoods') {
        groupState.userBMoods = value;
      } else if (key === 'userBMoods') {
        groupState.userAMoods = value;
      } else if (key === 'userAStatus') {
        groupState.userBStatus = value;
      } else if (key === 'userBStatus') {
        groupState.userAStatus = value;
      } else if (key === 'userACheckIns') {
        groupState.userBCheckIns = value;
      } else if (key === 'userBCheckIns') {
        groupState.userACheckIns = value;
      } else if (key === 'userAGoals') {
        groupState.userBGoals = value;
      } else if (key === 'userBGoals') {
        groupState.userAGoals = value;
      } else if (key === 'habitsA') {
        groupState.habitsB = value;
      } else if (key === 'habitsB') {
        groupState.habitsA = value;
      } else if (key === 'memories') {
        groupState.memories = value.map((m: any) => ({
          ...m,
          uploaderId: m.uploaderId === 'user_a' ? user.id : groupState.settings.userA.id
        }));
      } else if (key === 'voiceNotes') {
        groupState.voiceNotes = value.map((v: any) => ({
          ...v,
          uploaderId: v.uploaderId === 'user_a' ? user.id : groupState.settings.userA.id
        }));
      } else if (key === 'twists') {
        groupState.twists = value.map((t: any) => ({
          prompt: t.prompt,
          userAResponse: t.userBResponse,
          userBResponse: t.userAResponse,
          userAReaction: t.userBReaction,
          userBReaction: t.userAReaction,
          date: t.date
        }));
      } else if (key === 'actions') {
        groupState.actions = value.map((a: any) => ({
          ...a,
          senderId: a.senderId === 'user_a' ? user.id : groupState.settings.userA.id
        }));
      } else if (key === 'dreams') {
        groupState.dreams = value;
      } else if (key === 'capsules') {
        groupState.capsules = value.map((c: any) => ({
          ...c,
          creatorId: c.creatorId === 'user_a' ? user.id : groupState.settings.userA.id
        }));
      } else if (key === 'milestones') {
        groupState.milestones = value;
      } else if (key === 'memes') {
        groupState.memes = value.map((m: any) => {
          const reactions: Record<string, string> = {};
          for (const [uid, emoji] of Object.entries(m.reactions || {})) {
            reactions[uid === 'user_a' ? user.id : groupState.settings.userA.id] = emoji as string;
          }
          return {
            ...m,
            uploaderId: m.uploaderId === 'user_a' ? user.id : groupState.settings.userA.id,
            reactions
          };
        });
      } else if (key === 'reflections') {
        groupState.reflections = value.map((r: any) => ({
          ...r,
          completedBy: r.completedBy === 'user_a' ? user.id : groupState.settings.userA.id
        }));
      } else if (key === 'activityTimeline') {
        groupState.activityTimeline = value.map((item: any) => ({
          ...item,
          uploaderId: item.uploaderId === 'user_a' ? user.id : groupState.settings.userA.id
        }));
      }
    }

    saveDB();

    // Notify partner of state change
    notifyPartner(user.groupId, user.id, { type: 'update' });

    // Send instant events/notifications
    if (key === 'actions' && Array.isArray(value) && value.length > 0) {
      const latestAction = value[0];
      if (latestAction && !latestAction.acknowledged) {
        notifyPartner(user.groupId, user.id, {
          type: latestAction.type,
          message: latestAction.message,
          actionId: latestAction.id
        });
      }
    } else if (key === 'userAStatus' || key === 'userBStatus') {
      const statusVal = value;
      const nickname = user.nickname || 'Your partner';
      notifyPartner(user.groupId, user.id, {
        type: 'notification',
        title: 'Presence Update',
        message: `${nickname} is now ${statusVal.activity || 'active'}${statusVal.customStatus ? ` (${statusVal.customStatus})` : ''}`
      });
    } else if ((key === 'userAMoods' || key === 'userBMoods') && Array.isArray(value) && value.length > 0) {
      const latestMood = value[0];
      const nickname = user.nickname || 'Your partner';
      notifyPartner(user.groupId, user.id, {
        type: 'notification',
        title: 'Mood Update',
        message: `${nickname} is feeling ${latestMood.type.replace('_', ' ')} ${latestMood.emoji}`
      });
    }

    res.json({ success: true, updatedKey: key });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating state' });
  }
});

// 8. AI comfort / encouraging message from partner
app.post('/api/gemini/support', async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || !user.groupId) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const groupState = db.groups[user.groupId];
  if (!groupState) {
    return res.status(404).json({ error: 'Workspace state not found' });
  }

  try {
    const { moodType, context } = req.body;
    
    const isA = groupState.settings.userA.id === user.id;
    const userNickname = isA ? groupState.settings.userA.nickname : groupState.settings.userB.nickname;
    const partnerNickname = isA ? groupState.settings.userB.nickname : groupState.settings.userA.nickname;

    if (!hasGeminiKey || !ai) {
      // Elegant non-blocking fallback if no key
      const fallbackMsgs: Record<string, string> = {
        happy: `I'm so incredibly happy to see you shining today, my star! Your energy is infectious. Let's keep making dreams happen!`,
        calm: `Your peaceful mind is your greatest strength. Stay centered, you are doing absolutely amazing!`,
        sad: `I'm sending you the biggest, warmest virtual hug right now. Take all the time you need. I'm right here beside you.`,
        stressed: `Take a deep, slow breath. Your study/work goals are important, but you are my absolute priority. One tiny step at a time. We've got this.`,
        motivated: `Yes! That's the powerful focus I love! Crush those goals today, you are unstoppable!`,
        tired: `You've worked so hard. Please shut your laptop or put down the pen, rest your eyes, and drink some water. Your body deserves comfort.`,
        missing_you: `I miss you so much too. Close your eyes and feel my love surrounding you right now. Can't wait to hear your voice soon!`,
        loved: `You are my anchor, my peace, and my favorite study/coding buddy. You are deeply loved!`,
        grateful: `Gratefulness brings magic. I am so lucky to be building this beautiful future together with you.`
      };
      const text = fallbackMsgs[moodType] || `I'm right here. No matter what today brings, we will get through it together beautifully.`;
      return res.json({ message: text, isAI: false });
    }

    const prompt = `You are the private emotional voice of ${partnerNickname}, writing a sweet, deeply comforting, and premium encouraging note to your favorite person, ${userNickname}.
    They currently updated their mood to: "${moodType}" (${context || 'no extra notes'}).
    Write a 2-3 sentence personalized message. It should feel peaceful, luxurious, intimate, and highly motivational, like a high-end mindfulness greeting (similar to Headspace or Apple Health). 
    Do not use generic words. Speak specifically, supportively, and lovingly as ${partnerNickname}. Do not include quotes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const generatedText = response.text || '';
    res.json({ message: generatedText.trim(), isAI: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gemini error' });
  }
});

// 9. Generate daily creative prompt for "Twist of the Day"
app.get('/api/gemini/twist', async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || !user.groupId) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const groupState = db.groups[user.groupId];
  if (!groupState) {
    return res.status(404).json({ error: 'Workspace state not found' });
  }

  try {
    const isA = groupState.settings.userA.id === user.id;
    const nicknameA = isA ? groupState.settings.userA.nickname : groupState.settings.userB.nickname;
    const nicknameB = isA ? groupState.settings.userB.nickname : groupState.settings.userA.nickname;

    if (!hasGeminiKey || !ai) {
      const fallbackPrompts = [
        'What was the most unexpected thing that made you smile today?',
        'If we had a secret time-traveling portal in our workspace, where would we go tonight?',
        'What is a tiny coding or study habit you noticed in me that you secretly love?',
        'If we had to design a premium HEMO emblem, what three items would be on it?',
        'What is the sweetest distraction I ever caused while you were building dreams?',
      ];
      const randomPrompt = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
      return res.json({ prompt: randomPrompt, isAI: false });
    }

    const prompt = `Generate a single, deeply intriguing, or sweet personal prompt for a private couples journal called "Twist of the Day".
    The prompt should help them share an unexpected, nostalgic, or beautiful thought about their journey.
    They are: ${nicknameA} and ${nicknameB}.
    Keep it strictly 1 sentence. Make it elegant, premium, poetic but simple. Examples: "What is a tiny workspace habit you noticed in me that you secretly love?", "What was the most unexpected small victory today?".
    Output ONLY the prompt text, no headers or quotes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const promptText = response.text || '';
    res.json({ prompt: promptText.trim().replace(/^"|"$/g, ''), isAI: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gemini error' });
  }
});

// 10. AI Daily Reflection Sync (analyses daily tasks and check-ins)
app.post('/api/gemini/reflection', async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || !user.groupId) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const groupState = db.groups[user.groupId];
  if (!groupState) {
    return res.status(404).json({ error: 'Workspace state not found' });
  }

  try {
    const { checkInsA, checkInsB, goalsA, goalsB } = req.body;
    const isA = groupState.settings.userA.id === user.id;
    const nicknameA = isA ? groupState.settings.userA.nickname : groupState.settings.userB.nickname;
    const nicknameB = isA ? groupState.settings.userB.nickname : groupState.settings.userA.nickname;
    
    if (!hasGeminiKey || !ai) {
      return res.json({
        summary: `Today was a beautifully balanced step towards our dreams. We aligned our hearts while protecting our deep focus. ${nicknameA} tackled crucial sprints while ${nicknameB} fortified our shared goals. Step-by-step, we are rising together.`,
        isAI: false
      });
    }

    const prompt = `Analyze today's productivity log and check-ins for this power couple:
    ${nicknameA} logged: ${JSON.stringify(checkInsA)} and goals: ${JSON.stringify(goalsA)}.
    ${nicknameB} logged: ${JSON.stringify(checkInsB)} and goals: ${JSON.stringify(goalsB)}.
    
    Synthesize their achievements and emotional rhythm into a single premium 3-sentence evening synopsis.
    Use comforting, luxurious, and motivational language. Highlight the connection between productivity and mutual emotional trust.
    Do not use bullet points or code-like labels. Keep it highly organic and beautiful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const summaryText = response.text || '';
    res.json({ summary: summaryText.trim(), isAI: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gemini error' });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HEMO Server booting on http://localhost:${PORT}`);
  });
}

startServer();
