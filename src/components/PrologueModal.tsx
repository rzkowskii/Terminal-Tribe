import React, { useEffect, useRef } from 'react';
import { PROLOGUE } from '../content/narrative';

interface Props {
  onStart: () => void;
}

const PrologueModal: React.FC<Props> = ({ onStart }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    startRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStart();
      if (e.key === 'Tab') {
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
  }, [onStart]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="prologue-title">
      <div className="absolute inset-0 bg-black/70" />
      <div ref={dialogRef} className="relative z-10 max-w-2xl mx-4 rounded-xl border border-white/10 bg-terminal-bg/90 backdrop-blur p-8 text-terminal-text shadow-2xl">
        <h2 id="prologue-title" className="text-2xl font-bold mb-3">Prologue</h2>
        <p className="text-terminal-text/90 mb-4 whitespace-pre-wrap">{PROLOGUE}</p>
        <div className="flex justify-end">
          <button ref={startRef} onClick={onStart} className="bg-terminal-prompt/20 hover:bg-terminal-prompt/30 text-terminal-prompt px-4 py-2 rounded border border-terminal-prompt/30">Begin</button>
        </div>
      </div>
    </div>
  );
};

export default PrologueModal;


