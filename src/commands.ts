import { CommandResult } from './types/commands';
import useLevelStore from './stores/levelStore';
import * as fs from './utils/fileSystem';

// Type guard for FileSystemError
function isFileSystemError(error: unknown): error is fs.FileSystemError {
  return error instanceof Error && error.name === 'FileSystemError';
}

export async function executeCommand(input: string): Promise<CommandResult> {
  const store = useLevelStore.getState();
  const currentState = store.currentFileSystem;
  console.log('Current file system state:', currentState);
  
  const [command, ...args] = input.trim().toLowerCase().split(/\s+/);
  console.log('Executing command:', command, 'with args:', args);

  try {
    switch (command) {
      case 'help':
        console.log('Executing help command');
        return {
          output: `
Available Commands:

help                    Display this help message
pwd                     Print working directory
ls [options] [dir]     List directory contents
cd [dir]               Change directory
touch [file]           Create an empty file
mkdir [options] [dir]  Create a directory
cp [options] src dst   Copy files and directories
mv [options] src dst   Move files and directories
rm [options] file      Remove files or directories
ln [options] src dst   Create links
echo [string]          Display a line of text
clear                   Clear the terminal screen

Options:
ls: -a (show hidden files), -l (detailed listing), -R (recursive)
mkdir: -p (create parent directories)
cp: -r (copy directories recursively)
mv: -v (verbose output)
rm: -r (remove directories recursively)
ln: -s (create symbolic link)

Game Commands:
start                   Begin the game or continue from last checkpoint
progress               Show your current progress
tasks                  List available tasks
hint                   Get a hint for the current task
`.trim(),
          status: 'info'
        };

      case 'pwd':
        console.log('Executing pwd command');
        return {
          output: currentState.currentDirectory,
          status: 'success',
          newState: currentState
        };

      case 'ls': {
        console.log('Executing ls command');
        const showHidden = args.includes('-a');
        const detailed = args.includes('-l');
        const recursive = args.includes('-R');
        const targetPath = args.find(arg => !arg.startsWith('-')) || currentState.currentDirectory;
        const resolvedPath = fs.resolvePath(currentState.currentDirectory, targetPath);
        console.log('ls params:', { showHidden, detailed, recursive, targetPath, resolvedPath });
        
        try {
          const entries = fs.listDirectory(currentState, resolvedPath, showHidden, recursive);
          const listing = detailed ? 
            fs.formatListing(currentState, resolvedPath, detailed) :
            entries.join('  ');
          console.log('ls result:', listing);
          return {
            output: listing,
            status: 'success',
            newState: currentState
          };
        } catch (error) {
          console.error('ls error:', error);
          if (isFileSystemError(error)) {
            return {
              output: error.message,
              status: 'error'
            };
          }
          throw error;
        }
      }

      case 'cd': {
        console.log('Executing cd command');
        const path = args[0] || '/home/recruit';
        try {
          const newState = fs.changeDirectory(currentState, path);
          console.log('New file system state after cd:', newState);
          return {
            output: '',
            status: 'success',
            newState
          };
        } catch (error) {
          console.error('cd error:', error);
          if (isFileSystemError(error)) {
            return {
              output: error.message,
              status: 'error'
            };
          }
          throw error;
        }
      }

      case 'touch': {
        console.log('Executing touch command');
        if (!args[0]) {
          return {
            output: 'touch: missing file operand',
            status: 'error'
          };
        }

        try {
          const newState = fs.createFile(currentState, args[0]);
          console.log('New file system state after touch:', newState);
          return {
            output: '',
            status: 'success',
            newState
          };
        } catch (error) {
          console.error('touch error:', error);
          if (isFileSystemError(error)) {
            return {
              output: error.message,
              status: 'error'
            };
          }
          throw error;
        }
      }

      case 'mkdir': {
        console.log('Executing mkdir command');
        const recursive = args.includes('-p');
        const paths = args.filter(arg => !arg.startsWith('-'));

        if (paths.length === 0) {
          return {
            output: 'mkdir: missing operand',
            status: 'error'
          };
        }

        try {
          let newState = currentState;
          for (const path of paths) {
            newState = fs.createDirectory(newState, path, recursive);
          }
          console.log('New file system state after mkdir:', newState);
          return {
            output: '',
            status: 'success',
            newState
          };
        } catch (error) {
          console.error('mkdir error:', error);
          if (isFileSystemError(error)) {
            return {
              output: error.message,
              status: 'error'
            };
          }
          throw error;
        }
      }

      case 'cp': {
        console.log('Executing cp command');
        const recursive = args.includes('-r');
        const paths = args.filter(arg => !arg.startsWith('-'));

        if (paths.length !== 2) {
          return {
            output: 'cp: missing source or destination operand',
            status: 'error'
          };
        }

        try {
          const [src, dst] = paths;
          const newState = fs.copyFile(currentState, src, dst, recursive);
          console.log('New file system state after cp:', newState);
          return {
            output: '',
            status: 'success',
            newState
          };
        } catch (error) {
          console.error('cp error:', error);
          if (isFileSystemError(error)) {
            return {
              output: error.message,
              status: 'error'
            };
          }
          throw error;
        }
      }

      case 'mv': {
        console.log('Executing mv command');
        const verbose = args.includes('-v');
        const paths = args.filter(arg => !arg.startsWith('-'));

        if (paths.length !== 2) {
          return {
            output: 'mv: missing source or destination operand',
            status: 'error'
          };
        }

        try {
          const [src, dst] = paths;
          const { newState, movedPath } = fs.moveFile(currentState, src, dst);
          console.log('New file system state after mv:', newState);
          return {
            output: verbose ? `renamed '${src}' -> '${movedPath}'` : '',
            status: 'success',
            newState
          };
        } catch (error) {
          console.error('mv error:', error);
          if (isFileSystemError(error)) {
            return {
              output: error.message,
              status: 'error'
            };
          }
          throw error;
        }
      }

      case 'rm': {
        console.log('Executing rm command');
        const recursive = args.includes('-r');
        const paths = args.filter(arg => !arg.startsWith('-'));

        if (paths.length === 0) {
          return {
            output: 'rm: missing operand',
            status: 'error'
          };
        }

        try {
          let newState = currentState;
          for (const path of paths) {
            newState = fs.removeFile(newState, path, recursive);
          }
          console.log('New file system state after rm:', newState);
          return {
            output: '',
            status: 'success',
            newState
          };
        } catch (error) {
          console.error('rm error:', error);
          if (isFileSystemError(error)) {
            return {
              output: error.message,
              status: 'error'
            };
          }
          throw error;
        }
      }

      case 'ln': {
        console.log('Executing ln command');
        const symbolic = args.includes('-s');
        const paths = args.filter(arg => !arg.startsWith('-'));

        if (paths.length !== 2) {
          return {
            output: 'ln: missing source or destination operand',
            status: 'error'
          };
        }

        try {
          const [src, dst] = paths;
          const newState = fs.createLink(currentState, src, dst, symbolic);
          console.log('New file system state after ln:', newState);
          return {
            output: '',
            status: 'success',
            newState
          };
        } catch (error) {
          console.error('ln error:', error);
          if (isFileSystemError(error)) {
            return {
              output: error.message,
              status: 'error'
            };
          }
          throw error;
        }
      }

      case 'echo': {
        console.log('Executing echo command');
        const text = args.join(' ');
        return {
          output: text,
          status: 'success',
          newState: currentState
        };
      }

      case 'clear':
        console.log('Executing clear command');
        return {
          output: '',
          status: 'success'
        };

      default:
        console.log('Command not found:', command);
        return {
          output: `Command not found: ${command}. Type 'help' for a list of available commands.`,
          status: 'error'
        };
    }
  } catch (error) {
    console.error('Command execution error:', error);
    return {
      output: 'An error occurred while executing the command.',
      status: 'error'
    };
  }
}
