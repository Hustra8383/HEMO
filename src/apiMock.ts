/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FullHEMOState, Profile } from './types';

interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  avatar: string;
  color: string;
  partnerId: string | null;
  groupId: string | null;
  inviteCode: string | null;
}

// Helper to create empty group state (No demo data loaded!)
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
  };
};

// Perspective transformation on mock database (identical to the server-side implementation)
const mapStateForUser = (groupState: FullHEMOState, userId: string): FullHEMOState => {
  if (groupState.settings.userA.id === userId) {
    return {
      ...groupState,
      settings: {
        ...groupState.settings,
        userA: { ...groupState.settings.userA, id: 'user_a' },
        userB: { ...groupState.settings.userB, id: 'user_b' }
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
      }))
    };
  }

  const swapped: FullHEMOState = {
    settings: {
      userA: { ...groupState.settings.userB, id: 'user_a' },
      userB: { ...groupState.settings.userA, id: 'user_b' },
      relationshipStartDate: groupState.settings.relationshipStartDate,
      relationshipGoals: groupState.settings.relationshipGoals,
    },
    userAMoods: groupState.userBMoods,
    userBMoods: groupState.userAMoods,
    userAStatus: groupState.userBStatus,
    userBStatus: groupState.userAStatus,
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
  };
  return swapped;
};

// Client local storage database utility
const getLocalData = () => {
  const users = localStorage.getItem('hemo_mock_users');
  const groups = localStorage.getItem('hemo_mock_groups');
  return {
    users: users ? JSON.parse(users) : {} as Record<string, any>,
    groups: groups ? JSON.parse(groups) : {} as Record<string, any>
  };
};

const saveLocalData = (users: Record<string, any>, groups: Record<string, any>) => {
  localStorage.setItem('hemo_mock_users', JSON.stringify(users));
  localStorage.setItem('hemo_mock_groups', JSON.stringify(groups));
};

const getBodyString = (body: any): string => {
  if (!body) return '{}';
  if (typeof body === 'string') return body;
  return '{}';
};

