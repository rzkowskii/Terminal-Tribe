import React from 'react';
import useLevelStore from '../stores/levelStore';

const TerminalFrame: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  const { currentLevel, levels } = useLevelStore();
  const levelTitle = levels.find(l => l.id === currentLevel)?.title || '';
  return (
    <div className="bg-terminal-bg/30 border border-white/10 rounded-xl shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gradient-to-r from-terminal-prompt/10 to-transparent">
        <div className="text-xs uppercase tracking-widest text-terminal-prompt font-semibold flex items-center gap-3">
          <span>{title || 'Archive Terminal'}</span>
          <span className="text-terminal-text/60">•</span>
          <span className="text-terminal-text/80">Level {currentLevel}{levelTitle ? `: ${levelTitle}` : ''}</span>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-terminal-success shadow-[0_0_8px] shadow-terminal-success/60" />
          <span className="w-2 h-2 rounded-full bg-amber-400/80" />
          <span className="w-2 h-2 rounded-full bg-terminal-error/80" />
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default TerminalFrame;


