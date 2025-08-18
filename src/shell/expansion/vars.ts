// Very small variable expansion: ${NAME} or $NAME using a provided env map
export function expandVariables(arg: string, env: Record<string, string | undefined>): string {
  // ${VAR}
  let out = arg.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name) => env[name] ?? '');
  // $VAR
  out = out.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => env[name] ?? '');
  return out;
}

