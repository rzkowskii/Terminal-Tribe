import React, { useState } from 'react';
import useLevelStore from '../stores/levelStore';
import FsTree from './FsTree';

const LevelDisplay: React.FC = () => {
  const { currentLevel, levels, completedLevels, resetLevel, goToNextLevel } = useLevelStore();
  const currentLevelData = levels.find(l => l.id === currentLevel);
  const [showHint, setShowHint] = useState(false);
  const total = levels.length || 0;
  const completedCount = completedLevels.size;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (!currentLevelData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-xl shadow-xl border border-white/10 bg-terminal-bg/30 backdrop-blur p-6 text-terminal-text">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Level {currentLevel}</h2>
          <div className="text-terminal-info/80">{currentLevelData.title}</div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded border border-white/10 bg-terminal-prompt/10 text-terminal-prompt">
            <span>Progress</span>
            <span className="font-semibold">{completedCount}/{total}</span>
          </div>
          <div className="w-48 h-2 bg-white/10 rounded mt-2 overflow-hidden">
            <div className="h-2 bg-terminal-prompt transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-terminal-info">Story</h3>
        <p className="italic text-terminal-text/80">{currentLevelData.story}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-terminal-info">Current Task</h3>
        <p className="text-terminal-success">{currentLevelData.task}</p>
        <button
          onClick={() => setShowHint(v => !v)}
          className="mt-3 text-sm text-terminal-prompt hover:text-terminal-prompt/90"
        >
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
        {showHint && (
          <div className="mt-2 text-sm text-terminal-text/90">
            Hint: try commands and flags relevant to this task. Use <span className="text-terminal-prompt">help</span> to discover options.
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => resetLevel()}
          className="bg-white/5 hover:bg-white/10 text-terminal-text font-semibold py-2 px-4 rounded border border-white/10"
        >
          Reset Level
        </button>
        <button
          onClick={() => goToNextLevel()}
          className="bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt font-semibold py-2 px-4 rounded border border-terminal-prompt/30"
        >
          Next Level
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-semibold text-terminal-info">Filesystem</h3>
        <FsTree />
        <div className="text-xs text-terminal-text/60">Tip: Use ls -a -l -R to explore via terminal.</div>
      </div>
    </div>
  );
};

export default LevelDisplay;
