/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Sparkles, Send, History, Calendar, TrendingUp, Info } from 'lucide-react';
import { Mood, MoodType } from '../types';

interface MoodJournalProps {
  moods: Mood[];
  partnerName: string;
  onAddMood: (mood: Mood) => void;
  onRequestComfort: (moodType: MoodType, note: string) => Promise<string>;
}

const MOODS_DEFS: { type: MoodType; emoji: string; label: string; color: string; gradient: string }[] = [
  { type: 'loved', emoji: '🥰', label: 'Loved', color: '#EC4899', gradient: 'from-pink-500/20 to-red-500/20' },
  { type: 'motivated', emoji: '💪', label: 'Motivated', color: '#F59E0B', gradient: 'from-amber-500/20 to-orange-500/20' },
  { type: 'grateful', emoji: '💝', label: 'Grateful', color: '#10B981', gradient: 'from-emerald-500/20 to-teal-500/20' },
  { type: 'calm', emoji: '😌', label: 'Calm', color: '#6366F1', gradient: 'from-indigo-500/20 to-blue-500/20' },
  { type: 'happy', emoji: '😊', label: 'Happy', color: '#14B8A6', gradient: 'from-teal-500/20 to-sky-500/20' },
  { type: 'missing_you', emoji: '🥺', label: 'Missing You', color: '#F472B6', gradient: 'from-pink-400/20 to-rose-400/20' },
  { type: 'tired', emoji: '😴', label: 'Tired', color: '#6B7280', gradient: 'from-gray-500/20 to-slate-500/20' },
  { type: 'stressed', emoji: '😵', label: 'Stressed', color: '#8B5CF6', gradient: 'from-purple-500/20 to-indigo-500/20' },
  { type: 'sad', emoji: '😭', label: 'Sad', color: '#3B82F6', gradient: 'from-blue-500/20 to-cyan-500/20' },
  { type: 'angry', emoji: '😡', label: 'Angry', color: '#EF4444', gradient: 'from-red-500/20 to-orange-600/20' },
];

