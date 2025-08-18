import React from 'react';
import useUiStore from '../stores/uiStore';
import useLevelStore from '../stores/levelStore';

const HUD: React.FC = () => {
  const { setShowMap, setShowCodex } = useUiStore();
  const { completedLevels, levels } = useLevelStore();
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-terminal-text/80">Progress: {completedLevels.size}/{levels.length}</div>
      <div className="flex items-center gap-2">
        <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowMap(true)}>World Map</button>
        <button className="bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt px-3 py-1 rounded border border-terminal-prompt/30" onClick={() => setShowCodex(true)}>Codex</button>
      </div>
    </div>
  );
};

export default HUD;


