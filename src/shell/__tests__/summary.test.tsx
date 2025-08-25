import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import SummaryModal from '../../components/SummaryModal';
import useUiStore from '../../stores/uiStore';
import useTelemetryStore from '../../stores/telemetryStore';

describe('Summary Modal', () => {
  it('aggregates command counts', () => {
    const t = useTelemetryStore.getState();
    t.enabled = true;
    t.record({ command: 'ls -l', at: Date.now(), status: 'success' });
    t.record({ command: 'ls', at: Date.now(), status: 'success' });
    useUiStore.setState({ showSummary: true });
    const { getByText } = render(<SummaryModal />);
    expect(getByText('Session Summary')).toBeTruthy();
    expect(getByText('ls')).toBeTruthy();
  });

  it('shows suggestions when enabled and errors present, and opens skills on click', () => {
    const ui = useUiStore.getState();
    useUiStore.setState({ featureFlags: { ...ui.featureFlags, telemetry: true, suggestions: true } });
    const t = useTelemetryStore.getState();
    t.enabled = true;
    t.clear();
    t.record({ command: 'cat missing.txt', at: Date.now(), status: 'error', output: 'cat: missing.txt: No such file or directory', isError: true });
    t.record({ command: 'rm', at: Date.now(), status: 'error', output: 'rm: missing operand', isError: true });
    useUiStore.setState({ showSummary: true });
    const { getByText, getAllByRole } = render(<SummaryModal />);
    expect(getByText('Suggested practice')).toBeTruthy();
    expect(getByText('paths')).toBeTruthy();
    expect(getByText('removal')).toBeTruthy();
    const buttons = getAllByRole('button', { name: /Practice topic:/ });
    fireEvent.click(buttons[0]);
    expect(useUiStore.getState().showSkills).toBe(true);
  });

  it('suggestion chips are present and clickable (smoke)', () => {
    const ui = useUiStore.getState();
    useUiStore.setState({ featureFlags: { ...ui.featureFlags, telemetry: true, suggestions: true } });
    const t = useTelemetryStore.getState();
    t.enabled = true;
    t.clear();
    t.record({ command: 'cat missing.txt', at: Date.now(), status: 'error', output: 'No such file or directory', isError: true });
    useUiStore.setState({ showSummary: true });
    const { getByRole } = render(<SummaryModal />);
    const chip = getByRole('button', { name: /Practice topic:/i });
    expect(chip).toBeTruthy();
  });
});


