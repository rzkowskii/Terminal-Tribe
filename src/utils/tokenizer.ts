export function extractOutputTokens(text: string): string[] {
  const tokens = new Set<string>();
  const reFlag = /(?:^|\s)-(\w+)/g;
  const reCommand = /\b([a-z]{2,})\b/g;
  let m: RegExpExecArray | null;
  while ((m = reFlag.exec(text))) {
    const letters = m[1].split('');
    for (const ch of letters) tokens.add('-' + ch);
  }
  while ((m = reCommand.exec(text))) {
    const t = m[1];
    if (t.length >= 3) tokens.add(t);
  }
  return Array.from(tokens).slice(0, 8);
}


