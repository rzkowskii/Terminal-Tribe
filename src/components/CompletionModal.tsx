import React, { useEffect, useRef } from 'react';

interface Props {
  title: string;
  message: string;
  onClose: () => void;
  onNext: () => void;
  onRetry: () => void;
  onViewCodex?: () => void;
}

const CompletionModal: React.FC<Props> = ({ title, message, onClose, onNext, onRetry, onViewCodex }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // naive trap: keep focus inside dialog
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div ref={dialogRef} className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-terminal-bg/90 backdrop-blur p-6 text-terminal-text shadow-2xl">
        <h3 id="completion-title" className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-terminal-text/90 mb-4 whitespace-pre-wrap">{message}</p>
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <button onClick={onRetry} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10">Retry</button>
            {onViewCodex && (
              <button onClick={onViewCodex} className="bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt px-3 py-1 rounded border border-terminal-prompt/30">View Codex</button>
            )}
          </div>
          <div className="flex gap-2">
            <button ref={closeRef} onClick={onClose} className="bg-white/5 hover:bg-white/10 text-terminal-text px-3 py-1 rounded border border-white/10">Close</button>
            <button onClick={onNext} className="bg-terminal-success/20 hover:bg-terminal-success/30 text-terminal-success px-3 py-1 rounded border border-terminal-success/30">Next Level</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;


