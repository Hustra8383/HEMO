/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Music,
  Calendar,
  Clock,
  MapPin,
  Lock,
  BookOpen,
  Trophy,
  Smile,
  Send,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Zap,
  CheckSquare,
  Compass,
  Volume2,
  Camera
} from 'lucide-react';
import {
  FullHEMOState,
  MissYouLog,
  QuickReaction,
  DailyMemory,
  SharedCountdown,
  CalendarEvent,
  PrivateNote,
  BucketItem,
  LocationState,
  VaultPhoto,
  JournalEntry
} from '../types';


const ACTIVITIES = [
  { type: 'studying', label: 'Studying', emoji: '📚' },
  { type: 'sleeping', label: 'Sleeping', emoji: '🌙' },
  { type: 'atschool', label: 'At School', emoji: '🏫' },
  { type: 'atcollege', label: 'At College', emoji: '🎓' },
  { type: 'working', label: 'Working', emoji: '💼' },
  { type: 'busy', label: 'Busy', emoji: '🔴' },
  { type: 'free', label: 'Free', emoji: '🟢' },
  { type: 'gaming', label: 'Gaming', emoji: '🎮' },
  { type: 'travelling', label: 'Traveling', emoji: '✈️' },
  { type: 'eating', label: 'Eating', emoji: '🍲' },
  { type: 'withfamily', label: 'With Family', emoji: '👨‍👩‍👧‍👦' },
  { type: 'watchingmovie', label: 'Watching Movie', emoji: '🎬' },
  { type: 'exercising', label: 'Exercising', emoji: '🏋️' },
  { type: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { type: 'relaxing', label: 'Relaxing', emoji: '😌' },
  { type: 'reading', label: 'Reading', emoji: '📖' },
  { type: 'custom', label: 'Custom', emoji: '✨' }
];

interface WidgetDashboardProps {
  state: FullHEMOState;
  userId: string;
  saveStateField: (key: keyof FullHEMOState, value: any) => Promise<void>;
  playChime: () => void;
  triggerVibration: () => void;
  showLocalNotification: (title: string, body: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function WidgetDashboard({
  state,
  userId,
  saveStateField,
  playChime,
  triggerVibration,
  showLocalNotification,
  setActiveTab
}: WidgetDashboardProps) {
  const { settings, userAStatus, userBStatus } = state;

  // Local state for animations/overlays
  const [showMutualMissYou, setShowMutualMissYou] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number; delay: number }[]>([]);

  // Form states for adding items
  const [newNote, setNewNote] = useState('');
  const [newBucket, setNewBucket] = useState('');
  const [newBucketCategory, setNewBucketCategory] = useState('adventure');
  const [newCountdownTitle, setNewCountdownTitle] = useState('');
  const [newCountdownDate, setNewCountdownDate] = useState('');
  const [newCountdownCat, setNewCountdownCat] = useState<'anniversary' | 'birthday' | 'date' | 'festival' | 'trip' | 'custom'>('custom');

  // Calendar form states
  const [newCalTitle, setNewCalTitle] = useState('');
  const [newCalDate, setNewCalDate] = useState('');
  const [newCalType, setNewCalType] = useState<'date_night' | 'birthday' | 'exam' | 'event' | 'meetup' | 'appointment'>('date_night');
  const [newCalDesc, setNewCalDesc] = useState('');
  const [showAddCal, setShowAddCal] = useState(false);

  // Journal states
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalContent, setNewJournalContent] = useState('');
  const [newJournalMood, setNewJournalMood] = useState('loved');
  const [showAddJournal, setShowAddJournal] = useState(false);

  // Photo vault authorization
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [vaultError, setVaultError] = useState('');
  const [searchPhotoQuery, setSearchPhotoQuery] = useState('');
  const [photoAlbumFilter, setPhotoAlbumFilter] = useState('all');
  const [newPhotoBase64, setNewPhotoBase64] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoAlbum, setNewPhotoAlbum] = useState('trips');

  // Music state inputs
  const [myListeningTrack, setMyListeningTrack] = useState(userAStatus.feeling || '');
  const [myListeningArtist, setMyListeningArtist] = useState(userAStatus.estimatedFinishTime || '');
  const [myListeningMood, setMyListeningMood] = useState(userAStatus.customStatus || '');
  const [isUpdatingMusic, setIsUpdatingMusic] = useState(false);

  // Live Location toggling and simulation
  const [isSimulatingLocation, setIsSimulatingLocation] = useState(false);

  // Daily Memory inputs
  const [memoryPhoto, setMemoryPhoto] = useState('');
  const [memoryCaption, setMemoryCaption] = useState('');
  const [memoryText, setMemoryText] = useState('');
  const [showMemoryUpload, setShowMemoryUpload] = useState(false);

  // 12. Miss You ❤️ Match Calculation
  const handlePressMissYou = async () => {
    playChime();
    triggerVibration();

    const timestamp = new Date().toISOString();
    const newLog: MissYouLog = {
      id: `my_${Date.now()}`,
      senderId: 'user_a',
      timestamp
    };

    const currentHistory = state.missYouHistory || [];
    const updatedHistory = [newLog, ...currentHistory];
    await saveStateField('missYouHistory', updatedHistory);

    // Trigger floating heart animation
    triggerFloatingHearts();

    // Check if partner has also sent a "Miss You" within the last 30 minutes
    const partnerLogs = currentHistory.filter(h => h.senderId === 'user_b');
    if (partnerLogs.length > 0) {
      const latestPartnerLog = partnerLogs[0];
      const partnerTime = new Date(latestPartnerLog.timestamp).getTime();
      const thirtyMinutesMs = 30 * 60 * 1000;
      if (Date.now() - partnerTime <= thirtyMinutesMs) {
        // MATCH! Both missing each other
        setShowMutualMissYou(true);
        setTimeout(() => {
          setShowMutualMissYou(false);
        }, 5000);
      }
    }
  };

  const handlePressSqueezeHug = async () => {
    playChime();
    triggerVibration();
    triggerFloatingHearts();

    const timestamp = new Date().toISOString();
    const newAction = {
      id: `act_${Date.now()}`,
      senderId: 'user_a',
      type: 'hug' as const,
      message: `${state.settings.userA.nickname} sent you an instant Virtual Hug! 🫂💖`,
      timestamp,
      acknowledged: false,
    };

    const currentActions = state.actions || [];
    await saveStateField('actions', [newAction, ...currentActions]);
    showLocalNotification('🫂 Hug Sent!', 'Your partner will receive a beautiful tactile heartburst on their screen.');
  };

  const compileSharedRelationshipTimeline = () => {
    const events: { id: string; text: string; emoji: string; timestamp: string; senderNickname: string }[] = [];

    const getNickname = (senderId: string) => {
      if (senderId === 'user_a') return settings.userA.nickname;
      if (senderId === 'user_b') return settings.userB.nickname;
      return senderId === userId ? settings.userA.nickname : settings.userB.nickname;
    };

    if (Array.isArray(state.actions)) {
      state.actions.forEach((a) => {
        const isUserA = a.senderId === userId || a.senderId === 'user_a';
        events.push({
          id: a.id || `hug_${a.timestamp}`,
          text: isUserA 
            ? `You hugged ${settings.userB.nickname} 🫂` 
            : `${settings.userB.nickname} hugged you 🫂`,
          emoji: '🫂',
          timestamp: a.timestamp,
          senderNickname: getNickname(a.senderId)
        });
      });
    }

    if (Array.isArray(state.missYouHistory)) {
      state.missYouHistory.forEach((m) => {
        const isUserA = m.senderId === 'user_a';
        events.push({
          id: m.id || `my_${m.timestamp}`,
          text: isUserA 
            ? `You sent a Miss You Nudge ❤️` 
            : `${settings.userB.nickname} sent a Miss You Nudge ❤️`,
          emoji: '❤️',
          timestamp: m.timestamp,
          senderNickname: getNickname(m.senderId)
        });
      });
    }

    if (Array.isArray(state.userAMoods)) {
      state.userAMoods.slice(0, 5).forEach((m, idx) => {
        events.push({
          id: `mooda_${idx}_${m.timestamp}`,
          text: `You are feeling ${m.type.replace('_', ' ')} ${m.emoji}`,
          emoji: m.emoji || '😊',
          timestamp: m.timestamp,
          senderNickname: settings.userA.nickname
        });
      });
    }
    if (Array.isArray(state.userBMoods)) {
      state.userBMoods.slice(0, 5).forEach((m, idx) => {
        events.push({
          id: `moodb_${idx}_${m.timestamp}`,
          text: `${settings.userB.nickname} is feeling ${m.type.replace('_', ' ')} ${m.emoji}`,
          emoji: m.emoji || '😊',
          timestamp: m.timestamp,
          senderNickname: settings.userB.nickname
        });
      });
    }

    if (Array.isArray(state.quickReactionsHistory)) {
      state.quickReactionsHistory.forEach((q) => {
        const isUserA = q.senderId === 'user_a';
        events.push({
          id: q.id || `qr_${q.timestamp}`,
          text: isUserA
            ? `You reacted: ${q.label} ${q.emoji}`
            : `${settings.userB.nickname} reacted: ${q.label} ${q.emoji}`,
          emoji: q.emoji,
          timestamp: q.timestamp,
          senderNickname: getNickname(q.senderId)
        });
      });
    }

    if (Array.isArray(state.voiceNotes)) {
      state.voiceNotes.forEach((v) => {
        const isUserA = v.uploaderId === userId || v.uploaderId === 'user_a';
        events.push({
          id: v.id || `vn_${v.timestamp}`,
          text: isUserA
            ? `You whispered a voice note 🎤`
            : `${settings.userB.nickname} whispered a voice note 🎤`,
          emoji: '🎤',
          timestamp: v.timestamp,
          senderNickname: isUserA ? settings.userA.nickname : settings.userB.nickname
        });
      });
    }

    if (Array.isArray(state.photoVault)) {
      state.photoVault.forEach((p) => {
        const isUserA = p.uploaderId === userId || p.uploaderId === 'user_a';
        events.push({
          id: p.id || `photo_${p.timestamp}`,
          text: isUserA
            ? `You added today's Polaroid memory 📸`
            : `${settings.userB.nickname} added today's Polaroid memory 📸`,
          emoji: '📸',
          timestamp: p.timestamp,
          senderNickname: isUserA ? settings.userA.nickname : settings.userB.nickname
        });
      });
    }

    if (Array.isArray(state.journalEntries)) {
      state.journalEntries.forEach((j) => {
        const isUserA = j.authorId === userId || j.authorId === 'user_a';
        events.push({
          id: j.id || `jr_${j.timestamp}`,
          text: isUserA
            ? `You wrote in our Shared Journal 🖋️`
            : `${settings.userB.nickname} wrote in our Shared Journal 🖋️`,
          emoji: '🖋️',
          timestamp: j.timestamp,
          senderNickname: isUserA ? settings.userA.nickname : settings.userB.nickname
        });
      });
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);
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
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recently';
    }
  };


  const triggerFloatingHearts = () => {
    const hearts = Array.from({ length: 15 }).map((_, i) => ({
      id: Math.random() + i,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 2
    }));
    setFloatingHearts(hearts);
    setTimeout(() => {
      setFloatingHearts([]);
    }, 4000);
  };

  // 13. Send Quick Reaction
  const handleSendReaction = async (reaction: { emoji: string; label: string }) => {
    playChime();
    triggerVibration();

    const newReact: QuickReaction = {
      id: `qr_${Date.now()}`,
      senderId: 'user_a',
      emoji: reaction.emoji,
      label: reaction.label,
      timestamp: new Date().toISOString()
    };

    const currentHistory = state.quickReactionsHistory || [];
    await saveStateField('quickReactionsHistory', [newReact, ...currentHistory]);
    triggerFloatingHearts();
  };

  // 14. Save Daily Memory
  const handleSaveDailyMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryCaption || !memoryText) return;

    const newMem: DailyMemory = {
      id: `dm_${Date.now()}`,
      photoUrl: memoryPhoto || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop',
      caption: memoryCaption,
      shortMemory: memoryText,
      date: new Date().toISOString().split('T')[0],
      uploaderId: 'user_a'
    };

    const currentMems = state.dailyMemories || [];
    await saveStateField('dailyMemories', [newMem, ...currentMems]);
    setMemoryPhoto('');
    setMemoryCaption('');
    setMemoryText('');
    setShowMemoryUpload(false);
    playChime();
  };

  // Handle Photo input for base64 upload
  const handleMemoryPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemoryPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 15. Update Music Status
  const handleSaveMusic = async () => {
    setIsUpdatingMusic(false);
    const updatedStatus = {
      ...userAStatus,
      feeling: myListeningTrack, // repurpose feeling as Listening Track
      estimatedFinishTime: myListeningArtist, // repurpose est finish as Artist
      customStatus: myListeningMood, // repurpose customStatus as Listening Mood
      updatedAt: new Date().toISOString()
    };
    await saveStateField('userAStatus', updatedStatus);
    playChime();
  };

  // 16. Shared Countdowns
  const handleAddCountdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountdownTitle || !newCountdownDate) return;

    const newCD: SharedCountdown = {
      id: `cd_${Date.now()}`,
      title: newCountdownTitle,
      targetDate: newCountdownDate,
      category: newCountdownCat
    };

    const currentCDs = state.countdowns || [];
    await saveStateField('countdowns', [newCD, ...currentCDs]);
    setNewCountdownTitle('');
    setNewCountdownDate('');
    playChime();
  };

  const handleDeleteCountdown = async (id: string) => {
    const currentCDs = state.countdowns || [];
    await saveStateField('countdowns', currentCDs.filter(c => c.id !== id));
  };

  const getDaysRemaining = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? `${days} Days Left` : `${Math.abs(days)} Days Ago`;
  };

  // 17. Shared Calendar
  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalTitle || !newCalDate) return;

    const newEvent: CalendarEvent = {
      id: `cal_${Date.now()}`,
      title: newCalTitle,
      date: newCalDate,
      type: newCalType,
      description: newCalDesc,
      createdBy: 'user_a'
    };

    const currentEvents = state.calendarEvents || [];
    await saveStateField('calendarEvents', [newEvent, ...currentEvents]);
    setNewCalTitle('');
    setNewCalDate('');
    setNewCalDesc('');
    setShowAddCal(false);
    playChime();
  };

  const handleDeleteCalEvent = async (id: string) => {
    const currentEvents = state.calendarEvents || [];
    await saveStateField('calendarEvents', currentEvents.filter(e => e.id !== id));
  };

  // 18. Private Note
  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteItem: PrivateNote = {
      id: `pn_${Date.now()}`,
      text: newNote.trim(),
      senderId: 'user_a',
      timestamp: new Date().toISOString()
    };

    const currentNotes = state.privateNotes || [];
    await saveStateField('privateNotes', [noteItem, ...currentNotes]);
    setNewNote('');
    playChime();
  };

  const handleDeleteNote = async (id: string) => {
    const currentNotes = state.privateNotes || [];
    await saveStateField('privateNotes', currentNotes.filter(n => n.id !== id));
  };

  // 19. Shared Bucket List
  const handleAddBucketItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucket.trim()) return;

    const newItem: BucketItem = {
      id: `bi_${Date.now()}`,
      title: newBucket.trim(),
      completed: false,
      category: newBucketCategory
    };

    const currentBucket = state.bucketList || [];
    await saveStateField('bucketList', [newItem, ...currentBucket]);
    setNewBucket('');
    playChime();
  };

  const handleToggleBucket = async (id: string) => {
    const currentBucket = state.bucketList || [];
    const updated = currentBucket.map(item => {
      if (item.id === id) {
        const completed = !item.completed;
        return {
          ...item,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined
        };
      }
      return item;
    });
    await saveStateField('bucketList', updated);
    playChime();
  };

  const handleDeleteBucket = async (id: string) => {
    const currentBucket = state.bucketList || [];
    await saveStateField('bucketList', currentBucket.filter(item => item.id !== id));
  };

  // 20. Live Location (ON/OFF and simulation updates)
  const toggleLocationA = async () => {
    const currentLocA = state.liveLocationA || { enabled: false };
    const enabled = !currentLocA.enabled;
    const timestamp = new Date().toISOString();

    const updatedLocA: LocationState = {
      enabled,
      lat: enabled ? 28.6139 + (Math.random() - 0.5) * 0.05 : undefined,
      lng: enabled ? 77.2090 + (Math.random() - 0.5) * 0.05 : undefined,
      address: enabled ? 'Near Connaught Place, New Delhi' : undefined,
      updatedAt: timestamp
    };

    await saveStateField('liveLocationA', updatedLocA);
    playChime();
  };

  const simulateMoveLocation = async () => {
    setIsSimulatingLocation(true);
    setTimeout(async () => {
      const currentLocA = state.liveLocationA || { enabled: false };
      if (currentLocA.enabled) {
        const timestamp = new Date().toISOString();
        const updatedLocA: LocationState = {
          enabled: true,
          lat: (currentLocA.lat || 28.6139) + (Math.random() - 0.5) * 0.01,
          lng: (currentLocA.lng || 77.2090) + (Math.random() - 0.5) * 0.01,
          address: 'Amrit Udyan Gardens, India President Palace',
          updatedAt: timestamp
        };
        await saveStateField('liveLocationA', updatedLocA);
        playChime();
      }
      setIsSimulatingLocation(false);
    }, 1200);
  };

  // 21. Private Photo Vault Auth and Actions
  const handleVerifyPin = () => {
    if (pinInput === '1234') {
      setIsVaultLocked(false);
      setPinInput('');
      setVaultError('');
      playChime();
    } else {
      setVaultError('Invalid security PIN code. Try default: 1234');
      triggerVibration();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhotoToVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoBase64) return;

    const newPhoto: VaultPhoto = {
      id: `photo_${Date.now()}`,
      url: newPhotoBase64,
      caption: newPhotoCaption,
      album: newPhotoAlbum,
      isFavorite: false,
      timestamp: new Date().toISOString(),
      uploaderId: 'user_a'
    };

    const currentVault = state.photoVault || [];
    await saveStateField('photoVault', [newPhoto, ...currentVault]);
    setNewPhotoBase64('');
    setNewPhotoCaption('');
    playChime();
  };

  const handleDeletePhoto = async (id: string) => {
    const currentVault = state.photoVault || [];
    await saveStateField('photoVault', currentVault.filter(p => p.id !== id));
  };

  const handleTogglePhotoFavorite = async (id: string) => {
    const currentVault = state.photoVault || [];
    const updated = currentVault.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
    await saveStateField('photoVault', updated);
  };

  // 22. Relationship Journal
  const handleAddJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalTitle || !newJournalContent) return;

    const entry: JournalEntry = {
      id: `jr_${Date.now()}`,
      title: newJournalTitle,
      content: newJournalContent,
      mood: newJournalMood,
      timestamp: new Date().toISOString(),
      authorId: 'user_a',
      reactions: []
    };

    const currentJournal = state.journalEntries || [];
    await saveStateField('journalEntries', [entry, ...currentJournal]);
    setNewJournalTitle('');
    setNewJournalContent('');
    setShowAddJournal(false);
    playChime();
  };

  const handleReactJournal = async (id: string) => {
    const currentJournal = state.journalEntries || [];
    const updated = currentJournal.map(item => {
      if (item.id === id) {
        const reactions = item.reactions || [];
        const index = reactions.indexOf('user_a');
        let newReactions = [...reactions];
        if (index > -1) {
          newReactions.splice(index, 1); // remove reaction
        } else {
          newReactions.push('user_a'); // add reaction
        }
        return { ...item, reactions: newReactions };
      }
      return item;
    });
    await saveStateField('journalEntries', updated);
    playChime();
  };

  // 23. Achievement Badges Calculation
  const calculateAchievements = () => {
    const achievements = [
      {
        id: 'hugs_10',
        title: 'Hug Magnet',
        desc: 'Squeezed 10 Virtual Hugs',
        emoji: '🫂',
        unlocked: state.actions.filter(a => a.type === 'hug' && a.senderId === 'user_a').length >= 10
      },
      {
        id: 'streak_365',
        title: '365 Guardians',
        desc: 'An ambitious year together',
        emoji: '🏆',
        unlocked: (() => {
          const start = settings.relationshipStartDate || new Date().toISOString().split('T')[0];
          const diffDays = Math.max(1, Math.floor(Math.abs(Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
          return diffDays >= 365;
        })()
      },
      {
        id: 'memories_5',
        title: 'Memory Curators',
        desc: 'Stored 5 visual memories',
        emoji: '📸',
        unlocked: (state.memories?.length || 0) >= 5
      },
      {
        id: 'missyou_10',
        title: 'Telepathic Love',
        desc: 'Nudged Miss You 10 times',
        emoji: '❤️',
        unlocked: (state.missYouHistory?.filter(m => m.senderId === 'user_a').length || 0) >= 10
      },
      {
        id: 'bucket_completed',
        title: 'Dream Seekers',
        desc: 'Completed your first bucket list item',
        emoji: '🎯',
        unlocked: (state.bucketList?.filter(b => b.completed).length || 0) >= 1
      },
      {
        id: 'journal_gold',
        title: 'Soul Synchrony',
        desc: 'Logged 3 shared journal entry thoughts',
        emoji: '🖋️',
        unlocked: (state.journalEntries?.filter(j => j.authorId === 'user_a').length || 0) >= 3
      }
    ];
    return achievements;
  };

  // Filter vault photos
  const filteredPhotos = (state.photoVault || []).filter(p => {
    const matchesSearch = p.caption?.toLowerCase().includes(searchPhotoQuery.toLowerCase()) || false;
    if (photoAlbumFilter === 'all') return matchesSearch;
    if (photoAlbumFilter === 'favorites') return matchesSearch && p.isFavorite;
    return matchesSearch && p.album === photoAlbumFilter;
  });

  return (
    <div className="space-y-6" id="widgets-dashboard-container">
      {/* Mutual Match Overlay */}
      <AnimatePresence>
        {showMutualMissYou && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
            id="mutual-match-overlay"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-9xl mb-4"
            >
              💕
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-serif text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 text-center"
            >
              You're both missing each other!
            </motion.h2>
            <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mt-2">
              Telepathic Connection Aligned Within 30 Minutes
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating hearts container */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingHearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ y: '110vh', opacity: 0.8, scale: 0.5 }}
            animate={{ y: '-10vh', opacity: 0, scale: [1, 1.5, 0.8] }}
            transition={{ duration: 4, delay: heart.delay, ease: 'easeOut' }}
            className="absolute text-3xl"
            style={{ left: `${heart.left}%` }}
          >
            ❤️
          </motion.div>
        ))}
      </div>

      {/* Presence & Vibe Board (ONE SHARED RELATIONSHIP SPACE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget: Side-by-Side Presence & Vibe Board */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-pink-500/10 col-span-2 bg-gradient-to-br from-[#121020]/80 via-black/40 to-black/90">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-serif text-3xl font-bold tracking-tight text-gray-100 flex items-center gap-2">
                Our Shared Space <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
              </h3>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mt-1">
                Sanctuary status: Permanently Connected • One Relationship
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                {(() => {
                  const start = settings.relationshipStartDate || new Date().toISOString().split('T')[0];
                  const diffDays = Math.max(1, Math.floor(Math.abs(Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
                  return `${diffDays} Days Together`;
                })()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Left Column: YOU */}
            <div className="p-4 bg-white/3 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-gray-300 font-bold">YOU ({settings.userA.nickname})</span>
                </div>
                <span className="text-xs font-mono text-pink-400">Feeling: {state.userAMoods[0]?.emoji || '😊'}</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-mono uppercase block">Active Presence</span>
                <span className="text-sm font-serif font-bold text-gray-100 block">
                  {(() => {
                    const act = userAStatus.activity || 'free';
                    const matched = ACTIVITIES.find(a => a.type === act);
                    return `${matched ? matched.emoji : '✨'} ${matched ? matched.label : act}`;
                  })()}
                </span>
                {userAStatus.customStatus && (
                  <p className="text-xs text-gray-400 italic mt-0.5 truncate">"{userAStatus.customStatus}"</p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setActiveTab('status')}
                  className="w-full py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-[10px] font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Update Vibe / Deep Focus 🚀
                </button>
              </div>
            </div>

            {/* Right Column: PARTNER */}
            <div className="p-4 bg-white/3 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-gray-300 font-bold">{settings.userB.nickname}</span>
                </div>
                <span className="text-xs font-mono text-indigo-400">Feeling: {state.userBMoods[0]?.emoji || '😊'}</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-mono uppercase block">Active Presence</span>
                <span className="text-sm font-serif font-bold text-gray-100 block">
                  {(() => {
                    const act = userBStatus.activity || 'free';
                    const matched = ACTIVITIES.find(a => a.type === act);
                    return `${matched ? matched.emoji : '✨'} ${matched ? matched.label : act}`;
                  })()}
                </span>
                {userBStatus.customStatus ? (
                  <p className="text-xs text-gray-400 italic mt-0.5 truncate">"{userBStatus.customStatus}"</p>
                ) : (
                  <p className="text-xs text-gray-500 italic mt-0.5">Quietly connected</p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5 justify-between text-[10px] text-gray-400 font-mono">
                <span>Last seen: <b className="text-gray-300">{userBStatus.updatedAt ? formatRelativeTime(userBStatus.updatedAt) : 'Recently'}</b></span>
                {userBStatus.focusMode && (
                  <span className="text-purple-400 animate-pulse font-bold">🔴 IN DEEP FOCUS</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Double Telepathy Nudge Sanctuary */}
        <div className="glass-panel p-6 rounded-3xl border border-pink-500/15 flex flex-col justify-between relative overflow-hidden bg-gradient-to-tr from-pink-950/20 to-indigo-950/20">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest font-bold">Telepathy Sanctuary</span>
            <h4 className="text-md font-serif font-bold text-gray-100">Send Telepathy Spark</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handlePressMissYou}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 cursor-pointer"
              >
                <Heart className="w-7 h-7 text-white fill-white/20 animate-pulse" />
              </motion.button>
              <span className="text-[10px] text-gray-300 font-bold font-mono mt-2">Miss You</span>
              <span className="text-[9px] text-gray-500 font-mono">Telepathy ❤️</span>
            </div>

            <div className="flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handlePressSqueezeHug}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 cursor-pointer"
              >
                <span className="text-2xl filter drop-shadow">🫂</span>
              </motion.button>
              <span className="text-[10px] text-gray-300 font-bold font-mono mt-2">Squeeze Hug</span>
              <span className="text-[9px] text-gray-500 font-mono">Heartburst 🫂</span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-2 text-[9px] text-gray-500 font-mono flex justify-between items-center">
            <span>Hugs Squeezed: <b className="text-pink-400">{state.actions?.filter(a => a.type === 'hug').length || 0}</b></span>
            <span>Miss Yous: <b className="text-indigo-400">{state.missYouHistory?.length || 0}</b></span>
          </div>
        </div>
      </div>

      {/* Widget Grid Row 2: Reactions & Music & Presence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 13. QUICK LOVE REACTIONS */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-4 col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-serif font-bold text-gray-200">Instant Love Reactions</h4>
              <p className="text-xs text-gray-400 font-light">One-tap micro expressions sent instantly to partner dashboard</p>
            </div>
            <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {[
              { emoji: '❤️', label: 'Love You' },
              { emoji: '🥺', label: 'Miss You' },
              { emoji: '😘', label: 'Kiss' },
              { emoji: '🤗', label: 'Hug' },
              { emoji: '💪', label: 'Good Luck' },
              { emoji: '📚', label: 'Study Well' },
              { emoji: '🍽', label: 'Eat' },
              { emoji: '💧', label: 'Drink Water' },
              { emoji: '😴', label: 'Sleep Early' },
              { emoji: '🏠', label: 'Reach Safe' },
              { emoji: '✨', label: 'Thinking' },
              { emoji: '💖', label: 'Proud' }
            ].map((reaction, i) => (
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.97 }}
                key={i}
                onClick={() => handleSendReaction(reaction)}
                className="p-2.5 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center cursor-pointer transition-all"
              >
                <span className="text-xl mb-1">{reaction.emoji}</span>
                <span className="text-[10px] text-gray-400 font-mono text-center leading-tight truncate w-full">{reaction.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Quick reactions history log */}
          <div className="border-t border-white/5 pt-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-2">Reactions Stream</span>
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
              {state.quickReactionsHistory && state.quickReactionsHistory.length > 0 ? (
                state.quickReactionsHistory.slice(0, 8).map((q, idx) => (
                  <div key={idx} className="p-2 bg-white/2 border border-white/5 rounded-xl shrink-0 flex items-center gap-2 text-[10px] text-gray-300 font-mono">
                    <span className="text-md">{q.emoji}</span>
                    <span>{q.senderId === 'user_a' ? 'You' : settings.userB.nickname}: <b className="text-gray-100">{q.label}</b></span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-500 italic">No reactions logged. Send one above!</span>
              )}
            </div>
          </div>
        </div>

        {/* 15. MUSIC STATUS WIDGET */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                Partner Listening Status
              </span>
            </div>

            {/* Display Partner's currently listening */}
            <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="absolute top-1 right-1 opacity-5">
                <Music className="w-16 h-16 text-indigo-400" />
              </div>
              {userBStatus.feeling ? (
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-pink-400 block font-bold">Now Listening</span>
                  <h5 className="text-sm font-serif font-bold text-gray-100 truncate">{userBStatus.feeling}</h5>
                  <p className="text-xs text-gray-400 truncate mt-0.5">by {userBStatus.estimatedFinishTime || 'Unknown Artist'}</p>
                  <div className="inline-block px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-[9px] text-indigo-300 mt-2 font-mono">
                    Mood: {userBStatus.customStatus || 'Chill'}
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-xs text-gray-500 italic">No listening status from {settings.userB.nickname} yet.</p>
                </div>
              )}
            </div>

            {/* Set My Listening Status */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">Share Your Vibe</span>
              {isUpdatingMusic ? (
                <div className="space-y-2 p-3 bg-white/3 rounded-2xl border border-white/5">
                  <input
                    type="text"
                    placeholder="Track Name"
                    value={myListeningTrack}
                    onChange={(e) => setMyListeningTrack(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Artist"
                    value={myListeningArtist}
                    onChange={(e) => setMyListeningArtist(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Vibe/Mood (e.g. Focus, Relax)"
                    value={myListeningMood}
                    onChange={(e) => setMyListeningMood(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveMusic}
                      className="flex-1 py-1 px-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-[10px] font-bold text-white font-mono cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsUpdatingMusic(false)}
                      className="py-1 px-2 bg-white/10 hover:bg-white/15 rounded-lg text-[10px] text-gray-400 font-mono cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsUpdatingMusic(true)}
                  className="w-full py-2 bg-white/4 border border-white/5 hover:bg-white/8 rounded-xl text-xs font-semibold text-gray-300 font-mono uppercase cursor-pointer"
                >
                  {myListeningTrack ? `Listening To: ${myListeningTrack} 🎵` : 'Update My Listening Status'}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Widget Grid Row 3: Daily Memory & Shared Countdowns & Location */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 14. PRIVATE DAILY MEMORY */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-serif font-bold text-gray-200">Daily Memory Polaroid</h4>
              <p className="text-xs text-gray-400 font-light">One private photo, caption, and memory per day</p>
            </div>
            <Camera className="w-5 h-5 text-indigo-400" />
          </div>

          {/* Memory timeline card */}
          <div className="space-y-4">
            {state.dailyMemories && state.dailyMemories.length > 0 ? (
              (() => {
                const latestMemory = state.dailyMemories[0];
                return (
                  <div className="p-3 bg-white/3 border border-white/5 rounded-2xl space-y-2 relative">
                    <div className="h-44 rounded-xl overflow-hidden relative">
                      <img
                        src={latestMemory.photoUrl}
                        alt="Daily memory"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-indigo-300">
                        {latestMemory.uploaderId === 'user_a' ? 'You' : settings.userB.nickname}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-serif font-bold text-gray-200 italic">"{latestMemory.caption}"</h5>
                      <p className="text-[11px] text-gray-400 mt-1 leading-normal line-clamp-2">{latestMemory.shortMemory}</p>
                      <span className="text-[9px] text-gray-500 font-mono mt-2 block">{latestMemory.date}</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-6 bg-white/2 border border-white/5 rounded-2xl text-center">
                <p className="text-xs text-gray-500 italic">No daily memory uploaded today.</p>
              </div>
            )}

            {showMemoryUpload ? (
              <form onSubmit={handleSaveDailyMemory} className="space-y-2.5 p-3 bg-white/3 border border-white/5 rounded-2xl">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Memory Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMemoryPhotoUpload}
                    className="w-full text-xs text-gray-400 font-mono file:bg-white/10 file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1 file:mr-2 cursor-pointer"
                  />
                  {memoryPhoto && (
                    <img src={memoryPhoto} className="w-12 h-12 rounded object-cover mt-1" alt="Thumbnail" />
                  )}
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Short Caption"
                    value={memoryCaption}
                    onChange={(e) => setMemoryCaption(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <textarea
                    placeholder="Describe this beautiful day memory..."
                    value={memoryText}
                    onChange={(e) => setMemoryText(e.target.value)}
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white leading-normal"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-bold text-white font-mono cursor-pointer"
                  >
                    Log Polaroid
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMemoryUpload(false)}
                    className="py-1.5 px-3 bg-white/10 hover:bg-white/15 rounded-lg text-xs text-gray-400 font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowMemoryUpload(true)}
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl text-xs font-bold text-white font-mono uppercase cursor-pointer"
              >
                Log Today's Memory Polaroid
              </button>
            )}
          </div>
        </div>

        {/* 16. SHARED COUNTDOWNS */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-serif font-bold text-gray-200">Shared Countdowns</h4>
              <p className="text-xs text-gray-400 font-light">Custom countdown card trackboards</p>
            </div>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
            {state.countdowns && state.countdowns.length > 0 ? (
              state.countdowns.map((cd) => (
                <div key={cd.id} className="p-3 bg-white/3 border border-white/5 rounded-2xl flex justify-between items-center relative group">
                  <div>
                    <span className="text-[8px] font-mono text-indigo-300 uppercase tracking-widest block">{cd.category}</span>
                    <h5 className="text-xs font-serif font-bold text-gray-200">{cd.title}</h5>
                    <span className="text-[9px] text-gray-500 font-mono">{cd.targetDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs font-mono font-bold text-pink-300">
                      {getDaysRemaining(cd.targetDate)}
                    </span>
                    <button
                      onClick={() => handleDeleteCountdown(cd.id)}
                      className="p-1 hover:text-rose-400 text-gray-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No countdowns configured yet. Add one below!</p>
            )}
          </div>

          {/* Add Countdown Form */}
          <form onSubmit={handleAddCountdown} className="space-y-2 pt-2 border-t border-white/5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Countdown Title"
                value={newCountdownTitle}
                onChange={(e) => setNewCountdownTitle(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-1.5 text-xs text-white"
              />
              <input
                type="date"
                value={newCountdownDate}
                onChange={(e) => setNewCountdownDate(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-1.5 text-xs text-white font-mono"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newCountdownCat}
                onChange={(e: any) => setNewCountdownCat(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-1.5 text-xs text-gray-300 flex-1 font-mono"
              >
                <option value="anniversary">❤️ Anniversary</option>
                <option value="birthday">🎂 Birthday</option>
                <option value="date">📅 Next Date</option>
                <option value="festival">🎉 Festival</option>
                <option value="trip">🛫 Trip Together</option>
                <option value="custom">✨ Custom</option>
              </select>
              <button
                type="submit"
                className="py-1.5 px-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold text-white font-mono cursor-pointer"
              >
                Add Card
              </button>
            </div>
          </form>
        </div>

        {/* 20. OPTIONAL LIVE LOCATION */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-serif font-bold text-gray-200">Live Space Location</h4>
              <MapPin className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-xs text-gray-400 font-light">Privacy First • OFF by default • Only enabled when BOTH partners allow it.</p>
          </div>

          <div className="py-2.5">
            {/* Enabled check */}
            {state.liveLocationA?.enabled && state.liveLocationB?.enabled ? (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    Locations Synchronized
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Real-time GPS feed</span>
                </div>

                {/* Simulated Map Layout */}
                <div className="h-28 rounded-xl bg-[#0e0d22] border border-white/5 relative flex items-center justify-center overflow-hidden">
                  {/* Grid lines to represent map */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="border-r border-b border-white" />
                    ))}
                  </div>

                  {/* Marker A */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute left-[30%] top-[40%] flex flex-col items-center"
                  >
                    <div className="px-2 py-0.5 rounded-full bg-pink-500 text-[8px] font-mono font-bold text-white shadow-md">
                      You
                    </div>
                    <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899] mt-0.5" />
                  </motion.div>

                  {/* Marker B */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
                    className="absolute right-[30%] bottom-[30%] flex flex-col items-center"
                  >
                    <div className="px-2 py-0.5 rounded-full bg-indigo-500 text-[8px] font-mono font-bold text-white shadow-md">
                      {settings.userB.nickname}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] mt-0.5" />
                  </motion.div>

                  <span className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-600">Simulated Vector Map</span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="text-gray-300">
                    Your location: <span className="text-gray-400 font-normal">({state.liveLocationA.lat?.toFixed(4)}, {state.liveLocationA.lng?.toFixed(4)})</span>
                    <p className="text-[10px] text-gray-500 truncate leading-normal">{state.liveLocationA.address}</p>
                  </div>
                  <div className="text-gray-300 border-t border-white/5 pt-1.5">
                    {settings.userB.nickname}'s location: <span className="text-gray-400 font-normal">({state.liveLocationB.lat?.toFixed(4)}, {state.liveLocationB.lng?.toFixed(4)})</span>
                    <p className="text-[10px] text-gray-500 truncate leading-normal">{state.liveLocationB.address || 'Simulated address'}</p>
                  </div>
                </div>

                <button
                  onClick={simulateMoveLocation}
                  disabled={isSimulatingLocation}
                  className="w-full py-1 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg text-[10px] text-indigo-300 font-mono uppercase font-bold text-center transition-all cursor-pointer"
                >
                  {isSimulatingLocation ? 'Updating location GPS...' : 'Update/Simulate GPS Movement'}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-white/2 border border-white/5 rounded-2xl text-center text-xs space-y-2">
                <p className="text-gray-400">
                  {state.liveLocationA?.enabled && !state.liveLocationB?.enabled ? (
                    <span className="text-pink-400">Waiting for {settings.userB.nickname} to enable location...</span>
                  ) : !state.liveLocationA?.enabled && state.liveLocationB?.enabled ? (
                    <span className="text-indigo-400">{settings.userB.nickname} has enabled location! Enable yours to see them.</span>
                  ) : (
                    "Live Location feeds are inactive."
                  )}
                </p>
                <div className="text-[10px] text-gray-500 font-mono">
                  Coordinates are never loaded unless BOTH explicitly toggle.
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleLocationA}
            className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wide transition-all cursor-pointer ${
              state.liveLocationA?.enabled
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/15'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            {state.liveLocationA?.enabled ? 'Disable My Location' : 'Allow My Live Location'}
          </button>
        </div>

      </div>

      {/* Widget Grid Row 4: Calendar & sticky Notes & Bucket List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 17. LOVE CALENDAR */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-serif font-bold text-gray-200">Relationship Calendar</h4>
              <p className="text-xs text-gray-400 font-light">Shared timeline for dates, meetups, and exams</p>
            </div>
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
            {state.calendarEvents && state.calendarEvents.length > 0 ? (
              state.calendarEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-white/3 border border-white/5 rounded-2xl flex justify-between items-start relative group">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold uppercase">
                        {evt.type.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">{evt.date}</span>
                    </div>
                    <h5 className="text-xs font-serif font-bold text-gray-200">{evt.title}</h5>
                    {evt.description && <p className="text-[10px] text-gray-400 font-serif italic">"{evt.description}"</p>}
                    <span className="text-[8px] font-mono text-gray-500 block">Created by {evt.createdBy === 'user_a' ? 'You' : settings.userB.nickname}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCalEvent(evt.id)}
                    className="p-1 hover:text-rose-400 text-gray-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No events saved in relationship calendar.</p>
            )}
          </div>

          {showAddCal ? (
            <form onSubmit={handleAddCalendarEvent} className="space-y-2 p-3 bg-white/3 border border-white/5 rounded-2xl">
              <input
                type="text"
                placeholder="Event Title"
                value={newCalTitle}
                onChange={(e) => setNewCalTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                required
              />
              <input
                type="date"
                value={newCalDate}
                onChange={(e) => setNewCalDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                required
              />
              <select
                value={newCalType}
                onChange={(e: any) => setNewCalType(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-gray-300 font-mono"
              >
                <option value="date_night">🍷 Date Night</option>
                <option value="birthday">🎂 Birthday</option>
                <option value="exam">📚 Exam Date</option>
                <option value="event">🎉 Special Event</option>
                <option value="meetup">🛫 Airport Meetup</option>
                <option value="appointment">🩺 Appointment</option>
              </select>
              <input
                type="text"
                placeholder="Description / Location"
                value={newCalDesc}
                onChange={(e) => setNewCalDesc(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1 px-3 bg-indigo-500 hover:bg-indigo-600 text-white font-mono font-bold text-[10px] uppercase rounded-lg cursor-pointer"
                >
                  Save Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCal(false)}
                  className="py-1 px-3 bg-white/10 hover:bg-white/15 text-gray-400 font-mono text-[10px] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddCal(true)}
              className="w-full py-2 bg-white/4 border border-white/5 hover:bg-white/8 rounded-xl text-xs font-semibold text-gray-300 font-mono uppercase cursor-pointer"
            >
              Add Relationship Calendar Event
            </button>
          )}
        </div>

        {/* 18. PRIVATE NOTES */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-serif font-bold text-gray-200">Sweet Companion Notes</h4>
              <p className="text-xs text-gray-400 font-light">Leave private loving reminders for your partner</p>
            </div>
            <Heart className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
            {state.privateNotes && state.privateNotes.length > 0 ? (
              state.privateNotes.map((n) => (
                <div key={n.id} className="p-3 bg-gradient-to-tr from-yellow-950/20 to-amber-950/20 border border-amber-500/10 rounded-2xl flex justify-between items-start relative group">
                  <div className="space-y-1">
                    <p className="text-xs text-amber-200 font-serif leading-normal">"{n.text}"</p>
                    <span className="text-[8px] font-mono text-gray-500 block uppercase">
                      Left by {n.senderId === 'user_a' ? 'You' : settings.userB.nickname} • {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {n.senderId === 'user_a' && (
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="p-1 hover:text-rose-400 text-gray-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No love sticky notes pinned. Leave one below!</p>
            )}
          </div>

          <form onSubmit={handleSendNote} className="flex gap-2 pt-1 border-t border-white/5">
            <input
              type="text"
              placeholder="Good luck today! Don't forget lunch ❤️"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white flex-1"
            />
            <button
              type="submit"
              className="py-2 px-3.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl flex items-center justify-center cursor-pointer text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 19. SHARED BUCKET LIST */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-serif font-bold text-gray-200">Shared Bucket List</h4>
              <p className="text-xs text-gray-400 font-light">Bucket achievements to conquer together</p>
            </div>
            <CheckSquare className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
            {state.bucketList && state.bucketList.length > 0 ? (
              state.bucketList.map((item) => (
                <div key={item.id} className="p-3 bg-white/3 border border-white/5 rounded-2xl flex justify-between items-center group relative">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleBucket(item.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        item.completed
                          ? 'bg-emerald-500 border-emerald-500 text-black'
                          : 'border-gray-500 hover:border-white'
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <div className="truncate text-left">
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">{item.category}</span>
                      <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {item.title}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBucket(item.id)}
                    className="p-1 hover:text-rose-400 text-gray-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No bucket dreams listed yet. Write one below!</p>
            )}
          </div>

          <form onSubmit={handleAddBucketItem} className="space-y-2 pt-2 border-t border-white/5">
            <input
              type="text"
              placeholder="e.g. Visit Goa Together"
              value={newBucket}
              onChange={(e) => setNewBucket(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-1.5 text-xs text-white"
            />
            <div className="flex gap-2">
              <select
                value={newBucketCategory}
                onChange={(e) => setNewBucketCategory(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl p-1.5 text-xs text-gray-300 font-mono flex-1"
              >
                <option value="adventure">🌲 Adventure</option>
                <option value="travel">✈️ Travel Trip</option>
                <option value="food">🍽 Cook/Food</option>
                <option value="study">📚 Study Milestone</option>
                <option value="cozy">🏠 Cozy Moments</option>
              </select>
              <button
                type="submit"
                className="py-1.5 px-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold text-white font-mono cursor-pointer"
              >
                Add Dream
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Extended Block: 21. PRIVATE PHOTO VAULT */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-lg">
              🔒
            </div>
            <div>
              <h4 className="text-md font-serif font-bold text-gray-100">Private Photo Vault</h4>
              <p className="text-xs text-gray-400 font-light">Secure shared couples gallery protected by PIN</p>
            </div>
          </div>
          <Lock className="w-5 h-5 text-pink-400 animate-pulse" />
        </div>

        {isVaultLocked ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 max-w-sm mx-auto text-center" id="vault-pin-prompt">
            <Lock className="w-12 h-12 text-pink-400" />
            <div>
              <h5 className="text-sm font-serif font-bold text-gray-200">Unlock Photo Vault</h5>
              <p className="text-xs text-gray-400 mt-1">Both partners can view this gallery. Enter security PIN to unlock.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <input
                type="password"
                maxLength={4}
                placeholder="Enter 4-Digit PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center bg-black/60 border border-white/15 rounded-xl p-3 text-lg font-mono text-white tracking-widest focus:border-pink-500/50"
              />
              {vaultError && <span className="text-[10px] text-rose-400 font-mono">{vaultError}</span>}
              <button
                onClick={handleVerifyPin}
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold font-mono text-xs uppercase rounded-xl tracking-wider transition-all cursor-pointer"
              >
                Unlock Safe Vault
              </button>
            </div>
            <span className="text-[9px] text-gray-500 font-mono">Use default test PIN: 1234</span>
          </div>
        ) : (
          <div className="space-y-6" id="vault-open-content">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2">
                {['all', 'favorites', 'trips', 'daily', 'moments'].map((alb) => (
                  <button
                    key={alb}
                    onClick={() => setPhotoAlbumFilter(alb)}
                    className={`py-1.5 px-3 rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      photoAlbumFilter === alb
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/4 text-gray-400 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    {alb}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search caption..."
                  value={searchPhotoQuery}
                  onChange={(e) => setSearchPhotoQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white"
                />
              </div>

              <button
                onClick={() => setIsVaultLocked(true)}
                className="py-1 px-2.5 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-mono rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5" /> Lock Vault
              </button>
            </div>

            {/* Photo Upload Form */}
            <form onSubmit={handleSavePhotoToVault} className="p-4 bg-white/3 border border-white/5 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Add Photo Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-gray-400 font-mono file:bg-white/10 file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1 file:mr-2 cursor-pointer"
                  required
                />
                {newPhotoBase64 && <img src={newPhotoBase64} className="w-12 h-12 rounded object-cover mt-1" alt="Thumbnail" />}
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Photo Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Beautiful beach day"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-1.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Album Folder</label>
                <select
                  value={newPhotoAlbum}
                  onChange={(e) => setNewPhotoAlbum(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-1.5 text-xs text-gray-300 font-mono"
                >
                  <option value="trips">✈️ Trips</option>
                  <option value="daily">📅 Daily Polaroid</option>
                  <option value="moments">✨ Cozy Moments</option>
                </select>
              </div>
              <button
                type="submit"
                className="py-2 px-4 bg-pink-500 hover:bg-pink-600 rounded-xl text-xs font-bold text-white font-mono uppercase cursor-pointer"
              >
                Safe Upload Photo
              </button>
            </form>

            {/* Photo Grid */}
            {filteredPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredPhotos.map((p) => (
                  <div key={p.id} className="p-2 bg-white/2 border border-white/5 rounded-2xl space-y-2 group relative overflow-hidden">
                    <div className="h-40 rounded-xl overflow-hidden relative">
                      <img src={p.url} className="w-full h-full object-cover" alt={p.caption} referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-pink-300 uppercase font-bold">
                        {p.album}
                      </div>

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTogglePhotoFavorite(p.id)}
                          className={`p-1.5 rounded-lg border ${p.isFavorite ? 'bg-pink-500 border-pink-500 text-white' : 'bg-black/60 border-white/15 text-gray-300'} hover:scale-105 cursor-pointer`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                        <a
                          href={p.url}
                          download={`hemo_vault_${p.id}.png`}
                          className="p-1.5 rounded-lg bg-black/60 border border-white/15 text-gray-300 hover:scale-105 cursor-pointer"
                        >
                          💾
                        </a>
                        <button
                          onClick={() => handleDeletePhoto(p.id)}
                          className="p-1.5 rounded-lg bg-black/60 border border-white/15 hover:text-rose-400 text-gray-300 hover:scale-105 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {p.caption && <p className="text-[11px] text-gray-200 truncate font-serif italic text-center">"{p.caption}"</p>}
                    <span className="text-[8px] font-mono text-gray-500 block text-center uppercase">
                      by {p.uploaderId === 'user_a' ? 'You' : settings.userB.nickname} • {new Date(p.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-500 italic">
                No secure photos matching criteria found inside this folder vault.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extended Block: 22. RELATIONSHIP JOURNAL */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">
              🖋️
            </div>
            <div>
              <h4 className="text-md font-serif font-bold text-gray-100">Relationship Journal</h4>
              <p className="text-xs text-gray-400 font-light">Pour out your souls, align thoughts, and react with loving hearts</p>
            </div>
          </div>
          <BookOpen className="w-5 h-5 text-indigo-400 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">Latest Entries</span>
            <button
              onClick={() => setShowAddJournal(!showAddJournal)}
              className="py-1 px-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Write Entry
            </button>
          </div>

          {showAddJournal && (
            <form onSubmit={handleAddJournalEntry} className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Journal Entry Title"
                  value={newJournalTitle}
                  onChange={(e) => setNewJournalTitle(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white"
                  required
                />
                <select
                  value={newJournalMood}
                  onChange={(e) => setNewJournalMood(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-gray-300 font-mono"
                >
                  <option value="loved">💖 Feeling Loved</option>
                  <option value="grateful">🌸 Grateful</option>
                  <option value="excited">⚡ Excited</option>
                  <option value="calm">🧘 Peaceful / Calm</option>
                  <option value="melancholic">🌊 Melancholic</option>
                </select>
              </div>
              <textarea
                placeholder="Pour your heart and thoughts here..."
                value={newJournalContent}
                onChange={(e) => setNewJournalContent(e.target.value)}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white leading-relaxed"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-mono font-bold text-xs uppercase rounded-lg cursor-pointer"
                >
                  Publish Thoughts
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddJournal(false)}
                  className="py-1.5 px-3 bg-white/10 hover:bg-white/15 text-gray-400 font-mono text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {state.journalEntries && state.journalEntries.length > 0 ? (
            <div className="space-y-4">
              {state.journalEntries.map((jr) => (
                <div key={jr.id} className="p-5 bg-white/2 border border-white/5 hover:border-indigo-500/15 rounded-2xl space-y-3 transition-all relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold uppercase mr-2">
                        Mood: {jr.mood || 'Loved'}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">
                        {new Date(jr.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                      Written by <b className="text-gray-300">{jr.authorId === 'user_a' ? 'You' : settings.userB.nickname}</b>
                    </span>
                  </div>

                  <h5 className="text-md font-serif font-bold text-gray-100">{jr.title}</h5>
                  <p className="text-xs text-gray-300 leading-relaxed font-serif whitespace-pre-wrap">{jr.content}</p>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    {/* Reaction toggle */}
                    <button
                      onClick={() => handleReactJournal(jr.id)}
                      className={`py-1 px-3.5 rounded-full border text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        (jr.reactions || []).includes('user_a')
                          ? 'bg-pink-500/10 border-pink-500/30 text-pink-300'
                          : 'bg-white/3 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${(jr.reactions || []).includes('user_a') ? 'fill-current text-pink-400' : ''}`} />
                      {(jr.reactions || []).includes('user_a') ? 'Reacted with Heart!' : 'Give Partner Heart'}
                    </button>

                    <div className="flex items-center gap-1">
                      {jr.reactions && jr.reactions.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-pink-300 font-mono">
                          <span>❤️</span>
                          <span>{jr.reactions.length} love reaction</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-4">No shared journal entries recorded. Write the first memory thought together!</p>
          )}
        </div>
      </div>

      {/* 23. MILESTONE ACHIEVEMENTS BADGES */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-lg">
              🏆
            </div>
            <div>
              <h4 className="text-md font-serif font-bold text-gray-100">Milestone Achievements</h4>
              <p className="text-xs text-gray-400 font-light">Unlock premium relationship badges by logging memories and hugs</p>
            </div>
          </div>
          <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculateAchievements().map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative overflow-hidden ${
                ach.unlocked
                  ? 'bg-gradient-to-tr from-amber-950/20 to-indigo-950/20 border-amber-500/25 shadow-lg shadow-amber-500/5'
                  : 'bg-white/2 border-white/5 filter grayscale opacity-60'
              }`}
            >
              <div className="text-3xl shrink-0 p-2.5 bg-white/3 border border-white/5 rounded-xl">
                {ach.emoji}
              </div>
              <div className="space-y-1 text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-serif font-bold text-gray-200 truncate">{ach.title}</h5>
                  {ach.unlocked && (
                    <span className="text-[8px] bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono py-0.5 px-1 rounded uppercase font-bold">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
