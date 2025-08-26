export interface Level {
  id: number;
  title: string;
  story: string;
  task: string;
  expectedCommand: string;
  acceptedCommands?: string[]; // Accept simple strings or pipeline equivalents via SolutionPolicy
  expectedOutput?: string;
  postConditions?: Record<string, unknown>;
  rubric?: { efficiency?: string; safety?: string; style?: string };
  successMessage: string;
  initialState: FileSystemState;  // Made required to ensure type safety
  expectedState: FileSystemState; // Made required to ensure type safety
  // Optional narrative fields (populated by loader if missing)
  act?: number;
  biome?: 'outpost' | 'jungle' | 'arctic' | 'archipelago' | 'lunar';
  faction?: 'scribes' | 'circuit' | 'null';
  loreIntro?: string;
  radioChatter?: string;
  successLore?: string;
  hint?: string;
  // Concept keys for codex unlocking
  conceptKeys?: string[];
  // Optional meta data used for previews
  difficulty?: 'easy' | 'medium' | 'hard';
  estTimeMin?: number;
}

export interface DirectoryNode {
  type: 'directory';
  inode?: number;
  permissions?: string;
  owner?: string;
  group?: string;
  files: { [key: string]: FileSystemNode };
}

export interface FileNode {
  type: 'file';
  inode?: number;
  permissions?: string;
  owner?: string;
  group?: string;
  size?: number;
  content: string;
}

export interface SymlinkNode {
  type: 'symlink';
  inode?: number;
  permissions?: string;
  owner?: string;
  group?: string;
  target: string;
}

export type FileSystemNode = FileNode | DirectoryNode | SymlinkNode;

export interface FileSystemState {
  currentDirectory: string;
  previousDirectory: string;
  files: { [key: string]: FileSystemNode };
}

// Default file system state that can be used for levels that don't specify custom state
export const defaultFileSystemState: FileSystemState = {
  currentDirectory: '/home/recruit',
  previousDirectory: '/home/recruit',
  files: {
    home: {
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      files: {
        recruit: {
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: 'recruit',
          group: 'tribe',
          files: {
            'training.txt': {
              type: 'file',
              content: 'Welcome to Terminal Tribe training program.',
              permissions: '-rw-r--r--',
              owner: 'recruit',
              group: 'tribe',
              size: 42
            },
            missions: {
              type: 'directory',
              permissions: 'drwxr-xr-x',
              owner: 'recruit',
              group: 'tribe',
              files: {}
            }
          }
        }
      }
    }
  }
};
