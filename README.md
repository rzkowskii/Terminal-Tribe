# Terminal Tribe

Terminal Tribe is an educational game that teaches Linux system administration through gamified RHCSA (Red Hat Certified System Administrator) course content. The game provides a web-based terminal interface where users can practice Linux commands in a safe, simulated environment.

## Features

- Interactive terminal emulator with command history and tab completion
- Simulated Linux file system with full command support
- Task-based progression following RHCSA curriculum
- Multiple game modes:
  - Story Mode: Main campaign following RHCSA curriculum
  - Practice Mode: Free environment to experiment
  - Challenge Mode: Timed scenarios
  - Daily Tasks: Regular practice challenges

## Technical Stack

- React 18+
- TypeScript
- Tailwind CSS
- React Context API / Zustand for state management
- LocalStorage for progress persistence
- Jest and React Testing Library for testing

## Core Commands

The game currently supports these essential Linux commands:

- `pwd`: Print working directory
- `ls`: List directory contents (with -a, -l, -R options)
- `cd`: Change directory
- `touch`: Create empty files
- `mkdir`: Create directories (with -p option)
- `cp`: Copy files and directories (with -r option)
- `mv`: Move/rename files and directories
- `rm`: Remove files (with -r option)
- `ln`: Create hard and symbolic links

## Development

To run the project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
