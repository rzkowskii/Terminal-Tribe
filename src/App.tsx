import React, { useEffect } from 'react';
import Terminal from './components/Terminal';
import LevelDisplay from './components/LevelDisplay';
import useLevelStore from './stores/levelStore';
import HUD from './components/HUD';
import useUiStore from './stores/uiStore';
import useTelemetryStore from './stores/telemetryStore';
import WorldMap from './components/Map/WorldMap';
import Codex from './components/Codex/Codex';
import PrologueModal from './components/PrologueModal';
import CompletionModal from './components/CompletionModal';
import ActIntroModal from './components/ActIntroModal';
import SceneViewport from './components/SceneViewport';
import StatusPanel from './components/StatusPanel';
import FinaleModal from './components/FinaleModal';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import SkillsModal from './components/SkillsModal';
import ProfileModal from './components/ProfileModal';
import SummaryModal from './components/SummaryModal';
import FactionModal from './components/FactionModal';

const App: React.FC = () => {
  const { initializeLevels, goToNextLevel, resetLevel, goToPrevLevel } = useLevelStore();
  const { showMap, showCodex, showPrologue, setShowPrologue, showCompletionModal, setShowCompletionModal, completionTitle, completionMessage, completionCodexKey, completionOtherApproaches, completionMatched, setShowCodex, showScene, showSceneEffects, showFinale, featureFlags, setShowAbout } = useUiStore();
  const { currentLevel, levels } = useLevelStore();
  const currentLevelData = levels.find(l => l.id === currentLevel);
  const sceneLabel = currentLevelData?.biome ? `📍 ${currentLevelData.biome.toUpperCase()}` : '📍 Sector: Terminal Outpost';

  useEffect(() => {
    initializeLevels();
  }, [initializeLevels]);

  // Keep telemetry recorder in sync with feature flag
  useEffect(() => {
    useTelemetryStore.setState({ enabled: !!featureFlags.telemetry });
    if (!featureFlags.telemetry) {
      useTelemetryStore.getState().clear();
    }
  }, [featureFlags.telemetry]);

  return (
    <div className="min-h-screen bg-terminal-bg">
      {showScene && <SceneViewport label={sceneLabel} biome={currentLevelData?.biome} effectsEnabled={showSceneEffects} />}
      <div className="container mx-auto p-6">
        <HUD />
        <h1 className="text-4xl font-bold text-center mb-8 text-terminal-text tracking-tight">Terminal Tribe</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_18rem] gap-8">
          <div className="space-y-4">
            <LevelDisplay />
            <div className="rounded-xl shadow-xl border border-white/10 bg-terminal-bg/30 backdrop-blur p-4 text-terminal-text">
              <div className="grid grid-cols-3 gap-2 items-center">
                <button onClick={() => goToPrevLevel()} disabled={currentLevel <= 1} className="w-full h-12 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-terminal-text font-semibold text-base px-4 rounded border border-white/10 whitespace-nowrap flex items-center justify-center">Previous</button>
                <button onClick={() => resetLevel()} className="w-full h-12 bg-white/5 hover:bg-white/10 text-terminal-text font-semibold text-base px-4 rounded border border-white/10 whitespace-nowrap flex items-center justify-center">Reset</button>
                <button onClick={() => goToNextLevel()} className="w-full h-12 bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt font-semibold text-base px-4 rounded border border-terminal-prompt/30 whitespace-nowrap flex items-center justify-center">Next Level</button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Terminal />
          </div>
          <StatusPanel />
        </div>
      </div>

      {showMap && <WorldMap />}
      {showCodex && <Codex />}
      <SettingsModal />
      <SkillsModal />
      <ProfileModal />
      <SummaryModal />
      <FactionModal />
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
          otherApproaches={completionOtherApproaches}
          gradingDetails={completionMatched}
        />
      )}
      {showFinale && <FinaleModal />}
      {/* Bottom-center About button */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
        <button className="text-xs bg-white/5 hover:bg-white/10 text-terminal-text/80 px-3 py-1 rounded border border-white/10" onClick={() => setShowAbout(true)}>About</button>
      </div>
      <AboutModal />
    </div>
  );
};

export default App;
