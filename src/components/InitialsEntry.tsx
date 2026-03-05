import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Send } from 'lucide-react';

interface InitialsEntryProps {
  score: number;
  onComplete: () => void;
}

export const InitialsEntry: React.FC<InitialsEntryProps> = ({ score, onComplete }) => {
  const [initials, setInitials] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submitting) return;

      if (e.key === 'Backspace') {
        setInitials(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (initials.length === 3) {
          submitScore(initials);
        }
      } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        if (initials.length < 3) {
          setInitials(prev => (prev + e.key).toUpperCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initials, submitting]);

  const submitScore = async (val: string) => {
    if (val.length !== 3 || submitting) return;

    setSubmitting(true);
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initials: val, score }),
      });
      onComplete();
    } catch (err) {
      console.error('Failed to submit score:', err);
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitScore(initials);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[300] p-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-10 shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center space-y-8"
      >
        <div className="space-y-2">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tighter italic">NEW HIGH SCORE</h2>
          <p className="text-emerald-400 font-mono text-2xl">{score.toLocaleString()}</p>
          <p className="text-slate-500 text-xs uppercase tracking-widest pt-2">Type your initials for the Neural Database</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className={`w-20 h-24 bg-slate-800 border-2 rounded-2xl flex items-center justify-center text-5xl font-black transition-all ${
                  initials.length === i ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-700'
                }`}
              >
                {initials[i] || ''}
                {initials.length === i && (
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="absolute w-1 h-12 bg-emerald-500 ml-1"
                  />
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => submitScore(initials)}
            disabled={initials.length !== 3 || submitting}
            className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-2xl font-black text-lg transition-all"
          >
            {submitting ? 'UPLOADING...' : (
              <>
                <Send className="w-5 h-5" />
                SUBMIT RECORD
              </>
            )}
          </button>
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">Press ENTER to confirm</p>
        </div>
      </motion.div>
    </div>
  );
};
