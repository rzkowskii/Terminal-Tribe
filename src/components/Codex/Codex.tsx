import React, { useEffect, useMemo, useRef, useState } from 'react';
import useUiStore from '../../stores/uiStore';
import useProgressStore from '../../stores/progressStore';
import { CODEX_ENTRIES } from '../../content/codex';
import { marked } from 'marked';
import FocusTrap from '../FocusTrap';
import InteractiveCodexSandbox from '../InteractiveCodexSandbox';

const Codex: React.FC = () => {
  const { setShowCodex, selectedCodexKey, setSelectedCodexKey } = useUiStore();
  const { codexUnlocked, codexUnlockMap } = useProgressStore();
  const [query, setQuery] = useState('');
  const unlocked = new Set(codexUnlocked);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = CODEX_ENTRIES;
    if (!q) return base;
    return base.filter(e => e.title.toLowerCase().includes(q) || e.markdown.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!selectedCodexKey) return;
    const el = containerRef.current?.querySelector(`#codex-${selectedCodexKey}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedCodexKey]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowCodex(false)} />
      <FocusTrap onEscape={() => setShowCodex(false)}>
      <div className="relative z-10 max-w-4xl mx-auto mt-12 rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="codex-title">
        <div className="flex items-center justify-between mb-3">
          <h3 id="codex-title" className="text-xl font-bold">Codex</h3>
          <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowCodex(false)}>Close</button>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entries..."
          className="w-full mb-4 px-3 py-2 rounded bg-white/5 border border-white/10 outline-none"
          aria-label="Search codex"
        />
        <InteractiveCodexSandbox />
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1 mt-3">
          {filtered.map((e) => (
            <div id={`codex-${e.key}`} key={e.key} className={`rounded-lg border border-white/10 p-4 ${unlocked.has(e.key) ? 'bg-terminal-success/10' : 'bg-white/5'} ${selectedCodexKey === e.key ? 'ring-2 ring-terminal-prompt/50' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <button onClick={() => setSelectedCodexKey(e.key)} className="font-semibold text-terminal-text/90 hover:underline text-left">{e.title}</button>
                <span className={`text-xs px-2 py-0.5 rounded border border-white/10 ${unlocked.has(e.key) ? 'bg-terminal-success/20 text-terminal-success' : 'bg-terminal-info/20 text-terminal-info'}`}>
                  {unlocked.has(e.key) ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <div className="text-xs text-terminal-text/60 mb-2">Unlocked by levels: {(codexUnlockMap[e.key] || []).join(', ') || '—'}</div>
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(e.markdown) as string }} />
              {Array.isArray((e as any).tokens) && (e as any).tokens.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(e as any).tokens.map((tok: string) => (
                    <button key={tok} className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded" onClick={() => setSelectedCodexKey(tok)}>{tok}</button>
                  ))}
                </div>
              )}
              {e.related && e.related.length > 0 && (
                <div className="mt-2 text-xs text-terminal-info">Related: {e.related.map(r => (
                  <button key={r} onClick={() => setSelectedCodexKey(r)} className="underline hover:no-underline mr-2">{r}</button>
                ))}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      </FocusTrap>
    </div>
  );
};

export default Codex;


