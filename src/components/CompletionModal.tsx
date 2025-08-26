import React, { useEffect, useRef, useState } from 'react';
import useUiStore from '../stores/uiStore';
import FocusTrap from './FocusTrap';

interface Props {
  title: string;
  message: string;
  onClose: () => void;
  onNext: () => void;
  onRetry: () => void;
  onViewCodex?: () => void;
  isFinale?: boolean;
  otherApproaches?: string[];
  gradingDetails?: string[];
}

const CompletionModal: React.FC<Props> = ({ title, message, onClose, onNext, onRetry, onViewCodex, isFinale, otherApproaches, gradingDetails }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { autoAdvance, autoAdvanceDelayMs } = useUiStore();
  const [remaining, setRemaining] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    if (!isFinale && autoAdvance) {
      setRemaining(autoAdvanceDelayMs);
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const left = Math.max(0, autoAdvanceDelayMs - elapsed);
        setRemaining(left);
      }, 100);
      timerRef.current = setTimeout(() => {
        onNext();
      }, autoAdvanceDelayMs);
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      prev?.focus();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onClose, onNext, autoAdvance, autoAdvanceDelayMs, isFinale]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <FocusTrap initialFocusRef={closeRef} onEscape={onClose}>
      <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-terminal-bg/90 backdrop-blur p-6 text-terminal-text shadow-2xl">
        <h3 id="completion-title" className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-terminal-text/90 mb-4 whitespace-pre-wrap">{message}</p>
        {gradingDetails && gradingDetails.length > 0 && (
          <div className="mb-3 text-xs text-terminal-text/70">How this was graded: {gradingDetails.join(', ')}</div>
        )}
        {otherApproaches && otherApproaches.length > 0 && (
          <div className="mb-4 rounded border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold text-terminal-info mb-1">Other valid approaches</div>
            <ul className="list-disc pl-5 text-sm text-terminal-text/90">
              {otherApproaches.slice(0, 5).map((a, i) => (<li key={i}><code>{a}</code></li>))}
            </ul>
          </div>
        )}
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <button onClick={onRetry} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10">Retry</button>
            {onViewCodex && (
              <button onClick={onViewCodex} className="bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt px-3 py-1 rounded border border-terminal-prompt/30">View Codex</button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <button ref={closeRef} onClick={onClose} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10">Close</button>
            {!isFinale && (
              <button onClick={onNext} className="bg-terminal-success/20 hover:bg-terminal-success/30 text-terminal-success px-3 py-1 rounded border border-terminal-success/30">Next Level{autoAdvance && remaining !== null ? ` (${Math.ceil(remaining/1000)})` : ''}</button>
            )}
            {!isFinale && autoAdvance && (
              <button onClick={() => { setRemaining(null); if (timerRef.current) clearTimeout(timerRef.current); if (intervalRef.current) clearInterval(intervalRef.current); }} className="bg-white/5 hover:bg-white/10 text-terminal-text px-2 py-1 rounded border border-white/10 text-xs">Stay</button>
            )}
          </div>
        </div>
      </div>
      </FocusTrap>
    </div>
  );
};

export default CompletionModal;


