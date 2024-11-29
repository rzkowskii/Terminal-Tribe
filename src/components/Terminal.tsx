import { useState, useRef, useEffect } from 'react';
import { executeCommand } from '../commands';
import useLevelStore from '../stores/levelStore';
import { CommandResult } from '../types/commands';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<'success' | 'error' | 'info'>('info');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const currentLevel = useLevelStore(state => state.levels[state.currentLevel]);
  const validateCommand = useLevelStore(state => state.validateCommand);
  const validateState = useLevelStore(state => state.validateState);
  const completeLevel = useLevelStore(state => state.completeLevel);
  const resetLevel = useLevelStore(state => state.resetLevel);
  const currentFileSystem = useLevelStore(state => state.currentFileSystem);

  useEffect(() => {
    // Focus input on mount and when level changes
    inputRef.current?.focus();
  }, [currentLevel]);

  useEffect(() => {
    // Scroll to bottom when output changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('Form submitted');
    console.log('Executing user command:', input);

    // Add command to output
    setOutput(prev => [...prev, `guest@terminal-tribe:~$ ${input}`]);

    try {
      // Execute command
      const result = await executeCommand(input);
      console.log('Command result:', result);

      // Add command output to terminal
      if (result.output) {
        setOutput(prev => [...prev, result.output]);
      }

      // Update status
      setStatus(result.status);

      // If command was successful, validate it
      if (result.status === 'success') {
        const isCommandValid = validateCommand(input);
        const isStateValid = validateState();

        if (isCommandValid && isStateValid) {
          // Add success message to output
          setOutput(prev => [...prev, currentLevel.successMessage]);
          completeLevel();
        }
      }
    } catch (error) {
      console.error('Command execution error:', error);
      setOutput(prev => [...prev, 'An error occurred while executing the command.']);
      setStatus('error');
    }

    // Clear input
    setInput('');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
      <div ref={outputRef} className="h-96 overflow-y-auto mb-4 whitespace-pre-wrap">
        {output.map((line, i) => (
          <div key={i} className={
            line.startsWith('guest@terminal-tribe') ? 'text-blue-300' :
            status === 'success' ? 'text-green-300' :
            status === 'error' ? 'text-red-300' :
            'text-gray-300'
          }>
            {line}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <span className="text-blue-300">guest@terminal-tribe:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-gray-300"
          placeholder="Type a command..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Execute Command
        </button>
      </form>
      <div className="mt-4 text-gray-400 text-xs text-center">
        Type 'help' to see available commands
      </div>
    </div>
  );
}
