/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Laugh, Plus, Trash2, Heart, Award, Sparkles } from 'lucide-react';
import { Meme } from '../types';

interface MemeCornerProps {
  memes: Meme[];
  onAddMeme: (meme: Meme) => void;
  onReactMeme: (id: string) => void;
  onRemoveMeme: (id: string) => void;
  partnerName: string;
}

export default function MemeCorner({ memes, onAddMeme, onReactMeme, onRemoveMeme, partnerName }: MemeCornerProps) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Spark particle animations state
  const [laughingId, setLaughingId] = useState<string | null>(null);

  const handlePostMeme = () => {
    if (!url.trim()) return;
    const newMeme: Meme = {
      id: `meme_${Date.now()}`,
      url: url.trim(),
      caption: caption.trim() || 'No caption.',
      laughCount: 0,
      uploaderId: 'user_a',
      reactions: {},
      timestamp: new Date().toISOString(),
    };
    onAddMeme(newMeme);
    setUrl('');
    setCaption('');
    setIsAdding(false);
  };

  const triggerLaughReaction = (id: string) => {
    onReactMeme(id);
    setLaughingId(id);
    setTimeout(() => {
      setLaughingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div>
          <h3 className="text-lg font-serif font-bold">Meme Corner</h3>
          <p className="text-xs text-gray-400 font-light">A shared private sandbox for our inside jokes, tech memes, and laughter.</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="py-1.5 px-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Meme
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Add Meme Form */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-3xl space-y-4 overflow-hidden border-indigo-500/20"
          >
            <h4 className="text-sm font-serif font-bold text-pink-400">Add Inside Joke / Meme url</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Meme Image Link (URL)</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste meme / GIF image URL..."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Funny Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Me after compiling server without type errors..."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handlePostMeme}
              className="py-2.5 px-5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 transition-all cursor-pointer"
            >
              Post to Board
            </button>
          </motion.div>
        )}

        {/* Memes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="memes-gallery">
          {memes.length === 0 ? (
            <div className="md:col-span-3 text-center py-12 text-xs text-gray-500 font-light italic">
              No inside memes uploaded yet. Click "Add Meme" above to start the fun.
            </div>
          ) : (
            memes.map((m) => (
              <div
                key={m.id}
                className="glass-panel rounded-3xl overflow-hidden relative group hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between border border-white/5"
              >
                {/* Visual Image container */}
                <div className="h-64 bg-black/40 relative overflow-hidden">
                  <img
                    src={m.url}
                    alt={m.caption}
                    className="w-full h-full object-cover filter brightness-95"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // fallback for invalid image urls
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Delete button (owner action simulation) */}
                  {m.uploaderId === 'user_a' && (
                    <button
                      onClick={() => onRemoveMeme(m.id)}
                      className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-lg text-gray-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Info and reactions */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span>From: <b>{m.uploaderId === 'user_a' ? 'You' : partnerName}</b></span>
                  </div>

                  <p className="text-xs text-gray-200 font-light line-clamp-2 leading-relaxed font-sans">
                    {m.caption}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <button
                      onClick={() => triggerLaughReaction(m.id)}
                      className={`py-1.5 px-3.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                        m.laughCount > 0
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Laugh className="w-4 h-4 text-amber-400" />
                      <span>{m.laughCount} Laughs</span>

                      {/* Flying smile animations particles */}
                      {laughingId === m.id && (
                        <motion.span
                          initial={{ y: 0, opacity: 1, scale: 0.5 }}
                          animate={{ y: -40, opacity: 0, scale: 1.5 }}
                          className="absolute text-lg select-none pointer-events-none"
                        >
                          😆✨
                        </motion.span>
                      )}
                    </button>

                    <span className="text-[9px] font-mono text-gray-500 uppercase">
                      {new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
