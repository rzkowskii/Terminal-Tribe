import React, { useRef, useState } from 'react';
import useSandboxStore from '../stores/sandboxStore';
import { execute as runShell } from '../shell';

const InteractiveCodexSandbox: React.FC = () => {
  const { fs, setFs, reset } = useSandboxStore();
  const [history, setHistory] = useState<{ cmd: string; out: string; status: string }[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const limited = new Set(['pwd', 'echo', 'ls', 'cat', 'touch', 'mkdir']);
  async function run(e: React.FormEvent) {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    const name = cmd.split(/\s+/)[0];
    if (!limited.has(name)) {
      setHistory((h) => [...h, { cmd, out: 'Command not allowed in sandbox', status: 'error' }]);
      setInput('');
      return;
    }
    const res = await runShell(cmd, { currentState: fs });
    if (res.newState) setFs(res.newState);
    setHistory((h) => [...h, { cmd, out: res.output || '', status: res.status }]);
    setInput('');
    inputRef.current?.focus();
  }

  return (
    <div className="rounded border border-white/10 p-3 bg-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Sandbox</div>
        <button className="text-xs bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10" onClick={() => { reset(); setHistory([]); }}>Reset</button>
      </div>
      <div className="max-h-40 overflow-y-auto text-xs mb-2">
        {history.map((h, i) => (
          <div key={i} className="mb-1">
            <div><span className="text-terminal-prompt">$</span> {h.cmd}</div>
            {h.out && <div className={`${h.status === 'error' ? 'text-terminal-error' : h.status === 'success' ? 'text-terminal-success' : 'text-terminal-info'}`}>{h.out}</div>}
          </div>
        ))}
      </div>
      <form onSubmit={run} className="flex items-center gap-2">
        <span className="text-terminal-prompt">$</span>
        <input ref={inputRef} className="flex-1 bg-transparent outline-none text-xs" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try: echo hello | cat" />
      </form>
    </div>
  );
};

export default InteractiveCodexSandbox;


