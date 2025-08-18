type Level = 'debug' | 'info' | 'warn' | 'error' | 'silent';

let currentLevel: Level = (import.meta as any).env?.MODE === 'test' ? 'silent' : 'debug';

const levelOrder: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100
};

export function setLevel(level: Level) {
  currentLevel = level;
}

function logAt(level: Level, ...args: unknown[]) {
  if (levelOrder[level] < levelOrder[currentLevel]) return;
  const fn = level === 'debug' ? console.log : level === 'info' ? console.info : level === 'warn' ? console.warn : console.error;
  fn(...args);
}

export const logger = {
  debug: (...args: unknown[]) => logAt('debug', ...args),
  info: (...args: unknown[]) => logAt('info', ...args),
  warn: (...args: unknown[]) => logAt('warn', ...args),
  error: (...args: unknown[]) => logAt('error', ...args),
};


