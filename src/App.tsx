/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Smile,
  Activity,
  Wind,
  Target,
  Trophy,
  Lock,
  Calendar,
  Laugh,
  Mic,
  Camera,
  Moon,
  Volume2,
  Settings as SettingsIcon,
  ShieldCheck,
  Zap,
  Flame,
  AlertOctagon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

import { FullHEMOState, Mood, LiveStatus, Goal, Habit, Memory, VoiceNote, TwistOfDay, TimeCapsule, RelationshipMilestone, Meme, NightReflection, Profile, CompanionState, IHaveYouAction } from './types';
import { TwistResponse } from './components/TwistOfTheDay';
import { usePartnerState } from './hooks/usePartnerState';

// Subcomponents
import AuthPortal from './components/AuthPortal';
import PairingPortal from './components/PairingPortal';
import StatusFocus from './components/StatusFocus';
import MoodJournal from './components/MoodJournal';
import CalmMeDown from './components/CalmMeDown';
import GoalsHabits from './components/GoalsHabits';
import DreamBoard from './components/DreamBoard';
import TimeCapsules from './components/TimeCapsule';
import Relationship from './components/Relationship';
import MemeCorner from './components/MemeCorner';
import DailyCheckIns from './components/DailyCheckIns';
import VoiceNotes from './components/VoiceNotes';
import MemoryUpload from './components/MemoryUpload';
import TwistOfTheDay from './components/TwistOfTheDay';
import NightReflections from './components/NightReflection';
import NeedYou from './components/NeedYou';
import Settings from './components/Settings';
import WidgetDashboard from './components/WidgetDashboard';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('hemo_userId'));
  const [state, setState] = useState<FullHEMOState | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');

  // Heart trigger effect state
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Active Alert Overlay (Booster or Emergency)
  const [activeAlert, setActiveAlert] = useState<{ type: string; message: string } | null>(null);

  const partnerState = usePartnerState(state);

  // Fetch auth and state dynamically based on user session
  useEffect(() => {
    const storedUserId = localStorage.getItem('hemo_userId');
    if (!storedUserId) {
      setUserId(null);
      setUser(null);
      setLoading(false);
      return;
    }

    setUserId(storedUserId);

    // Get current authenticated user details
    fetch('/api/auth/me', {
      headers: { 'X-User-ID': storedUserId }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session invalid');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);

        // Fetch state only if they are paired in a group
        if (data.user.groupId) {
          return fetch('/api/state', {
            headers: { 'X-User-ID': storedUserId }
          })
            .then((res) => {
              if (!res.ok) throw new Error('State fetch failed');
              return res.json();
            })
            .then((stateData: FullHEMOState) => {
              setState(stateData);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        // Quietly reset session if expired/invalid
        localStorage.removeItem('hemo_userId');
        setUserId(null);
        setUser(null);
        setLoading(false);
      });
  }, [userId]);

  const saveStateField = async (key: keyof FullHEMOState, value: any) => {
    if (!state || !userId) return;
    
    // Optimistic local state update
    const updatedState = { ...state, [key]: value };
    setState(updatedState);

    try {
      const resp = await fetch('/api/state', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({ key, value }),
      });
      if (!resp.ok) throw new Error('Failed saving state field');
    } catch (err) {
      console.error('Error saving state field:', err);
    }
  };

  const handleAuthSuccess = (newUserId: string, userData: any) => {
    localStorage.setItem('hemo_userId', newUserId);
    setUserId(newUserId);
    setUser(userData);
  };

  const handlePairSuccess = (updatedUser: any) => {
    setUser(updatedUser);
    // Clear and set userId to trigger a fresh session reload
    setUserId(null);
    setTimeout(() => {
      setUserId(updatedUser.id);
    }, 20);
  };

  const handleLogout = () => {
    localStorage.removeItem('hemo_userId');
    setUserId(null);
    setUser(null);
    setState(null);
    setActiveTab('home');
  };

  // Programmatic sweet synthesizer chime (C5 -> E5 -> G5 -> C6 arpeggio)
  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.36); // C6
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch (e) {
      console.warn('Audio chime blocked or unsupported:', e);
    }
  };

  // Device vibration feedback
  const triggerVibration = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (e) {
        // ignore
      }
    }
  };

  // Display browser notification
  const showLocalNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (err) {
        console.warn('Browser push notification failed:', err);
      }
    }
  };

  // Trigger heart overlay simulation
  const handleTriggerComfortBurst = () => {
    setShowHeartBurst(true);
    setTimeout(() => {
      setShowHeartBurst(false);
    }, 4000);
  };

  // Real-time synchronization SSE EventSource & Fallback backup polling
  useEffect(() => {
    if (!userId || !user?.groupId) return;

    // Request desktop browser notification permissions on connect
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Connect to SSE live feed
    const eventSource = new EventSource(`/api/state/live?userId=${userId}`);

    const handleUpdateEvent = () => {
      fetch('/api/state', {
        headers: { 'X-User-ID': userId }
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((stateData: FullHEMOState) => {
          setState(stateData);
        })
        .catch((err) => {
          console.warn('Real-time sync refresh failed:', err);
        });
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected' || data.type === 'ping') {
          return;
        }

        if (data.type === 'update') {
          handleUpdateEvent();
        } else if (data.type === 'notification') {
          showLocalNotification(data.title, data.message);
          playChime();
          handleUpdateEvent();
        } else if (data.type === 'missyou') {
          showLocalNotification(data.title || 'Miss You ❤️', data.message);
          playChime();
          triggerVibration();
          handleUpdateEvent();
        } else if (data.type === 'quickreaction') {
          showLocalNotification(data.title || 'Love Reaction', data.message);
          playChime();
          triggerVibration();
          handleUpdateEvent();
        } else if (data.type === 'privatenote') {
          showLocalNotification(data.title || 'Private Note 📝', data.message);
          playChime();
          triggerVibration();
          handleUpdateEvent();
        } else if (data.type === 'hug') {
          handleTriggerComfortBurst();
          playChime();
          triggerVibration();
          setActiveAlert({ type: 'hug', message: data.message });
          showLocalNotification('🫂 Virtual Squeeze Hug!', data.message);
          handleUpdateEvent();
        } else if (data.type === 'emergency' || data.type === 'comfort') {
          playChime();
          triggerVibration();
          setActiveAlert({ type: 'emergency', message: data.message });
          showLocalNotification('🚨 Urgent Companion Signal!', data.message);
          handleUpdateEvent();
        }
      } catch (err) {
        console.error('SSE Live payload parse error:', err);
      }
    };

    eventSource.onerror = () => {
      console.warn('SSE disconnected, falling back to background poll...');
    };

    // Keep backup interval check (slower frequency for battery optimization since SSE is active)
    const pollInterval = setInterval(() => {
      handleUpdateEvent();
    }, 12000);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [userId, user?.groupId]);

  // Broadcast comfort and alert actions to partner
  const handleTriggerPartnerAction = async (type: 'hug' | 'comfort' | 'motivation' | 'call' | 'advice' | 'emergency', msg: string) => {
    if (!state || !userId) return;
    const newAction: IHaveYouAction = {
      id: `act_${Date.now()}`,
      senderId: 'user_a', // frontend perspective
      type,
      message: msg,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    await saveStateField('actions', [newAction, ...state.actions]);
  };

  // Trigger comfort response from Gemini
  const handleRequestComfort = async (moodType: string, noteText: string) => {
    if (!state || !userId) return "";
    try {
      const res = await fetch('/api/gemini/support', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          moodType,
          nickname: state.settings.userA.nickname,
          partnerName: state.settings.userB.nickname,
          context: noteText,
        }),
      });
      const data = await res.json();
      return data.message;
    } catch (e) {
      console.error(e);
      return "I'm right here holding your hand. Let's conquer this day step-by-step.";
    }
  };

  // Generate prompt for twist of the day
  const handleGenerateNewPrompt = async () => {
    if (!userId) return "What is a small detail about my workspace that brings you silent comfort?";
    try {
      const res = await fetch('/api/gemini/twist', {
        headers: { 'X-User-ID': userId }
      });
      const data = await res.json();
      return data.prompt;
    } catch (e) {
      return "What is a small detail about my workspace that brings you silent comfort?";
    }
  };

  const handleSendAlertSignal = (type: string, msg: string) => {
    setActiveAlert({ type, message: msg });
  };

  const handleWipeDatabase = async () => {
    if (!state || !userId) return;
    setLoading(true);
    try {
      // Clear all active user data by updating state fields to empty arrays
      const keysToWipe: (keyof FullHEMOState)[] = [
        'userAMoods', 'userBMoods', 'userACheckIns', 'userBCheckIns',
        'userAGoals', 'userBGoals', 'habitsA', 'habitsB',
        'memories', 'voiceNotes', 'twists', 'actions',
        'dreams', 'capsules', 'milestones', 'memes', 'reflections'
      ];
      
      for (const key of keysToWipe) {
        await saveStateField(key, []);
      }

      await saveStateField('userAStatus', {
        activity: 'free',
        customStatus: '',
        estimatedFinishTime: '',
        focusMode: false,
        silentNotifications: false,
        updatedAt: new Date().toISOString(),
      });
      await saveStateField('userBStatus', {
        activity: 'free',
        customStatus: '',
        estimatedFinishTime: '',
        focusMode: false,
        silentNotifications: false,
        updatedAt: new Date().toISOString(),
      });

      window.location.reload();
    } catch (err) {
      console.error('Failed to wipe data safely:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0915] flex flex-col justify-center items-center text-white" id="initial-loading">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/20">
            <Heart className="w-8 h-8 text-white fill-white/20 animate-bounce" />
          </div>
          <span className="text-xs uppercase tracking-widest text-pink-400 font-mono font-medium animate-pulse">Initializing HEMO Spaces...</span>
        </div>
      </div>
    );
  }

  // Phase 1: Not logged in
  if (!userId || !user) {
    return <AuthPortal onAuthSuccess={handleAuthSuccess} />;
  }

  // Phase 2: Logged in but not paired with partner
  if (!user.groupId) {
    return <PairingPortal user={user} onPairSuccess={handlePairSuccess} onLogout={handleLogout} />;
  }

  // Phase 3: Paired and state fully loaded
  if (!state) {
    return (
      <div className="min-h-screen bg-[#0A0915] flex flex-col justify-center items-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          <span className="text-xs font-mono text-gray-400">Loading companion sync...</span>
        </div>
      </div>
    );
  }

  const { settings, userAMoods, userBMoods, userAStatus, userBStatus, userACheckIns, userBCheckIns, userAGoals, habitsA, memories, voiceNotes, twists, dreams, capsules, milestones, memes, reflections } = state;

  // Compute stats
  const totalCompletedGoals = userAGoals.filter(g => g.completed).length;
  const activeFocusStatus = userAStatus.focusMode;

  // Helper to compile dynamic Partner-Only Activity Timeline (strictly viewable only by current user)
  const compilePartnerActivityTimeline = () => {
    const items: { type: string; title: string; detail: string; emoji: string; timestamp: string }[] = [];

    // 1. Partner Mood Updates
    if (Array.isArray(userBMoods)) {
      userBMoods.forEach((m) => {
        items.push({
          type: 'Mood Log',
          title: `Logged mood as ${m.type.replace('_', ' ')}`,
          detail: m.note || '',
          emoji: m.emoji || '😊',
          timestamp: m.timestamp
        });
      });
    }

    // 2. Partner Presence updates
    if (userBStatus && userBStatus.updatedAt) {
      items.push({
        type: 'Presence',
        title: `Presence is now ${userBStatus.activity || 'active'}`,
        detail: userBStatus.customStatus || 'Active',
        emoji: '✨',
        timestamp: userBStatus.updatedAt
      });
    }

    // 3. Partner Sent Hugs / Actions
    if (Array.isArray(state.actions)) {
      state.actions
        .filter((a) => a.senderId === 'user_b')
        .forEach((a) => {
          items.push({
            type: 'Action',
            title: 'Sent you a Hug 🫂',
            detail: a.message,
            emoji: '💖',
            timestamp: a.timestamp || new Date().toISOString()
          });
        });
    }

    // 4. Partner Completed Goals (userBGoals)
    if (Array.isArray(state.userBGoals)) {
      state.userBGoals
        .filter((g) => g.completed)
        .forEach((g) => {
          items.push({
            type: 'Goal Met',
            title: 'Completed a Goal',
            detail: g.text,
            emoji: '🎯',
            timestamp: g.timestamp || new Date().toISOString()
          });
        });
    }

    // Sort chronologically (latest first)
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0915] text-white flex flex-col md:flex-row relative overflow-hidden" id="hemo-root">
      
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-0 w-[60vw] h-[60vw] rounded-full bg-pink-500/5 animate-ambient-1 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 animate-ambient-2 blur-[120px] pointer-events-none" />

      {/* Floating Heartburst Overlay on hugging action */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-pink-500/10 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.2, rotate: -45 }}
              animate={{ scale: [1, 2.5, 2], rotate: [0, 15, -15, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="text-8xl filter drop-shadow-2xl"
            >
              🫂💖✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive alert banners */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="p-4 rounded-3xl bg-radial-gradient from-amber-950/90 to-black/95 border border-amber-500/30 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex gap-3 items-center">
                <AlertOctagon className="w-6 h-6 text-amber-400 animate-bounce" />
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">Companion Alert</span>
                  <p className="text-xs text-gray-200 leading-normal">{activeAlert.message}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white font-mono text-[9px] rounded-xl font-bold uppercase transition-all"
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT NAVIGATION: Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-black/40 border-r border-white/5 p-6 shrink-0 relative z-20 backdrop-blur-md">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/10">
              <Heart className="w-5 h-5 text-white fill-white/20" />
            </div>
            <span className="font-serif text-lg font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
              HEMO
            </span>
          </div>

          {/* Quick status bar */}
          <div className="p-3 bg-white/3 border border-white/5 rounded-2xl flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
              <span className="font-light text-gray-300">Heart Locked</span>
            </div>
            <span className="font-mono text-[10px] text-gray-500">v1.0.2</span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-1">
            {[
              { id: 'home', label: 'Dashboard', icon: Heart },
              { id: 'status', label: 'Live Presence', icon: Activity },
              { id: 'mood', label: 'Mood Journal', icon: Smile },
              { id: 'calm', label: 'Relax Sanctuary', icon: Wind },
              { id: 'goals', label: 'Goals & Habits', icon: Target },
              { id: 'dreams', label: 'Dream Board', icon: Trophy },
              { id: 'capsules', label: 'Time Capsule', icon: Lock },
              { id: 'relationship', label: 'Milestones', icon: Calendar },
              { id: 'memes', label: 'Meme Corner', icon: Laugh },
              { id: 'checkins', label: 'Life Streams', icon: Zap },
              { id: 'voice', label: 'Voice Memos', icon: Mic },
              { id: 'memories', label: 'Memory Vault', icon: Camera },
              { id: 'twist', label: 'Daily Twist', icon: Sparkles },
              { id: 'reflection', label: 'Night Thoughts', icon: Moon },
              { id: 'settings', label: 'Configurations', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold tracking-wide flex items-center gap-3 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white shadow-inner border-l-4 border-pink-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pink-400' : 'text-gray-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/5 text-[10px] text-gray-500 font-mono flex justify-between items-center">
          <span>{settings.userA.nickname} + {settings.userB.nickname}</span>
          <span className="text-pink-400">♥</span>
        </div>
      </aside>

      {/* MOBILE HEADER & NAVIGATION */}
      <header className="md:hidden flex justify-between items-center p-4 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white/10" />
          </div>
          <span className="font-serif text-md font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
            HEMO
          </span>
        </div>

        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-mono"
        >
          <option value="home">Dashboard</option>
          <option value="status">Live Presence</option>
          <option value="mood">Mood Journal</option>
          <option value="calm">Relax Sanctuary</option>
          <option value="goals">Goals & Habits</option>
          <option value="dreams">Dream Board</option>
          <option value="capsules">Time Capsule</option>
          <option value="relationship">Milestones</option>
          <option value="memes">Meme Corner</option>
          <option value="checkins">Life Streams</option>
          <option value="voice">Voice Memos</option>
          <option value="memories">Memory Vault</option>
          <option value="twist">Daily Twist</option>
          <option value="reflection">Night Thoughts</option>
          <option value="settings">Configurations</option>
        </select>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[100vh] relative z-10" id="main-content-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Tab Controller Switch */}
            {activeTab === 'home' && (
              <WidgetDashboard
                state={state}
                userId={userId!}
                saveStateField={saveStateField}
                playChime={playChime}
                triggerVibration={triggerVibration}
                showLocalNotification={showLocalNotification}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'status' && (
              <StatusFocus
                status={userAStatus}
                partnerName={settings.userB.nickname}
                onUpdate={(up) => saveStateField('userAStatus', up)}
              />
            )}

            {activeTab === 'mood' && (
              <MoodJournal
                moods={userAMoods}
                partnerMoods={userBMoods}
                partnerName={settings.userB.nickname}
                onAddMood={(m) => saveStateField('userAMoods', [m, ...userAMoods])}
                onRequestComfort={handleRequestComfort}
              />
            )}

            {activeTab === 'calm' && (
              <CalmMeDown
                partnerName={settings.settings?.userB?.nickname || settings.userB.nickname}
                memories={memories}
                onComfortTrigger={() => {
                  handleTriggerComfortBurst();
                  handleTriggerPartnerAction('hug', `${settings.userA.nickname} sent you an instant Virtual Hug! 🫂💖`);
                }}
              />
            )}

            {activeTab === 'goals' && (
              <GoalsHabits
                goals={userAGoals}
                habits={habitsA}
                onUpdateGoals={(updated) => saveStateField('userAGoals', updated)}
                onUpdateHabits={(updated) => saveStateField('habitsA', updated)}
                partnerName={settings.userB.nickname}
              />
            )}

            {activeTab === 'dreams' && (
              <DreamBoard
                dreams={dreams}
                onAddDream={(d) => saveStateField('dreams', [d, ...dreams])}
                onRemoveDream={(id) => saveStateField('dreams', dreams.filter(d => d.id !== id))}
                onToggleDream={(id) => {
                  const updated = dreams.map(d => d.id === id ? { ...d, completed: !d.completed } : d);
                  saveStateField('dreams', updated);
                }}
              />
            )}

            {activeTab === 'capsules' && (
              <TimeCapsules
                capsules={capsules}
                onAddCapsule={(c) => saveStateField('capsules', [c, ...capsules])}
                onUnlockCapsule={(id) => {
                  const updated = capsules.map(c => c.id === id ? { ...c, unlocked: true } : c);
                  saveStateField('capsules', updated);
                }}
                partnerName={settings.userB.nickname}
              />
            )}

            {activeTab === 'relationship' && (
              <Relationship
                milestones={milestones}
                startDate={settings.relationshipStartDate}
                onAddMilestone={(m) => saveStateField('milestones', [m, ...milestones])}
                onRemoveMilestone={(id) => saveStateField('milestones', milestones.filter(m => m.id !== id))}
              />
            )}

            {activeTab === 'memes' && (
              <MemeCorner
                memes={partnerState?.memes || memes}
                onAddMeme={(m) => saveStateField('memes', [m, ...(partnerState?.memes || memes)])}
                onReactMeme={(id) => {
                  const currentMemes = partnerState?.memes || memes;
                  const updated = currentMemes.map(m => m.id === id ? { ...m, laughCount: (m.laughCount || 0) + 1 } : m);
                  saveStateField('memes', updated);
                }}
                onRemoveMeme={(id) => saveStateField('memes', (partnerState?.memes || memes).filter(m => m.id !== id))}
                partnerName={settings.userB.nickname}
              />
            )}

            {activeTab === 'checkins' && (
              <DailyCheckIns
                checkIns={partnerState?.checkIns || []}
                onAddCheckIn={(text, emoji) => {
                  const newC = { type: 'custom' as any, label: text, emoji, timestamp: new Date().toISOString() };
                  saveStateField('userACheckIns', [newC, ...userACheckIns]);
                }}
                partnerName={settings.userB.nickname}
              />
            )}

            {activeTab === 'voice' && (
              <VoiceNotes
                voiceNotes={partnerState?.voiceNotes || voiceNotes}
                onAddVoiceNote={(v) => saveStateField('voiceNotes', [v, ...(partnerState?.voiceNotes || voiceNotes)])}
                onRemoveVoiceNote={(id) => saveStateField('voiceNotes', (partnerState?.voiceNotes || voiceNotes).filter(v => v.id !== id))}
                partnerName={settings.userB.nickname}
              />
            )}

            {activeTab === 'memories' && (
              <MemoryUpload
                memories={memories}
                onAddMemory={(m) => saveStateField('memories', [m, ...memories])}
                onRemoveMemory={(id) => saveStateField('memories', memories.filter(m => m.id !== id))}
                partnerName={settings.userB.nickname}
              />
            )}

            {activeTab === 'twist' && (
              <TwistOfTheDay
                currentPrompt="What is a sweet workspace habit you noticed in me that you secretly love?"
                responses={twists.map(t => ({
                  userId: t.userAResponse ? 'user_a' : 'user_b',
                  text: t.userAResponse || t.userBResponse || '',
                  timestamp: t.date,
                }))}
                onAddResponse={(text) => {
                  const newT: TwistOfDay = {
                    prompt: 'What is a sweet workspace habit you noticed in me that you secretly love?',
                    userAResponse: text,
                    date: new Date().toISOString().split('T')[0]
                  };
                  saveStateField('twists', [newT, ...twists]);
                }}
                onGenerateNewPrompt={handleGenerateNewPrompt}
                partnerName={settings.userB.nickname}
              />
            )}

            {activeTab === 'reflection' && (
              <NightReflections
                reflections={reflections}
                onAddReflection={(ref) => {
                  saveStateField('reflections', [ref, ...reflections]);
                }}
                partnerName={settings.userB.nickname}
              />
            )}

            {activeTab === 'settings' && (
              <Settings
                userA={settings.userA}
                userB={settings.userB}
                startDate={settings.relationshipStartDate}
                onUpdateProfiles={(a, b) => {
                  const updatedS = { ...settings, userA: a, userB: b };
                  saveStateField('settings', updatedS);
                }}
                onWipeDatabase={handleWipeDatabase}
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
