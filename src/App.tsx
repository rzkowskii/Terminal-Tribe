import React, { useEffect } from 'react';
import Terminal from './components/Terminal';
import LevelDisplay from './components/LevelDisplay';
import useLevelStore from './stores/levelStore';
import HUD from './components/HUD';
import useUiStore from './stores/uiStore';
import WorldMap from './components/Map/WorldMap';
import Codex from './components/Codex/Codex';
import PrologueModal from './components/PrologueModal';
import CompletionModal from './components/CompletionModal';
import ActIntroModal from './components/ActIntroModal';

const App: React.FC = () => {
  const { initializeLevels, goToNextLevel, resetLevel } = useLevelStore();
  const { showMap, showCodex, showPrologue, setShowPrologue, showCompletionModal, setShowCompletionModal, completionTitle, completionMessage, completionCodexKey, setShowCodex } = useUiStore();

  useEffect(() => {
    initializeLevels();
  }, [initializeLevels]);

  return (
    <div className="min-h-screen bg-terminal-bg">
      <div className="container mx-auto p-6">
        <HUD />
        <h1 className="text-4xl font-bold text-center mb-8 text-terminal-text tracking-tight">Terminal Tribe</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <LevelDisplay />
          </div>
          <div className="space-y-4">
            <Terminal />
          </div>
        </div>
      </div>

      {showMap && <WorldMap />}
      {showCodex && <Codex />}
      {showPrologue && <PrologueModal onStart={() => setShowPrologue(false)} />}
      <ActIntroModal />
      {showCompletionModal && (
        <CompletionModal
          title={completionTitle || 'Data Shard Restored'}
          message={completionMessage || 'A lost fragment of the Archive hums to life. The Tribe grows stronger.'}
          onClose={() => setShowCompletionModal(false)}
          onNext={() => { setShowCompletionModal(false); goToNextLevel(); }}
          onRetry={() => { setShowCompletionModal(false); resetLevel(); }}
          onViewCodex={completionCodexKey ? () => { setShowCompletionModal(false); setShowCodex(true); } : undefined}
        />
      )}
    </div>
  );
};

export default App;
