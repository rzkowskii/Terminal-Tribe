// Expand a single {a,b} or {1..5} style pattern in an argument.
export function expandBrace(arg: string): string[] {
  const start = arg.indexOf('{');
  const end = arg.indexOf('}', start + 1);
  if (start === -1 || end === -1 || end <= start + 1) return [arg];
  const prefix = arg.slice(0, start);
  const body = arg.slice(start + 1, end);
  const suffix = arg.slice(end + 1);

  // Numeric range {1..5}
  const rangeMatch = body.match(/^(\d+)\.\.(\d+)$/);
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1], 10);
    const b = parseInt(rangeMatch[2], 10);
    const results: string[] = [];
    const step = a <= b ? 1 : -1;
    for (let i = a; step > 0 ? i <= b : i >= b; i += step) {
      results.push(prefix + String(i) + suffix);
    }
    return results;
  }

  // Comma list {a,b,c}
  const parts = body.split(',');
  if (parts.length > 1) {
    return parts.map(p => prefix + p + suffix);
  }

  return [arg];
}