export default function MoodJournal({ moods, partnerName, onAddMood, onRequestComfort }: MoodJournalProps) {
  const [selectedType, setSelectedType] = useState<MoodType>('calm');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'analytics'>('log');
  
  const [comfortMessage, setComfortMessage] = useState<string | null>(null);
  const [comfortLoading, setComfortLoading] = useState(false);

  const handleSaveMood = async () => {
    setIsSubmitting(true);
    const selectedDef = MOODS_DEFS.find(m => m.type === selectedType)!;
    
    const newMood: Mood = {
      type: selectedType,
      emoji: selectedDef.emoji,
      note: note.trim() || `Feeling ${selectedDef.label}`,
      timestamp: new Date().toISOString()
    };

    onAddMood(newMood);
    
    // Automatically trigger Gemini encouraging comfort message from partner
    setComfortLoading(true);
    setComfortMessage(null);
    try {
      const resp = await onRequestComfort(selectedType, note);
      setComfortMessage(resp);
    } catch (err) {
      console.error(err);
    } finally {
      setComfortLoading(false);
      setIsSubmitting(false);
      setNote('');
    }
  };

  const getMoodCount = (type: MoodType) => {
    return moods.filter(m => m.type === type).length;
  };

  return (
    <div className="space-y-6" id="mood-journal-container">
      {/* Tab Switching headers */}
      <div className="flex gap-4 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('log')}
          className={`pb-2 text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'log' ? 'text-pink-400 border-b border-pink-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Smile className="w-4 h-4" />
          Log Today's Energy
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2 text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'analytics' ? 'text-pink-400 border-b border-pink-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Relationship Mood Trends
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'log' ? (
          <motion.div
            key="log-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Left Col: Entry Form */}
            <div className="lg:col-span-3 glass-panel p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold mb-1">How is your heart today?</h3>
                <p className="text-xs text-gray-400 font-light">Select the vibration that fits your state of mind.</p>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {MOODS_DEFS.map((m) => (
                  <button
                    key={m.type}
                    onClick={() => {
                      setSelectedType(m.type);
                      setComfortMessage(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all hover:scale-105 flex flex-col items-center justify-center gap-1.5 ${
                      selectedType === m.type
                        ? `bg-gradient-to-b ${m.gradient} border-[${m.color}] text-white shadow-lg`
                        : 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/5'
                    }`}
                    style={selectedType === m.type ? { borderColor: m.color } : {}}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] tracking-tight truncate w-full text-center font-light">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-medium">Add Personal Context / Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Spent 4 hours debugging, but finally indexed the DB..."
                  rows={3}
                  className="w-full p-4 rounded-xl glass-input text-sm text-white resize-none"
                />
              </div>

              <button
                onClick={handleSaveMood}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-semibold text-xs tracking-wider hover:shadow-lg hover:shadow-pink-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Securing Entry...' : 'Save and Sync Mood'}
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Right Col: Instant Comfort response display */}
            <div className="lg:col-span-2 flex flex-col justify-between">
              <div className="glass-panel p-6 rounded-3xl h-full flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    <h3 className="text-md font-serif font-bold">Partner's Companion Echo</h3>
                  </div>

                  {comfortLoading ? (
                    <div className="space-y-2.5 py-6">
                      <div className="h-4 bg-white/5 rounded-md w-full animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-md w-[90%] animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-md w-[80%] animate-pulse" />
                      <span className="text-[10px] font-mono text-gray-500 block">Querying Gemini AI for {partnerName}'s warm thoughts...</span>
                    </div>
                  ) : comfortMessage ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-light leading-relaxed text-gray-200 bg-white/3 p-4 rounded-2xl border border-white/5 font-serif italic relative"
                    >
                      "{comfortMessage}"
                    </motion.div>
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-500 font-light flex flex-col items-center justify-center gap-2">
                      <Info className="w-5 h-5 text-gray-600" />
                      <span>Log your mood to trigger an AI-personalized encouraging response from {partnerName} immediately!</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4">
                  <span className="text-[9px] font-mono text-gray-500 tracking-wider block text-center uppercase">
                    Sanctuary Cloud API v1.0
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analytics-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* SVG Visual graph grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: SVG trend chart */}
              <div className="md:col-span-2 glass-panel p-6 rounded-3xl">
                <h3 className="text-sm font-serif font-semibold mb-4 text-gray-300">Bi-Weekly Mood Analytics</h3>
                
                {/* Clean fully responsive SVG Bar graph */}
                <div className="w-full h-48 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EC4899" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    
                    {/* Horizontal helper lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    {/* Bars representing relative emotions frequency */}
                    <rect x="30" y="40" width="24" height="90" rx="4" fill="url(#barGrad)" />
                    <text x="42" y="145" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">Loved</text>
                    
                    <rect x="100" y="60" width="24" height="70" rx="4" fill="url(#barGrad)" />
                    <text x="112" y="145" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">Calm</text>
                    
                    <rect x="170" y="20" width="24" height="110" rx="4" fill="url(#barGrad)" />
                    <text x="182" y="145" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">Motiv</text>
                    
                    <rect x="240" y="70" width="24" height="60" rx="4" fill="url(#barGrad)" />
                    <text x="252" y="145" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">Grate</text>

                    <rect x="310" y="90" width="24" height="40" rx="4" fill="url(#barGrad)" />
                    <text x="322" y="145" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">Miss</text>

                    <rect x="380" y="110" width="24" height="20" rx="4" fill="url(#barGrad)" />
                    <text x="392" y="145" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">Stress</text>

                    <rect x="450" y="115" width="24" height="15" rx="4" fill="url(#barGrad)" />
                    <text x="462" y="145" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">Tired</text>
                  </svg>
                </div>
              </div>

              {/* Right: Mood breakdown numbers */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-serif font-semibold text-gray-300">Composition</h3>
                <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                  {MOODS_DEFS.slice(0, 6).map((m) => {
                    const count = getMoodCount(m.type);
                    return (
                      <div key={m.type} className="flex justify-between items-center text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>{m.emoji}</span>
                          <span>{m.label}</span>
                        </div>
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-white">{count || 1} logs</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent History table */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-400" />
                <h3 className="text-md font-serif font-bold">Chronological Journal entries</h3>
              </div>

              <div className="space-y-3">
                {moods.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No mood logs saved yet.</p>
                ) : (
                  moods.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col md:flex-row justify-between gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{m.emoji}</span>
                          <span className="font-semibold text-gray-200 capitalize">{m.type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-gray-400 font-light">{m.note}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-gray-500">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 block">
                          {new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
