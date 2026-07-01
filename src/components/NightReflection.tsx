/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Star, Send, BookOpen, Sunset, Coffee, Sparkles, BrainCircuit } from 'lucide-react';
import { NightReflection } from '../types';

interface NightReflectionProps {
  reflections: NightReflection[];
  onAddReflection: (ref: NightReflection) => void;
  partnerName: string;
}

export default function NightReflections({ reflections, onAddReflection, partnerName }: NightReflectionProps) {
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [learnedText, setLearnedText] = useState('');
  const [partnerNote, setPartnerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<'reflect' | 'history'>('reflect');

  const handlePostReflection = () => {
    if (!gratitude1.trim() || !learnedText.trim() || !partnerNote.trim()) return;
    setIsSubmitting(true);

    const newReflection: NightReflection = {
      date: new Date().toISOString().split('T')[0],
      bestMoment: 'Achieved complete task list',
      hardestMoment: 'None',
      gratefulFor: [gratitude1.trim(), gratitude2.trim(), gratitude3.trim()].filter(Boolean).join(', '),
      achievement: 'Maintained focused deep work sprint',
      improvement: learnedText.trim(),
      beforeSleepMessage: partnerNote.trim(),
      completedBy: 'user_a',
    };

    setTimeout(() => {
      onAddReflection(newReflection);
      // Reset
      setGratitude1('');
      setGratitude2('');
      setGratitude3('');
      setLearnedText('');
      setPartnerNote('');
      setIsSubmitting(false);
      setActiveTab('history');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-2 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-serif font-bold">Night Reflection</h3>
          <p className="text-xs text-gray-400 font-light">
            Unwind your ambitious mind before sleeping. Record gratitude, logging lessons, and whisper direct sweet notes.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('reflect')}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'reflect' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Reflect Today
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'history' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Reflection History
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reflect' ? (
          <motion.div
            key="reflect-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Left Col: Questionnaire (3 cols) */}
            <div className="lg:col-span-3 glass-panel p-6 rounded-3xl space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-medium">1. Three Things you are grateful for today</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={gratitude1}
                    onChange={(e) => setGratitude1(e.target.value)}
                    placeholder="First thing (required)... e.g. Compiling the main module seamlessly."
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                  <input
                    type="text"
                    value={gratitude2}
                    onChange={(e) => setGratitude2(e.target.value)}
                    placeholder="Second thing (optional)... e.g. Quick tea break."
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                  <input
                    type="text"
                    value={gratitude3}
                    onChange={(e) => setGratitude3(e.target.value)}
                    placeholder="Third thing (optional)... e.g. Cozy rain outside."
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1.5 font-medium">2. What major lesson did you learn today?</label>
                <input
                  type="text"
                  value={learnedText}
                  onChange={(e) => setLearnedText(e.target.value)}
                  placeholder="e.g. Always index coordinate DB tables early to avoid lag."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1.5 font-medium">3. Sleep Message / Whisper to your person</label>
                <textarea
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                  placeholder="Type a loving sleep note to your partner..."
                  rows={3}
                  className="w-full p-4 rounded-xl glass-input text-xs text-white resize-none"
                />
              </div>

              <button
                onClick={handlePostReflection}
                disabled={isSubmitting || !gratitude1.trim() || !learnedText.trim() || !partnerNote.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-semibold text-xs tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Sealing Night Reflection...' : 'Broadcast Night Reflection'}
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Right Col: Companion Night Vibe (2 cols) */}
            <div className="lg:col-span-2 flex flex-col justify-between">
              <div className="glass-panel p-6 rounded-3xl h-full flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                  <Moon className="w-24 h-24 text-indigo-400 animate-pulse" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-md font-serif font-bold">Unwind and Sleep</h3>
                  </div>

                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    By sharing your reflections, you declutter your conscious thoughts, letting your sleep states deeply digest knowledge.
                  </p>

                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-indigo-200 leading-relaxed font-light">
                      "When we clear our heart of minor worries before bed, our brains consolidate study data up to 40% faster." — HEMO Companion AI research team.
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 text-center">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">
                    Sanctuary Sleep Labs v1.0
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* AI Summarization banner */}
            <div className="p-5 rounded-3xl bg-radial-gradient from-purple-950/30 to-black border border-purple-500/20 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className="p-3 bg-purple-500/20 rounded-2xl">
                  <BrainCircuit className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-gray-100">AI Reflection Synopsis</h4>
                  <p className="text-[11px] text-gray-400 font-light">Gemini AI synthesizes your weekly learning curves and gratitude trends together.</p>
                </div>
              </div>
              <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full font-bold uppercase font-mono">
                Stable State Analytics
              </span>
            </div>

            {/* List */}
            <div className="space-y-4">
              {reflections.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-8 text-center">No night reflections logged yet.</p>
              ) : (
                reflections.map((ref, idx) => (
                  <div
                    key={ref.date + idx}
                    className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 text-xs"
                  >
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[9px] font-mono text-indigo-400 uppercase">
                        Logged by: <b>{ref.completedBy === 'user_a' ? 'You' : partnerName}</b>
                      </span>
                      <span className="text-[9px] font-mono text-gray-500">
                        {ref.date}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Gratitude column */}
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase tracking-wider text-gray-500 block font-medium">Grateful For:</span>
                        <p className="text-gray-300 font-light leading-relaxed">{ref.gratefulFor}</p>
                      </div>

                      {/* Learning curve */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-gray-500 block font-medium">Lesson Learned:</span>
                        <p className="text-gray-300 leading-relaxed font-light">{ref.improvement}</p>
                      </div>

                      {/* Sleep Note */}
                      <div className="p-3 bg-white/2 rounded-2xl border border-white/5 space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-pink-400 block font-semibold">Sleep Note:</span>
                        <p className="text-gray-300 italic font-serif leading-relaxed">"{ref.beforeSleepMessage}"</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
