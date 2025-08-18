import { BuiltinCommand } from './types';

const registry = new Map<string, BuiltinCommand>();

export function register(cmd: BuiltinCommand) {
  registry.set(cmd.meta.name, cmd);
}

export function get(name: string): BuiltinCommand | undefined {
  return registry.get(name);
}

export function list(): BuiltinCommand[] {
  return Array.from(registry.values());
}

