import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Heart, Zap, MessageSquare } from 'lucide-react';

interface DialogueProps {
  onChoice: (choice: 'WEAPON' | 'HEALTH' | 'MAGIC') => void;
  roomNumber: number;
}

export const Dialogue: React.FC<DialogueProps> = ({ onChoice, roomNumber }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono text-emerald-400 uppercase tracking-[0.2em]">The Wanderer</h2>
              <p className="text-2xl font-serif italic text-slate-100">"You've survived quite a bit, traveler. But the breach deepens. What do you need to press on?"</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => onChoice('WEAPON')}
              className="group relative p-6 bg-slate-800/50 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 text-left space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-700 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                <Sword className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Sharpened Edge</h3>
                <p className="text-xs text-slate-400 mt-1">Increase weapon damage and fire rate.</p>
              </div>
            </button>

            <button 
              onClick={() => onChoice('HEALTH')}
              className="group relative p-6 bg-slate-800/50 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/50 rounded-2xl transition-all duration-300 text-left space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-700 group-hover:bg-rose-500/20 flex items-center justify-center transition-colors">
                <Heart className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Vitality Surge</h3>
                <p className="text-xs text-slate-400 mt-1">Restore health and increase max vitality.</p>
              </div>
            </button>

            <button 
              onClick={() => onChoice('MAGIC')}
              className="group relative p-6 bg-slate-800/50 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/50 rounded-2xl transition-all duration-300 text-left space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-700 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Aether Overload</h3>
                <p className="text-xs text-slate-400 mt-1">Unlock additional Aether charges (Max 3).</p>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Room {roomNumber} Milestone</span>
            <span>Choose Wisely</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
