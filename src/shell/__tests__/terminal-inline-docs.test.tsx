import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Terminal from '../../components/Terminal';
import Codex from '../../components/Codex/Codex';
import useUiStore from '../../stores/uiStore';

describe('Terminal inline docs "?"', () => {
  beforeEach(() => {
    useUiStore.setState({ showCodex: false, selectedCodexKey: undefined });
  });

  it('opens Codex for token at caret when pressing ?', () => {
    render(<div><Terminal /><Codex /></div>);
    const input = screen.getByPlaceholderText(/Type a command/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ls -l' } });
    // set caret inside the 'ls' token
    input.setSelectionRange(2, 2);
    fireEvent.keyDown(input, { key: '?' });
    expect(useUiStore.getState().showCodex).toBe(true);
    expect(useUiStore.getState().selectedCodexKey).toBe('ls');
  });
});


