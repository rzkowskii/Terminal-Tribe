import React, { useRef } from 'react';
import useUiStore from '../stores/uiStore';
import FocusTrap from './FocusTrap';

const AboutModal: React.FC = () => {
  const { showAbout, setShowAbout } = useUiStore();
  const close = () => setShowAbout(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  if (!showAbout) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <FocusTrap initialFocusRef={closeBtnRef} onEscape={close}>
        <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-terminal-bg/95 backdrop-blur p-6 text-terminal-text shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 id="about-title" className="text-xl font-bold">About</h3>
            <button ref={closeBtnRef} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10" onClick={close}>Close</button>
          </div>
          <div className="space-y-2 text-terminal-text/90">
            <p>Richard Ziolkowski ~ 2025</p>
            <p>Made just for fun.</p>
            <p>MIT License. Do what you want with it!</p>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default AboutModal;


