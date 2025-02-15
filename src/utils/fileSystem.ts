import { FileSystemState, FileSystemNode, DirectoryNode, FileNode, SymlinkNode } from '../types/level';

// Re-export types
export type { FileSystemState, FileSystemNode, DirectoryNode, FileNode, SymlinkNode };

export class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}

// Type guards
export function isDirectoryNode(node: FileSystemNode): node is DirectoryNode {
  return node.type === 'directory';
}

export function isFileNode(node: FileSystemNode): node is FileNode {
  return node.type === 'file';
}

export function isSymlinkNode(node: FileSystemNode): node is SymlinkNode {
  return node.type === 'symlink';
}

// Helper function to safely get files from a node
export function getNodeFiles(node: FileSystemNode): { [key: string]: FileSystemNode } {
  if (isDirectoryNode(node)) {
    return node.files;
  }
  return {};
}

export const getPathParts = (path: string): string[] => {
  const parts = path.split('/').filter(Boolean);
  console.log('Path parts:', parts);
  return parts;
};

export const resolvePath = (currentPath: string, targetPath: string): string => {
  console.log('Resolving path:', { currentPath, targetPath });
  if (targetPath.startsWith('/')) {
    return targetPath;
  }

  const parts = currentPath.split('/').filter(Boolean);
  const targetParts = targetPath.split('/').filter(Boolean);

  targetParts.forEach(part => {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  });

  const resolvedPath = '/' + parts.join('/');
  console.log('Resolved path:', resolvedPath);
  return resolvedPath;
};

export const getNodeAtPath = (
  state: FileSystemState,
  path: string
): FileSystemNode | null => {
  console.log('Getting node at path:', path);
  console.log('Current state:', state);
  
  if (path === '/') {
    console.log('Returning root directory node');
    return { type: 'directory', files: state.files };
  }

  if (path === '/home/recruit') {
    console.log('Returning home directory node');
    return { type: 'directory', files: state.files };
  }
  
  const parts = getPathParts(path);
  let current: { [key: string]: FileSystemNode } = state.files;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    console.log(`Traversing path part ${i}:`, { part, current });

    if (part === 'home' && i === 0) {
      continue; // Skip 'home' in /home/recruit
    }
    if (part === 'recruit' && i === 1 && parts[0] === 'home') {
      continue; // Skip 'recruit' in /home/recruit
    }

    const node = current[part];
    console.log(`Looking up node for part ${part}:`, node);

    if (!node) {
      console.log('Node not found at:', part);
      return null;
    }

    if (i === parts.length - 1) {
      console.log('Found target node:', node);
      return node;
    }

    if (!isDirectoryNode(node)) {
      console.log('Not a directory at:', part);
      return null;
    }

    current = node.files;
  }

  console.log('Returning root directory');
  return { type: 'directory', files: state.files };
};

export const listDirectory = (
  state: FileSystemState,
  path: string,
  showHidden: boolean = false,
  recursive: boolean = false
): string[] => {
  console.log('Listing directory:', { path, showHidden, recursive, state });
  const node = getNodeAtPath(state, path);
  if (!node) {
    throw new FileSystemError('No such file or directory');
  }

  if (isSymlinkNode(node)) {
    const targetNode = getNodeAtPath(state, node.target);
    if (!targetNode) {
      throw new FileSystemError('Broken symbolic link');
    }
    if (!isDirectoryNode(targetNode)) {
      throw new FileSystemError('Not a directory');
    }
    return listDirectory(state, node.target, showHidden, recursive);
  }

  if (!isDirectoryNode(node)) {
    throw new FileSystemError('Not a directory');
  }

  let entries: string[] = [];

  // Get entries for current directory
  const currentEntries = Object.entries(node.files)
    .filter(([name]) => showHidden || !name.startsWith('.'))
    .map(([name, node]) => {
      if (isDirectoryNode(node)) {
        return name + '/';
      } else if (isSymlinkNode(node)) {
        return name + ' -> ' + node.target;
      }
      return name;
    })
    .sort();

  // If showing hidden files, add . and ..
  if (showHidden) {
    currentEntries.unshift('.', '..');
  }

  entries = entries.concat(currentEntries);

  // If recursive, add subdirectory contents
  if (recursive) {
    Object.entries(node.files)
      .filter(([_, node]) => isDirectoryNode(node))
      .forEach(([name, _]) => {
        const subPath = path + '/' + name;
        const subEntries = listDirectory(state, subPath, showHidden, recursive)
          .map(entry => name + '/' + entry);
        entries = entries.concat(subEntries);
      });
  }

  console.log('Directory entries:', entries);
  return entries;
};

