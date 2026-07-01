/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, ShieldCheck, Copy, ArrowRight, LogOut, Check } from 'lucide-react';

interface PairingPortalProps {
  user: any;
  onPairSuccess: (user: any) => void;
  onLogout: () => void;
}

const AVATAR_EMOJIS: Record<string, string> = {
  lotus_zen: '🌸',
  forest_ranger: '🌲',
  space_cadet: '🚀',
  tech_builder: '💻',
  golden_heart: '💛'
};

export default function PairingPortal({ user, onPairSuccess, onLogout }: PairingPortalProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(user.inviteCode);
  const [enteredCode, setEnteredCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    setError('');
    setLoading(true);
    try {
      const resp = await fetch('/api/pair/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': user.id
        }
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }
      setInviteCode(data.code);
    } catch (err: any) {
      setError(err.message || 'Error generating connection code');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode.trim()) return;

    setError('');
    setLoading(true);
    try {
      const resp = await fetch('/api/pair/join', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': user.id
        },
        body: JSON.stringify({ inviteCode: enteredCode.trim() })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Pairing failed. Please verify code.');
      }
      setSuccess(true);
      setTimeout(() => {
        onPairSuccess(data.user);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error connecting to partner');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0915] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans" id="pairing-portal">
      {/* Background ambient radial glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-500/5 animate-ambient-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 animate-ambient-2 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* User Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between border border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-white/10"
              style={{ backgroundColor: `${user.color}20`, borderColor: user.color }}
            >
              {AVATAR_EMOJIS[user.avatar] || '🌸'}
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">My Profile</span>
              <h3 className="text-lg font-serif font-bold text-white leading-tight">{user.nickname}</h3>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-all font-mono py-1.5 px-3 bg-white/5 hover:bg-red-500/10 rounded-xl cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>

        {/* Pairing Choices */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-6 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold">Connect with Your Partner</h2>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
              HEMO is an exclusive secure space for exactly two people. Connect permanently with your companion to begin syncing your updates.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center justify-center gap-2 animate-bounce">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Hearts Connected! Syncing secure sanctuary...</span>
            </div>
          )}

          {!success && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-left">
              {/* Option A: Generate Code */}
              <div className="p-5 rounded-2xl bg-white/3 border border-white/5 space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono uppercase text-pink-400 font-bold">Choice A</div>
                  <h4 className="text-sm font-bold text-white">Share Your Code</h4>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    Generate an invitation code and share it securely with your companion.
                  </p>
                </div>

                {inviteCode ? (
                  <div className="space-y-2 pt-2">
                    <div className="p-3 bg-black/50 border border-white/5 rounded-xl flex items-center justify-between">
                      <span className="font-mono font-bold text-md text-pink-400 tracking-widest">{inviteCode}</span>
                      <button 
                        onClick={copyToClipboard}
                        className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Copy Code"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 block text-center">
                      {copied ? 'Copied code!' : 'Waiting for partner to enter code...'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCode}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 hover:border-pink-500/40 rounded-xl font-medium text-xs transition-all cursor-pointer"
                  >
                    {loading ? 'Generating...' : 'Generate Invite Code'}
                  </button>
                )}
              </div>

              {/* Option B: Enter Code */}
              <form onSubmit={handleJoinCode} className="p-5 rounded-2xl bg-white/3 border border-white/5 space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono uppercase text-indigo-400 font-bold">Choice B</div>
                  <h4 className="text-sm font-bold text-white">Enter Partner's Code</h4>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    Paste the invitation code received from your partner to link accounts.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <input
                    type="text"
                    required
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="e.g. HM-A3D2"
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/5 focus:border-indigo-500/50 rounded-xl text-center text-xs text-white font-mono tracking-widest uppercase placeholder-gray-700 focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading || !enteredCode.trim()}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <span>Connect Partner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>

        <div className="flex justify-center items-center gap-2 text-[11px] text-gray-500 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Both accounts will sync automatically once paired.</span>
        </div>
      </div>
    </div>
  );
}
