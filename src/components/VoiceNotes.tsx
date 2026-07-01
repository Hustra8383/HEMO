/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Play, Pause, Trash2, Volume2, Calendar, Award, Sparkles } from 'lucide-react';
import { VoiceNote } from '../types';

interface VoiceNotesProps {
  voiceNotes: VoiceNote[];
  onAddVoiceNote: (vn: VoiceNote) => void;
  onRemoveVoiceNote: (id: string) => void;
  partnerName: string;
}

export default function VoiceNotes({ voiceNotes, onAddVoiceNote, onRemoveVoiceNote, partnerName }: VoiceNotesProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);

  // Waveform animation intervals
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playOscRef = useRef<OscillatorNode | null>(null);
  const playCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Generate static visual waveform bars for records
    const bars = Array.from({ length: 24 }, () => Math.floor(Math.random() * 85) + 15);
    setWaveformBars(bars);
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      setRecordDuration(0);
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  const handleStartRecord = () => {
    setIsRecording(true);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    
    // Create new voice note
    const newNote: VoiceNote = {
      id: `vn_${Date.now()}`,
      duration: recordDuration || 14, // fallback duration
      transcript: 'Direct morning audio memo whispered safely.',
      timestamp: new Date().toISOString(),
      isFavorite: false,
      uploaderId: 'user_a',
    };
    onAddVoiceNote(newNote);
  };

  const handlePlayVoiceNote = (vn: VoiceNote) => {
    if (playingId === vn.id) {
      handleStopPlayback();
      return;
    }

    handleStopPlayback();
    setPlayingId(vn.id);

    // Synthesize premium futuristic audio note beep using Web Audio API
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      playCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime); // standard melodious E note
      
      // Pitch slide effect
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + vn.duration);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + vn.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      playOscRef.current = osc;

      // Automatically clear playing state when voice note completes
      setTimeout(() => {
        setPlayingId(null);
      }, vn.duration * 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopPlayback = () => {
    setPlayingId(null);
    if (playOscRef.current) {
      try {
        playOscRef.current.stop();
      } catch (err) {}
      playOscRef.current = null;
    }
    if (playCtxRef.current) {
      playCtxRef.current.close();
      playCtxRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-2">
        <h3 className="text-lg font-serif font-bold">Voice Memos</h3>
        <p className="text-xs text-gray-400 font-light">
          Share quick, whispered voice notes to start their morning or soothe their focus sprints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Recording Module (2 cols) */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[300px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.05)_0%,_transparent_70%)] pointer-events-none" />

          <div>
            <h4 className="text-xs uppercase tracking-widest text-pink-400 font-bold block mb-1">Daily Recorder</h4>
            <p className="text-xs text-gray-400 font-light">Record up to 60s of comforting voice devotion.</p>
          </div>

          {/* Animated Waveform recording feedback */}
          <div className="my-6 flex justify-center items-center gap-1.5 h-16">
            {isRecording ? (
              waveformBars.map((bar, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: [bar * 0.4, bar, bar * 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.05 }}
                  className="w-1 bg-pink-500 rounded-full"
                  style={{ height: `${bar * 0.6}px` }}
                />
              ))
            ) : (
              <div className="text-center text-xs text-gray-500 italic flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-gray-600 animate-pulse" />
                <span>Microphone ready. Standing by.</span>
              </div>
            )}
          </div>

          <div className="space-y-3.5 pt-4">
            {isRecording ? (
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-pink-400 animate-pulse">Recording: {formatDuration(recordDuration)}</span>
                <button
                  onClick={handleStopRecord}
                  className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full transition-all cursor-pointer"
                >
                  <Square className="w-5 h-5 fill-red-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartRecord}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl text-xs font-semibold hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Capture Whisper Note
              </button>
            )}
          </div>
        </div>

        {/* Right: Library of notes (3 cols) */}
        <div className="md:col-span-3 glass-panel p-6 rounded-3xl space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">Library Logs</h4>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {voiceNotes.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">No voice notes saved today.</p>
            ) : (
              voiceNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={() => handlePlayVoiceNote(note)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        playingId === note.id
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {playingId === note.id ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-gray-400 translate-x-0.5" />
                      )}
                    </button>
                    
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                        <span>From: <b>{note.uploaderId === 'user_a' ? 'You' : partnerName}</b></span>
                        <span>{new Date(note.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                      
                      {/* Simulated wave strip */}
                      <div className="flex gap-0.5 items-center h-4 pt-1 w-full opacity-60">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-0.5 rounded-full ${playingId === note.id ? 'bg-pink-500' : 'bg-gray-600'}`}
                            style={{ height: `${(Math.sin(i * 0.5) + 1.2) * 6}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-400">{note.duration}s</span>
                    <button
                      onClick={() => onRemoveVoiceNote(note.id)}
                      className="text-gray-600 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
