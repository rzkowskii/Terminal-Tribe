import { Level, FileSystemState, defaultFileSystemState } from '../types/level';
import { assignInodes, createDirectory, writeFile, copyFile, moveFile, removeFile, createLink, isDirectoryNode, changeDirectory } from './fileSystem';
import levels1To20 from '../levels/levels1-20.json';
import levels21To40 from '../levels/levels21-40.json';
import levels41To60 from '../levels/levels41-60.json';
import { applyNarrative } from '../content/narrative';

const normalizeFileSystemState = (state?: Partial<FileSystemState> | { currentDirectory?: string; previousDirectory?: string; files?: unknown }): FileSystemState => {
  if (!state) {
    return { ...defaultFileSystemState };
  }
  const currentDirectory = state.currentDirectory || defaultFileSystemState.currentDirectory;
  const previousDirectory = state.previousDirectory || currentDirectory;
  let files = (state.files as Record<string, unknown>) || {};
  // Treat provided files as root if it has a top-level 'home' directory; otherwise nest under /home/recruit
  const hasHomeRoot = files && typeof files === 'object' && Object.prototype.hasOwnProperty.call(files, 'home');
  if (!hasHomeRoot) {
    files = {
      home: {
        type: 'directory',
        files: {
          recruit: {
            type: 'directory',
            files
          }
        }
      }
    } as unknown as FileSystemState['files'];
  }
  const normalized: FileSystemState = { currentDirectory, previousDirectory, files } as FileSystemState;
  return assignInodes(normalized);
};

const conceptFromCommand = (cmd: string): string[] => {
  const c = cmd.trim().split(/\s+/)[0];
  switch (c) {
    case 'pwd':
    case 'cd':
      return ['paths'];
    case 'ls':
      return ['listing'];
    case 'touch':
    case 'mkdir':
      return ['creation'];
    case 'cp':
    case 'mv':
      return ['copy-move'];
    case 'rm':
    case 'rmdir':
      return ['removal'];
    case 'ln':
      return ['links'];
    case 'echo':
      return ['expansion'];
    default:
      return [];
  }
};

const actBiomeForId = (id: number): { act: number; biome: NonNullable<Level['biome']> } => {
  // Distribute 150 levels across five acts evenly (1-30, 31-60, 61-90, 91-120, 121-150)
  if (id <= 30) return { act: 1, biome: 'outpost' };
  if (id <= 60) return { act: 2, biome: 'jungle' };
  if (id <= 90) return { act: 3, biome: 'arctic' };
  if (id <= 120) return { act: 4, biome: 'archipelago' };
  return { act: 5, biome: 'lunar' };
};

type RawLevel = Partial<Level> & { id: number; title: string; story: string; task: string; successMessage: string } & { [k: string]: unknown };
const normalizeLevel = (raw: RawLevel): Level => {
  const normalizedInitial = normalizeFileSystemState(raw.initialState);
  const normalizedExpected = raw.expectedState ? normalizeFileSystemState(raw.expectedState) : normalizedInitial;
  const n: Level = {
    id: raw.id,
    title: raw.title,
    story: raw.story,
    task: raw.task,
    expectedCommand: raw.expectedCommand,
    acceptedCommands: raw.acceptedCommands,
    expectedOutput: raw.expectedOutput,
    postConditions: raw.postConditions,
    rubric: raw.rubric,
    successMessage: raw.successMessage,
    initialState: normalizedInitial,
    expectedState: normalizedExpected,
    act: raw.act,
    biome: raw.biome,
    faction: raw.faction,
    loreIntro: raw.loreIntro,
    radioChatter: raw.radioChatter,
    successLore: raw.successLore,
    hint: raw.hint,
    conceptKeys: raw.conceptKeys || conceptFromCommand(raw.expectedCommand || ''),
    difficulty: raw.difficulty,
    estTimeMin: raw.estTimeMin,
  };
  if (!n.act || !n.biome) {
    const ab = actBiomeForId(n.id);
    n.act = ab.act;
    n.biome = ab.biome;
  }
  // Keep difficulty undefined for curated pacing
  if (typeof n.estTimeMin !== 'number') {
    n.estTimeMin = Math.max(1, Math.min(10, Math.ceil(((n.expectedCommand || '').split(/\s+/).length) / 2)));
  }
  return n;
};

