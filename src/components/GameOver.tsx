import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Trophy, DoorOpen } from 'lucide-react';

interface GameOverProps {
  score: number;
  rooms: number;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, rooms, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-12"
      >
        <div className="space-y-4">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-7xl font-black text-slate-100 italic tracking-tighter"
          >
            NOT-STONKS
          </motion.h1>
          <p className="text-slate-400 font-mono uppercase tracking-[0.3em] text-sm">Your journey ends here</p>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest">Final Score</span>
            </div>
            <div className="text-4xl font-bold text-slate-100">{score.toLocaleString()}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <DoorOpen className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest">Rooms Cleared</span>
            </div>
            <div className="text-4xl font-bold text-slate-100">{rooms}</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="group relative inline-flex items-center gap-3 px-10 py-5 bg-slate-100 text-slate-950 rounded-full font-bold text-lg transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]"
        >
          <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          ONCE MORE UNTO THE BREACH
        </motion.button>

        <div className="pt-8">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            Developed with Ethereal Engine v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};
