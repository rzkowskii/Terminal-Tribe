import React, { useEffect, useRef } from 'react';

type Props = {
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
  onEscape?: () => void;
};

const FocusTrap: React.FC<Props> = ({ children, initialFocusRef, onEscape }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    const focusables = getFocusables();
    const target = initialFocusRef?.current || focusables[0] || undefined;
    target?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = getFocusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prevFocusRef.current?.focus();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFocusables = () => {
    const root = containerRef.current;
    if (!root) return [] as HTMLElement[];
    const selectors = [
      'a[href]', 'button:not([disabled])', 'textarea', 'input', 'select',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    return Array.from(root.querySelectorAll<HTMLElement>(selectors)).filter(el => !el.hasAttribute('disabled'));
  };

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

export default FocusTrap;


