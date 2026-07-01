/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, ShieldCheck, User, Lock, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';

interface AuthPortalProps {
  onAuthSuccess: (userId: string, user: any) => void;
}

const COLORS = [
  { hex: '#EC4899', name: 'Rose Petal' },
  { hex: '#6366F1', name: 'Deep Indigo' },
  { hex: '#10B981', name: 'Forest Emerald' },
  { hex: '#8B5CF6', name: 'Royal Velvet' },
  { hex: '#F59E0B', name: 'Golden Sun' },
];

const AVATARS = [
  { id: 'lotus_zen', label: 'Lotus Zen', emoji: '🌸' },
  { id: 'forest_ranger', label: 'Forest Ranger', emoji: '🌲' },
  { id: 'space_cadet', label: 'Space Cadet', emoji: '🚀' },
  { id: 'tech_builder', label: 'Tech Builder', emoji: '💻' },
  { id: 'golden_heart', label: 'Golden Heart', emoji: '💛' },
];

export default function AuthPortal({ onAuthSuccess }: AuthPortalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration specific fields
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('lotus_zen');
  const [color, setColor] = useState('#EC4899');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (!isLogin && !nickname.trim()) {
      setError('Please provide a nickname');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const bodyObj = isLogin 
        ? { username: username.trim().toLowerCase(), password } 
        : { 
            username: username.trim().toLowerCase(), 
            password, 
            nickname: nickname.trim(), 
            avatar, 
            color 
          };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Save user ID to localStorage and notify parent
      localStorage.setItem('hemo_userId', data.userId);
      onAuthSuccess(data.userId, data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0915] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans" id="auth-portal">
      {/* Background ambient radial glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-500/5 animate-ambient-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 animate-ambient-2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <Heart className="w-7 h-7 text-white fill-white/20 animate-pulse" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 font-serif font-bold">HEMO</span>
          </h1>
          <p className="text-gray-400 text-xs font-light uppercase tracking-widest max-w-xs mx-auto">
            The private companion sanctuary for ambitious focus
          </p>
        </div>

        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex border-b border-white/5 pb-4 mb-6 gap-4">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 pb-2 font-serif text-md font-bold text-center transition-all border-b-2 cursor-pointer ${
                isLogin ? 'border-pink-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 pb-2 font-serif text-md font-bold text-center transition-all border-b-2 cursor-pointer ${
                !isLogin ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Join Premium
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5 font-bold">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. hansika99"
                  className="w-full pl-9 pr-4 py-3 bg-white/3 border border-white/5 focus:border-pink-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5 font-bold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 bg-white/3 border border-white/5 focus:border-pink-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden pt-2"
                >
                  <div className="border-t border-white/5 my-2" />
                  
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5 font-bold">Your Nickname</label>
                    <input
                      type="text"
                      required={!isLogin}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g. Hansika"
                      className="w-full px-4 py-3 bg-white/3 border border-white/5 focus:border-indigo-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5 font-bold">Choose Your Avatar</label>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATARS.map((av) => (
                        <button
                          type="button"
                          key={av.id}
                          onClick={() => setAvatar(av.id)}
                          className={`p-2 rounded-xl text-xl flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer ${
                            avatar === av.id ? 'bg-indigo-500/20 border border-indigo-500' : 'bg-white/3 border border-transparent'
                          }`}
                        >
                          <span>{av.emoji}</span>
                          <span className="text-[8px] text-gray-500 mt-0.5 tracking-tighter">{av.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5 font-bold">Your Accent Color</label>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button
                          type="button"
                          key={c.hex}
                          onClick={() => setColor(c.hex)}
                          className="w-8 h-8 rounded-full transition-all hover:scale-110 relative flex items-center justify-center border border-white/10 cursor-pointer"
                          style={{ backgroundColor: c.hex }}
                        >
                          {color === c.hex && (
                            <Check className="w-4 h-4 text-white filter drop-shadow-md" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl font-medium tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer mt-4 ${
                isLogin 
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-600 hover:shadow-pink-500/10' 
                  : 'bg-gradient-to-r from-indigo-500 to-pink-600 hover:shadow-indigo-500/10'
              }`}
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Join Premium & Register'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <div className="text-center mt-6 text-xs text-gray-500 font-light max-w-xs mx-auto space-y-2">
          <div className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
            <span>End-to-End Encrypted Workspace</span>
          </div>
          <p>Each paired companion set has an completely isolated database environment.</p>
        </div>
      </div>
    </div>
  );
}
