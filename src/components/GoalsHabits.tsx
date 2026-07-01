/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle2, Circle, Plus, Zap, Star, Trophy, Calculator, BookOpen, Code, Layers, Percent } from 'lucide-react';
import { Goal, Habit } from '../types';

interface GoalsHabitsProps {
  goals: Goal[];
  habits: Habit[];
  onAddGoal: (goal: Goal) => void;
  onToggleGoal: (id: string) => void;
  onToggleHabit: (id: string) => void;
  partnerName: string;
}

export default function GoalsHabits({ goals, habits, onAddGoal, onToggleGoal, onToggleHabit, partnerName }: GoalsHabitsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'goals' | 'habits' | 'study' | 'work'>('goals');
  
  // Create goal states
  const [goalText, setGoalText] = useState('');
  const [goalScope, setGoalScope] = useState<'today' | 'weekly' | 'monthly'>('today');
  const [goalCategory, setGoalCategory] = useState<'general' | 'study' | 'work' | 'dream'>('general');

  // Study Dashboard States
  const [subjects, setSubjects] = useState([
    { name: 'Physics Mechanics', progress: 85, hours: 24 },
    { name: 'Coordinate Geometry', progress: 60, hours: 18 },
    { name: 'Organic Chemistry Reactions', progress: 40, hours: 12 },
  ]);
  const [newSubject, setNewSubject] = useState('');

  // Work Dashboard States
  const [projects, setProjects] = useState([
    { name: 'ChatGro PostgreSQL Indexing', status: 'Deployed', value: '45% load reduction' },
    { name: 'ChatGro Self-Serve Tier Billing', status: 'In Progress', value: '75% complete' },
    { name: 'Hasmol Vector Brand Guideline', status: 'Review', value: 'Ready for client sync' },
  ]);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateGoal = () => {
    if (!goalText.trim()) return;
    const newG: Goal = {
      id: `g_${Date.now()}`,
      text: goalText.trim(),
      scope: goalScope,
      category: goalCategory,
      completed: false,
      timestamp: new Date().toISOString()
    };
    onAddGoal(newG);
    setGoalText('');
  };

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      setSubjects([...subjects, { name: newSubject.trim(), progress: 10, hours: 0 }]);
      setNewSubject('');
    }
  };

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      setProjects([...projects, { name: newProjectName.trim(), status: 'Initiated', value: '0% progress' }]);
      setNewProjectName('');
    }
  };

  const filteredGoals = (scope: 'today' | 'weekly' | 'monthly') => {
    return goals.filter(g => g.scope === scope);
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Horizontal pill navigation */}
      <div className="flex gap-2 bg-white/3 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'goals', label: 'Core Goals', icon: Target },
          { id: 'habits', label: 'Habit Streams', icon: Zap },
          { id: 'study', label: 'Study Sprint', icon: BookOpen },
          { id: 'work', label: 'Work & Revenue', icon: Code },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id as any)}
              className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === item.id
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Core Goals Dashboard */}
        {activeSubTab === 'goals' && (
          <motion.div
            key="goals-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Left: Goals form & stats (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Panel */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-serif font-bold text-gray-200">Growth Progress</h3>
                  <span className="font-mono text-xs text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full font-bold">
                    {progressPercent}% Completed
                  </span>
                </div>
                
                {/* SVG Progress Arc representation */}
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-400 font-light">
                  <span>{completedCount} accomplished</span>
                  <span>{totalCount - completedCount} pending today</span>
                </div>
              </div>

              {/* Add Goal Panel */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="text-md font-serif font-bold">New Goal Objective</h3>
                
                <div className="space-y-3.5">
                  <input
                    type="text"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    placeholder="Solve 20 Mains chemistry problems..."
                    className="w-full p-3.5 rounded-xl glass-input text-sm text-white"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Timeline Scope</label>
                      <select
                        value={goalScope}
                        onChange={(e) => setGoalScope(e.target.value as any)}
                        className="w-full p-2.5 rounded-lg bg-[#141225] border border-white/10 text-xs text-gray-300"
                      >
                        <option value="today">Today</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Category</label>
                      <select
                        value={goalCategory}
                        onChange={(e) => setGoalCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-lg bg-[#141225] border border-white/10 text-xs text-gray-300"
                      >
                        <option value="general">General</option>
                        <option value="study">Study</option>
                        <option value="work">Startup / Work</option>
                        <option value="dream">Big Dream</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateGoal}
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl text-xs tracking-wider hover:bg-gray-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Secure Objective
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Goals lists scoped (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {(['today', 'weekly', 'monthly'] as const).map((scope) => {
                const list = filteredGoals(scope);
                return (
                  <div key={scope} className="glass-panel p-6 rounded-3xl space-y-3">
                    <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">
                      {scope} Objectives
                    </h4>
                    
                    <div className="space-y-2">
                      {list.length === 0 ? (
                        <p className="text-xs text-gray-500 italic py-2">No goals configured for this scope.</p>
                      ) : (
                        list.map((g) => (
                          <div
                            key={g.id}
                            onClick={() => onToggleGoal(g.id)}
                            className="p-3.5 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 flex items-center justify-between gap-3 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-3">
                              {g.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-500 hover:text-pink-400 shrink-0" />
                              )}
                              <span className={`text-sm font-light leading-snug ${g.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                {g.text}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono tracking-widest uppercase bg-white/5 px-2 py-0.5 rounded text-gray-400 shrink-0">
                              {g.category}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Habits Dashboard */}
        {activeSubTab === 'habits' && (
          <motion.div
            key="habits-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel p-6 rounded-3xl space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-serif font-bold">Daily Habit Streams</h3>
                <p className="text-xs text-gray-400 font-light">Keep your streaks glowing to reflect continuous devotion.</p>
              </div>
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((h) => (
                <div
                  key={h.id}
                  onClick={() => onToggleHabit(h.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    h.completedToday
                      ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30'
                      : 'bg-white/2 border-white/5 hover:bg-white/4'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      h.completedToday ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-gray-400'
                    }`}>
                      {h.name.includes('Math') || h.name.includes('MCQ') ? <Calculator className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${h.completedToday ? 'text-emerald-300' : 'text-gray-200'}`}>
                        {h.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono">Streak: {h.streak} days consecutive</p>
                    </div>
                  </div>

                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                    h.completedToday
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-gray-600 hover:border-pink-500'
                  }`}>
                    {h.completedToday && <CheckCircle2 className="w-5 h-5" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dedicated Study Dashboard */}
        {activeSubTab === 'study' && (
          <motion.div
            key="study-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Subject revision tracker */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-serif font-bold">JEE Subjects & Revisions</h3>
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>

              <div className="space-y-4">
                {subjects.map((sub, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-200 font-light">{sub.name}</span>
                      <span className="font-mono text-gray-400">{sub.hours}h logged • {sub.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Inorganic Chemistry Part 2"
                  className="flex-1 p-2.5 rounded-xl glass-input text-xs text-white"
                />
                <button
                  onClick={handleAddSubject}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Track
                </button>
              </div>
            </div>

            {/* Preparation Metrics */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-md font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                  Target: JEE Advanced CSE
                </h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Focus tracker estimates you are on track with <b className="text-white">82%</b> of syllabus revision milestones. Maintain daily math sprints (+20 problems) to build consistent velocity.
                </p>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block uppercase">Total Study Hours</span>
                    <span className="text-2xl font-mono text-indigo-300 font-bold">148.5 hrs</span>
                  </div>
                  <Percent className="w-8 h-8 text-indigo-400 opacity-40" />
                </div>
              </div>

              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block text-center pt-4">
                Continuous improvement secures IIT success
              </span>
            </div>
          </motion.div>
        )}

        {/* Dedicated Work Dashboard */}
        {activeSubTab === 'work' && (
          <motion.div
            key="work-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Startup Pipeline projects */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-serif font-bold">ChatGro Pipelines & Brand</h3>
                <Code className="w-5 h-5 text-pink-400" />
              </div>

              <div className="space-y-3">
                {projects.map((p, index) => (
                  <div key={index} className="p-3 rounded-xl bg-white/2 border border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-semibold text-gray-200">{p.name}</h4>
                      <p className="text-[10px] text-gray-500">{p.value}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                      p.status === 'Deployed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Hasmol global trademark draft"
                  className="flex-1 p-2.5 rounded-xl glass-input text-xs text-white"
                />
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Create
                </button>
              </div>
            </div>

            {/* ChatGro Business Stats */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-md font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                  ChatGro SAAS Revenue
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10 text-center">
                    <span className="text-[9px] text-gray-400 font-mono block uppercase">Monthly Revenue</span>
                    <span className="text-xl font-mono text-pink-300 font-bold">$12,400</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                    <span className="text-[9px] text-gray-400 font-mono block uppercase">Target MRR</span>
                    <span className="text-xl font-mono text-indigo-300 font-bold">$25,000</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Billing architecture refactor is <b className="text-white">75% complete</b>. Once deployed, self-serve onboarding will go live globally, targeting 180+ waitlisted client corporations.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>Active clients: 48 companies</span>
                <span>Active waitlist: 184</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
