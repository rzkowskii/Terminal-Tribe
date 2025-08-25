import React, { useMemo } from 'react';
import useLevelStore from '../stores/levelStore';
import useProgressStore from '../stores/progressStore';
import useUiStore from '../stores/uiStore';

const StatusPanel: React.FC = () => {
  const { levels, completedLevels } = useLevelStore();
  const { codexUnlocked, codexUnlockMap } = useProgressStore();
  const { setShowCodex, setSelectedCodexKey } = useUiStore();

  const total = levels.length || 0;
  const completedCount = completedLevels.size;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const unlockedKeys = useMemo(() => Array.from(codexUnlocked), [codexUnlocked]);

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-3">
      <div className="bg-terminal-bg/40 border border-white/10 rounded p-4">
        <div className="text-xs uppercase tracking-wide text-terminal-prompt mb-2">Archive Restoration</div>
        <div className="h-2 bg-white/10 rounded overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-terminal-prompt to-terminal-success transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 text-xs text-terminal-text/70">{completedCount} of {total} levels completed</div>
      </div>

      <div className="bg-terminal-bg/40 border border-white/10 rounded p-4 flex-1">
        <div className="text-xs uppercase tracking-wide text-terminal-prompt mb-3">Knowledge Bank</div>
        <div className="space-y-2 max-h-80 overflow-auto pr-1">
          {unlockedKeys.length === 0 && (
            <div className="text-xs text-terminal-text/60">No entries unlocked yet. Complete levels to unlock Codex articles.</div>
          )}
          {unlockedKeys.map((key) => (
            <button
              key={key}
              onClick={() => { setSelectedCodexKey(key); setShowCodex(true); }}
              className="w-full text-left text-sm bg-terminal-success/10 border border-terminal-success/30 text-terminal-success px-2 py-1 rounded hover:bg-terminal-success/20"
            >
              <div className="flex items-center justify-between">
                <span>{key}</span>
                <span className="text-xs text-terminal-text/60">Lv {(codexUnlockMap[key] || []).join(', ') || '—'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default StatusPanel;


