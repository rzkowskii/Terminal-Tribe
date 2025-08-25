import React, { useRef } from 'react';
import useUiStore from '../stores/uiStore';
import useAchievementStore from '../stores/achievementStore';
import useCosmeticsStore from '../stores/cosmeticsStore';
import FocusTrap from './FocusTrap';

const ProfileModal: React.FC = () => {
  const { showProfile, setShowProfile } = useUiStore();
  const { list } = useAchievementStore();
  const { themes, selectedThemeId, setTheme } = useCosmeticsStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  if (!showProfile) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowProfile(false)} />
      <FocusTrap initialFocusRef={closeRef} onEscape={() => setShowProfile(false)}>
        <div className="relative z-10 w-full max-w-lg rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 id="profile-title" className="text-xl font-bold">Profile</h3>
            <button ref={closeRef} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={() => setShowProfile(false)}>Close</button>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold mb-1">Theme</div>
            <div className="flex gap-2 flex-wrap">
              {themes.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} className={`px-2 py-1 rounded border ${selectedThemeId === t.id ? 'bg-terminal-prompt/20 border-terminal-prompt/40 text-terminal-prompt' : 'bg-white/5 border-white/10 text-terminal-text/80'}`}>{t.name}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1">Badges</div>
            <div className="grid grid-cols-2 gap-2">
              {list().length === 0 && <div className="text-terminal-text/60">No badges yet.</div>}
              {list().map(b => (
                <div key={b.id} className="rounded border border-white/10 p-2 bg-white/5">
                  <div className="font-semibold text-sm">{b.title}</div>
                  <div className="text-xs text-terminal-text/70">{b.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default ProfileModal;


