/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Award, Star, TrendingUp, Sparkles, Map, Gift, Check, Plus, Trash2 } from 'lucide-react';
import { DreamCard } from '../types';

interface DreamBoardProps {
  dreams: DreamCard[];
  onAddDream: (dream: DreamCard) => void;
  onRemoveDream: (id: string) => void;
}

export default function DreamBoard({ dreams, onAddDream, onRemoveDream }: DreamBoardProps) {
  const [activeBoardTab, setActiveBoardTab] = useState<'cards' | 'bucket'>('cards');
  
  // Custom Dream creation
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'countdown' | 'revenue' | 'milestone' | 'savings' | 'vision' | 'bucket'>('vision');
  const [value, setValue] = useState('');
  const [progress, setProgress] = useState(50);
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Bucket list items (with visual checkpoints)
  const [bucketList, setBucketList] = useState([
    { id: 'b1', text: 'Trek the blooming Valley of Flowers in Uttarakhand', done: false },
    { id: 'b2', text: 'Rent a silent cabin in Coorg for 1 full coding/study retreat', done: true },
    { id: 'b3', text: 'Launch ChatGro to $30K MRR and donate 10% to tech education', done: false },
    { id: 'b4', text: 'Co-publish a paper on advanced coordinate systems & algorithms', done: false },
  ]);
  const [newBucketText, setNewBucketText] = useState('');

  const handleAddDreamCard = () => {
    if (!title.trim() || !value.trim()) return;
    const newCard: DreamCard = {
      id: `dream_${Date.now()}`,
      title: title.trim(),
      type,
      value: value.trim(),
      progress: ['revenue', 'countdown', 'savings'].includes(type) ? progress : undefined,
      description: description.trim() || 'A shared companion aspiration.',
    };
    onAddDream(newCard);
    
    // reset states
    setTitle('');
    setValue('');
    setDescription('');
    setIsAdding(false);
  };

  const handleAddBucketItem = () => {
    if (newBucketText.trim()) {
      setBucketList([...bucketList, { id: `bucket_${Date.now()}`, text: newBucketText.trim(), done: false }]);
      setNewBucketText('');
    }
  };

  const handleToggleBucketItem = (id: string) => {
    setBucketList(bucketList.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <div className="space-y-6">
      {/* Board toggle tab headers */}
      <div className="flex gap-4 border-b border-white/5 pb-2 justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveBoardTab('cards')}
            className={`pb-2 text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeBoardTab === 'cards' ? 'text-pink-400 border-b border-pink-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Milestones & Vision Board
          </button>
          <button
            onClick={() => setActiveBoardTab('bucket')}
            className={`pb-2 text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeBoardTab === 'bucket' ? 'text-pink-400 border-b border-pink-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            The Bucket List
          </button>
        </div>

        {activeBoardTab === 'cards' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="py-1.5 px-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Pin Dream
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Creating / Pinning Dream Card Dialog Panel */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-3xl space-y-4 overflow-hidden border-pink-500/20"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-serif font-bold text-pink-400">Pin a New Vision to the Board</h4>
              <button onClick={() => setIsAdding(false)} className="text-xs text-gray-500 hover:text-white">Cancel</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Vision Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ChatGro Revenue Milestone"
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Board Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#141225] border border-white/10 text-xs text-gray-300"
                >
                  <option value="vision">Vision Card</option>
                  <option value="countdown">Countdown Clock</option>
                  <option value="revenue">Revenue Goal</option>
                  <option value="milestone">Brand Milestone</option>
                  <option value="savings">Savings Target</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Display Value</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 94 days left, $15,000 MRR, Trademark Completed"
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>

              {['revenue', 'countdown', 'savings'].includes(type) && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Current Progression %</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full mt-2 accent-pink-500"
                  />
                  <span className="text-[10px] font-mono text-gray-400 block text-right mt-1">{progress}%</span>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Core Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Scaling client company acquisitions and launching standard Stripe auto-billing."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleAddDreamCard}
              className="py-2.5 px-6 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 transition-all cursor-pointer"
            >
              Pin Vision Card
            </button>
          </motion.div>
        )}

        {/* Vision cards Grid */}
        {activeBoardTab === 'cards' && (
          <motion.div
            key="cards-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {dreams.map((d) => (
              <div
                key={d.id}
                className="glass-panel p-6 rounded-3xl space-y-4 relative overflow-hidden group border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
              >
                {/* Visual watermark icon based on type */}
                <div className="absolute top-2 right-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  {d.type === 'countdown' && <Calendar className="w-16 h-16" />}
                  {d.type === 'revenue' && <TrendingUp className="w-16 h-16" />}
                  {d.type === 'milestone' && <Award className="w-16 h-16" />}
                  {d.type === 'vision' && <Star className="w-16 h-16" />}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md font-bold">
                      {d.type}
                    </span>
                    <button
                      onClick={() => onRemoveDream(d.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-lg font-serif font-bold text-gray-100 group-hover:text-pink-400 transition-colors">
                      {d.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-light mt-1.5 leading-relaxed">{d.description}</p>
                  </div>
                </div>

                {/* Progress bar represent for math metrics */}
                {d.progress !== undefined ? (
                  <div className="space-y-1.5 pt-4">
                    <div className="flex justify-between text-xs font-mono text-gray-400">
                      <span>Value: <b className="text-white font-mono">{d.value}</b></span>
                      <span>{d.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-indigo-600 h-full rounded-full"
                        style={{ width: `${d.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 flex justify-between items-center text-xs text-gray-400 border-t border-white/5">
                    <span>Target Achievement:</span>
                    <span className="font-mono text-white font-bold">{d.value}</span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Travel & Experience Bucket List view */}
        {activeBoardTab === 'bucket' && (
          <motion.div
            key="bucket-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel p-6 rounded-3xl space-y-4"
          >
            <div>
              <h3 className="text-lg font-serif font-bold">The Adventure Ledger</h3>
              <p className="text-xs text-gray-400 font-light">Experiences, shared achievements, and silent goals to pursue hand-in-hand.</p>
            </div>

            <div className="space-y-2.5">
              {bucketList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleBucketItem(item.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    item.done
                      ? 'bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border-pink-500/20'
                      : 'bg-white/2 border-white/5 hover:bg-white/4'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      item.done ? 'bg-pink-500 border-pink-400 text-white' : 'border-gray-600'
                    }`}>
                      {item.done && <Check className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm font-light ${item.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {item.text}
                    </span>
                  </div>

                  <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500">
                    {item.done ? 'Accomplished' : 'Aspirational'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <input
                type="text"
                value={newBucketText}
                onChange={(e) => setNewBucketText(e.target.value)}
                placeholder="e.g. Ride motorcycles across Ladakh highways..."
                className="flex-1 p-3.5 rounded-xl glass-input text-xs text-white"
              />
              <button
                onClick={handleAddBucketItem}
                className="px-5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 transition-all cursor-pointer"
              >
                Pin Adventure
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
