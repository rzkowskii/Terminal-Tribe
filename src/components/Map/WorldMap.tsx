import React, { useMemo } from 'react';
import useUiStore from '../../stores/uiStore';
import useLevelStore from '../../stores/levelStore';

const acts = [
  { id: 1, name: 'Outpost Ruins', range: [1, 12] as [number, number] },
  { id: 2, name: 'Data Jungle', range: [13, 20] as [number, number] },
  { id: 3, name: 'Arctic Vaults', range: [21, 36] as [number, number] },
  { id: 4, name: 'Archipelago of Nodes', range: [37, 48] as [number, number] },
  { id: 5, name: 'Lunar Blacksite', range: [49, 60] as [number, number] },
];

const WorldMap: React.FC = () => {
  const { setShowMap, showActIntro, shownActIntros } = useUiStore();
  const { completedLevels, setCurrentLevel, setActFilter } = useLevelStore();

  const maxCompleted = useMemo(() => (completedLevels.size > 0 ? Math.max(...Array.from(completedLevels)) : 0), [completedLevels]);
  const isActUnlocked = (actId: number) => {
    if (actId === 1) return true;
    const prevMax = acts[actId - 2].range[1];
    return maxCompleted >= prevMax;
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
      <div className="relative z-10 max-w-3xl mx-auto mt-16 rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">World Map</h3>
          <button className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowMap(false)}>Close</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {acts.map((a) => {
            const unlocked = isActUnlocked(a.id);
            return (
              <button
                key={a.id}
                onClick={() => handleSelectAct(a.id)}
                disabled={!unlocked}
                className={`text-left rounded-lg border border-white/10 p-4 transition ${unlocked ? 'bg-white/5 hover:bg-white/10' : 'bg-black/30 opacity-60 cursor-not-allowed'}`}
              >
                <div className={`font-semibold mb-1 ${unlocked ? 'text-terminal-prompt' : 'text-terminal-text/60'}`}>Act {a.id}</div>
                <div className="text-terminal-text/90">{a.name}</div>
                {!unlocked && <div className="text-xs text-terminal-text/60 mt-1">Locked: Complete previous act</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorldMap;


