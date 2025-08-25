import React, { useRef } from 'react';
import FocusTrap from './FocusTrap';
import useUiStore from '../stores/uiStore';
import useNarrativeStore from '../stores/narrativeStore';

const FactionModal: React.FC = () => {
  const { featureFlags } = useUiStore();
  const { selectedFaction, setFaction } = useNarrativeStore();
  const [open, setOpen] = React.useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  if (!featureFlags.narrativeBranches) return null;
  return (
    <div className="fixed right-4 bottom-4">
      <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setOpen(true)}>
        Faction: {selectedFaction || 'None'}
      </button>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="faction-title">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <FocusTrap initialFocusRef={closeRef} onEscape={() => setOpen(false)}>
            <div className="relative z-10 w-full max-w-md mx-auto mt-24 rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 id="faction-title" className="text-xl font-bold">Choose Faction</h3>
                <button ref={closeRef} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setOpen(false)}>Close</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['scribes','circuit','null'] as const).map(f => (
                  <button key={f} onClick={() => { setFaction(f); setOpen(false); }} className={`rounded border p-3 ${selectedFaction === f ? 'bg-terminal-prompt/20 border-terminal-prompt/40 text-terminal-prompt' : 'bg-white/5 border-white/10 text-terminal-text/80'}`}>{f}</button>
                ))}
              </div>
            </div>
          </FocusTrap>
        </div>
      )}
    </div>
  );
};

export default FactionModal;


