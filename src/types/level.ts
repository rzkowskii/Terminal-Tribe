export interface FileSystemState {
  currentDirectory: string;
  previousDirectory?: string;
  files: { [key: string]: FileSystemNode };
}

export type FileSystemNode = FileNode | DirectoryNode | SymlinkNode;

export interface FileNode {
  type: 'file';
  content: string;
  permissions?: string;
  owner?: string;
  group?: string;
  size?: number;
}

export interface DirectoryNode {
  type: 'directory';
  files: { [key: string]: FileSystemNode };
  permissions?: string;
  owner?: string;
  group?: string;
}

export interface SymlinkNode {
  type: 'symlink';
  target: string;
  permissions?: string;
  owner?: string;
  group?: string;
}

export interface Level {
  id: number;
  title: string;
  story: string;
  task: string;
  expectedCommand: string;
  successMessage: string;
  initialState: FileSystemState;
  expectedState: FileSystemState;
}

export interface LevelFile {
  levels: Level[];
}
