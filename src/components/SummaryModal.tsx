import React, { useMemo, useRef } from 'react';
import FocusTrap from './FocusTrap';
import useUiStore from '../stores/uiStore';
import useTelemetryStore from '../stores/telemetryStore';
import { deriveSuggestions } from '../utils/suggestions';

const SummaryModal: React.FC = () => {
  const { showSummary, setShowSummary, featureFlags, setShowSkills, setShowCodex, setSelectedCodexKey } = useUiStore();
  const telemetry = useTelemetryStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const data = useMemo(() => telemetry.aggregate(), [telemetry.events]);
  const suggestions = useMemo(() => {
    if (!featureFlags.telemetry || !featureFlags.suggestions) return [] as ReturnType<typeof deriveSuggestions>;
    return deriveSuggestions(telemetry.events);
  }, [telemetry.events, featureFlags.telemetry, featureFlags.suggestions]);
  if (!showSummary) return null;
  const entries = Object.entries(data.counts).sort((a, b) => b[1] - a[1]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowSummary(false)} />
      <FocusTrap initialFocusRef={closeRef} onEscape={() => setShowSummary(false)}>
        <div className="relative z-10 w-full max-w-xl rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 id="summary-title" className="text-xl font-bold">Session Summary</h3>
            <button ref={closeRef} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowSummary(false)}>Close</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {entries.length === 0 && <div className="text-terminal-text/70">No telemetry recorded. Enable in Settings.</div>}
            {entries.map(([cmd, count]) => (
              <div key={cmd} className="rounded border border-white/10 p-3 bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{cmd}</div>
                  <div className="text-xs text-terminal-info">{count}</div>
                </div>
                <div className="h-2 bg-white/10 rounded overflow-hidden mt-2">
                  <div className="h-2 bg-terminal-success/60" style={{ width: `${Math.min(100, count * 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
          {featureFlags.telemetry && featureFlags.suggestions && suggestions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Suggested practice</h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.conceptKey}
                    className="px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm"
                    aria-label={`Practice topic: ${s.conceptKey}`}
                    onClick={() => setShowSkills(true)}
                  >
                    <span className="font-semibold mr-2">{s.conceptKey}</span>
                    <span className="text-terminal-text/70">{s.reason}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );
};

export default SummaryModal;


