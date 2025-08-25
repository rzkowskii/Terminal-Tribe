import React, { useState, useRef, useEffect } from 'react';
import useLevelStore from '../stores/levelStore';
import useTerminalStore from '../stores/terminalStore';
import { executeCommand } from '../commands';
import QuickActions from './QuickActions';
import TerminalFrame from './TerminalFrame';
import useUiStore from '../stores/uiStore';
import { evaluateSolution } from '../services/solutionPolicy';
import { extractOutputTokens } from '../utils/tokenizer';

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const { commandHistory, addToHistory, clearHistory, getPrevHistory, getNextHistory, complete, isearchOpen, openISearch, closeISearch, updateISearch, isearchResult } = useTerminalStore();
  const { 
    validateCommand,
    validateState,
    completeLevel,
    setCurrentFileSystem,
    currentFileSystem
  } = useLevelStore();
  const ui = useUiStore();

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
      const completion = complete(input, e.shiftKey ? -1 : 1);
      if (completion) setInput(completion);
      e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
      openISearch();
      e.preventDefault();
    } else if (e.key === '?') {
      // Inline docs: open Codex for the token at caret
      const el = e.target as HTMLInputElement;
      const pos = el.selectionStart || 0;
      const left = input.slice(0, pos);
      const tokens = left.split(/\s+/);
      const token = tokens[tokens.length - 1] || input.split(/\s+/)[0] || '';
      if (token) {
        ui.setSelectedCodexKey(token);
        ui.setShowCodex(true);
        e.preventDefault();
      }
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

    let accepted = false;
    if (validateCommand(input) && result.status === 'success') {
      accepted = !result.newState || validateState(result.newState);
    } else if (ui.featureFlags.solutionPolicy && result.status !== 'error') {
      const { levels, currentLevel } = useLevelStore.getState();
      const lvl = levels.find(l => l.id === currentLevel);
      if (lvl) {
        const evalRes = evaluateSolution({ rawCommand: input, stdout: result.output, stderr: result.status === 'error' ? result.output : '', fsBefore: currentFileSystem, fsAfter: result.newState || currentFileSystem, level: lvl });
        accepted = evalRes.success;
      }
    }
    if (accepted) completeLevel();

    // Token chips hint: (future) could display elsewhere; we compute and ignore here
    const tokens = extractOutputTokens(result.output || '');
    void tokens;

    setInput('');
  };

  return (
    <TerminalFrame title="ARCHIVE TERMINAL v2.847">
      <div ref={outputRef} className="h-96 overflow-y-auto mb-4 pr-1 terminal-window text-terminal-text font-mono" aria-live="polite">
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
            {entry.output && ui.featureFlags.deepLinks && (
              <div className="flex flex-wrap gap-1 mt-1 ml-6">
                {extractOutputTokens(entry.output).map((tok) => (
                  <button
                    key={tok}
                    className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-1.5 py-0.5 rounded"
                    aria-label={`Open Codex for ${tok}`}
                    onClick={() => { ui.setSelectedCodexKey(tok); ui.setShowCodex(true); }}
                  >{tok}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {isearchOpen && (
        <div className="mb-2 text-xs px-2 py-1 rounded border border-white/10 bg-white/5 flex items-center gap-2">
          <span className="text-terminal-info">(reverse‑i‑search)</span>
          <input className="flex-1 bg-transparent outline-none" autoFocus onChange={(e) => updateISearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { if (isearchResult) setInput(isearchResult); closeISearch(); e.preventDefault(); } if (e.key === 'Escape') { closeISearch(); e.preventDefault(); } }} placeholder="Type to search history…" />
          <button className="text-terminal-text/70" onClick={() => closeISearch()} type="button">Cancel</button>
          {isearchResult && <span className="text-terminal-success">{isearchResult}</span>}
        </div>
      )}
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
        {ui.showTerminalHints && (
          <div className="text-xs text-terminal-text/60 whitespace-nowrap">↑ history • Tab completion • Enter to run • ? for docs</div>
        )}
      </form>
      <QuickActions />
    </TerminalFrame>
  );
};

export default Terminal;