export const formatListing = (
  state: FileSystemState,
  path: string,
  detailed: boolean = false
): string => {
  console.log('Formatting directory listing:', { state, path, detailed });
  const node = getNodeAtPath(state, path);
  if (!node) {
    throw new FileSystemError('No such file or directory');
  }

  if (isSymlinkNode(node)) {
    const targetNode = getNodeAtPath(state, node.target);
    if (!targetNode) {
      throw new FileSystemError('Broken symbolic link');
    }
    if (!isDirectoryNode(targetNode)) {
      throw new FileSystemError('Not a directory');
    }
    return formatListing(state, node.target, detailed);
  }

  if (!isDirectoryNode(node)) {
    throw new FileSystemError('Not a directory');
  }

  const entries = Object.entries(node.files)
    .map(([name, node]) => {
      const permissions = node.permissions || 
        (isDirectoryNode(node) ? 'drwxr-xr-x' : 
         isSymlinkNode(node) ? 'lrwxrwxrwx' : '-rw-r--r--');
      const owner = node.owner || 'recruit';
      const group = node.group || 'tribe';
      const size = isFileNode(node) ? (node.size || 0) : 
                  isDirectoryNode(node) ? 4096 : 0;
      
      let displayName = name;
      if (isDirectoryNode(node)) {
        displayName += '/';
      } else if (isSymlinkNode(node)) {
        displayName += ' -> ' + node.target;
      }
      
      return detailed ? 
        `${permissions} ${owner} ${group} ${size.toString().padStart(8)} ${displayName}` :
        displayName;
    })
    .sort();

  return detailed ? entries.join('\n') : entries.join('  ');
};

export const changeDirectory = (
  state: FileSystemState,
  targetPath: string
): FileSystemState => {
  console.log('Changing directory:', { currentState: state, targetPath });

  // Handle special cases
  if (targetPath === '') {
    return {
      ...state,
      currentDirectory: '/home/recruit'
    };
  }

  if (targetPath === '-') {
    if (!state.previousDirectory) {
      throw new FileSystemError('No previous directory');
    }
    const newState = {
      ...state,
      currentDirectory: state.previousDirectory,
      previousDirectory: state.currentDirectory
    };
    console.log('New state after cd -:', newState);
    return newState;
  }

  const resolvedPath = resolvePath(state.currentDirectory, targetPath);
  const node = getNodeAtPath(state, resolvedPath);

  if (!node) {
    throw new FileSystemError('No such directory');
  }

  if (!isDirectoryNode(node)) {
    throw new FileSystemError('Not a directory');
  }

  const newState = {
    ...state,
    previousDirectory: state.currentDirectory,
    currentDirectory: resolvedPath,
  };
  console.log('New state after cd:', newState);
  return newState;
};

export const createFile = (
  state: FileSystemState,
  path: string,
  content: string = ''
): FileSystemState => {
  console.log('Creating file:', { state, path, content });
  const parts = getPathParts(path);
  const fileName = parts.pop();
  if (!fileName) {
    throw new FileSystemError('Invalid file name');
  }

  const dirPath = '/' + parts.join('/');
  const parentNode = getNodeAtPath(state, dirPath);

  if (!parentNode || !isDirectoryNode(parentNode)) {
    throw new FileSystemError('Parent directory does not exist');
  }

  const newFiles = { ...parentNode.files };
  newFiles[fileName] = {
    type: 'file',
    content,
  };

  // Create a new state with the updated file
  const newState = { ...state };
  let current = newState.files;

  for (const part of parts) {
    const node = current[part];
    if (!node || !isDirectoryNode(node)) {
      throw new FileSystemError('Invalid path');
    }
    current = node.files;
  }
  current[fileName] = newFiles[fileName];

  console.log('New state after creating file:', newState);
  return newState;
};

export const createDirectory = (
  state: FileSystemState,
  path: string,
  recursive: boolean = false
): FileSystemState => {
  console.log('Creating directory:', { state, path, recursive });
  const parts = getPathParts(path);
  let current = { ...state.files };
  let currentPath = '';

  for (const part of parts) {
    currentPath += '/' + part;
    console.log('Processing directory part:', { part, currentPath });
    
    if (!current[part]) {
      if (!recursive && currentPath !== path) {
        throw new FileSystemError('Parent directory does not exist');
      }
      
      current[part] = {
        type: 'directory',
        files: {},
      };
    } else if (!isDirectoryNode(current[part])) {
      throw new FileSystemError('Path exists but is not a directory');
    }

    current = current[part].files;
  }

  const newState = {
    ...state,
    files: { ...state.files },
  };
  console.log('New state after creating directory:', newState);
  return newState;
};

