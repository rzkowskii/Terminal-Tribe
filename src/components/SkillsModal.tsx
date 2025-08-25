import React, { useMemo, useRef } from 'react';
import useUiStore from '../stores/uiStore';
import useSkillStore from '../stores/skillStore';
import FocusTrap from './FocusTrap';

const SkillsModal: React.FC = () => {
  const { showSkills, setShowSkills } = useUiStore();
  const { skills } = useSkillStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const entries = useMemo(() => Object.entries(skills), [skills]);
  if (!showSkills) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="skills-title">
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowSkills(false)} />
      <FocusTrap initialFocusRef={closeRef} onEscape={() => setShowSkills(false)}>
        <div className="relative z-10 w-full max-w-lg rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 id="skills-title" className="text-xl font-bold">Skills</h3>
            <button ref={closeRef} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowSkills(false)}>Close</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {entries.length === 0 && <div className="text-terminal-text/70">No skill progress yet.</div>}
            {entries.map(([key, prog]) => (
              <div key={key} className="rounded border border-white/10 p-3 bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold">{key}</div>
                  <div className="text-xs text-terminal-info">Lv {prog.level}</div>
                </div>
                <div className="h-2 bg-white/10 rounded overflow-hidden">
                  <div className="h-2 bg-terminal-prompt/60" style={{ width: `${Math.min(100, (prog.xp % 20) * 5)}%` }} />
                </div>
                <div className="text-xs text-terminal-text/70 mt-1">{prog.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default SkillsModal;


