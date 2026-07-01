/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Award, HelpCircle, Shuffle, ChevronRight, HelpCircle as Help } from 'lucide-react';
export interface TwistResponse {
  userId: string;
  text: string;
  timestamp: string;
}

interface TwistOfTheDayProps {
  currentPrompt: string;
  responses: TwistResponse[];
  onAddResponse: (text: string) => void;
  onGenerateNewPrompt: () => Promise<string>;
  partnerName: string;
}

export default function TwistOfTheDay({ currentPrompt, responses, onAddResponse, onGenerateNewPrompt, partnerName }: TwistOfTheDayProps) {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState(currentPrompt || "What is a funny mathematical equation to describe our connection today?");

  const handlePostResponse = () => {
    if (!inputText.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAddResponse(inputText.trim());
      setInputText('');
      setIsSubmitting(false);
    }, 800);
  };

  const handleShufflePrompt = async () => {
    setPromptLoading(true);
    try {
      const resp = await onGenerateNewPrompt();
      if (resp) {
        setActivePrompt(resp);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPromptLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-2 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-serif font-bold">Twist of the Day</h3>
          <p className="text-xs text-gray-400 font-light">
            AI-generated companion prompts to inject surprising, deep conversations into your busy day.
          </p>
        </div>

        <button
          onClick={handleShufflePrompt}
          disabled={promptLoading}
          className="py-1.5 px-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
        >
          <Shuffle className={`w-3.5 h-3.5 ${promptLoading ? 'animate-spin' : ''}`} />
          Shuffle Prompt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Col: Prompt & submission input (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden text-center min-h-[220px] flex flex-col justify-between items-center border-pink-500/10">
            <div className="absolute top-[-30%] left-[-30%] w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-pink-500/10 rounded-2xl">
                <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {promptLoading ? (
                <div className="space-y-2.5 py-4 w-full">
                  <div className="h-4 bg-white/5 rounded-md w-[80%] mx-auto animate-pulse" />
                  <div className="h-4 bg-white/5 rounded-md w-[60%] mx-auto animate-pulse" />
                  <span className="text-[10px] font-mono text-pink-400 animate-pulse block">Consulting Gemini AI companion algorithms...</span>
                </div>
              ) : (
                <motion.h4
                  key={activePrompt}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-serif text-lg md:text-xl font-medium tracking-tight text-gray-200 px-4 leading-relaxed max-w-md"
                >
                  "{activePrompt}"
                </motion.h4>
              )}
            </AnimatePresence>

            <span className="text-[9px] font-mono tracking-widest text-gray-500 uppercase mt-4">
              Daily AI companion twist
            </span>
          </div>

          {/* Response Submission */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">Broadcast your response</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your whimsical or sweet response..."
                className="flex-1 p-3.5 rounded-xl glass-input text-sm text-white focus:border-indigo-500 transition-all"
              />
              <button
                onClick={handlePostResponse}
                disabled={isSubmitting || !inputText.trim()}
                className="px-5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-100 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? 'Posting...' : 'Post response'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Shared responses ledger (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4 relative overflow-hidden">
          <h4 className="text-xs uppercase tracking-widest text-pink-400 font-bold block">Shared Responses</h4>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {responses.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-8 text-center flex flex-col items-center justify-center gap-2">
                <Help className="w-6 h-6 text-gray-600" />
                <span>No responses recorded today. Answer the prompt first!</span>
              </p>
            ) : (
              responses.map((r, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between font-mono text-[9px] text-gray-500">
                    <span>From: <b>{r.userId === 'user_a' ? 'You' : partnerName}</b></span>
                    <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-300 font-light leading-relaxed font-serif italic">"{r.text}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