const handleMockAPI = async (url: string, init?: RequestInit): Promise<Response> => {
  const method = init?.method?.toUpperCase() || 'GET';
  const headers = (init?.headers || {}) as Record<string, string>;
  const userIdHeader = headers['X-User-ID'] || headers['x-user-id'] || '';

  const { users, groups } = getLocalData();

  // Route: /api/auth/register
  if (url.includes('/api/auth/register') && method === 'POST') {
    const body = JSON.parse(getBodyString(init?.body));
    const { username, password, nickname, avatar, color } = body;
    if (!username || !password || !nickname) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }
    const cleanUsername = username.trim().toLowerCase();
    const userExists = Object.values(users).some((u: any) => u.username === cleanUsername);
    if (userExists) {
      return new Response(JSON.stringify({ error: 'Username already registered' }), { status: 400 });
    }

    const userId = 'u_mock_' + Math.random().toString(36).substring(2, 9);
    const newUser: UserAccount = {
      id: userId,
      username: cleanUsername,
      passwordHash: password,
      nickname: nickname.trim(),
      avatar: avatar || 'lotus_zen',
      color: color || '#EC4899',
      partnerId: null,
      groupId: null,
      inviteCode: null
    };

    users[userId] = newUser;
    saveLocalData(users, groups);

    return new Response(JSON.stringify({ success: true, userId, user: newUser }));
  }

  // Route: /api/auth/login
  if (url.includes('/api/auth/login') && method === 'POST') {
    const body = JSON.parse(getBodyString(init?.body));
    const { username, password } = body;
    const cleanUsername = (username || '').trim().toLowerCase();
    const user = Object.values(users).find((u: any) => u.username === cleanUsername && u.passwordHash === password) as any;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), { status: 401 });
    }
    return new Response(JSON.stringify({ success: true, userId: user.id, user }));
  }

  // Route: /api/auth/me
  if (url.includes('/api/auth/me') && method === 'GET') {
    const user = users[userIdHeader];
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized access' }), { status: 401 });
    }
    return new Response(JSON.stringify({ success: true, user }));
  }

  // Route: /api/pair/generate
  if (url.includes('/api/pair/generate') && method === 'POST') {
    const user = users[userIdHeader];
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const code = 'HM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    user.inviteCode = code;
    saveLocalData(users, groups);
    return new Response(JSON.stringify({ success: true, code }));
  }

  // Route: /api/pair/join
  if (url.includes('/api/pair/join') && method === 'POST') {
    const userB = users[userIdHeader];
    if (!userB) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const body = JSON.parse(getBodyString(init?.body));
    const cleanCode = (body.inviteCode || '').trim().toUpperCase();
    const userA = Object.values(users).find((u: any) => u.inviteCode === cleanCode) as any;

    if (!userA) {
      return new Response(JSON.stringify({ error: 'Invalid invitation code or partner already paired' }), { status: 400 });
    }
    if (userA.id === userB.id) {
      return new Response(JSON.stringify({ error: 'You cannot connect with your own code!' }), { status: 400 });
    }

    const groupId = 'g_mock_' + Math.random().toString(36).substring(2, 9);
    userA.partnerId = userB.id;
    userA.groupId = groupId;
    userA.inviteCode = null;

    userB.partnerId = userA.id;
    userB.groupId = groupId;
    userB.inviteCode = null;

    groups[groupId] = createEmptyGroupState(
      { id: userA.id, nickname: userA.nickname, avatar: userA.avatar, color: userA.color },
      { id: userB.id, nickname: userB.nickname, avatar: userB.avatar, color: userB.color }
    );

    saveLocalData(users, groups);
    return new Response(JSON.stringify({ success: true, user: userB }));
  }

  // Route: /api/state (GET)
  if (url.includes('/api/state') && method === 'GET') {
    const user = users[userIdHeader];
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    if (!user.groupId) {
      return new Response(JSON.stringify({ error: 'No partner registered' }), { status: 400 });
    }
    const groupState = groups[user.groupId];
    if (!groupState) {
      return new Response(JSON.stringify({ error: 'State not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(mapStateForUser(groupState, user.id)));
  }

  // Route: /api/state (POST)
  if (url.includes('/api/state') && method === 'POST') {
    const user = users[userIdHeader];
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    if (!user.groupId) {
      return new Response(JSON.stringify({ error: 'No partner registered' }), { status: 400 });
    }
    const groupState = groups[user.groupId];
    if (!groupState) {
      return new Response(JSON.stringify({ error: 'State not found' }), { status: 404 });
    }

    const body = JSON.parse(getBodyString(init?.body));
    const { key, value } = body;
    const isA = groupState.settings.userA.id === user.id;

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
      }
    } else {
      // Swapped configuration for User B
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
      }
    }

    saveLocalData(users, groups);
    return new Response(JSON.stringify({ success: true, updatedKey: key }));
  }

  // Route: /api/gemini/support
  if (url.includes('/api/gemini/support') && method === 'POST') {
    const body = JSON.parse(getBodyString(init?.body));
    const { moodType } = body;
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
    return new Response(JSON.stringify({ message: text, isAI: false }));
  }

  // Route: /api/gemini/twist
  if (url.includes('/api/gemini/twist') && method === 'GET') {
    const fallbackPrompts = [
      'What was the most unexpected thing that made you smile today?',
      'If we had a secret time-traveling portal in our workspace, where would we go tonight?',
      'What is a tiny coding or study habit you noticed in me that you secretly love?',
      'If we had to design a premium HEMO emblem, what three items would be on it?',
      'What is the sweetest distraction I ever caused while you were building dreams?',
    ];
    const randomPrompt = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
    return new Response(JSON.stringify({ prompt: randomPrompt, isAI: false }));
  }

  // Route: /api/gemini/reflection
  if (url.includes('/api/gemini/reflection') && method === 'POST') {
    return new Response(JSON.stringify({
      summary: `Today was a beautifully balanced step towards our dreams. We aligned our hearts while protecting our deep focus. Step-by-step, we are rising together.`,
      isAI: false
    }));
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404 });
};

export const initApiMock = () => {
  const originalFetch = window.fetch;

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Only intercept requests destined to /api/*
    if (!url.includes('/api/')) {
      return originalFetch.apply(this, arguments as any);
    }

    const isStaticMode = localStorage.getItem('hemo_static_mode') === 'true';

    if (isStaticMode) {
      try {
        return await handleMockAPI(url, init);
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Mock Error' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    try {
      const response = await originalFetch.apply(this, arguments as any);
      const contentType = response.headers.get('content-type') || '';

      // If the response is HTML (starts with <!doctype or content type has text/html),
      // it means we are in static host redirection territory (e.g. Netlify 404 falling back to index.html)
      if (contentType.includes('text/html') || response.status === 404) {
        console.warn('Backend API returned HTML/404. Falling back to client-only offline-safe mock database.');
        localStorage.setItem('hemo_static_mode', 'true');
        return await handleMockAPI(url, init);
      }

      return response;
    } catch (err) {
      console.warn('Network error fetching backend. Falling back to client-only offline-safe mock database.', err);
      localStorage.setItem('hemo_static_mode', 'true');
      try {
        return await handleMockAPI(url, init);
      } catch (mockErr: any) {
        return new Response(JSON.stringify({ error: mockErr.message || 'Mock Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  };
};
