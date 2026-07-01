/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Activity, Sunset, Moon, Coffee, Sparkles, LogIn, Award } from 'lucide-react';
export interface DailyCheckIn {
  id: string;
  statusText: string;
  emoji: string;
  timestamp: string;
  userId: string;
}

interface DailyCheckInsProps {
  checkIns: DailyCheckIn[];
  onAddCheckIn: (statusText: string, emoji: string) => void;
  partnerName: string;
}

const TEMPLATE_STATUSES = [
  { text: 'Starting morning study sprint 📚☕', emoji: '📚' },
  { text: 'JEE Math problem sheet complete! 📐🔥', emoji: '📐' },
  { text: 'Refactored server database indexing 💻', emoji: '💻' },
  { text: 'Taking a 15 min water break 💧🚶', emoji: '💧' },
  { text: 'Feeling tired, taking a quick power nap 😴', emoji: '😴' },
  { text: 'Going to bed, sweet dreams! 🌌🌙', emoji: '🌙' },
];

export default function DailyCheckIns({ checkIns, onAddCheckIn, partnerName }: DailyCheckInsProps) {
  const [customText, setCustomText] = useState('');
  
  const handleCheckIn = (text: string, emoji: string) => {
    onAddCheckIn(text, emoji);
    setCustomText('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-2">
        <h3 className="text-lg font-serif font-bold">Daily Life Streams</h3>
        <p className="text-xs text-gray-400 font-light">Broadcast small logs throughout the day so your person feels connected to your hustle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Col: Log a moment (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">Quick Presences</h4>
            
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_STATUSES.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCheckIn(t.text, t.emoji)}
                  className="p-3 bg-white/3 border border-white/5 hover:bg-white/10 hover:border-white/15 rounded-2xl text-left text-xs font-light transition-all flex flex-col justify-between gap-1"
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-gray-300 leading-tight line-clamp-2">{t.text.split(' ')[0]}...</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-pink-400 font-bold block">Custom Broadcast</h4>
            
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Setting up Stripe auto-billing... 🚀"
              className="w-full p-3.5 rounded-xl glass-input text-xs text-white"
            />
            
            <button
              onClick={() => handleCheckIn(customText.trim() || 'Hustling hard!', '✨')}
              disabled={!customText.trim()}
              className="w-full py-3 bg-white text-black font-semibold rounded-xl text-xs tracking-wider hover:bg-gray-100 disabled:opacity-40 transition-all cursor-pointer"
            >
              Broadcast moment
            </button>
          </div>
        </div>

        {/* Right Col: Combined timeline stream (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-3xl space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-pink-400 font-bold block">Today's Presence Feed</h4>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {checkIns.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">No broadcast check-ins today.</p>
            ) : (
              checkIns.map((item) => (
                <div key={item.id} className="p-3.5 bg-white/2 border border-white/5 rounded-2xl flex items-start gap-3 text-xs justify-between">
                  <div className="flex gap-3">
                    <span className="text-2xl mt-0.5 shrink-0">{item.emoji}</span>
                    <div className="space-y-1">
                      <span className="font-semibold text-gray-200 block">
                        {item.userId === 'user_a' ? 'You' : partnerName}
                      </span>
                      <p className="text-gray-400 font-light leading-relaxed">{item.statusText}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-gray-500 tracking-wider">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
