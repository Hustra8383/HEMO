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

  // Trigger heart overlay simulation
  const handleTriggerComfortBurst = () => {
    setShowHeartBurst(true);
    setTimeout(() => {
      setShowHeartBurst(false);
    }, 4000);
  };

  // Poll server for state synchronization and new partner alerts
  useEffect(() => {
    if (!userId || !user?.groupId) return;

    const pollInterval = setInterval(() => {
      fetch('/api/state', {
        headers: { 'X-User-ID': userId }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Poll failed');
          return res.json();
        })
        .then((stateData: FullHEMOState) => {
          if (state && stateData.actions.length > state.actions.length) {
            // Check for new partner actions (perspective: user_b is partner)
            const newPartnerActions = stateData.actions.filter(
              newAct => newAct.senderId === 'user_b' && !state.actions.some(oldAct => oldAct.id === newAct.id)
            );
            if (newPartnerActions.length > 0) {
              const latestAction = newPartnerActions[0];
              if (latestAction.type === 'hug') {
                handleTriggerComfortBurst();
                setActiveAlert({ type: 'hug', message: latestAction.message });
              } else if (latestAction.type === 'emergency' || latestAction.type === 'comfort') {
                setActiveAlert({ type: 'emergency', message: latestAction.message });
              }
            }
          }
          setState(stateData);
        })
        .catch((err) => {
          console.warn('Real-time sync poll failed:', err);
        });
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [userId, user?.groupId, state?.actions]);

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

  const partnerState = usePartnerState(state);
  const { settings, userAMoods, userBMoods, userAStatus, userBStatus, userACheckIns, userBCheckIns, userAGoals, habitsA, memories, voiceNotes, twists, dreams, capsules, milestones, memes, reflections } = state;

  // Compute stats
  const totalCompletedGoals = userAGoals.filter(g => g.completed).length;
  const activeFocusStatus = userAStatus.focusMode;

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
              <div className="space-y-6" id="home-view">
                
                {/* Greeting Header block */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="font-serif text-3xl font-bold tracking-tight mb-1 text-gray-100">
                      Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">{settings.userA.nickname}</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-light font-mono uppercase tracking-wider">
                      Private Companion Sanctuary • Secured Alignment
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('status')}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide border transition-all flex items-center gap-1.5 ${
                        activeFocusStatus
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${activeFocusStatus ? 'bg-purple-400 animate-ping' : 'bg-emerald-500'}`} />
                      {activeFocusStatus ? 'Focus Sprint Active' : 'Normal State'}
                    </button>

                    <button
                      onClick={() => setActiveTab('calm')}
                      className="py-2 px-4 rounded-xl text-xs font-semibold tracking-wide bg-gradient-to-r from-pink-500 to-indigo-600 hover:shadow-lg transition-all text-white flex items-center gap-1.5"
                    >
                      <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                      Breathing room
                    </button>
                  </div>
                </div>

                {/* Main Dashboard Widget Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Widget 1: How is my person today? (Accent custom color based!) */}
                  <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-indigo-500/10 min-h-[220px]">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                      <Heart className="w-24 h-24 text-indigo-400 fill-indigo-400" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Partner Status</span>
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-3xl relative">
                          🌸
                        </div>
                        <div>
                          <h4 className="text-lg font-serif font-bold text-gray-200">{settings.userB.nickname}</h4>
                          <span className="text-xs text-indigo-300 font-light font-serif italic">"Feeling {userBMoods[0]?.type || 'peaceful'}"</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 font-light font-mono bg-white/2 p-2.5 rounded-xl border border-white/5">
                        Current Presence: <b className="text-white">{userBStatus.customStatus || 'Hustling hard!'}</b>
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-[10px] text-gray-500 font-mono">
                      <span>Est. finish: <b>{userBStatus.estimatedFinishTime || '22:00'}</b></span>
                      <span>Muted: {userBStatus.silentNotifications ? 'Yes 🔕' : 'No 🔔'}</span>
                    </div>
                  </div>

                  {/* Widget 2: Streak & Quick Stats */}
                  <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-pink-500/10 min-h-[220px]">
                    <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-pink-500/5 rounded-full" />

                    <div className="space-y-3">
                      <span className="text-xs font-mono uppercase tracking-widest text-pink-400 font-bold">Streaks & Progress</span>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-pink-500/10 rounded-2xl">
                          <Flame className="w-6 h-6 text-pink-500 animate-bounce" />
                        </div>
                        <div>
                          <span className="text-3xl font-mono font-bold tracking-tight">
                            {(() => {
                              const start = settings.relationshipStartDate || new Date().toISOString().split('T')[0];
                              const diffDays = Math.max(1, Math.floor(Math.abs(Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
                              return `${diffDays} days`;
                            })()}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-mono uppercase">Consecutive Aligned Connection</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] text-gray-400">
                        <span>Daily Goals complete:</span>
                        <span className="font-mono text-white font-bold">{totalCompletedGoals} / {userAGoals.length}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full rounded-full" style={{ width: `${userAGoals.length > 0 ? (totalCompletedGoals / userAGoals.length) * 100 : 50}%` }} />
                      </div>
                    </div>

                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block text-center mt-2">
                      Continuous progress fuels big ambitions
                    </span>
                  </div>

                  {/* Widget 3: Live countdown or Target exam clock */}
                  <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[220px] relative overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Countdown Clock</span>
                        <Calendar className="w-4 h-4 text-indigo-400" />
                      </div>

                      {dreams.filter(d => d.type === 'countdown').length > 0 ? (
                        (() => {
                          const countdownCard = dreams.filter(d => d.type === 'countdown')[0];
                          return (
                            <>
                              <div>
                                <h4 className="text-md font-serif font-semibold text-gray-100">{countdownCard.title}</h4>
                                <p className="text-xs text-gray-400 font-light mt-1">{countdownCard.description}</p>
                              </div>
                              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex justify-between items-center text-xs">
                                <span className="text-indigo-300 font-mono font-bold">{countdownCard.value}</span>
                                <span className="text-[10px] text-gray-500 font-mono uppercase">Target Goal</span>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <>
                          <div>
                            <h4 className="text-md font-serif font-semibold text-gray-100">No Countdown Active</h4>
                            <p className="text-xs text-gray-400 font-light mt-1">Pin a countdown card to your Dream Board to display real-time connection targets here.</p>
                          </div>
                          <button
                            onClick={() => setActiveTab('dreams')}
                            className="p-3 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-2xl text-center text-xs font-semibold text-indigo-300 transition-all cursor-pointer"
                          >
                            Add Countdown Card ➔
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Row 2: Anchor memory block preview and Quick Connection Signals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Visual memory slider */}
                  <div className="glass-panel p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-serif font-bold text-gray-200">Latest Anchored Memory</h4>
                      <button onClick={() => setActiveTab('memories')} className="text-xs text-pink-400 hover:underline">Vault</button>
                    </div>

                    {memories.length > 0 ? (
                      <div className="relative rounded-2xl overflow-hidden h-44 group">
                        <img
                          src={memories[0].url}
                          alt="Anchored memory preview"
                          className="w-full h-full object-cover filter brightness-[0.7] group-hover:scale-102 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent p-4 flex flex-col justify-end">
                          <p className="text-sm text-gray-200 font-serif font-light">"{memories[0].caption}"</p>
                          <span className="text-[10px] font-mono text-gray-500 mt-1 uppercase">
                            {new Date(memories[0].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic py-6">No visual memories saved yet.</p>
                    )}
                  </div>

                  {/* Direct Need You panel action shortcuts */}
                  <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-gray-200">Private Companion Actions</h4>
                      <p className="text-xs text-gray-400 font-light mt-1">Instantly squeeze a private virtual hug or signal for urgent advice.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => {
                          handleTriggerComfortBurst();
                          handleTriggerPartnerAction('hug', `${settings.userA.nickname} sent you an instant Virtual Hug! 🫂💖`);
                        }}
                        className="py-3 px-4 bg-pink-500/20 hover:bg-pink-500/35 border border-pink-500/30 text-pink-200 rounded-2xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        Squeeze Hug 🫂
                      </button>

                      <button
                        onClick={() => setActiveTab('capsules')}
                        className="py-3 px-4 bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-500/30 text-indigo-200 rounded-2xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        Time Lock Box 🔒
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all"
                    >
                      Configuration Settings
                    </button>
                  </div>

                </div>

              </div>
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
                onAddGoal={(g) => saveStateField('userAGoals', [g, ...userAGoals])}
                onToggleGoal={(id) => {
                  const updated = userAGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
                  saveStateField('userAGoals', updated);
                }}
                onToggleHabit={(id) => {
                  const updated = habitsA.map(h => h.id === id ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? Math.max(0, h.streak - 1) : h.streak + 1 } : h);
                  saveStateField('habitsA', updated);
                }}
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
