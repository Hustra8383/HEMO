/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Clock, Gift, Award, HelpCircle, Key, Send, AlertCircle } from 'lucide-react';
import { TimeCapsule } from '../types';

interface TimeCapsuleProps {
  capsules: TimeCapsule[];
  onAddCapsule: (capsule: TimeCapsule) => void;
  onUnlockCapsule: (id: string) => void;
  partnerName: string;
}

export default function TimeCapsules({ capsules, onAddCapsule, onUnlockCapsule, partnerName }: TimeCapsuleProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockType, setUnlockType] = useState<'one_month' | 'after_jee' | 'chatgro_milestone' | 'hasmol_launch' | 'one_year' | 'custom'>('after_jee');
  const [triggerText, setTriggerText] = useState('');
  const [isSealing, setIsSealing] = useState(false);

  // Selected locked capsule to "Try Unlocking" with animation
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [isUnlockingAnim, setIsUnlockingAnim] = useState(false);

  const handleSealCapsule = () => {
    if (!title.trim() || !message.trim()) return;

    const newCapsule: TimeCapsule = {
      id: `capsule_${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      unlockType,
      unlockTriggerText: ['custom', 'chatgro_milestone', 'hasmol_launch'].includes(unlockType) ? triggerText.trim() : undefined,
      unlocked: false,
      createdAt: new Date().toISOString(),
      creatorId: 'user_a',
    };

    onAddCapsule(newCapsule);
    setTitle('');
    setMessage('');
    setTriggerText('');
    setIsSealing(false);
  };

  const handleTriggerUnlock = (id: string) => {
    setUnlockingId(id);
    setIsUnlockingAnim(true);
    
    // Simulate premium security lock-opening
    setTimeout(() => {
      onUnlockCapsule(id);
      setIsUnlockingAnim(false);
      setUnlockingId(null);
    }, 2500);
  };

  const getTriggerLabel = (type: string, triggerText?: string) => {
    switch (type) {
      case 'one_month': return 'Locks for exactly 30 days';
      case 'after_jee': return 'Unlocks after JEE Mains Advanced CS Exam (Oct 2026)';
      case 'chatgro_milestone': return `Unlocks after ChatGro reaches: "${triggerText || '$25K MRR'}"`;
      case 'hasmol_launch': return `Unlocks when Hasmol brand launches: "${triggerText || 'Main brand launch'}"`;
      case 'one_year': return 'Unlocks on our 1 Year Anniversary';
      default: return `Custom: "${triggerText || 'Specific goal accomplished'}"`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div>
          <h3 className="text-lg font-serif font-bold">Virtual Time Capsules</h3>
          <p className="text-xs text-gray-400 font-light">Seal thoughts, surprises, or sweet words for special future milestones.</p>
        </div>

        <button
          onClick={() => setIsSealing(!isSealing)}
          className="py-1.5 px-3 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl text-xs font-semibold hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          Seal Message
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Unlocking animation overlay */}
        {isUnlockingAnim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0915]/95 flex flex-col items-center justify-center p-4"
          >
            <div className="text-center space-y-6 max-w-sm">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                  borderRadius: ["20%", "50%", "20%"]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/30"
              >
                <Key className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-xl font-serif font-bold text-gray-100">Decrypting Capsule...</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Verifying target trigger condition & authenticating digital security locks for your emotional sanctuary.
              </p>
            </div>
          </motion.div>
        )}

        {/* Seal Form */}
        {isSealing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-3xl space-y-4 overflow-hidden"
          >
            <h4 className="text-sm font-serif font-bold text-pink-400">Lock Capsule Messages</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Capsule Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. For when you finish JEE exam"
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Sealing Trigger Type</label>
                  <select
                    value={unlockType}
                    onChange={(e) => setUnlockType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#141225] border border-white/10 text-xs text-gray-300"
                  >
                    <option value="after_jee">After JEE Mains Advanced Exam</option>
                    <option value="chatgro_milestone">After ChatGro MRR Milestone</option>
                    <option value="hasmol_launch">When Hasmol launches</option>
                    <option value="one_month">Exactly 1 month from today</option>
                    <option value="one_year">1 Year Anniversary</option>
                    <option value="custom">Custom Condition</option>
                  </select>
                </div>
              </div>

              {['custom', 'chatgro_milestone', 'hasmol_launch'].includes(unlockType) && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Condition Specification Detail</label>
                  <input
                    type="text"
                    value={triggerText}
                    onChange={(e) => setTriggerText(e.target.value)}
                    placeholder="e.g. ChatGro reaches $25,000 monthly recurring revenue (MRR)"
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Write Your Deep Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your comforting message, secrets, or surprise notes here..."
                  rows={4}
                  className="w-full p-4 rounded-xl glass-input text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsSealing(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSealCapsule}
                  className="px-5 py-2 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Seal messages
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Locked / Unlocked Capsules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="time-capsules-grid">
          {capsules.length === 0 ? (
            <div className="md:col-span-2 text-center py-12 text-xs text-gray-500 font-light italic">
              No time capsules created yet.
            </div>
          ) : (
            capsules.map((c) => (
              <div
                key={c.id}
                className={`glass-panel p-6 rounded-3xl space-y-4 relative overflow-hidden transition-all border ${
                  c.unlocked
                    ? 'border-emerald-500/20 bg-gradient-to-tr from-emerald-950/10 to-transparent'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Lock icon indicators */}
                <div className="absolute top-4 right-4 text-gray-400">
                  {c.unlocked ? (
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <Unlock className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-2 bg-white/5 rounded-xl text-pink-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-indigo-400 block">
                    Created {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <h4 className="text-md font-serif font-bold text-gray-200">{c.title}</h4>
                </div>

                <div className="p-3 bg-white/3 rounded-2xl text-xs border border-white/5 flex gap-2 items-start">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-gray-400 font-light leading-relaxed">
                    {getTriggerLabel(c.unlockType, c.unlockTriggerText)}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {c.unlocked ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-white/2 rounded-2xl border border-white/5 text-xs text-gray-300 italic leading-relaxed font-serif"
                    >
                      "{c.message}"
                    </motion.div>
                  ) : (
                    <div className="pt-2 flex flex-col gap-2">
                      <div className="p-3 bg-pink-500/5 rounded-xl text-[10px] text-pink-400/80 flex items-center gap-1.5 border border-pink-500/10">
                        <AlertCircle className="w-4 h-4 text-pink-400 shrink-0" />
                        <span>Sealed completely. Locked securely.</span>
                      </div>

                      <button
                        onClick={() => handleTriggerUnlock(c.id)}
                        className="w-full py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
                      >
                        Try Decrypting Lock
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
