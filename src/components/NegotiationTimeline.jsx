import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';

export default function NegotiationTimeline({ logs = [], autoAnimate = true }) {
  const [visibleCount, setVisibleCount] = useState(autoAnimate ? 1 : logs.length);
  const [isPlaying, setIsPlaying] = useState(autoAnimate);

  useEffect(() => {
    if (autoAnimate) {
      setVisibleCount(1);
      setIsPlaying(true);
    } else {
      setVisibleCount(logs.length);
      setIsPlaying(false);
    }
  }, [logs, autoAnimate]);

  useEffect(() => {
    if (!isPlaying) return;
    if (visibleCount >= logs.length) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(logs.length, prev + 1));
    }, 180);
    return () => clearTimeout(timer);
  }, [visibleCount, isPlaying, logs.length]);

  const handleReplay = () => {
    setVisibleCount(1);
    setIsPlaying(true);
  };

  const handleShowAll = () => {
    setIsPlaying(false);
    setVisibleCount(logs.length);
  };

  const displayedLogs = logs.slice(0, visibleCount);

  return (
    <div className="bg-neutral-950/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Autonomous Multi-Agent Negotiation Timeline
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Step-by-step protocol log: minimum safety floor lock followed by utility-weighted surplus dispatch (score = priority × unmet_demand)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tabular-nums text-neutral-400 mr-2">
            Step {visibleCount} of {logs.length}
          </span>
          <button
            type="button"
            onClick={handleReplay}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/20 text-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Animation</span>
          </button>
          {visibleCount < logs.length && (
            <button
              type="button"
              onClick={handleShowAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-black flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Complete Instantly</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {displayedLogs.map((entry, idx) => {
          const isError =
            entry.includes('No Safe Allocation Possible') ||
            entry.includes('CRITICAL DEFICIT') ||
            entry.includes('REJECT');
          const isEmergency = entry.includes('EMERGENCY RENEGOTIATION');
          const isComplete =
            entry.includes('completed successfully') ||
            entry.includes('Phase 1 Baseline Complete');

          return (
            <motion.div
              key={`${idx}-${entry.slice(0, 24)}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              className={`p-3.5 rounded-lg border text-sm flex items-start gap-3 ${
                isEmergency
                  ? 'bg-red-950/40 border-red-800/70 text-red-200'
                  : isError
                  ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                  : isComplete
                  ? 'bg-cyan-950/35 border-cyan-400/40 text-cyan-100'
                  : 'bg-black/70 border-cyan-500/15 text-neutral-200'
              }`}
            >
              <div className="font-mono tabular-nums text-xs text-neutral-400 pt-0.5 w-8 shrink-0">
                {String(idx + 1).padStart(2, '0')}.
              </div>
              <div className="flex-1 leading-relaxed">{entry}</div>
              <div className="shrink-0 pt-0.5">
                {isError || isEmergency ? (
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                ) : isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Terminal className="w-4 h-4 text-cyan-400" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
