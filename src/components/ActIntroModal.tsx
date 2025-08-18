import React from 'react';
import useUiStore from '../stores/uiStore';
import { ACT_INTRO } from '../content/narrative';

const ACT_COPY: Record<number, { title: string; body: string }> = {
  1: { title: 'Act I — Outpost Ruins', body: 'The wind gnaws at the concrete shells. Beneath the dust, terminals still blink. The Tribe needs a keeper who can wake them.' },
  2: { title: 'Act II — Data Jungle', body: 'Green crowns swallow forgotten corridors. Vines tangle cables, and storage bays teem with life—and corruption.' },
  3: { title: 'Act III — Arctic Vaults', body: 'Cold preserves and shatters alike. In these vaults, knowledge is brittle—handle links with care.' },
  4: { title: 'Act IV — Archipelago of Nodes', body: 'Islands drift. Paths shift. Combine what you know and learn to cross between nodes without losing the thread.' },
  5: { title: 'Act V — Lunar Blacksite', body: 'Above the dust, a blacksite hums. Null echoes test your footing—only mastery will carry the Archive home.' }
};

const ActIntroModal: React.FC = () => {
  const { pendingActIntro, dismissActIntro, setShowMap } = useUiStore();
  if (!pendingActIntro) return null;
  const introBody = ACT_INTRO[pendingActIntro] || '';
  const copy = ACT_COPY[pendingActIntro] || { title: `Act ${pendingActIntro}`, body: introBody };
  const close = () => { dismissActIntro(); setShowMap(false); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="act-intro-title">
      <div className="absolute inset-0 bg-black/70" onClick={close} />
      <div className="relative z-10 max-w-2xl mx-4 rounded-xl border border-white/10 bg-terminal-bg/90 backdrop-blur p-8 text-terminal-text shadow-2xl">
        <h2 id="act-intro-title" className="text-2xl font-bold mb-3">{copy.title}</h2>
        <p className="text-terminal-text/90 mb-4 whitespace-pre-wrap">{introBody || copy.body}</p>
        <div className="flex justify-end">
          <button onClick={close} className="bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt px-4 py-2 rounded border border-terminal-prompt/30">Continue</button>
        </div>
      </div>
    </div>
  );
};

export default ActIntroModal;
