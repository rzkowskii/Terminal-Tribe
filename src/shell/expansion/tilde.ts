export function expandTilde(_ctx: unknown, arg: string): string {
  if (!arg.startsWith('~')) return arg;
  // ~ or ~user[/...]
  const rest = arg.slice(1);
  if (rest === '' || rest.startsWith('/')) {
    return '/home/recruit' + rest;
  }
  // ~username or ~username/...
  const slashIndex = rest.indexOf('/');
  const username = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
  const tail = slashIndex === -1 ? '' : rest.slice(slashIndex);
  // Map to /home/<user>
  return `/home/${username}${tail}`;
}

