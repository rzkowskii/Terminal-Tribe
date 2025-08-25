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
import SkillsModal from './components/SkillsModal';
import ProfileModal from './components/ProfileModal';
import SummaryModal from './components/SummaryModal';
import FactionModal from './components/FactionModal';

const App: React.FC = () => {
  const { initializeLevels, goToNextLevel, resetLevel } = useLevelStore();
  const { showMap, showCodex, showPrologue, setShowPrologue, showCompletionModal, setShowCompletionModal, completionTitle, completionMessage, completionCodexKey, completionOtherApproaches, completionMatched, setShowCodex, showScene, showSceneEffects, showFinale, featureFlags } = useUiStore();
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
          <div>
            <LevelDisplay />
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
    </div>
  );
};

export default App;
