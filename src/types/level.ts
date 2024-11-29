export interface Level {
  id: number;
  title: string;
  story: string;
  task: string;
  expectedCommand: string;
  successMessage: string;
  initialState: FileSystemState;  // Made required to ensure type safety
  expectedState: FileSystemState; // Made required to ensure type safety
}

export interface DirectoryNode {
  type: 'directory';
  permissions?: string;
  owner?: string;
  group?: string;
  files: { [key: string]: FileSystemNode };
}

export interface FileNode {
  type: 'file';
  permissions?: string;
  owner?: string;
  group?: string;
  size?: number;
  content: string;
}

export interface SymlinkNode {
  type: 'symlink';
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
    'training.txt': {
      type: 'file',
      content: 'Welcome to Terminal Tribe training program.',
      permissions: '-rw-r--r--',
      owner: 'recruit',
      group: 'tribe',
      size: 42
    },
    'missions': {
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'recruit',
      group: 'tribe',
      files: {}
    }
  }
};
