/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Clock, Sliders, BellOff, Volume2, Shield, AlertTriangle } from 'lucide-react';
import { LiveStatus, ActivityType } from '../types';

interface StatusFocusProps {
  status: LiveStatus;
  partnerName: string;
  onUpdate: (updatedStatus: LiveStatus) => void;
}

const ACTIVITIES: { type: ActivityType; label: string; emoji: string }[] = [
  { type: 'studying', label: 'Studying', emoji: '📚' },
  { type: 'working', label: 'Working', emoji: '💼' },
  { type: 'eating', label: 'Eating', emoji: '🍲' },
  { type: 'sleeping', label: 'Sleeping', emoji: '🌙' },
  { type: 'relaxing', label: 'Relaxing', emoji: '😌' },
  { type: 'travelling', label: 'Travelling', emoji: '✈️' },
  { type: 'busy', label: 'Busy', emoji: '🔴' },
  { type: 'free', label: 'Free', emoji: '🟢' },
];

export default function StatusFocus({ status, partnerName, onUpdate }: StatusFocusProps) {
  const [activity, setActivity] = useState<ActivityType>(status.activity);
  const [customStatus, setCustomStatus] = useState(status.customStatus);
  const [estimatedFinishTime, setEstimatedFinishTime] = useState(status.estimatedFinishTime);
  const [focusMode, setFocusMode] = useState(status.focusMode);
  const [silentNotifications, setSilentNotifications] = useState(status.silentNotifications);

  // Focus Timer States (e.g. 25, 45, 60 mins)
  const [timerDuration, setTimerDuration] = useState(45); // default 45 mins
  const [timeLeft, setTimeLeft] = useState(timerDuration * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sync with parent state changes
    setActivity(status.activity);
    setCustomStatus(status.customStatus);
    setEstimatedFinishTime(status.estimatedFinishTime);
    setFocusMode(status.focusMode);
    setSilentNotifications(status.silentNotifications);
  }, [status]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      handleStopTimer();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const handleStartTimer = () => {
    setTimeLeft(timerDuration * 60);
    setIsTimerRunning(true);
    setFocusMode(true);
    setSilentNotifications(true);
    
    // Automatically determine estimated finish hour
    const finish = new Date();
    finish.setMinutes(finish.getMinutes() + timerDuration);
    const finishStr = `${String(finish.getHours()).padStart(2, '0')}:${String(finish.getMinutes()).padStart(2, '0')}`;
    setEstimatedFinishTime(finishStr);

    onUpdate({
      activity: 'studying',
      customStatus: 'Currently Focusing & Building Dreams 🚀',
      estimatedFinishTime: finishStr,
      focusMode: true,
      silentNotifications: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setFocusMode(false);
    setSilentNotifications(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    onUpdate({
      activity: 'free',
      customStatus: 'Finished focus sprint! Free to chat.',
      estimatedFinishTime: '',
      focusMode: false,
      silentNotifications: false,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveStandardStatus = () => {
    onUpdate({
      activity,
      customStatus,
      estimatedFinishTime,
      focusMode,
      silentNotifications,
      updatedAt: new Date().toISOString(),
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Active Focus Mode View */}
      <AnimatePresence mode="wait">
        {focusMode ? (
          <motion.div
            key="active-focus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-3xl bg-radial-gradient from-purple-950/40 via-black/50 to-black/80 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.1)_0%,_transparent_65%)] pointer-events-none" />
            <span className="text-[10px] font-mono tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase mb-4 inline-block">
              Currently Focusing
            </span>

            <h3 className="text-xl font-serif font-semibold text-gray-200 mb-1">Building Our Dreams</h3>
            <p className="text-xs text-gray-400 font-light mb-6">
              Notifications silenced. {partnerName} sees: <span className="text-pink-400">"Don't disturb. Currently building dreams."</span>
            </p>

            {/* Countdown circular style */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-44 h-44 flex items-center justify-center rounded-full bg-white/2 border-4 border-purple-500/20 shadow-inner">
                <div className="absolute inset-2 rounded-full border border-dashed border-purple-500/30 animate-spin" style={{ animationDuration: '30s' }} />
                <span className="text-4xl font-mono tracking-tight font-medium text-purple-300">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleStopTimer}
                className="py-2.5 px-6 rounded-xl bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-200 font-medium text-xs tracking-wider transition-all cursor-pointer"
              >
                End Focus Session
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="normal-status"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left: Quick Status updater */}
            <div className="glass-panel p-6 rounded-3xl space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-serif font-bold">Update Current Presence</h3>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-2 font-medium">What are you doing?</label>
                <div className="grid grid-cols-4 gap-2">
                  {ACTIVITIES.map((act) => (
                    <button
                      key={act.type}
                      onClick={() => setActivity(act.type)}
                      className={`p-2.5 rounded-xl transition-all text-sm flex flex-col items-center justify-center gap-1 ${
                        activity === act.type
                          ? 'bg-pink-500/20 border border-pink-500/40 text-white'
                          : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{act.emoji}</span>
                      <span className="text-[9px] font-light truncate w-full text-center">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1.5 font-medium">Custom Status Detail</label>
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="e.g. Solving Chemistry Module 3..."
                    className="w-full p-3 rounded-xl glass-input text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1.5 font-medium">Est. Finish Hour</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={estimatedFinishTime}
                        onChange={(e) => setEstimatedFinishTime(e.target.value)}
                        placeholder="e.g. 19:30"
                        className="w-full p-3 pl-9 rounded-xl glass-input text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      onClick={() => setSilentNotifications(!silentNotifications)}
                      className={`p-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-2 ${
                        silentNotifications
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <BellOff className="w-4 h-4" />
                      {silentNotifications ? 'Muted' : 'Unmuted'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveStandardStatus}
                className="w-full py-3 bg-white text-black font-semibold rounded-xl text-xs tracking-wider hover:bg-gray-100 transition-all cursor-pointer"
              >
                Broadcast Active Status
              </button>
            </div>

            {/* Right: Premium Focus Mode setup */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                <Shield className="w-20 h-20 text-purple-500" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-serif font-bold">Deep Focus Mode</h3>
                </div>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Lock into single-task deep learning or project building. Silent all incoming pings, notify {partnerName}, and showcase real-time commitment to our dream timelines.
                </p>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-2 font-medium">Select Focus Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 45, 60].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => {
                          setTimerDuration(dur);
                          setTimeLeft(dur * 60);
                        }}
                        className={`py-2.5 rounded-xl text-xs font-mono font-medium border transition-all ${
                          timerDuration === dur
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {dur} Min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleStartTimer}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs tracking-wider shadow-lg shadow-purple-500/15 transition-all cursor-pointer"
                >
                  Initiate Dream Sprint
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
