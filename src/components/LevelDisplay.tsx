import React, { useMemo } from 'react';
import useLevelStore from '../stores/levelStore';
import FsTree from './FsTree';
import useUiStore from '../stores/uiStore';

const LevelDisplay: React.FC = () => {
  const { currentLevel, levels, completedLevels, resetLevel, goToNextLevel, goToPrevLevel } = useLevelStore();
  const currentLevelData = levels.find(l => l.id === currentLevel);
  const { showHint, toggleHint } = useUiStore();
  const total = levels.length || 150;
  const progress = total > 0 ? Math.round(((Math.min(Math.max(currentLevel, 1), total)) / total) * 100) : 0;
  const hintText = useMemo(() => currentLevelData?.hint || 'Consider flags and relative/absolute paths.', [currentLevelData]);

  if (!currentLevelData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-xl shadow-xl border border-white/10 bg-terminal-bg/30 backdrop-blur p-6 text-terminal-text flex flex-col h-[36rem]">
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Level {currentLevel}</h2>
            <div className="text-terminal-info/80">{currentLevelData.title}</div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded border border-white/10 bg-terminal-prompt/10 text-terminal-prompt">
              <span>Progress</span>
              <span className="font-semibold">{Math.min(Math.max(currentLevel, 1), total)}/{total}</span>
            </div>
            <div className="w-48 h-2 bg-white/10 rounded mt-2 overflow-hidden">
              <div className="h-2 bg-terminal-prompt transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4 min-h-24">
              <h3 className="text-lg font-semibold text-terminal-info">Story</h3>
              <p className="italic text-terminal-text/80">{currentLevelData.story}</p>
            </div>
            <div className="text-right text-xs text-terminal-text/70 min-w-[8rem]">
              {currentLevelData.biome && <div>{currentLevelData.biome.toUpperCase()}</div>}
              {typeof currentLevelData.estTimeMin === 'number' && <div>~{currentLevelData.estTimeMin}m</div>}
              {currentLevelData.difficulty && <div>{currentLevelData.difficulty}</div>}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-terminal-info">Current Task</h3>
          <p className="text-terminal-success min-h-10 flex items-center">{currentLevelData.task}</p>
          <button
            onClick={toggleHint}
            className="mt-3 text-sm text-terminal-prompt hover:text-terminal-prompt/90"
          >
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
          {showHint && (
            <div className="mt-2 text-sm text-terminal-text/90">
              Hint: {hintText}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-terminal-info">Filesystem</h3>
          <FsTree />
          <div className="text-xs text-terminal-text/60">Tip: Use ls -a -l -R to explore via terminal.</div>
        </div>
      </div>

      {/* Controls moved to separate component/card below */}
    </div>
  );
};

export default LevelDisplay;
