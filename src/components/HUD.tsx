import React from 'react';
import { Player } from '../types';
import { motion } from 'motion/react';

interface HUDProps {
  player: Player;
  roomNumber: number;
}

export const HUD: React.FC<HUDProps> = ({ player, roomNumber }) => {
  const healthPercent = (player.health / player.maxHealth) * 100;
  const magicPercent = (player.magic / player.maxMagic) * 100;

  return (
    <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-10">
      <div className="space-y-4 w-64">
        {/* Health Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-emerald-400 uppercase tracking-wider">
            <span>Vitality</span>
            <span>{Math.ceil(player.health)} / {player.maxHealth}</span>
          </div>
          <div className="h-3 bg-slate-900/80 rounded-full border border-slate-700 overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${healthPercent}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            />
          </div>
        </div>

        {/* Magic Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-blue-400 uppercase tracking-wider">
            <span>Aether</span>
            <span>{Math.ceil(player.magic)} / {player.maxMagic}</span>
          </div>
          <div className="h-3 bg-slate-900/80 rounded-full border border-slate-700 overflow-hidden backdrop-blur-sm">
            <motion.div 
              className={`h-full bg-gradient-to-r from-blue-600 to-blue-400 ${player.magic >= player.maxMagic ? 'animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]' : ''}`}
              initial={{ width: 0 }}
              animate={{ width: `${magicPercent}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            />
          </div>
          
          {/* Aether Charges */}
          <div className="flex gap-2 mt-2">
            {Array.from({ length: player.maxAetherCharges }).map((_, i) => (
              <div 
                key={i}
                className={`w-8 h-2 rounded-full border border-slate-700 transition-all duration-300 ${
                  i < player.aetherCharges 
                    ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)] border-blue-300' 
                    : 'bg-slate-900/50'
                }`}
              />
            ))}
          </div>

          {player.aetherCharges > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-blue-300 font-mono text-center animate-bounce mt-1"
            >
              [SPACE] TO UNLEASH AETHER BREACH ({player.aetherCharges})
            </motion.div>
          )}
        </div>
      </div>

      <div className="text-right space-y-1">
        <div className="text-4xl font-black text-slate-100 italic tracking-tighter leading-none">
          ROOM {roomNumber}
        </div>
        <div className="text-sm font-mono text-slate-400 uppercase tracking-widest">
          Score: {player.score.toString().padStart(6, '0')}
        </div>
      </div>
    </div>
  );
};
