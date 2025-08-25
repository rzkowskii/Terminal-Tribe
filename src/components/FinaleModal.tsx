import React, { useEffect, useRef } from 'react';
import useUiStore from '../stores/uiStore';
import useLevelStore from '../stores/levelStore';

const FinaleModal: React.FC = () => {
  const { showFinale, setShowCodex, setShowFinale } = useUiStore();
  const { setCurrentLevel, setActFilter } = useLevelStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  if (!showFinale) return null;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={() => setShowFinale(false)} />
      <div className="relative z-10 max-w-xl mx-auto mt-24 rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl">
        <h3 className="text-2xl font-bold mb-2">Archive Restored</h3>
        <p className="text-terminal-text/90 mb-4">You completed all levels. The Tribe thrives. Where to next?</p>
        <div className="flex gap-2">
          <button ref={closeRef} className="bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt px-3 py-2 rounded border border-terminal-prompt/30" onClick={() => { setActFilter(undefined); setCurrentLevel(1); setShowFinale(false); }}>Replay from Level 1</button>
          <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-2 rounded border border-white/10" onClick={() => setShowCodex(true)}>Open Codex</button>
          <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-2 rounded border border-white/10" onClick={() => { setShowFinale(false); useUiStore.getState().setShowMap(true); }}>Open World Map</button>
        </div>
      </div>
    </div>
  );
};

export default FinaleModal;


