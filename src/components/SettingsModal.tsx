import React, { useRef } from 'react';
import useUiStore from '../stores/uiStore';
import useTelemetryStore from '../stores/telemetryStore';
import FocusTrap from './FocusTrap';

const SettingsModal: React.FC = () => {
  const { showSettings, setShowSettings, autoAdvance, setAutoAdvance, autoAdvanceDelayMs, setAutoAdvanceDelay, showSceneEffects, toggleSceneEffects, featureFlags, showTerminalHints, showScene, toggleScene } = useUiStore();
  const close = () => setShowSettings(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  if (!showSettings) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <FocusTrap initialFocusRef={closeBtnRef} onEscape={close}>
        <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 id="settings-title" className="text-xl font-bold">Settings</h3>
            <button ref={closeBtnRef} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={close}>Close</button>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3">
              <span>Auto-Advance</span>
              <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Auto-Advance Delay (ms)</span>
              <input type="number" className="w-28 bg-white/5 border border-white/10 rounded px-2 py-1" value={autoAdvanceDelayMs} onChange={(e) => setAutoAdvanceDelay(Number(e.target.value) || 0)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Reduce Motion / Disable Effects</span>
              <input type="checkbox" checked={!showSceneEffects} onChange={() => toggleSceneEffects()} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Experimental Scene</span>
              <input type="checkbox" checked={!!showScene} onChange={() => toggleScene()} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Terminal Hints</span>
              <input type="checkbox" checked={!!showTerminalHints} onChange={(e) => useUiStore.setState({ showTerminalHints: e.target.checked })} />
            </label>
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="text-sm font-semibold mb-2">Experimental Features</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3"><span>Solution Policy</span><input type="checkbox" checked={featureFlags.solutionPolicy} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, solutionPolicy: e.target.checked } })} /></div>
                <div className="flex items-center justify-between gap-3"><span>Process Simulation</span><input type="checkbox" checked={featureFlags.processSim} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, processSim: e.target.checked } })} /></div>
                <div className="flex items-center justify-between gap-3"><span>Archives</span><input type="checkbox" checked={featureFlags.archives} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, archives: e.target.checked } })} /></div>
                <div className="flex items-center justify-between gap-3"><span>Skills</span><input type="checkbox" checked={featureFlags.skills} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, skills: e.target.checked } })} /></div>
                <div className="flex items-center justify-between gap-3"><span>Badges</span><input type="checkbox" checked={featureFlags.badges} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, badges: e.target.checked } })} /></div>
                <div className="flex items-center justify-between gap-3"><span>Narrative Branches</span><input type="checkbox" checked={featureFlags.narrativeBranches} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, narrativeBranches: e.target.checked } })} /></div>
                <div className="flex items-center justify-between gap-3"><span>Telemetry</span><input type="checkbox" checked={featureFlags.telemetry} onChange={(e) => { useUiStore.setState({ featureFlags: { ...featureFlags, telemetry: e.target.checked } }); useTelemetryStore.setState({ enabled: e.target.checked }); }} /></div>
                <div className="flex items-center justify-between gap-3"><span>Recommendations</span><input type="checkbox" checked={featureFlags.suggestions} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, suggestions: e.target.checked } })} /></div>
                <div className="flex items-center justify-between gap-3"><span>Sandbox</span><input type="checkbox" checked={featureFlags.sandbox} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, sandbox: e.target.checked } })} /></div>
                <div className="flex items-center justify-between gap-3"><span>Deep Link Chips</span><input type="checkbox" checked={featureFlags.deepLinks} onChange={(e) => useUiStore.setState({ featureFlags: { ...featureFlags, deepLinks: e.target.checked } })} /></div>
              </div>
            </div>
            <p className="text-xs text-terminal-text/70">Tip: Press ? in the terminal to open related Codex entries for the current command.</p>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default SettingsModal;