export const copyFile = (
  state: FileSystemState,
  sourcePath: string,
  destPath: string,
  recursive: boolean = false
): FileSystemState => {
  console.log('Copying file:', { state, sourcePath, destPath, recursive });

  // Get source node
  const sourceNode = getNodeAtPath(state, sourcePath);
  if (!sourceNode) {
    throw new FileSystemError('Source file or directory does not exist');
  }

  // Check if source is directory and recursive flag
  if (isDirectoryNode(sourceNode) && !recursive) {
    throw new FileSystemError('Source is a directory, use -r flag to copy directories');
  }

  // Prepare destination path
  const destParts = getPathParts(destPath);
  const destName = destParts.pop();
  if (!destName) {
    throw new FileSystemError('Invalid destination path');
  }

  // Get destination parent directory
  const destParentPath = '/' + destParts.join('/');
  const destParent = getNodeAtPath(state, destParentPath);
  if (!destParent || !isDirectoryNode(destParent)) {
    throw new FileSystemError('Destination parent directory does not exist');
  }

  // Create new state and copy the node
  const newState = { ...state };
  let current = newState.files;
  for (const part of destParts) {
    const node = current[part];
    if (!node || !isDirectoryNode(node)) {
      throw new FileSystemError('Invalid path');
    }
    current = node.files;
  }
  current[destName] = cloneNode(sourceNode);

  console.log('New state after copying:', newState);
  return newState;
};

export const moveFile = (
  state: FileSystemState,
  sourcePath: string,
  destPath: string
): { newState: FileSystemState; movedPath: string } => {
  console.log('Moving file:', { state, sourcePath, destPath });

  // First copy the file
  const newState = copyFile(state, sourcePath, destPath, true);

  // Then delete the source
  const sourceParts = getPathParts(sourcePath);
  const sourceName = sourceParts.pop()!;
  let current = newState.files;
  for (const part of sourceParts) {
    const node = current[part];
    if (!node || !isDirectoryNode(node)) {
      throw new FileSystemError('Invalid path');
    }
    current = node.files;
  }
  delete current[sourceName];

  // Return the new state and the final path for verbose output
  const movedPath = resolvePath(state.currentDirectory, destPath);
  return { newState, movedPath };
};

export const removeFile = (
  state: FileSystemState,
  path: string,
  recursive: boolean = false
): FileSystemState => {
  console.log('Removing file:', { state, path, recursive });

  const node = getNodeAtPath(state, path);
  if (!node) {
    throw new FileSystemError('No such file or directory');
  }

  if (isDirectoryNode(node) && !recursive) {
    throw new FileSystemError('Cannot remove directory without -r flag');
  }

  const parts = getPathParts(path);
  const fileName = parts.pop()!;
  const newState = { ...state };
  let current = newState.files;

  for (const part of parts) {
    const node = current[part];
    if (!node || !isDirectoryNode(node)) {
      throw new FileSystemError('Invalid path');
    }
    current = node.files;
  }

  delete current[fileName];
  console.log('New state after removing file:', newState);
  return newState;
};

export const createLink = (
  state: FileSystemState,
  sourcePath: string,
  linkPath: string,
  symbolic: boolean = false
): FileSystemState => {
  console.log('Creating link:', { state, sourcePath, linkPath, symbolic });

  const sourceNode = getNodeAtPath(state, sourcePath);
  if (!sourceNode) {
    throw new FileSystemError('Source file does not exist');
  }

  const parts = getPathParts(linkPath);
  const linkName = parts.pop()!;
  const newState = { ...state };
  let current = newState.files;

  for (const part of parts) {
    const node = current[part];
    if (!node || !isDirectoryNode(node)) {
      throw new FileSystemError('Invalid link path');
    }
    current = node.files;
  }

  if (symbolic) {
    current[linkName] = {
      type: 'symlink',
      target: sourcePath,
      permissions: 'lrwxrwxrwx',
      owner: 'recruit',
      group: 'tribe'
    };
  } else {
    current[linkName] = cloneNode(sourceNode);
  }

  console.log('New state after creating link:', newState);
  return newState;
};

// Deep clone a node and its contents
export const cloneNode = (node: FileSystemNode): FileSystemNode => {
  const clone = { ...node };
  if (isDirectoryNode(node)) {
    (clone as DirectoryNode).files = {};
    for (const [name, childNode] of Object.entries(node.files)) {
      (clone as DirectoryNode).files[name] = cloneNode(childNode);
    }
  }
  return clone;
};