export const loadLevels = (): Level[] => {
  // Some test environments may not support JSON ESM imports via ts-jest. Fallback to require at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const src1: any = (levels1To20 as any) || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const src2: any = (levels21To40 as any) || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const src3: any = (levels41To60 as any) || {};
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const json1 = src1.levels ? src1 : require('../levels/levels1-20.json');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const json2 = src2.levels ? src2 : require('../levels/levels21-40.json');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const json3 = src3.levels ? src3 : require('../levels/levels41-60.json');
  const levels1 = (json1.levels as any[]).map(normalizeLevel);
  const levels2 = (json2.levels as any[]).map(normalizeLevel);
  const levels3 = (json3.levels as any[]).map(normalizeLevel);
  const extra = generateAdditionalLevels(61, 150);

  const allLevels = applyNarrative([...levels1, ...levels2, ...levels3, ...extra]);
  const validatedLevels = validateLevels(allLevels);
  return validatedLevels;
};

export default loadLevels;

export const validateLevels = (levels: Level[]): Level[] => {
  // Ensure levels are in order
  levels.sort((a, b) => a.id - b.id);

  // Check for missing or duplicate levels
  const idCounts: Record<number, number> = {};
  for (const l of levels) {
    idCounts[l.id] = (idCounts[l.id] || 0) + 1;
  }
  const duplicateIds = Object.entries(idCounts)
    .filter(([, count]) => (count as number) > 1)
    .map(([id]) => Number(id))
    .sort((a, b) => a - b);

  const maxId = levels.length > 0 ? Math.max(...levels.map(l => l.id)) : 0;
  const existingIds = new Set(levels.map(l => l.id));
  const missingIds = Array.from({ length: maxId }, (_, i) => i + 1).filter(id => !existingIds.has(id));

  if (missingIds.length > 0) {
    console.warn('Missing level IDs:', missingIds);
  }

  if (duplicateIds.length > 0) {
    console.error('Duplicate level IDs:', duplicateIds);
  }

  return levels;
};

// -------- Additional content generator (61-150, including 10 labs) --------

function deepCloneState<T>(s: T): T {
  return JSON.parse(JSON.stringify(s)) as T;
}

function freshState(): FileSystemState {
  // Start from default FS
  const base = deepCloneState(defaultFileSystemState);
  return assignInodes(base);
}

function withCwd(state: FileSystemState, cwd: string): FileSystemState {
  const next = deepCloneState(state);
  next.currentDirectory = cwd;
  next.previousDirectory = cwd;
  return next;
}

function labScenario(index: number): { initial: FileSystemState; expected: FileSystemState; title: string; task: string } {
  // Create a balanced multi-step objective reachable with core built-ins
  let s = freshState();
  s = createDirectory(s, '/home/recruit/staging', true);
  s = createDirectory(s, '/home/recruit/incoming/assets', true);
  s = writeFile(s, '/home/recruit/staging/report.txt', 'alpha');
  s = writeFile(s, '/home/recruit/incoming/assets/logo.svg', '<svg></svg>');
  s = writeFile(s, '/home/recruit/incoming/assets/readme.md', '# assets');
  const initial = withCwd(s, '/home/recruit');

  let e = deepCloneState(initial);
  // mkdir -p ops/reports/2024 && mv staging/report.txt ops/reports/2024/report.txt
  e = createDirectory(e, '/home/recruit/ops/reports/2024', true);
  e = moveFile(e, '/home/recruit/staging/report.txt', '/home/recruit/ops/reports/2024/report.txt').newState;
  // cp -r incoming/assets ops/assets
  e = copyFile(e, '/home/recruit/incoming/assets', '/home/recruit/ops/assets', true);
  // ln -s ops/assets ops/link-assets
  e = createLink(e, '/home/recruit/ops/assets', '/home/recruit/ops/link-assets', true);
  // rm -r incoming
  e = removeFile(e, '/home/recruit/incoming', true, false);
  // cd ops
  e = changeDirectory(e, 'ops');
  const expected = e;

  return {
    initial: initial,
    expected: expected,
    title: `Lab ${index}: Ops Consolidation`,
    task: 'Consolidate reports into ops/reports/2024, copy assets, create a symlink, remove incoming, and end in /home/recruit/ops.'
  };
}

