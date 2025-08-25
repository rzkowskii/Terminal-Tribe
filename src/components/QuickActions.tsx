import React from 'react';
import useUiStore from '../stores/uiStore';
import useTerminalStore from '../stores/terminalStore';
// no direct level store usage here

const QuickActions: React.FC = () => {
  const { toggleHint, setShowCodex } = useUiStore();
  const { clearHistory, addToHistory } = useTerminalStore();

  return (
    <div className="flex gap-2 mt-3">
      <button
        className="flex-1 px-3 py-2 text-xs uppercase tracking-wide border border-terminal-prompt/40 text-terminal-prompt bg-terminal-prompt/10 rounded hover:bg-terminal-prompt/20"
        onClick={toggleHint}
      >
        Hint
      </button>
      <button
        className="flex-1 px-3 py-2 text-xs uppercase tracking-wide border border-white/10 text-terminal-text bg-white/5 rounded hover:bg-white/10"
        onClick={() => clearHistory()}
      >
        Clear
      </button>
      <button
        className="flex-1 px-3 py-2 text-xs uppercase tracking-wide border border-terminal-info/40 text-terminal-info bg-terminal-info/10 rounded hover:bg-terminal-info/20"
        onClick={() => {
          addToHistory({ command: 'help', output: 'Tip: Open the Codex for deeper guidance.', status: 'info' });
          setShowCodex(true);
        }}
      >
        Help
      </button>
    </div>
  );
};

export default QuickActions;


