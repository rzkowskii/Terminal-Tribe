import React, { useState, useRef, useEffect } from 'react';
import useLevelStore from '../stores/levelStore';
import useTerminalStore from '../stores/terminalStore';
import { executeCommand } from '../commands';

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const { commandHistory, addToHistory, clearHistory, getPrevHistory, getNextHistory, complete } = useTerminalStore();
  const { 
    validateCommand,
    validateState,
    completeLevel,
    setCurrentFileSystem,
    currentFileSystem
  } = useLevelStore();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      const prev = getPrevHistory();
      if (prev !== null) setInput(prev);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      const next = getNextHistory();
      if (next !== null) setInput(next);
      e.preventDefault();
    } else if (e.key === 'Tab') {
      const parts = input.trim().split(/\s+/);
      const first = parts[0] || '';
      const completion = complete(first);
      if (completion) {
        parts[0] = completion;
        setInput(parts.join(' '));
      }
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const result = await executeCommand(input);
    
    if (result.newState) {
      setCurrentFileSystem(result.newState);
    }

    if (result.effects?.clearHistory) {
      clearHistory();
    } else {
      addToHistory({
        command: input,
        output: result.output,
        status: result.status
      });
    }

    if (validateCommand(input) && result.status === 'success') {
      if (!result.newState || validateState(result.newState)) {
        completeLevel();
      }
    }

    setInput('');
  };

  return (
    <div className="terminal-window text-terminal-text p-4 rounded-xl shadow-xl font-mono border border-white/10">
      <div ref={outputRef} className="h-96 overflow-y-auto mb-4 pr-1" aria-live="polite">
        {commandHistory.map((entry, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-start gap-2">
              <span className="terminal-prompt">
                {(() => {
                  const cwd = currentFileSystem.currentDirectory;
                  const pretty = cwd === '/home/recruit' ? '~' : (cwd.startsWith('/home/recruit/') ? ('~' + cwd.slice('/home/recruit'.length)) : cwd);
                  return `recruit@terminal-tribe:${pretty}$`;
                })()}
              </span>
              <span className="break-words">{entry.command}</span>
            </div>
            {entry.output && (
              <div className="mt-1 flex items-start gap-2">
                <span className={`${
                  entry.status === 'error' ? 'bg-terminal-error/20 text-terminal-error' : 
                  entry.status === 'success' ? 'bg-terminal-success/20 text-terminal-success' : 
                  'bg-terminal-info/20 text-terminal-info'
                } px-2 py-0.5 text-xs rounded border border-white/10`}>{entry.status.toUpperCase()}</span>
                <div className={`${
                  entry.status === 'error' ? 'terminal-error' : 
                  entry.status === 'success' ? 'terminal-success' : 
                  'terminal-info'
                } whitespace-pre-wrap`}>
                  {entry.output}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
        <span className="terminal-prompt">
          {(() => {
            const cwd = currentFileSystem.currentDirectory;
            const pretty = cwd === '/home/recruit' ? '~' : (cwd.startsWith('/home/recruit/') ? ('~' + cwd.slice('/home/recruit'.length)) : cwd);
            return `recruit@terminal-tribe:${pretty}$`;
          })()}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-input flex-1 bg-transparent outline-none"
          placeholder="Type a command and press Enter..."
        />
        <div className="text-xs text-terminal-text/60 whitespace-nowrap">↑ history • Tab completion • Enter to run</div>
      </form>
    </div>
  );
};

export default Terminal;
