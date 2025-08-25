import React from 'react';
import useUiStore from '../stores/uiStore';
import useLevelStore from '../stores/levelStore';

const HUD: React.FC = () => {
  const { setShowMap, setShowCodex, showScene, toggleScene, showSceneEffects, toggleSceneEffects, autoAdvance, setAutoAdvance, setShowSettings, featureFlags, setShowSkills, setShowProfile } = useUiStore();
  const { completedLevels, levels } = useLevelStore();
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-terminal-text/80">Progress: {completedLevels.size}/{levels.length}</div>
      <div className="flex items-center gap-2">
        <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowMap(true)}>World Map</button>
        <button className="bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt px-3 py-1 rounded border border-terminal-prompt/30" onClick={() => setShowCodex(true)}>Codex</button>
        {featureFlags.skills && (
          <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowSkills(true)}>Skills</button>
        )}
        {featureFlags.badges && (
          <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowProfile(true)}>Profile</button>
        )}
        <button className="bg-white/5 hover:bg-white/10 text-terminal-text/80 px-3 py-1 rounded border border-white/10" onClick={toggleScene}>{showScene ? 'Hide Scene' : 'Show Scene'}</button>
        <button className="bg-white/5 hover:bg-white/10 text-terminal-text/80 px-3 py-1 rounded border border-white/10" onClick={toggleSceneEffects}>{showSceneEffects ? 'Disable Effects' : 'Enable Effects'}</button>
        <button className={`px-3 py-1 rounded border ${autoAdvance ? 'bg-terminal-success/20 border-terminal-success/40 text-terminal-success' : 'bg-white/5 border-white/10 text-terminal-text/80'} hover:opacity-90`} onClick={() => setAutoAdvance(!autoAdvance)}>{autoAdvance ? 'Auto-Advance: ON' : 'Auto-Advance: OFF'}</button>
        <button className="bg-white/5 hover:bg-white/10 text-terminal-text/80 px-3 py-1 rounded border border-white/10" onClick={() => setShowSettings(true)}>Settings</button>
      </div>
    </div>
  );
};

export default HUD;


