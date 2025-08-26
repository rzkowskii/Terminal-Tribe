import React, { useMemo } from 'react';
import useUiStore from '../../stores/uiStore';
import useLevelStore from '../../stores/levelStore';
import FocusTrap from '../FocusTrap';

const acts = [
  { id: 1, name: 'Outpost Ruins', range: [1, 30] as [number, number] },
  { id: 2, name: 'Data Jungle', range: [31, 60] as [number, number] },
  { id: 3, name: 'Arctic Vaults', range: [61, 90] as [number, number] },
  { id: 4, name: 'Archipelago of Nodes', range: [91, 120] as [number, number] },
  { id: 5, name: 'Lunar Blacksite', range: [121, 150] as [number, number] },
];

const WorldMap: React.FC = () => {
  const { setShowMap, showActIntro, shownActIntros, setShowCodex, setSelectedCodexKey } = useUiStore();
  const { completedLevels, setCurrentLevel, setActFilter, currentLevel, levels } = useLevelStore();

  const idToMeta = useMemo(() => {
    const map = new Map<number, typeof levels[number]>();
    for (const l of levels) map.set(l.id, l);
    return map;
  }, [levels]);

  const maxCompleted = useMemo(() => (completedLevels.size > 0 ? Math.max(...Array.from(completedLevels)) : 0), [completedLevels]);
  const isActUnlocked = (actId: number) => {
    if (actId === 1) return true;
    const prevMax = acts[actId - 2].range[1];
    return maxCompleted >= prevMax;
  };

  const actProgress = (range: [number, number]) => {
    const [start, end] = range;
    let count = 0;
    for (let i = start; i <= end; i++) if (completedLevels.has(i)) count++;
    const total = end - start + 1;
    const pct = Math.round((count / total) * 100);
    return { count, total, pct };
  };

  const handleSelectAct = (actId: number) => {
    if (!isActUnlocked(actId)) return;
    setActFilter(actId);
    const [start, end] = acts[actId - 1].range;
    const completed = completedLevels;
    let target = start;
    for (let i = start; i <= end; i++) {
      if (!completed.has(i)) { target = i; break; }
    }
    setCurrentLevel(target);
    if (!shownActIntros.includes(actId)) {
      showActIntro(actId);
    } else {
      setShowMap(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowMap(false)} />
      <FocusTrap onEscape={() => setShowMap(false)}>
      <div className="relative z-10 max-w-3xl mx-auto mt-16 rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="worldmap-title">
        <div className="flex items-center justify-between mb-4">
          <h3 id="worldmap-title" className="text-xl font-bold">World Map</h3>
          <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowMap(false)}>Close</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {acts.map((a) => {
            const unlocked = isActUnlocked(a.id);
            const prog = actProgress(a.range);
            return (
              <div key={a.id} className={`rounded-lg border border-white/10 p-4 ${unlocked ? 'bg-white/5' : 'bg-black/30 opacity-60'}`}>
                <button
                  onClick={() => handleSelectAct(a.id)}
                  disabled={!unlocked}
                  className={`w-full text-left transition ${unlocked ? 'hover:opacity-90' : 'cursor-not-allowed'}`}
                >
                  <div className={`font-semibold mb-1 ${unlocked ? 'text-terminal-prompt' : 'text-terminal-text/60'}`}>Act {a.id}</div>
                  <div className="text-terminal-text/90 mb-2">{a.name}</div>
                  <div className="h-2 bg-white/10 rounded overflow-hidden">
                    <div className="h-2 bg-terminal-prompt/60" style={{ width: `${prog.pct}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-terminal-text/70">{prog.count}/{prog.total} levels</div>
                  {!unlocked && <div className="text-xs text-terminal-text/60 mt-1">Locked: Complete previous act</div>}
                </button>
                {unlocked && (
                  <div className="mt-3 grid grid-cols-8 gap-1">
                    {Array.from({ length: a.range[1] - a.range[0] + 1 }, (_, i) => a.range[0] + i).map(id => {
                      const meta = idToMeta.get(id);
                      const concepts = (meta?.conceptKeys || []).slice(0, 3);
                      const title = meta
                        ? `L${id}: ${meta.title}\n${meta.task}\n${meta.difficulty || ''} • ~${meta.estTimeMin || 1}m${concepts.length ? `\nconcepts: ${concepts.join(', ')}` : ''}`
                        : `Level ${id}`;
                      const aria = meta
                        ? `Level ${id}: ${meta.title}. ${meta.difficulty || ''}, approximately ${meta.estTimeMin || 1} minutes`
                        : `Level ${id}`;
                      return (
                        <div key={id} className="flex flex-col items-stretch group">
                          <button
                            onClick={() => { setCurrentLevel(id); setShowMap(false); }}
                            className={`text-xs h-7 rounded border ${completedLevels.has(id) ? 'bg-terminal-success/20 border-terminal-success/40 text-terminal-success' : id === currentLevel ? 'bg-terminal-prompt/20 border-terminal-prompt/40 text-terminal-prompt' : 'bg-white/5 border-white/10 text-terminal-text/80'} hover:bg-white/10`}
                            title={title}
                            aria-label={aria}
                          >{id}</button>
                          {meta && (
                            <div className="mt-1 flex items-center gap-1 flex-wrap max-h-0 overflow-hidden opacity-0 group-hover:max-h-10 group-hover:opacity-100 group-focus-within:max-h-10 group-focus-within:opacity-100 transition-all duration-200">
                              {meta.difficulty && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-terminal-text/80">
                                  {meta.difficulty}
                                </span>
                              )}
                              {typeof meta.estTimeMin === 'number' && meta.estTimeMin > 1 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-terminal-text/80">
                                  ~{meta.estTimeMin}m
                                </span>
                              )}
                              {(meta.conceptKeys || []).slice(0,1).map((k) => (
                                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-terminal-text/80">
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </FocusTrap>
    </div>
  );
};

export default WorldMap;


