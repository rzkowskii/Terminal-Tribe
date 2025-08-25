import type { CommandEvent } from '../stores/telemetryStore';

export interface SuggestionRule {
  test: RegExp | ((e: CommandEvent) => boolean);
  conceptKey: string;
  weight?: number;
  reason: string;
}

export const SUGGESTION_RULES: SuggestionRule[] = [
  {
    test: /(No such file|cannot access|cd: .*: No such)/i,
    conceptKey: 'paths',
    weight: 1,
    reason: 'File or directory path errors',
  },
  {
    test: /(permission denied|Operation not permitted)/i,
    conceptKey: 'paths',
    weight: 1,
    reason: 'Permissions or access issues',
  },
  {
    test: /(rm: missing operand|rmdir: missing operand)/i,
    conceptKey: 'removal',
    weight: 1,
    reason: 'Removal command missing target',
  },
  {
    test: /(mkdir: .* parent|Parent directory does not exist)/i,
    conceptKey: 'creation',
    weight: 1,
    reason: 'Creating directories with parents',
  },
  {
    test: /(cp: missing|Source .* does not exist)/i,
    conceptKey: 'copy-move',
    weight: 1,
    reason: 'Copy/move source or args incorrect',
  },
  {
    test: /(ln: .* not a directory|invalid link path)/i,
    conceptKey: 'links',
    weight: 1,
    reason: 'Hard/soft link path issues',
  },
  {
    test: /(unmatched quote|bad substitution|echo .* unexpected)/i,
    conceptKey: 'expansion',
    weight: 1,
    reason: 'Quoting/expansion syntax errors',
  },
];

export function deriveSuggestions(events: CommandEvent[], max: number = 3): { conceptKey: string; score: number; reason: string }[] {
  if (!Array.isArray(events) || events.length === 0) return [];

  const errorEvents = events.filter((e) => e.isError || e.status === 'error');
  if (errorEvents.length === 0) return [];

  const scores = new Map<string, { score: number; reason: string }>();

  for (const e of errorEvents) {
    const haystack = `${e.output || ''}\n${e.command || ''}`;
    let matched: SuggestionRule | undefined;
    for (const rule of SUGGESTION_RULES) {
      const ok = typeof rule.test === 'function' ? rule.test(e) : rule.test.test(haystack);
      if (ok) {
        matched = rule;
        break;
      }
    }
    if (!matched) continue;
    const { conceptKey, weight = 1, reason } = matched;
    const prev = scores.get(conceptKey) || { score: 0, reason };
    scores.set(conceptKey, { score: prev.score + weight, reason: prev.reason || reason });
  }

  const result = Array.from(scores.entries())
    .map(([conceptKey, v]) => ({ conceptKey, score: v.score, reason: v.reason }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.conceptKey.localeCompare(b.conceptKey);
    })
    .slice(0, max);

  return result;
}


