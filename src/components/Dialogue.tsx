import React from 'react';
import { motion } from 'motion/react';
import { Sword, Heart, Zap, MessageSquare, Shield, Crosshair, Flame, ZapOff } from 'lucide-react';

interface DialogueProps {
  onChoice: (choice: 'WEAPON' | 'HEALTH' | 'MAGIC' | 'LIFE' | 'CHOOSE_PISTOL' | 'CHOOSE_SHOTGUN' | 'CHOOSE_PLASMA' | 'CHOOSE_MINIGUN') => void;
  roomNumber: number;
}

export const Dialogue: React.FC<DialogueProps> = ({ onChoice, roomNumber }) => {
  const isWeaponSelect = roomNumber % 5 === 0;
  const isStandardUpgrade = !isWeaponSelect && roomNumber % 3 === 0;

  const weaponOptions = React.useMemo(() => {
    if (!isWeaponSelect) return [];
    const allOptions = [
      { id: 'CHOOSE_PISTOL' as const, title: 'Pistol', desc: 'Standard reliable fire.', color: 'slate', icon: <Crosshair className="w-6 h-6 text-slate-100" /> },
      { id: 'CHOOSE_SHOTGUN' as const, title: 'Shotgun', desc: 'Wide spread, high impact.', color: 'orange', icon: <Shield className="w-6 h-6 text-orange-400" /> },
      { id: 'CHOOSE_PLASMA' as const, title: 'Plasma', desc: 'Slow, explosive rounds.', color: 'purple', icon: <Flame className="w-6 h-6 text-purple-400" /> },
      { id: 'CHOOSE_MINIGUN' as const, title: 'Minigun', desc: 'Rapid parallel fire.', color: 'yellow', icon: <ZapOff className="w-6 h-6 text-yellow-400" /> },
    ];
    return allOptions.sort(() => Math.random() - 0.5).slice(0, 2);
  }, [roomNumber, isWeaponSelect]);

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-3xl w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-10 shadow-2xl relative overflow-hidden"
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
              <h2 className="text-sm font-mono text-emerald-400 uppercase tracking-[0.2em]">Neural Link</h2>
              <p className="text-2xl font-serif italic text-slate-100">
                {roomNumber % 15 === 0 ? "\"Sector 15 reached. Reboot credit awarded. Choose your primary weapon system.\"" :
                 isWeaponSelect ? "\"RBYT3R, we've unlocked advanced armaments. Choose your primary weapon system.\"" :
                 "\"RBYT3R, the demon infestation is spreading. We need to optimize your combat systems.\""}
              </p>
            </div>
          </div>

          <div className={`grid ${isWeaponSelect ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
            {isWeaponSelect ? (
              weaponOptions.map(opt => (
                <UpgradeButton 
                  key={opt.id}
                  icon={opt.icon}
                  title={opt.title}
                  desc={opt.desc}
                  color={opt.color}
                  onClick={() => onChoice(opt.id)}
                />
              ))
            ) : (
              <>
                <UpgradeButton 
                  icon={<Sword className="w-6 h-6 text-emerald-400" />}
                  title="Sharpened Edge"
                  desc="Increase damage/fire rate."
                  color="emerald"
                  onClick={() => onChoice('WEAPON')}
                />
                <UpgradeButton 
                  icon={<Heart className="w-6 h-6 text-rose-400" />}
                  title="Vitality Surge"
                  desc="Restore/Increase health."
                  color="rose"
                  onClick={() => onChoice('HEALTH')}
                />
                <UpgradeButton 
                  icon={<Zap className="w-6 h-6 text-blue-400" />}
                  title="Neural Overload"
                  desc="Unlock Neural charges."
                  color="blue"
                  onClick={() => onChoice('MAGIC')}
                />
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Sector {roomNumber} Milestone</span>
            <span>{isWeaponSelect ? 'Armory Unlocked' : 'Optimization Ready'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const UpgradeButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
}> = ({ icon, title, desc, color, onClick }) => {
  const colorClasses: Record<string, string> = {
    emerald: 'hover:bg-emerald-500/10 border-slate-700 hover:border-emerald-500/50',
    rose: 'hover:bg-rose-500/10 border-slate-700 hover:border-rose-500/50',
    blue: 'hover:bg-blue-500/10 border-slate-700 hover:border-blue-500/50',
    orange: 'hover:bg-orange-500/10 border-slate-700 hover:border-orange-500/50',
    purple: 'hover:bg-purple-500/10 border-slate-700 hover:border-purple-500/50',
    yellow: 'hover:bg-yellow-500/10 border-slate-700 hover:border-yellow-500/50',
    slate: 'hover:bg-slate-500/10 border-slate-700 hover:border-slate-500/50',
  };

  const iconBgClasses: Record<string, string> = {
    emerald: 'group-hover:bg-emerald-500/20',
    rose: 'group-hover:bg-rose-500/20',
    blue: 'group-hover:bg-blue-500/20',
    orange: 'group-hover:bg-orange-500/20',
    purple: 'group-hover:bg-purple-500/20',
    yellow: 'group-hover:bg-yellow-500/20',
    slate: 'group-hover:bg-slate-500/20',
  };

  return (
    <button 
      onClick={onClick}
      className={`group relative p-6 bg-slate-800/50 border rounded-2xl transition-all duration-300 text-left space-y-4 ${colorClasses[color]}`}
    >
      <div className={`w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center transition-colors ${iconBgClasses[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-100">{title}</h3>
        <p className="text-[10px] leading-tight text-slate-400 mt-1">{desc}</p>
      </div>
    </button>
  );
};
