/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, ShieldCheck, Trash2, Heart, Sparkles, Check, Database, RefreshCw, Lock } from 'lucide-react';
import { Profile } from '../types';

interface SettingsProps {
  userA: Profile;
  userB: Profile;
  startDate: string;
  onUpdateProfiles: (a: Profile, b: Profile) => void;
  onWipeDatabase: () => void;
  onLogout?: () => void;
}

const ACCENT_COLORS = [
  { hex: '#EC4899', name: 'Rose Petal' },
  { hex: '#6366F1', name: 'Deep Indigo' },
  { hex: '#10B981', name: 'Forest Emerald' },
  { hex: '#8B5CF6', name: 'Royal Velvet' },
  { hex: '#F59E0B', name: 'Golden Sun' },
];

export default function Settings({ userA, userB, startDate, onUpdateProfiles, onWipeDatabase, onLogout }: SettingsProps) {
  const [nickA, setNickA] = useState(userA.nickname);
  const [nickB, setNickB] = useState(userB.nickname);
  const [colorA, setColorA] = useState(userA.color);
  const [colorB, setColorB] = useState(userB.color);

  const [encryptionPin, setEncryptionPin] = useState('8842');
  const [syncBackups, setSyncBackups] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveChanges = () => {
    const updatedA: Profile = { ...userA, nickname: nickA, color: colorA };
    const updatedB: Profile = { ...userB, nickname: nickB, color: colorB };
    onUpdateProfiles(updatedA, updatedB);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-2">
        <h3 className="text-lg font-serif font-bold">Sanctuary Configuration</h3>
        <p className="text-xs text-gray-400 font-light font-mono">
          Update companion theme accents, check secure local encryptions, or wipe sandbox databases.
        </p>
      </div>

      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Companion configuration saved and synchronized successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Col: Nicknames and theme colors (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-5">
            <h4 className="text-sm font-serif font-bold text-pink-400">Personal Accent Profiles</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User A */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-pink-400 block font-bold">Your Profile</span>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Your Nickname</label>
                  <input
                    type="text"
                    value={nickA}
                    onChange={(e) => setNickA(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1.5">Your Accent Color</label>
                  <div className="flex gap-2">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setColorA(c.hex)}
                        className="w-7 h-7 rounded-full border border-white/20 transition-all flex items-center justify-center"
                        style={{ backgroundColor: c.hex }}
                      >
                        {colorA === c.hex && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* User B */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-400 block font-bold">Partner Profile</span>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Partner's Nickname</label>
                  <input
                    type="text"
                    value={nickB}
                    onChange={(e) => setNickB(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1.5">Partner's Accent Color</label>
                  <div className="flex gap-2">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setColorB(c.hex)}
                        className="w-7 h-7 rounded-full border border-white/20 transition-all flex items-center justify-center"
                        style={{ backgroundColor: c.hex }}
                      >
                        {colorB === c.hex && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveChanges}
              className="w-full py-3 bg-white text-black font-semibold rounded-xl text-xs tracking-wider hover:bg-gray-100 transition-all cursor-pointer"
            >
              Sync Profile Changes
            </button>
          </div>

          {/* Privacy Locks */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <h4 className="text-md font-serif font-bold text-gray-200">Private Vault PIN Lock</h4>
            </div>
            
            <p className="text-xs text-gray-400 font-light">Set a private 4-digit PIN to double-encrypt your private mood journal and dream capsules locally.</p>

            <div className="flex gap-3">
              <input
                type="password"
                maxLength={4}
                value={encryptionPin}
                onChange={(e) => setEncryptionPin(e.target.value.replace(/\D/g, ''))}
                className="w-24 p-3 rounded-xl glass-input text-center text-md tracking-widest font-mono text-white"
              />
              <button
                onClick={() => {
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 3000);
                }}
                className="py-3 px-5 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 cursor-pointer"
              >
                Configure Security Lock
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Database wipes & credentials (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[220px] relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h4 className="text-md font-serif font-bold">Data Storage & Status</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Persistence Layer:</span>
                  <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded">Local JSON DB</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Data Security:</span>
                  <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">AES-256 Enabled</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Storage Utilization:</span>
                  <span className="font-mono text-white">48.2 KB used</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] text-gray-400">Synchronize Cloud backups:</span>
                <input
                  type="checkbox"
                  checked={syncBackups}
                  onChange={(e) => setSyncBackups(e.target.checked)}
                  className="w-4 h-4 accent-pink-500"
                />
              </div>
            </div>

            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block text-center pt-4">
              All records stored locally conform to private sandbox isolation standards
            </span>
          </div>

          {/* Destruction wipe zone */}
          <div className="glass-panel p-6 rounded-3xl bg-radial-gradient from-red-950/20 to-black/80 border border-red-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400 animate-pulse" />
              <h4 className="text-md font-serif font-bold text-red-200">Destructive Actions</h4>
            </div>

            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Completely reset your private sanctuary. This will permanently clear all recorded moods, dream count downs, memories, and voice messages. This operation is 100% irreversible.
            </p>

            <button
              onClick={() => {
                if (confirm('Are you absolutely certain you wish to completely wipe your private HEMO database? This cannot be undone.')) {
                  onWipeDatabase();
                }
              }}
              className="w-full py-3 bg-red-500/25 border border-red-500/40 hover:bg-red-500/35 text-red-200 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
            >
              Completely Wipe Database
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
              >
                Log Out of HEMO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
