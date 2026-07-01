/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap, AlertTriangle, MessageSquare, Volume2, Sparkles, Smile, ShieldAlert } from 'lucide-react';

interface NeedYouProps {
  partnerName: string;
  onSendAlert: (type: string, message: string) => void;
  onComfortTrigger: () => void;
}

export default function NeedYou({ partnerName, onSendAlert, onComfortTrigger }: NeedYouProps) {
  const [adviceQuery, setAdviceQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // sound buzzer
  const playBuzzer = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // standard melodious A note
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3); // warning slide

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setTimeout(() => osc.stop(), 500);

      onSendAlert('emergency', `${partnerName} sounded the heart distress buzzer! Check in immediately.`);
      triggerSuccess('Distress buzzer echoed safely to partner device!');
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const sendBooster = () => {
    onSendAlert('booster', `An urgent motivation booster has been sent! You've got this! ⚡`);
    triggerSuccess('Motivation booster pushed to partner Home Screen!');
  };

  const sendAdvice = () => {
    if (!adviceQuery.trim()) return;
    onSendAlert('advice', `Urgent Workspace Query: "${adviceQuery.trim()}"`);
    setAdviceQuery('');
    triggerSuccess('Urgent question broadcasted safely!');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-2">
        <h3 className="text-lg font-serif font-bold">I Need You</h3>
        <p className="text-xs text-gray-400 font-light font-mono">
          DIRECT SANCTUARY ACCESS. Send instant signals, request focus answers, or sound the gentle heart buzzer.
        </p>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="need-you-controls">
        {/* Card 1: Virtual Hug */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[220px] border border-pink-500/10 hover:border-pink-500/20 transition-all relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-pink-500/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform" />

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-pink-500/10 rounded-2xl">
                <Heart className="w-6 h-6 text-pink-400 fill-pink-500/30" />
              </div>
              <span className="text-[9px] font-mono uppercase bg-pink-500/10 px-2 py-0.5 rounded text-pink-400">Tactile Signal</span>
            </div>

            <div>
              <h4 className="text-md font-serif font-bold text-gray-100">Send an Instant Virtual Hug</h4>
              <p className="text-xs text-gray-400 font-light mt-1">Triggers a beautiful cascading screen explosion of warm hearts on their dashboard.</p>
            </div>
          </div>

          <button
            onClick={onComfortTrigger}
            className="w-full py-3 bg-pink-500/25 border border-pink-500/40 hover:bg-pink-500/35 text-pink-200 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
          >
            Squeeze Virtual Hug 🫂
          </button>
        </div>

        {/* Card 2: Motivation Booster */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[220px] border border-indigo-500/10 hover:border-indigo-500/20 transition-all relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-indigo-500/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform" />

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-[9px] font-mono uppercase bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400">Energy Boost</span>
            </div>

            <div>
              <h4 className="text-md font-serif font-bold text-gray-100">Push Motivation Booster</h4>
              <p className="text-xs text-gray-400 font-light mt-1">Deliver a high-velocity notification alert banner directly onto their work screen.</p>
            </div>
          </div>

          <button
            onClick={sendBooster}
            className="w-full py-3 bg-indigo-500/25 border border-indigo-500/40 hover:bg-indigo-500/35 text-indigo-200 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
          >
            Push Energy ⚡
          </button>
        </div>

        {/* Card 3: Ask for Advice / Help */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h4 className="text-md font-serif font-bold text-gray-200">Urgent Project / Study Query</h4>
          </div>

          <p className="text-xs text-gray-400 font-light">Stuck on a tricky math equation, or debugging a SAAS backend error? Type it below for urgent priority review.</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={adviceQuery}
              onChange={(e) => setAdviceQuery(e.target.value)}
              placeholder="e.g. Help, getting a PostgreSQL connection pool timeout error..."
              className="flex-1 p-3.5 rounded-xl glass-input text-xs text-white"
            />
            <button
              onClick={sendAdvice}
              disabled={!adviceQuery.trim()}
              className="px-5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 disabled:opacity-40 transition-all cursor-pointer"
            >
              Signal Query
            </button>
          </div>
        </div>

        {/* Card 4: Sound Warning Distress Buzzer */}
        <div className="glass-panel p-6 rounded-3xl bg-radial-gradient from-amber-950/20 to-black/80 border border-amber-500/20 md:col-span-2 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-amber-500" />
          
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h4 className="text-md font-serif font-bold text-gray-100">Heart Distress Buzzer</h4>
            </div>
            <p className="text-xs text-gray-400 font-light max-w-md">
              Feeling completely overwhelmed or extremely anxious? Sound this buzzer to trigger a gentle synthesized device ping.
            </p>
          </div>

          <button
            onClick={playBuzzer}
            className="py-3 px-6 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-200 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            Echo Buzzer 🚨
          </button>
        </div>
      </div>
    </div>
  );
}
