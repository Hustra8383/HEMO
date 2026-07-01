/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Pause, RefreshCw, Volume2, Image as ImageIcon, Heart, Sparkles, Smile } from 'lucide-react';
import { Memory } from '../types';

interface CalmMeDownProps {
  partnerName: string;
  memories: Memory[];
  onComfortTrigger: () => void;
}

const SOUNDS = [
  { id: 'rain', label: 'Zen Rain 🌧️', frequency: 120 },
  { id: 'space', label: 'Cosmic Drone 🌌', frequency: 75 },
  { id: 'ocean', label: 'Tidal Waves 🌊', frequency: 60 },
  { id: 'forest', label: 'Binaural Harmony 🧘', frequency: 220 },
];

const AFFIRMATIONS = [
  "You are capable of doing extremely hard things.",
  "Your breath is steady. Your mind is quiet. Your heart is safe.",
  "No single exam, milestone, or build define your complete destiny.",
  "Your dedication is brilliant. But you deserve to rest and recover.",
  "Step by step. One task, one breath, one heartbeat at a time.",
  "You do not have to carry everything alone. I am holding your hand right here.",
];

export default function CalmMeDown({ partnerName, memories, onComfortTrigger }: CalmMeDownProps) {
  // Breathing state: 'inhale' | 'hold' | 'exhale'
  const [breathState, setBreathState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [meditationTime, setMeditationTime] = useState(300); // 5 min default
  const [isMeditationActive, setIsMeditationActive] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Slide index for memories
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    // Rotation of affirmations every 10 seconds
    const interval = setInterval(() => {
      setAffirmationIdx((prev) => (prev + 1) % AFFIRMATIONS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Breathing cycle logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMeditationActive) {
      timer = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev === 1) {
            if (breathState === 'inhale') {
              setBreathState('hold');
              return 4; // Hold for 4
            } else if (breathState === 'hold') {
              setBreathState('exhale');
              return 4; // Exhale for 4
            } else {
              setBreathState('inhale');
              return 4; // Inhale for 4
            }
          }
          return prev - 1;
        });

        setMeditationTime((prev) => {
          if (prev <= 1) {
            handleStopMeditation();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMeditationActive, breathState]);

  const handleStartMeditation = () => {
    setIsMeditationActive(true);
    setBreathState('inhale');
    setBreathingTimer(4);
    // Start ambient synth if not already playing
    if (!activeSound) {
      handlePlaySound('rain');
    }
  };

  const handleStopMeditation = () => {
    setIsMeditationActive(false);
    handleStopSound();
  };

  const handlePlaySound = (soundId: string) => {
    handleStopSound();
    setActiveSound(soundId);

    try {
      const soundDef = SOUNDS.find((s) => s.id === soundId)!;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(soundDef.frequency, ctx.currentTime);

      // Low frequency modulators for binaural relaxing beat effect
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      modulator.frequency.value = 1.5; // low frequency wave pulsing
      modGain.gain.value = 5;

      modulator.connect(modGain);
      modGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.08, ctx.currentTime); // keep volume subtle
      osc.connect(gain);
      gain.connect(ctx.destination);

      modulator.start();
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.error('Audio synthesis failed', e);
    }
  };

  const handleStopSound = () => {
    setActiveSound(null);
    if (oscRef.current) {
      try {
        oscRef.current.stop();
      } catch (err) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Memory slideshow logic
  const handleNextSlide = () => {
    if (memories.length > 0) {
      setSlideIdx((prev) => (prev + 1) % memories.length);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Col: Breathing sphere core (3 cols) */}
      <div className="lg:col-span-3 glass-panel p-8 rounded-3xl flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden">
        {/* Dynamic breathing background gradient glow */}
        <div
          className={`absolute inset-0 transition-all duration-[4000ms] pointer-events-none ${
            isMeditationActive
              ? breathState === 'inhale'
                ? 'bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.15)_0%,_transparent_70%)]'
                : breathState === 'hold'
                ? 'bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15)_0%,_transparent_70%)]'
                : 'bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]'
              : 'bg-transparent'
          }`}
        />

        <div className="w-full flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-serif font-bold text-gray-200">Breathing Sanctuary</span>
          </div>
          <span className="font-mono text-sm text-gray-400 tracking-wider">
            {formatTimer(meditationTime)}
          </span>
        </div>

        {/* The Pulsing Breathing Sphere */}
        <div className="my-10 flex flex-col items-center justify-center relative">
          <div
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-[4000ms] relative z-10 ${
              isMeditationActive
                ? breathState === 'inhale'
                  ? 'breathing-bubble border-4 border-pink-400 bg-pink-500/10'
                  : breathState === 'hold'
                  ? 'scale-105 border-4 border-purple-400 bg-purple-500/10'
                  : 'scale-90 border-4 border-emerald-400 bg-emerald-500/10'
                : 'border-2 border-white/10 bg-white/2'
            }`}
          >
            {isMeditationActive ? (
              <div className="text-center">
                <span className="text-xs font-mono uppercase tracking-widest text-white block mb-1">
                  {breathState}
                </span>
                <span className="text-3xl font-mono text-white font-semibold">
                  {breathingTimer}s
                </span>
              </div>
            ) : (
              <div className="text-center px-4">
                <span className="text-xs text-gray-400 font-light block mb-2">Ready to align?</span>
                <button
                  onClick={handleStartMeditation}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg mx-auto cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-black translate-x-0.5" />
                </button>
              </div>
            )}
          </div>

          {/* Breathing Text Prompts */}
          <AnimatePresence mode="wait">
            {isMeditationActive && (
              <motion.p
                key={breathState}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-md font-serif font-light text-gray-300 mt-6 z-10"
              >
                {breathState === 'inhale' && "Slowly fill your lungs with peace..."}
                {breathState === 'hold' && "Hold the light inside your mind..."}
                {breathState === 'exhale' && "Let all tension fade into the universe..."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation & Controls */}
        <div className="w-full flex justify-between items-center z-10 pt-4 border-t border-white/5">
          <div className="flex gap-2">
            {[300, 600].map((t) => (
              <button
                key={t}
                onClick={() => setMeditationTime(t)}
                disabled={isMeditationActive}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all disabled:opacity-35 ${
                  meditationTime === t
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/2 border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                {t / 60} Min
              </button>
            ))}
          </div>

          {isMeditationActive && (
            <button
              onClick={handleStopMeditation}
              className="py-1.5 px-4 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-200 text-xs rounded-xl font-medium tracking-wide cursor-pointer"
            >
              Stop Meditation
            </button>
          )}
        </div>
      </div>

      {/* Right Col: Sounds, Affirmations & Memory Slides (2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Ambient Synthesized Sound triggers */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-md font-serif font-bold">Natural Soundscapes</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SOUNDS.map((snd) => (
              <button
                key={snd.id}
                onClick={() => {
                  if (activeSound === snd.id) {
                    handleStopSound();
                  } else {
                    handlePlaySound(snd.id);
                  }
                }}
                className={`p-3 rounded-2xl text-xs font-medium border text-left transition-all flex items-center justify-between ${
                  activeSound === snd.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-md'
                    : 'bg-white/2 border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                <span>{snd.label}</span>
                {activeSound === snd.id && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />}
              </button>
            ))}
          </div>
        </div>

        {/* Positive Affirmations & Comfort messages */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-md font-serif font-bold">Encouragements</h3>
          </div>

          <div className="min-h-[80px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={affirmationIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="text-sm font-light leading-relaxed text-gray-300 italic font-serif"
              >
                "{AFFIRMATIONS[affirmationIdx]}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Quick Hug action triggering full screen overlay */}
          <button
            onClick={onComfortTrigger}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border border-pink-500/30 hover:border-pink-500/50 hover:bg-pink-500/30 text-pink-200 rounded-xl font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400/20" />
            I'm here. We'll get through today.
          </button>
        </div>

        {/* Memory mini slide-show */}
        <div className="glass-panel p-6 rounded-3xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-serif font-bold text-gray-300">Anchored Memories</h3>
            </div>
            {memories.length > 0 && (
              <button
                onClick={handleNextSlide}
                className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
              >
                Next Memory
              </button>
            )}
          </div>

          {memories.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-4">No companion memories saved to slider yet.</p>
          ) : (
            <div className="relative rounded-2xl overflow-hidden h-32 group">
              <img
                src={memories[slideIdx].url}
                alt="Affirmed"
                className="w-full h-full object-cover filter brightness-[0.6] transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                <p className="text-[11px] text-gray-300 line-clamp-2 font-serif font-light">
                  "{memories[slideIdx].caption}"
                </p>
                <span className="text-[8px] font-mono text-gray-500 mt-1 uppercase">
                  {new Date(memories[slideIdx].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
