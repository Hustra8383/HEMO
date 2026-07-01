/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Heart, MessageSquare, Award, Clock, Star, Plus, Trash2, Quote } from 'lucide-react';
import { RelationshipMilestone } from '../types';

interface RelationshipProps {
  milestones: RelationshipMilestone[];
  startDate: string;
  onAddMilestone: (m: RelationshipMilestone) => void;
  onRemoveMilestone: (id: string) => void;
}

export default function Relationship({ milestones, startDate, onAddMilestone, onRemoveMilestone }: RelationshipProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'quotes'>('timeline');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'anniversary' | 'special_date' | 'milestone' | 'quote'>('milestone');
  const [isAdding, setIsAdding] = useState(false);

  // Dedicated private shared quotes database
  const [sharedQuotes, setSharedQuotes] = useState([
    { id: 'q1', text: 'Success is sweetest when built together, step by focused step.', author: 'Shukra', timestamp: '2025-01-14' },
    { id: 'q2', text: 'You tackle mechanics and chemistry, I index databases. We dominate our domains.', author: 'Hansika', timestamp: '2025-03-22' },
  ]);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');

  const handleAddMilestone = () => {
    if (!title.trim() || !date.trim()) return;
    const newM: RelationshipMilestone = {
      id: `ms_${Date.now()}`,
      title: title.trim(),
      date,
      description: description.trim() || 'A magical shared memory.',
      type,
    };
    onAddMilestone(newM);
    
    // Reset States
    setTitle('');
    setDate('');
    setDescription('');
    setIsAdding(false);
  };

  const handleAddQuote = () => {
    if (newQuoteText.trim()) {
      setSharedQuotes([...sharedQuotes, {
        id: `q_${Date.now()}`,
        text: newQuoteText.trim(),
        author: newQuoteAuthor.trim() || 'Anonymous',
        timestamp: new Date().toISOString().split('T')[0]
      }]);
      setNewQuoteText('');
      setNewQuoteAuthor('');
    }
  };

  // Calculate Days count since start date
  const calculateDays = (startStr: string) => {
    try {
      const start = new Date(startStr);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  const daysConnected = calculateDays(startDate);

  return (
    <div className="space-y-6">
      {/* Header Stat Board */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-pink-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-1 text-center md:text-left z-10">
          <h3 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
            Days of Devotion
          </h3>
          <p className="text-xs text-gray-400 font-light">Continuously growing and supporting our dreams since {startDate}</p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="p-3 bg-pink-500/10 rounded-2xl">
            <Heart className="w-8 h-8 text-pink-400 fill-pink-500/30 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-3xl font-mono text-white font-bold tracking-tight">{daysConnected}</span>
            <span className="text-[10px] text-gray-400 block font-mono uppercase">Days Beautifully Aligned</span>
          </div>
        </div>
      </div>

      {/* Navigation subtab headers */}
      <div className="flex gap-4 border-b border-white/5 pb-2 justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timeline' ? 'text-pink-400 border-b border-pink-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Milestone Ledger
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-2 text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quotes' ? 'text-pink-400 border-b border-pink-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Quote className="w-4 h-4" />
            Shared Companion Quotes
          </button>
        </div>

        {activeTab === 'timeline' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="py-1.5 px-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Milestone
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* New Milestone Form */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-3xl space-y-4 overflow-hidden border-indigo-500/20"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-serif font-bold text-pink-400">Save a Special Memory Moment</h4>
              <button onClick={() => setIsAdding(false)} className="text-xs text-gray-500 hover:text-white">Cancel</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Moment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rainy trip to Kodaikanal"
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Date Occurred</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#141225] border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Moment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#141225] border border-white/10 text-xs text-gray-300"
                  >
                    <option value="milestone">Milestone</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="special_date">Special Date</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Core Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Walked around the misty lake holding warm chocolate cups."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleAddMilestone}
              className="py-2.5 px-5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 transition-all cursor-pointer"
            >
              Pin Milestone
            </button>
          </motion.div>
        )}

        {/* Milestone Vertical Ledger representation */}
        {activeTab === 'timeline' && (
          <motion.div
            key="timeline-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {milestones.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">No companion timeline milestones pinned yet.</p>
            ) : (
              milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="glass-panel p-5 rounded-3xl border border-white/5 flex gap-4 relative overflow-hidden group hover:border-white/10 transition-all"
                >
                  <div className="p-3.5 bg-pink-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-pink-400" />
                  </div>

                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-gray-400 block uppercase">
                        {new Date(m.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => onRemoveMilestone(m.id)}
                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-md font-serif font-bold text-gray-100">{m.title}</h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Private Quotes Board */}
        {activeTab === 'quotes' && (
          <motion.div
            key="quotes-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Display list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedQuotes.map((q) => (
                <div key={q.id} className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[140px] border border-white/5">
                  <Quote className="w-8 h-8 text-indigo-400 opacity-10 absolute top-3 left-3" />
                  <p className="text-sm text-gray-200 italic font-serif leading-relaxed font-light z-10 pt-2">
                    "{q.text}"
                  </p>
                  
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span>Logged by: <b>{q.author}</b></span>
                    <span>{q.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick addition form */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">Log Shared Quote Words</h4>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  placeholder="e.g. Coding represents mathematics in execution..."
                  className="flex-1 p-3.5 rounded-xl glass-input text-xs text-white focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={newQuoteAuthor}
                  onChange={(e) => setNewQuoteAuthor(e.target.value)}
                  placeholder="Author..."
                  className="w-full md:w-32 p-3.5 rounded-xl glass-input text-xs text-white"
                />
                <button
                  onClick={handleAddQuote}
                  className="py-3 px-6 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Save Quote
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
