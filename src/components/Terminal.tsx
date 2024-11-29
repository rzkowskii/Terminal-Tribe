import React, { useState, useRef, useEffect } from 'react';
import useLevelStore from '../stores/levelStore';
import useTerminalStore from '../stores/terminalStore';
import { executeCommand } from '../commands';

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const { commandHistory, addToHistory } = useTerminalStore();
  const { 
    currentLevel,
    levels,
    currentFileSystem,
    validateCommand,
    validateState,
    completeLevel,
    resetLevel,
    setCurrentFileSystem
  } = useLevelStore();

  const currentLevelData = levels.find(l => l.id === currentLevel);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('Form submitted');
    console.log('Executing user command:', input);

    addToHistory({
      command: input,
      output: '',
      status: 'pending'
    });

    const result = await executeCommand(input);
    
    if (result.newState) {
      setCurrentFileSystem(result.newState);
    }

    addToHistory({
      command: input,
      output: result.output,
      status: result.status
    });

    if (validateCommand(input)) {
      if (!result.newState || validateState(result.newState)) {
        completeLevel();
      }
    }

    setInput('');
  };

  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded-lg shadow-lg font-mono">
      <div ref={outputRef} className="h-96 overflow-y-auto mb-4">
        {commandHistory.map((entry, index) => (
          <div key={index} className="mb-2">
            <div>
              <span className="text-blue-400">guest@terminal-tribe:~$</span> {entry.command}
            </div>
            {entry.output && (
              <div className={`mt-1 ${
                entry.status === 'error' ? 'text-red-400' : 
                entry.status === 'success' ? 'text-green-400' : 
                'text-gray-400'
              }`}>
                {entry.output}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <span className="text-blue-400 mr-2">guest@terminal-tribe:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none"
          placeholder="Type a command..."
        />
        <button type="submit" className="ml-2 px-4 py-1 bg-blue-600 text-white rounded">
          Execute Command
        </button>
      </form>
    </div>
  );
};

export default Terminal;
