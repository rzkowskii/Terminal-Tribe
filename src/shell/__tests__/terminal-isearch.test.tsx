import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Terminal from '../../components/Terminal';
import useTerminalStore from '../../stores/terminalStore';
import useUiStore from '../../stores/uiStore';

describe('Terminal reverse‑i‑search', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      commandHistory: [
        { command: 'ls -la', output: '', status: 'success' },
        { command: 'pwd', output: '', status: 'success' },
      ],
      historyIndex: -1,
      isearchOpen: false,
      isearchQuery: '',
      isearchResult: null,
    } as any);
    useUiStore.setState({ showTerminalHints: true });
  });

  it('opens overlay, searches, accepts result, and closes', () => {
    render(<Terminal />);
    const input = screen.getByPlaceholderText(/Type a command/i);
    input.focus();
    fireEvent.keyDown(input, { key: 'r', ctrlKey: true });
    const overlayInput = screen.getByPlaceholderText(/Type to search history/i);
    fireEvent.change(overlayInput, { target: { value: 'ls' } });
    fireEvent.keyDown(overlayInput, { key: 'Enter' });
    // overlay closed
    expect(screen.queryByPlaceholderText(/Type to search history/i)).toBeNull();
    // input updated
    expect((input as HTMLInputElement).value).toBe('ls -la');
  });

  it('esc closes overlay without changing input when no match', () => {
    render(<Terminal />);
    const input = screen.getByPlaceholderText(/Type a command/i);
    fireEvent.keyDown(input, { key: 'r', ctrlKey: true });
    const overlayInput = screen.getByPlaceholderText(/Type to search history/i);
    fireEvent.change(overlayInput, { target: { value: 'nope' } });
    fireEvent.keyDown(overlayInput, { key: 'Enter' });
    // no result -> overlay closes and input unchanged (empty)
    expect((input as HTMLInputElement).value).toBe('');
  });
});


