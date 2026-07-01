/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Plus, Trash2, ShieldCheck, Heart, Sparkles, UploadCloud } from 'lucide-react';
import { Memory } from '../types';

interface MemoryUploadProps {
  memories: Memory[];
  onAddMemory: (memory: Memory) => void;
  onRemoveMemory: (id: string) => void;
  partnerName: string;
}

export default function MemoryUpload({ memories, onAddMemory, onRemoveMemory, partnerName }: MemoryUploadProps) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Selected memory for full screen expansion
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const handlePostMemory = () => {
    if (!url.trim() || !caption.trim()) return;

    const newM: Memory = {
      id: `memory_${Date.now()}`,
      url: url.trim(),
      caption: caption.trim(),
      album: 'all',
      isFavorite: false,
      uploaderId: 'user_a',
      timestamp: new Date().toISOString(),
    };

    onAddMemory(newM);
    setUrl('');
    setCaption('');
    setIsAdding(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Simulate file upload with Unsplash/mock URL
      const file = e.dataTransfer.files[0];
      const mockUrl = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80';
      setUrl(mockUrl);
      setCaption(`Uploaded: ${file.name}`);
      setIsAdding(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div>
          <h3 className="text-lg font-serif font-bold">Memory Vault</h3>
          <p className="text-xs text-gray-400 font-light">Anchored snapshots of your shared path, protected in fully private local encryption.</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="py-1.5 px-3 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl text-xs font-semibold hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Anchor Memory
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Full screen modal image preview */}
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0915]/95 flex flex-col items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setSelectedMemory(null)}
          >
            <div className="max-w-3xl w-full text-center space-y-4">
              <img
                src={selectedMemory.url}
                alt="Expanded View"
                className="max-h-[75vh] mx-auto rounded-3xl object-contain shadow-2xl filter brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <p className="text-md font-serif text-white font-medium italic">"{selectedMemory.caption}"</p>
                <span className="text-xs font-mono text-gray-500 uppercase">
                  {new Date(selectedMemory.timestamp).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Anchor Form (supports drag drop simulated) */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-3xl space-y-4 overflow-hidden border-indigo-500/20"
          >
            <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">Anchor Memory Snap</h4>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-8 border-2 border-dashed rounded-2xl text-center transition-all ${
                dragActive ? 'border-pink-500 bg-pink-500/5' : 'border-white/10 hover:border-white/20 bg-white/1'
              }`}
            >
              <UploadCloud className="w-8 h-8 text-pink-400 block mx-auto mb-2 animate-bounce" />
              <p className="text-xs text-gray-300 font-medium">Drag & Drop an image file here</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono">Or paste a secure visual web link below</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Image URL Link</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste Unsplash / visual image link..."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1 font-medium">Anchor Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Setting up the Hasmol visual guidelines at night..."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
              <button
                onClick={handlePostMemory}
                disabled={!url.trim() || !caption.trim()}
                className="px-5 py-2 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 disabled:opacity-40 transition-all cursor-pointer"
              >
                Anchor snap
              </button>
            </div>
          </motion.div>
        )}

        {/* Memories Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="memory-gallery">
          {memories.length === 0 ? (
            <div className="sm:col-span-2 md:col-span-3 text-center py-12 text-xs text-gray-500 font-light italic">
              No snapshots anchored yet. Add a sweet memory to keep your visual timeline sparkling!
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="glass-panel rounded-3xl overflow-hidden relative group hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between border border-white/5"
              >
                <div
                  className="h-56 bg-black/40 relative overflow-hidden cursor-zoom-in"
                  onClick={() => setSelectedMemory(m)}
                >
                  <img
                    src={m.url}
                    alt={m.caption}
                    className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Absolute subtle dark card gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMemory(m.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-lg text-gray-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs text-gray-200 font-light leading-relaxed font-serif italic">
                    "{m.caption}"
                  </p>

                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 border-t border-white/5 pt-2">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Encrypted State
                    </span>
                    <span>
                      {new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
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
