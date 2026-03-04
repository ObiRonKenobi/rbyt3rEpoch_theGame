import React from 'react';
import { motion } from 'motion/react';
import { Play, Shield, Target, Zap } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-[200] overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random()
            }}
            animate={{ 
              y: ['-10%', '110%'],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center space-y-12 relative z-10 p-8"
      >
        <div className="space-y-4">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500 italic tracking-tighter leading-none">
              RBYT3R<br />EPOCH
            </h1>
          </motion.div>
          <p className="text-emerald-400 font-mono uppercase tracking-[0.5em] text-sm">Bullet Hell RPG Survival</p>
        </div>

        <div className="grid grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Combat</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">WASD to move. Mouse to aim and shoot. Survive the waves.</p>
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Aether</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">Kill enemies to fill Aether. Press SPACE for a massive AoE blast.</p>
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
            <Shield className="w-5 h-5 text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Choices</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">Every 3 rooms, meet the Wanderer to upgrade your abilities.</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#10b981' }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-12 py-6 bg-emerald-500 text-slate-950 rounded-full font-black text-xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)]"
        >
          <Play className="w-6 h-6 fill-current" />
          START MISSION
        </motion.button>

        <div className="pt-8 flex justify-center gap-8 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          <span>v1.0.4 Stable</span>
          <span>System Online</span>
        </div>
      </motion.div>
    </div>
  );
};
