import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

interface ScoreEntry {
  initials: string;
  score: number;
}

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setScores(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-slate-500 font-mono text-[10px] animate-pulse">Accessing Neural Database...</div>;
  if (scores.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-xs mx-auto space-y-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h2 className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">Top Operatives</h2>
      </div>
      
      <div className="space-y-2">
        {scores.map((entry, index) => (
          <div key={index} className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-600 w-4">{index + 1}.</span>
              <span className="text-sm font-black text-slate-200 tracking-widest group-hover:text-emerald-400 transition-colors">
                {entry.initials}
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-500/80">
              {entry.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
