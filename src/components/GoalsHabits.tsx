/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Zap, Flame, Trophy, Star, BookOpen, Code, Heart, Coffee,
  Dumbbell, Music, Sparkles, Smile, Compass, Clock, Check, Trash2, Edit2, Plus, X, Bell, Palette, CheckCircle2, Circle
} from 'lucide-react';
import { Goal, Habit } from '../types';

interface GoalsHabitsProps {
  goals: Goal[];
  habits: Habit[];
  onUpdateGoals: (goals: Goal[]) => void;
  onUpdateHabits: (habits: Habit[]) => void;
  partnerName: string;
}

const ICON_LIST = [
  { name: 'Target', icon: Target },
  { name: 'Zap', icon: Zap },
  { name: 'Flame', icon: Flame },
  { name: 'Trophy', icon: Trophy },
  { name: 'Star', icon: Star },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Code', icon: Code },
  { name: 'Heart', icon: Heart },
  { name: 'Coffee', icon: Coffee },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Music', icon: Music },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Smile', icon: Smile },
  { name: 'Compass', icon: Compass },
  { name: 'Clock', icon: Clock }
];

const COLOR_DEFS = [
  { name: 'Rose', hex: '#f43f5e', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', hoverBg: 'hover:bg-rose-500/20' },
  { name: 'Amber', hex: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hoverBg: 'hover:bg-amber-500/20' },
  { name: 'Emerald', hex: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hoverBg: 'hover:bg-emerald-500/20' },
  { name: 'Sky', hex: '#0ea5e9', text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', hoverBg: 'hover:bg-sky-500/20' },
  { name: 'Indigo', hex: '#6366f1', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', hoverBg: 'hover:bg-indigo-500/20' },
  { name: 'Violet', hex: '#8b5cf6', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', hoverBg: 'hover:bg-violet-500/20' },
  { name: 'Pink', hex: '#ec4899', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', hoverBg: 'hover:bg-pink-500/20' },
  { name: 'Orange', hex: '#f97316', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', hoverBg: 'hover:bg-orange-500/20' }
];

export default function GoalsHabits({ goals = [], habits = [], onUpdateGoals, onUpdateHabits, partnerName }: GoalsHabitsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'goals' | 'habits'>('goals');

  // Creation States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'goal' | 'habit'>('goal');
  
  // Form fields
  const [titleText, setTitleText] = useState('');
  const [goalScope, setGoalScope] = useState<'today' | 'weekly' | 'monthly'>('today');
  const [goalCategory, setGoalCategory] = useState<'general' | 'study' | 'work' | 'dream'>('general');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState('#6366f1'); // Indigo default
  const [reminderTime, setReminderTime] = useState('');

  // Editing States
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setTitleText('');
    setGoalScope('today');
    setGoalCategory('general');
    setSelectedIcon('Target');
    setSelectedColor('#6366f1');
    setReminderTime('');
    setEditingId(null);
  };

  const handleOpenAddGoal = () => {
    setModalType('goal');
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenAddHabit = () => {
    setModalType('habit');
    resetForm();
    setSelectedIcon('Zap');
    setShowAddModal(true);
  };

  const handleOpenEditGoal = (goal: Goal) => {
    setModalType('goal');
    setEditingId(goal.id);
    setTitleText(goal.text);
    setGoalScope(goal.scope);
    setGoalCategory(goal.category);
    setSelectedIcon(goal.icon || 'Target');
    setSelectedColor(goal.color || '#6366f1');
    setReminderTime(goal.reminderTime || '');
    setShowAddModal(true);
  };

  const handleOpenEditHabit = (habit: Habit) => {
    setModalType('habit');
    setEditingId(habit.id);
    setTitleText(habit.name);
    setSelectedIcon(habit.icon || 'Zap');
    setSelectedColor(habit.color || '#6366f1');
    setReminderTime(habit.reminderTime || '');
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!titleText.trim()) return;

    if (modalType === 'goal') {
      if (editingId) {
        // Edit existing
        const updated = goals.map(g => g.id === editingId ? {
          ...g,
          text: titleText.trim(),
          scope: goalScope,
          category: goalCategory,
          icon: selectedIcon,
          color: selectedColor,
          reminderTime: reminderTime || undefined
        } : g);
        onUpdateGoals(updated);
      } else {
        // Create new
        const newGoal: Goal = {
          id: `g_${Date.now()}`,
          text: titleText.trim(),
          scope: goalScope,
          category: goalCategory,
          completed: false,
          timestamp: new Date().toISOString(),
          icon: selectedIcon,
          color: selectedColor,
          reminderTime: reminderTime || undefined
        };
        onUpdateGoals([newGoal, ...goals]);
      }
    } else {
      if (editingId) {
        // Edit existing habit
        const updated = habits.map(h => h.id === editingId ? {
          ...h,
          name: titleText.trim(),
          icon: selectedIcon,
          color: selectedColor,
          reminderTime: reminderTime || undefined
        } : h);
        onUpdateHabits(updated);
      } else {
        // Create new habit
        const newHabit: Habit = {
          id: `h_${Date.now()}`,
          name: titleText.trim(),
          icon: selectedIcon,
          streak: 0,
          completedToday: false,
          history: [],
          color: selectedColor,
          reminderTime: reminderTime || undefined
        };
        onUpdateHabits([newHabit, ...habits]);
      }
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteGoal = (id: string) => {
    onUpdateGoals(goals.filter(g => g.id !== id));
  };

  const handleDeleteHabit = (id: string) => {
    onUpdateHabits(habits.filter(h => h.id !== id));
  };

  const handleToggleGoal = (id: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    onUpdateGoals(updated);
  };

  const handleToggleHabit = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id === id) {
        const currentlyCompleted = h.completedToday;
        let newHistory = [...h.history];
        let newStreak = h.streak;

        if (currentlyCompleted) {
          // Uncompleting habit
          newHistory = newHistory.filter(date => date !== todayStr);
          newStreak = Math.max(0, newStreak - 1);
        } else {
          // Completing habit
          if (!newHistory.includes(todayStr)) {
            newHistory.push(todayStr);
          }
          newStreak = newStreak + 1;
        }

        return {
          ...h,
          completedToday: !currentlyCompleted,
          streak: newStreak,
          history: newHistory
        };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  const getIconComponent = (iconName: string) => {
    const found = ICON_LIST.find(i => i.name === iconName);
    return found ? found.icon : Target;
  };

  const getColorDetails = (colorHex: string) => {
    return COLOR_DEFS.find(c => c.hex === colorHex) || COLOR_DEFS[4]; // Default to Indigo
  };

  return (
    <div className="space-y-6" id="goals-habits-container">
      {/* Tab bar + Action button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 bg-white/3 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSubTab('goals')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'goals'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            Custom Goals ({goals.length})
          </button>
          <button
            onClick={() => setActiveSubTab('habits')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'habits'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            Custom Habits ({habits.length})
          </button>
        </div>

        <button
          onClick={activeSubTab === 'goals' ? handleOpenAddGoal : handleOpenAddHabit}
          className="py-2.5 px-4 rounded-xl bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 font-semibold text-xs tracking-wide transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Custom {activeSubTab === 'goals' ? 'Goal' : 'Habit'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Goals Subtab */}
        {activeSubTab === 'goals' && (
          <motion.div
            key="goals-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Overall Progress Panel */}
            {goals.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-radial-gradient from-indigo-950/10 to-transparent flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-lg font-serif font-bold">Goal Pursuit Progress</h3>
                  <p className="text-xs text-gray-400 font-light">
                    Track daily, weekly, and monthly milestones together. Maintain momentum!
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-mono">COMPLETED</span>
                    <span className="text-2xl font-mono text-indigo-300 font-bold">
                      {goals.filter(g => g.completed).length} / {goals.length}
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-indigo-400" />
                  </div>
                </div>
              </div>
            )}

            {goals.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center space-y-4">
                <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-md font-semibold">No goals set yet</h4>
                  <p className="text-xs text-gray-400 font-light mt-1">
                    Set shared or private intentions to stay aligned. Click "Create Custom Goal" above to start.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Scopes */}
                {(['today', 'weekly', 'monthly'] as const).map((scope) => {
                  const scopeGoals = goals.filter(g => g.scope === scope);
                  return (
                    <div key={scope} className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 flex flex-col justify-between min-h-[300px]">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
                            {scope === 'today' ? 'Daily Targets' : scope === 'weekly' ? 'Weekly Sprints' : 'Monthly Visions'}
                          </span>
                          <span className="text-[10px] bg-white/5 text-gray-400 font-mono py-0.5 px-2 rounded-full">
                            {scopeGoals.length}
                          </span>
                        </div>

                        {scopeGoals.length === 0 ? (
                          <p className="text-xs text-gray-500 italic py-6 text-center">Empty shelf</p>
                        ) : (
                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {scopeGoals.map((g) => {
                              const colorDef = getColorDetails(g.color || '#6366f1');
                              const GoalIcon = getIconComponent(g.icon || 'Target');
                              return (
                                <div
                                  key={g.id}
                                  className="p-3.5 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all flex items-start gap-3 relative group"
                                >
                                  <button
                                    onClick={() => handleToggleGoal(g.id)}
                                    className="pt-0.5 text-gray-400 hover:text-white transition-all cursor-pointer shrink-0"
                                  >
                                    {g.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs leading-normal font-light ${g.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                      {g.text}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border ${colorDef.text} ${colorDef.bg} ${colorDef.border}`}>
                                        <GoalIcon className="w-2.5 h-2.5" />
                                        {g.category}
                                      </span>
                                      {g.reminderTime && (
                                        <span className="inline-flex items-center gap-1 text-[9px] text-gray-500 font-mono">
                                          <Bell className="w-2.5 h-2.5" />
                                          {g.reminderTime}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                                    <button
                                      onClick={() => handleOpenEditGoal(g)}
                                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGoal(g.id)}
                                      className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Habits Subtab */}
        {activeSubTab === 'habits' && (
          <motion.div
            key="habits-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {habits.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center space-y-4">
                <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-md font-semibold">No habits tracked yet</h4>
                  <p className="text-xs text-gray-400 font-light mt-1">
                    Establish daily patterns together. Choose colors, icons, and configure notifications.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {habits.map((h) => {
                  const colorDef = getColorDetails(h.color || '#6366f1');
                  const HabitIcon = getIconComponent(h.icon || 'Zap');
                  return (
                    <div
                      key={h.id}
                      className="glass-panel p-5 rounded-3xl border border-white/5 flex items-start justify-between gap-4 hover:border-white/10 transition-all group relative"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Icon circle */}
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${colorDef.text} ${colorDef.bg} ${colorDef.border}`}>
                          <HabitIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <h4 className="text-sm font-semibold text-gray-100 truncate">{h.name}</h4>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full text-[10px] font-mono">
                              <Flame className="w-3 h-3 fill-pink-500/10" />
                              Streak: {h.streak} days
                            </span>

                            {h.reminderTime && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded-full">
                                <Bell className="w-3 h-3 text-indigo-400" />
                                {h.reminderTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Complete status */}
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleToggleHabit(h.id)}
                          className={`py-2 px-3 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                            h.completedToday
                              ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-300'
                              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <Check className={`w-4 h-4 ${h.completedToday ? 'text-emerald-400 scale-110' : 'text-gray-500'}`} />
                          {h.completedToday ? 'Completed' : 'Complete'}
                        </button>
                      </div>

                      {/* Hover action bar */}
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                        <button
                          onClick={() => handleOpenEditHabit(h)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(h.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creation / Edit Modal Dialog */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 p-6 rounded-3xl shadow-2xl space-y-5 z-10"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-md font-serif font-bold text-gray-100">
                  {editingId ? 'Edit' : 'Create'} Custom {modalType === 'goal' ? 'Goal' : 'Habit'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Title / Task Description</label>
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    placeholder={modalType === 'goal' ? 'e.g. Finish reading calculus syllabus chapter 4' : 'e.g. Drink 3L of water'}
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                {modalType === 'goal' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Time Scope</label>
                      <select
                        value={goalScope}
                        onChange={(e) => setGoalScope(e.target.value as any)}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200"
                      >
                        <option value="today">Daily Target</option>
                        <option value="weekly">Weekly Sprint</option>
                        <option value="monthly">Monthly Vision</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Category</label>
                      <select
                        value={goalCategory}
                        onChange={(e) => setGoalCategory(e.target.value as any)}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200"
                      >
                        <option value="general">General</option>
                        <option value="study">Study</option>
                        <option value="work">Work</option>
                        <option value="dream">Dream</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Custom Color Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    Color Palette
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {COLOR_DEFS.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setSelectedColor(col.hex)}
                        className="w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative"
                        style={{
                          backgroundColor: col.hex,
                          borderColor: selectedColor === col.hex ? '#ffffff' : 'transparent'
                        }}
                        title={col.name}
                      >
                        {selectedColor === col.hex && (
                          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Icon Picker */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Custom Icon symbol
                  </label>
                  <div className="grid grid-cols-5 gap-2 max-h-[100px] overflow-y-auto p-1 border border-white/5 rounded-xl bg-white/2">
                    {ICON_LIST.map((ic) => {
                      const IconComp = ic.icon;
                      const isSelected = selectedIcon === ic.name;
                      return (
                        <button
                          key={ic.name}
                          onClick={() => setSelectedIcon(ic.name)}
                          className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'
                          }`}
                          title={ic.name}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reminder Setting */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 animate-pulse" />
                    Daily Reminder Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white text-center font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs tracking-wide transition-all cursor-pointer"
                >
                  {editingId ? 'Save Edits' : 'Create Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
