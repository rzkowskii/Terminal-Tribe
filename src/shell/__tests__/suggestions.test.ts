import { deriveSuggestions } from '../../utils/suggestions';
import type { CommandEvent } from '../../stores/telemetryStore';

describe('deriveSuggestions', () => {
  it('returns top concepts ordered by score with deterministic tie-break', () => {
    const events: CommandEvent[] = [
      { command: 'cat missing.txt', at: 1, status: 'error', output: 'cat: missing.txt: No such file or directory', isError: true },
      { command: 'rm', at: 2, status: 'error', output: 'rm: missing operand', isError: true },
      { command: 'mkdir a/b/c', at: 3, status: 'error', output: 'Parent directory does not exist', isError: true },
      { command: 'cp src dst', at: 4, status: 'error', output: 'Source src does not exist', isError: true },
      { command: 'echo "unterminated', at: 5, status: 'error', output: 'unmatched quote', isError: true },
      { command: 'ls /root', at: 6, status: 'error', output: 'permission denied', isError: true },
      { command: 'ls', at: 7, status: 'success' },
    ];

    const res = deriveSuggestions(events, 3);
    const keys = res.map(r => r.conceptKey);
    expect(keys).toEqual(['paths', 'copy-move', 'creation']);
    // Check reason present for paths
    expect(res.find(r => r.conceptKey === 'paths')?.reason).toBeTruthy();
  });

  it('returns empty when no error events', () => {
    const events: CommandEvent[] = [
      { command: 'ls', at: 1, status: 'success' },
      { command: 'pwd', at: 2, status: 'success' },
    ];
    const res = deriveSuggestions(events);
    expect(res).toEqual([]);
  });
});

import { deriveSuggestions } from '../../utils/suggestions';
import { CommandEvent } from '../../stores/telemetryStore';

describe('deriveSuggestions', () => {
  it('scores and orders suggestions with stable alphabetical tie-break', () => {
    const events: CommandEvent[] = [
      { command: 'cat missing.txt', at: 1, status: 'error', output: 'No such file or directory', isError: true },
      { command: 'rm', at: 2, status: 'error', output: 'rm: missing operand', isError: true },
      { command: 'mkdir a/b/c', at: 3, status: 'error', output: 'Parent directory does not exist', isError: true },
      { command: 'cat missing2.txt', at: 4, status: 'error', output: 'cannot access missing2.txt', isError: true },
      { command: 'echo "unterminated', at: 5, status: 'error', output: 'unmatched quote', isError: true },
    ];

    const res = deriveSuggestions(events, 3);
    expect(res.length).toBe(3);
    // paths should have 2 hits
    expect(res[0].conceptKey).toBe('paths');
    expect(res[0].score).toBeGreaterThanOrEqual(2);
    // For ties at 1, alphabetical order determines remaining picks
    const keys = res.map((r) => r.conceptKey);
    expect(keys.slice(1)).toEqual(['creation', 'expansion']);
  });
});


