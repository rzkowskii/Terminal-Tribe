import { BuiltinCommand } from '../types';
import { list } from '../registry';

const help: BuiltinCommand = {
  meta: {
    name: 'help',
    description: 'Display available commands',
  },
  run: async () => {
    const commands = list()
      .map(c => `${c.meta.name.padEnd(8)} ${c.meta.description || ''}`)
      .sort()
      .join('\n');
    return {
      output: `Available Commands:\n\n${commands}`,
      status: 'info',
    };
  }
};

export default help;