function generateAdditionalLevels(startId: number, endId: number): Level[] {
  const levels: Level[] = [];
  // Choose 10 lab IDs evenly across range
  const total = endId - startId + 1;
  const labCount = 10;
  const labIds = new Set<number>();
  for (let i = 0; i < labCount; i++) {
    const pos = Math.floor((i + 1) * (total / (labCount + 1)));
    labIds.add(startId + pos);
  }

  for (let id = startId; id <= endId; id++) {
    // Act 3 focuses on permissions/ownership/umask; disable extra text-tool injections here
    // (IDs 64–67 now fall through to curated Act 3 generator)
    // Curated injections for new domains
    if (id === 61) {
      const initial: FileSystemState = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'doc.txt': { type: 'file', content: 'secret', permissions: '-rw-------', owner: 'recruit', group: 'tribe' } as any } });
      const expected: FileSystemState = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'doc.txt': { type: 'file', content: 'secret', permissions: '-rw-r--r--', owner: 'recruit', group: 'tribe' } as any } });
      levels.push({ id, title: 'Set File Permissions', story: 'Harden a file before sharing.', task: 'Set doc.txt to 644 permissions.', expectedCommand: 'chmod 644 doc.txt', successMessage: 'Permissions updated.', initialState: initial, expectedState: expected, conceptKeys: ['permissions'], hint: 'Try: chmod 644 doc.txt' } as Level);
      continue;
    }
    if (id === 62) {
      const initial: FileSystemState = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'doc.txt': { type: 'file', content: 'payload', permissions: '-rw-r--r--', owner: 'recruit', group: 'tribe' } as any } });
      const expected: FileSystemState = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'doc.txt': { type: 'file', content: 'payload', permissions: '-rw-r--r--', owner: 'root', group: 'root' } as any } });
      levels.push({ id, title: 'Change Ownership', story: 'Transfer control to root.', task: 'Change owner and group of doc.txt to root:root.', expectedCommand: 'chown root:root doc.txt', successMessage: 'Ownership updated.', initialState: initial, expectedState: expected, conceptKeys: ['ownership'], hint: 'Try: chown root:root doc.txt' } as Level);
      continue;
    }
    if (id === 63) {
      levels.push({ id, title: 'Adjust umask', story: 'Tighten default creation mask.', task: 'Set umask to 027.', expectedCommand: 'umask 027', successMessage: 'Mask set.', initialState: normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} }), expectedState: normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} }), conceptKeys: ['permissions'], hint: 'Try: umask 027' } as Level);
      continue;
    }
    // Add a few mini multi-step permission tasks before 90 for variety
    if (id === 70) {
      // chmod -R and verify directory/file perms
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'proj': { type: 'directory', files: { 'readme.md': { type: 'file', content: 'hello', permissions: '-rw-------', owner: 'recruit', group: 'tribe' } } as any, permissions: 'drwx------', owner: 'recruit', group: 'tribe' } as any } });
      const expected = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'proj': { type: 'directory', files: { 'readme.md': { type: 'file', content: 'hello', permissions: '-rw-r--r--', owner: 'recruit', group: 'tribe' } } as any, permissions: 'drwxr-xr-x', owner: 'recruit', group: 'tribe' } as any } });
      levels.push({ id, title: 'Harden Then Share', story: 'Iris: Apply consistent access across a tree.', task: 'Recursively set proj to 755 and files inside to readable.', expectedCommand: 'chmod -R 755 proj', successMessage: 'Tree permissions aligned.', initialState: initial, expectedState: expected, conceptKeys: ['permissions'], hint: 'Try: chmod -R 755 proj' } as Level);
      continue;
    }
    if (id === 74) {
      // chown -R root:root on a directory tree
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'cache': { type: 'directory', files: { 'data.bin': { type: 'file', content: 'x', owner: 'recruit', group: 'tribe' } } as any, owner: 'recruit', group: 'tribe' } as any } });
      const expected = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'cache': { type: 'directory', files: { 'data.bin': { type: 'file', content: 'x', owner: 'root', group: 'root' } } as any, owner: 'root', group: 'root' } as any } });
      levels.push({ id, title: 'Custody Shift', story: 'Iris: Ownership defines responsibility—shift it.', task: 'Recursively change owner:group of cache to root:root.', expectedCommand: 'chown -R root:root cache', successMessage: 'Ownership transferred.', initialState: initial, expectedState: expected, conceptKeys: ['ownership'], hint: 'Try: chown -R root:root cache' } as Level);
      continue;
    }
    if (id === 78) {
      // umask then create a file to validate behavior via expected state unchanged but post-condition check is not used here; keep expected equal to initial to pass outcome by command match
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
      levels.push({ id, title: 'Default Discipline', story: 'Iris: Set the mask before you create.', task: 'Set umask 077 for strict defaults.', expectedCommand: 'umask 077', successMessage: 'Defaults tightened.', initialState: initial, expectedState: initial, conceptKeys: ['permissions'], hint: 'Try: umask 077' } as Level);
      continue;
    }
    if (id === 82) {
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {
        'secrets': { type: 'directory', files: { 'token.txt': { type: 'file', content: 'abcd1234', permissions: '-rw-r--r--', owner: 'recruit', group: 'tribe' } } as any, permissions: 'drwxr-xr-x', owner: 'recruit', group: 'tribe' } as any
      } });
      const expected = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {
        'secrets': { type: 'directory', files: { 'token.txt': { type: 'file', content: 'abcd1234', permissions: '-rwx------', owner: 'recruit', group: 'tribe' } } as any, permissions: 'drwx------', owner: 'recruit', group: 'tribe' } as any
      } });
      levels.push({ id, title: 'Lock the Vault', story: 'Iris: Close every door—only you should pass.', task: 'Recursively set secrets to 700.', expectedCommand: 'chmod -R 700 secrets', successMessage: 'Secrets locked.', initialState: initial, expectedState: expected, conceptKeys: ['permissions'], hint: 'Try: chmod -R 700 secrets' } as Level);
      continue;
    }
    if (id === 86) {
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {
        'shared': { type: 'directory', files: { 'notes.txt': { type: 'file', content: 'guidelines', permissions: '-rw-------', owner: 'recruit', group: 'tribe' } } as any, permissions: 'drwx------', owner: 'recruit', group: 'tribe' } as any
      } });
      const expected = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {
        'shared': { type: 'directory', files: { 'notes.txt': { type: 'file', content: 'guidelines', permissions: '-rwxrwxr-x', owner: 'recruit', group: 'tribe' } } as any, permissions: 'drwxrwxr-x', owner: 'recruit', group: 'tribe' } as any
      } });
      levels.push({ id, title: 'Open the Commons', story: 'Iris: Collaboration needs access—grant group rights safely.', task: 'Recursively set shared to 775.', expectedCommand: 'chmod -R 775 shared', successMessage: 'Shared area opened.', initialState: initial, expectedState: expected, conceptKeys: ['permissions'], hint: 'Try: chmod -R 775 shared' } as Level);
      continue;
    }
    if (id === 88) {
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {
        'drop': { type: 'directory', files: { 'inbox.txt': { type: 'file', content: 'leave here', permissions: '-rw-------', owner: 'recruit', group: 'tribe' } } as any, permissions: 'drwx------', owner: 'recruit', group: 'tribe' } as any
      } });
      const expected = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {
        'drop': { type: 'directory', files: { 'inbox.txt': { type: 'file', content: 'leave here', permissions: '-rw-------', owner: 'recruit', group: 'tribe' } } as any, permissions: 'drwxrwxrwx', owner: 'recruit', group: 'tribe' } as any
      } });
      levels.push({ id, title: 'Shared Drop', story: 'Iris: Create a world-writable drop box (training only).', task: 'Set drop to 777.', expectedCommand: 'chmod 777 drop', successMessage: 'Drop zone open.', initialState: initial, expectedState: expected, conceptKeys: ['permissions'], hint: 'Try: chmod 777 drop' } as Level);
      continue;
    }
    if (id === 91) {
      levels.push({ id, title: 'Enable Service', story: 'Prepare API for boot.', task: 'Enable api.service.', expectedCommand: 'systemctl enable api.service', successMessage: 'Service enabled.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['services'], hint: 'Try: systemctl enable api.service' } as Level);
      continue;
    }
    if (id === 92) {
      levels.push({ id, title: 'Start Service', story: 'Bring API online.', task: 'Start api.service.', expectedCommand: 'systemctl start api.service', successMessage: 'Service started.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['services'], hint: 'Try: systemctl start api.service' } as Level);
      continue;
    }
    if (id === 93) {
      levels.push({ id, title: 'Log a Message', story: 'Write to system log.', task: 'Log "API up".', expectedCommand: 'logger API up', successMessage: 'Log written.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['logs'], hint: 'Try: logger "API up"' } as Level);
      continue;
    }
    if (id === 94) {
      levels.push({ id, title: 'Read Logs', story: 'Verify service status via logs.', task: 'Show journal entries.', expectedCommand: 'journalctl', successMessage: 'Entries reviewed.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['logs'], hint: 'Try: journalctl' } as Level);
      continue;
    }
    if (id === 96) {
      levels.push({ id, title: 'Service Status', story: 'Check API state.', task: 'Show status of api.service.', expectedCommand: 'systemctl status api.service', successMessage: 'Status known.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['services'], hint: 'Try: systemctl status api.service' } as Level);
      continue;
    }
    if (id === 97) {
      levels.push({ id, title: 'Stop Service', story: 'Iris: Sometimes you must shut it down safely.', task: 'Stop api.service.', expectedCommand: 'systemctl stop api.service', successMessage: 'Service stopped.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['services'], hint: 'Try: systemctl stop api.service' } as Level);
      continue;
    }
    if (id === 98) {
      levels.push({ id, title: 'Disable Service', story: 'Iris: Prevent auto-start—make it deliberate.', task: 'Disable api.service.', expectedCommand: 'systemctl disable api.service', successMessage: 'Service disabled.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['services'], hint: 'Try: systemctl disable api.service' } as Level);
      continue;
    }
    if (id === 101) {
      levels.push({ id, title: 'Mount Data Volume', story: 'Attach external data.', task: 'Mount /dev/sdb1 to /mnt/data.', expectedCommand: 'mount /dev/sdb1 /mnt/data', successMessage: 'Volume mounted.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['filesystems'], hint: 'Try: mount /dev/sdb1 /mnt/data' } as Level);
      continue;
    }
    if (id === 102) {
      levels.push({ id, title: 'Check Space', story: 'Audit mounted filesystems.', task: 'Show df output.', expectedCommand: 'df', successMessage: 'Capacity noted.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['filesystems'], hint: 'Try: df' } as Level);
      continue;
    }
    if (id === 103) {
      levels.push({ id, title: 'List Blocks', story: 'Inspect block devices.', task: 'List block devices.', expectedCommand: 'lsblk', successMessage: 'Devices listed.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['filesystems'], hint: 'Try: lsblk' } as Level);
      continue;
    }
    if (id === 104) {
      levels.push({ id, title: 'Unmount Volume', story: 'Safely detach the volume.', task: 'Unmount /mnt/data.', expectedCommand: 'umount /mnt/data', successMessage: 'Volume detached.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['filesystems'], hint: 'Try: umount /mnt/data' } as Level);
      continue;
    }
    if (id === 110) {
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'project': { type: 'directory', files: { 'a.txt': { type: 'file', content: 'x' } } as any } as any } });
      levels.push({ id, title: 'Estimate Usage', story: 'Iris: Know the weight of your data.', task: 'Show a summary size for project.', expectedCommand: 'du -s project', successMessage: 'Usage estimated.', initialState: initial, expectedState: initial, conceptKeys: ['filesystems'], hint: 'Try: du -s project' } as Level);
      continue;
    }
    if (id === 118) {
      // Micro-lab: create mountpoint, mount device, copy tree, report df
      let s = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
      const initial = s;
      let e = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
      // expected: a mountpoint exists conceptually; we keep FS equal and validate by command match
      levels.push({ id, title: 'FS Micro-Lab: Stage Data', story: 'Iris: Attach, stage, measure—tight loop.', task: 'Create /mnt/data, mount /dev/sdb1, then check df.', expectedCommand: 'mkdir -p /mnt/data && mount /dev/sdb1 /mnt/data && df', successMessage: 'Mounted, staged, measured.', initialState: initial, expectedState: e, conceptKeys: ['filesystems'], hint: 'Try: mkdir -p /mnt/data && mount /dev/sdb1 /mnt/data && df' } as Level);
      continue;
    }
    if (id === 121) {
      levels.push({ id, title: 'Install Nano', story: 'Fetch essentials.', task: 'Install nano with apt.', expectedCommand: 'apt install nano', successMessage: 'Nano installed.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['packages'], hint: 'Try: apt install nano' } as Level);
      continue;
    }
    if (id === 122) {
      levels.push({ id, title: 'List Packages', story: 'Audit installed packages.', task: 'List installed with dpkg -l.', expectedCommand: 'dpkg -l', successMessage: 'Packages listed.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['packages'], hint: 'Try: dpkg -l' } as Level);
      continue;
    }
    if (id === 123) {
      levels.push({ id, title: 'Install curl (RPM)', story: 'Use DNF on an RPM system.', task: 'Install curl with dnf.', expectedCommand: 'dnf install curl', successMessage: 'curl installed.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['packages'], hint: 'Try: dnf install curl' } as Level);
      continue;
    }
    if (id === 124) {
      levels.push({ id, title: 'Query RPM', story: 'Confirm installation.', task: 'Query nano or curl with rpm -q.', expectedCommand: 'rpm -q nano', successMessage: 'Package present.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['packages'], hint: 'Try: rpm -q nano' } as Level);
      continue;
    }
    if (id === 125) {
      levels.push({ id, title: 'Search Packages', story: 'Discover available services.', task: 'Search for nginx via apt.', expectedCommand: 'apt search nginx', successMessage: 'Results found.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['packages'], hint: 'Try: apt search nginx' } as Level);
      continue;
    }
    if (id === 126) {
      levels.push({ id, title: 'Remove Package', story: 'Iris: Keep systems lean—remove what you no longer need.', task: 'Remove nano with apt.', expectedCommand: 'apt remove nano', successMessage: 'Package removed.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['packages'], hint: 'Try: apt remove nano' } as Level);
      continue;
    }
    if (id === 127) {
      levels.push({ id, title: 'Inspect Package', story: 'Iris: Query details directly.', task: 'Show nano status via dpkg -s.', expectedCommand: 'dpkg -s nano', successMessage: 'Details shown.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['packages'], hint: 'Try: dpkg -s nano' } as Level);
      continue;
    }
    if (id === 131) {
      levels.push({ id, title: 'Assign Address', story: 'Bring interface online.', task: 'Assign 10.0.0.2/24 to eth0.', expectedCommand: 'ip addr add 10.0.0.2/24 dev eth0', successMessage: 'Address assigned.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['net-iface'], hint: 'Try: ip addr add 10.0.0.2/24 dev eth0' } as Level);
      continue;
    }
    if (id === 132) {
      levels.push({ id, title: 'Link Up', story: 'Enable the interface.', task: 'Set link up.', expectedCommand: 'ip link set eth0 up', successMessage: 'Link up.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['net-iface'], hint: 'Try: ip link set eth0 up' } as Level);
      continue;
    }
    if (id === 133) {
      levels.push({ id, title: 'Default Route', story: 'Add a default gateway.', task: 'Add default route via 10.0.0.1.', expectedCommand: 'ip route add default via 10.0.0.1', successMessage: 'Route added.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['net-routing'], hint: 'Try: ip route add default via 10.0.0.1' } as Level);
      continue;
    }
    if (id === 134) {
      levels.push({ id, title: 'Ping Host', story: 'Verify connectivity.', task: 'Ping example.com.', expectedCommand: 'ping example.com', successMessage: 'Reachable.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['net-tests'], hint: 'Try: ping example.com' } as Level);
      continue;
    }
    if (id === 135) {
      levels.push({ id, title: 'Show Addresses', story: 'Audit interface config.', task: 'Show addresses on interfaces.', expectedCommand: 'ip addr show', successMessage: 'Addresses listed.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['net-iface'], hint: 'Try: ip addr show' } as Level);
      continue;
    }
    if (id === 136) {
      levels.push({ id, title: 'Add Route', story: 'Add a static network.', task: 'Add route to 10.0.1.0/24 via 10.0.0.1.', expectedCommand: 'ip route add 10.0.1.0/24 via 10.0.0.1', successMessage: 'Route added.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['net-routing'], hint: 'Try: ip route add 10.0.1.0/24 via 10.0.0.1' } as Level);
      continue;
    }
    if (id === 139) {
      levels.push({ id, title: 'Show Routes', story: 'Iris: Audit the paths your packets will take.', task: 'Show current routes.', expectedCommand: 'ip route show', successMessage: 'Routes listed.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['net-routing'], hint: 'Try: ip route show' } as Level);
      continue;
    }
    if (id === 140) {
      levels.push({ id, title: 'Link Down', story: 'Iris: Disable an interface cleanly.', task: 'Set eth0 down.', expectedCommand: 'ip link set eth0 down', successMessage: 'Link disabled.', initialState: normalizeFileSystemState({ files: {} }), expectedState: normalizeFileSystemState({ files: {} }), conceptKeys: ['net-iface'], hint: 'Try: ip link set eth0 down' } as Level);
      continue;
    }
    if (id === 145) {
      // Micro-lab: assign address, bring link up, add default route, then ping
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
      const expected = initial;
      levels.push({ id, title: 'Net Micro-Lab: Bring It Online', story: 'Iris: Address, link, route, verify—clean execution.', task: 'Assign 10.0.0.2/24 to eth0, link up, add default route, ping example.com.', expectedCommand: 'ip addr add 10.0.0.2/24 dev eth0 && ip link set eth0 up && ip route add default via 10.0.0.1 && ping example.com', successMessage: 'Connectivity verified.', initialState: initial, expectedState: expected, conceptKeys: ['net-iface','net-routing','net-tests'], hint: 'Try: ip addr add … && ip link set … up && ip route add default via … && ping example.com' } as Level);
      continue;
    }
    if (labIds.has(id)) {
      const labIdx = Array.from(labIds).sort((a, b) => a - b).indexOf(id) + 1;
      const { initial, expected, title, task } = labScenario(labIdx);
      levels.push({
        id,
        title,
        story: 'An ops merge requires precision under time pressure. Prove your mastery.',
        task,
        expectedCommand: 'lab',
        successMessage: 'Ops consolidated. Lab complete.',
        initialState: initial,
        expectedState: expected,
        conceptKeys: ['copy-move', 'creation', 'links', 'removal', 'paths'],
        estTimeMin: 5,
        hint: 'Sequence: mkdir -p ops/...; mv staging/report.txt ...; cp -r incoming/assets ...; ln -s ...; rm -r incoming; cd ops'
      } as Level);
      continue;
    }

    // Curated domain schedule for remaining IDs
    const makeTextLevels = () => {
      const idx = id % 6;
      if (idx === 0) {
        const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'log.txt': { type: 'file', content: 'ok\nwarn\nerror\n' } as any } });
        return { title: 'Filter Errors', task: 'Show only error lines.', cmd: 'grep -i error log.txt', concept: ['search'] };
      }
      if (idx === 1) {
        const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'nums.txt': { type: 'file', content: '3\n1\n2\n' } as any } });
        return { title: 'Sort Ascending', task: 'Sort numbers ascending.', cmd: 'sort -n nums.txt', concept: ['text-io'] };
      }
      if (idx === 2) {
        const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'users.csv': { type: 'file', content: 'u1,admin\nu2,user\n' } as any } });
        return { title: 'Extract Usernames', task: 'Print first CSV field.', cmd: 'cut -d , -f 1 users.csv', concept: ['text-io'] };
      }
      if (idx === 3) {
        const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
        return { title: 'Uppercase', task: 'Uppercase input HELLO.', cmd: "echo hello | tr 'a-z' 'A-Z'", concept: ['text-io'] };
      }
      if (idx === 4) {
        const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
        return { title: 'Duplicate Output', task: 'Write payload to file and stdout.', cmd: 'echo payload | tee out.txt', concept: ['redirection'] };
      }
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'a.txt': { type: 'file', content: 'x' } as any, 'b.txt': { type: 'file', content: 'y' } as any } });
      return { title: 'Compare Files', task: 'Check if a.txt differs from b.txt.', cmd: 'diff a.txt b.txt', concept: ['compare'] };
    };

    const makePermLevels = () => {
      const idx = id % 3;
      if (idx === 0) {
        const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'doc.txt': { type: 'file', content: 'x', permissions: '-rw-------', owner: 'recruit', group: 'tribe' } as any } });
        const expected = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'doc.txt': { type: 'file', content: 'x', permissions: '-rw-r--r--', owner: 'recruit', group: 'tribe' } as any } });
        return {
          title: 'Open Read Access',
          task: 'Set doc.txt to 644.',
          cmd: 'chmod 644 doc.txt',
          concept: ['permissions'],
          hint: 'Grant group/other read: chmod 644 doc.txt',
          story: 'Iris: Arctic protocols demand clarity—open read access precisely.',
          initial,
          expected,
        } as {
          title: string; task: string; cmd: string; concept: string[]; hint?: string; story?: string; initial?: FileSystemState; expected?: FileSystemState
        };
      }
      if (idx === 1) {
        const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'doc.txt': { type: 'file', content: 'x', permissions: '-rw-r--r--', owner: 'recruit', group: 'tribe' } as any } });
        const expected = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: { 'doc.txt': { type: 'file', content: 'x', permissions: '-rw-r--r--', owner: 'root', group: 'root' } as any } });
        return {
          title: 'Transfer Ownership',
          task: 'Make root:root owner of doc.txt.',
          cmd: 'chown root:root doc.txt',
          concept: ['ownership'],
          hint: 'Change owner and group: chown root:root doc.txt',
          story: 'Iris: Custody matters in the cold—transfer control to root.',
          initial,
          expected,
        } as {
          title: string; task: string; cmd: string; concept: string[]; hint?: string; story?: string; initial?: FileSystemState; expected?: FileSystemState
        };
      }
      const initial = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
      const expected = normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
      return {
        title: 'Set Default Mask',
        task: 'Set umask to 027.',
        cmd: 'umask 027',
        concept: ['permissions'],
        hint: 'Tighten defaults: umask 027',
        story: 'Iris: In the whiteout, default discipline keeps you safe—tighten the mask.',
        initial,
        expected,
      } as {
        title: string; task: string; cmd: string; concept: string[]; hint?: string; story?: string; initial?: FileSystemState; expected?: FileSystemState
      };
    };

    const makeServiceLevels = () => {
      const idx = id % 4;
      if (idx === 0) return { title: 'Enable Service', task: 'Enable api.service.', cmd: 'systemctl enable api.service', concept: ['services'], hint: 'Try: systemctl enable api.service', story: 'Iris: Services live on when enabled—make it persist.' } as any;
      if (idx === 1) return { title: 'Start Service', task: 'Start api.service.', cmd: 'systemctl start api.service', concept: ['services'], hint: 'Try: systemctl start api.service', story: 'Iris: Start the process—hear the system breathe.' } as any;
      if (idx === 2) return { title: 'Write a Log', task: 'Log message "OK".', cmd: 'logger OK', concept: ['logs'], hint: 'Try: logger OK', story: 'Iris: Leave a trail—future you will thank you.' } as any;
      return { title: 'Read Journal', task: 'Show logs.', cmd: 'journalctl', concept: ['logs'], hint: 'Try: journalctl', story: 'Iris: The machine remembers—read its memory.' } as any;
    };

    const makeFsLevels = () => {
      const idx = id % 4;
      if (idx === 0) return { title: 'Mount Volume', task: 'Mount /dev/sdb1 at /mnt/data.', cmd: 'mount /dev/sdb1 /mnt/data', concept: ['filesystems'], hint: 'Try: mount /dev/sdb1 /mnt/data', story: 'Iris: Attach the island—make its data reachable.' } as any;
      if (idx === 1) return { title: 'Check Space', task: 'Show filesystem usage.', cmd: 'df', concept: ['filesystems'], hint: 'Try: df', story: 'Iris: Measure capacity—avoid silent failures.' } as any;
      if (idx === 2) return { title: 'List Blocks', task: 'List block devices.', cmd: 'lsblk', concept: ['filesystems'], hint: 'Try: lsblk', story: 'Iris: See the hardware map beneath the paths.' } as any;
      return { title: 'Unmount Volume', task: 'Unmount /mnt/data.', cmd: 'umount /mnt/data', concept: ['filesystems'], hint: 'Try: umount /mnt/data', story: 'Iris: Detach cleanly—leave nothing dirty.' } as any;
    };

    const makePkgLevels = () => {
      const idx = id % 5;
      if (idx === 0) return { title: 'Search Packages', task: 'Search for nginx.', cmd: 'apt search nginx', concept: ['packages'], hint: 'Try: apt search nginx', story: 'Iris: Discover what tools exist before choosing one.' } as any;
      if (idx === 1) return { title: 'Install nano', task: 'Install nano.', cmd: 'apt install nano', concept: ['packages'], hint: 'Try: apt install nano', story: 'Iris: Add the right tool for the job.' } as any;
      if (idx === 2) return { title: 'List Installed', task: 'List installed packages.', cmd: 'dpkg -l', concept: ['packages'], hint: 'Try: dpkg -l', story: 'Iris: Audit the system—know what’s present.' } as any;
      if (idx === 3) return { title: 'Install curl (RPM)', task: 'Install curl via dnf.', cmd: 'dnf install curl', concept: ['packages'], hint: 'Try: dnf install curl', story: 'Iris: On RPM lands, sail with dnf.' } as any;
      return { title: 'Query RPM', task: 'Query nano with rpm.', cmd: 'rpm -q nano', concept: ['packages'], hint: 'Try: rpm -q nano', story: 'Iris: Verify installation—assume nothing.' } as any;
    };

    const makeNetLevels = () => {
      const idx = id % 4;
      if (idx === 0) return { title: 'Assign Address', task: 'Assign 10.0.0.2/24 to eth0.', cmd: 'ip addr add 10.0.0.2/24 dev eth0', concept: ['net-iface'], hint: 'Try: ip addr add 10.0.0.2/24 dev eth0', story: 'Iris: Give the interface a voice on the network.' } as any;
      if (idx === 1) return { title: 'Link Up', task: 'Bring eth0 up.', cmd: 'ip link set eth0 up', concept: ['net-iface'], hint: 'Try: ip link set eth0 up', story: 'Iris: Enable the link—no signal flows when down.' } as any;
      if (idx === 2) return { title: 'Default Route', task: 'Add default route via 10.0.0.1.', cmd: 'ip route add default via 10.0.0.1', concept: ['net-routing'], hint: 'Try: ip route add default via 10.0.0.1', story: 'Iris: Set the path home for unknown destinations.' } as any;
      return { title: 'Ping Host', task: 'Ping example.com.', cmd: 'ping example.com', concept: ['net-tests'], hint: 'Try: ping example.com', story: 'Iris: Ask the far end if it hears you.' } as any;
    };

    const act = actBiomeForId(id).act;
    let curated: { title: string; task: string; cmd: string; concept: string[]; hint?: string; story?: string; initial?: FileSystemState; expected?: FileSystemState };
    if (act === 2) curated = makeTextLevels();
    else if (act === 3) curated = makePermLevels();
    // Group topics for smoother pacing:
    // Act 4: services first (91–105), then filesystems (106–120)
    else if (act === 4) {
      if (id <= 105) curated = makeServiceLevels();
      else curated = makeFsLevels();
    }
    // Act 5: packages first (121–135), then networking (136–150)
    else if (act === 5) {
      if (id <= 135) curated = makePkgLevels();
      else curated = makeNetLevels();
    }
    else curated = makeTextLevels();

    const story = curated.story || `Iris whispers: ${curated.title}. The ${actBiomeForId(id).biome} hums as you type.`;
    const initial = curated.initial || normalizeFileSystemState({ currentDirectory: '/home/recruit', files: {} });
    levels.push({
      id,
      title: curated.title,
      story,
      task: curated.task,
      expectedCommand: curated.cmd,
      successMessage: 'Task complete.',
      initialState: initial,
      expectedState: curated.expected || initial,
      conceptKeys: curated.concept,
      hint: curated.hint || `Try: ${curated.cmd}`,
    } as Level);
  }
  return levels;
}


