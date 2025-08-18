import React from 'react';
import useLevelStore from '../stores/levelStore';
import { FileSystemNode } from '../types/level';
import { isDirectoryNode, isSymlinkNode } from '../utils/fileSystem';

const FsTree: React.FC = () => {
  const { currentFileSystem } = useLevelStore();

  const renderNode = (name: string, node: FileSystemNode) => {
    if (isDirectoryNode(node)) {
      return (
        <li key={name}>
          <span className="text-terminal-prompt">{name}/</span>
          {Object.keys(node.files).length > 0 && (
            <ul className="pl-4">
              {Object.entries(node.files).map(([childName, child]) => renderNode(childName, child))}
            </ul>
          )}
        </li>
      );
    }
    if (isSymlinkNode(node)) {
      return (
        <li key={name}>
          <span className="text-terminal-info">{name} -&gt; {node.target}</span>
        </li>
      );
    }
    return (
      <li key={name}>
        <span className="text-terminal-text/90">{name}</span>
      </li>
    );
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="text-sm font-semibold text-terminal-info mb-2">Filesystem</div>
      <ul className="text-sm text-terminal-text/90">
        {Object.entries(currentFileSystem.files).map(([name, node]) => renderNode(name, node))}
      </ul>
    </div>
  );
};

export default FsTree;
