import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Terminal from '../../components/Terminal';
import Codex from '../../components/Codex/Codex';
import useTerminalStore from '../../stores/terminalStore';
import useUiStore from '../../stores/uiStore';

describe('Terminal deep‑link chips', () => {
  beforeEach(() => {
    const ui = useUiStore.getState();
    useUiStore.setState({ featureFlags: { ...ui.featureFlags, deepLinks: true }, showCodex: false, selectedCodexKey: undefined } as any);
    useTerminalStore.setState({
      commandHistory: [
        { command: 'ls x', output: "ls: cannot access 'x': No such file or directory", status: 'error' },
      ],
      historyIndex: -1,
    } as any);
  });

  it('renders token chip and opens codex on click', () => {
    render(<div><Terminal /><Codex /></div>);
    // tokenizer extracts words len>=3, so 'cannot' appears from the error text
    const chip = screen.getByRole('button', { name: /Open Codex for cannot/i });
    expect(chip).toBeInTheDocument();
    fireEvent.click(chip);
    expect(useUiStore.getState().showCodex).toBe(true);
    expect(useUiStore.getState().selectedCodexKey).toBe('cannot');
  });

  it('does not render chips when flag disabled', () => {
    const ui = useUiStore.getState();
    useUiStore.setState({ featureFlags: { ...ui.featureFlags, deepLinks: false } });
    render(<Terminal />);
    expect(screen.queryByRole('button', { name: /Open Codex for/i })).toBeNull();
  });
});


