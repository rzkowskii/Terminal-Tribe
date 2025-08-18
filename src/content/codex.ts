export interface CodexEntry {
  key: string;
  title: string;
  markdown: string;
  related?: string[];
}

export const CODEX_ENTRIES: CodexEntry[] = [
  {
    key: 'paths',
    title: 'Paths & Navigation',
    markdown: `# The Wayfinder's Code

In the before-times, humans navigated vast digital territories through paths—strings of text that described location as surely as stars guide travelers.

## Core Concepts

**The Root (/)**: The origin point, where all paths begin. Everything grows from root.

**Home (~)**: Your personal sanctuary. The tilde symbol always leads you back.

**Current Location (.)**: Where you stand now. A single dot represents "here."

**Parent (..)**: One step back, one level up. Two dots retreat from danger.

## Commands

\`cd [path]\` - Change Directory. Your primary navigation tool.
\`pwd\` - Print Working Directory. Reveals your current position.

## Path Types

**Absolute**: Starting with /, universal coordinates.
**Relative**: From current position, context-dependent.

Remember: In the wasteland, knowing your position is survival.`,
    related: ['listing', 'creation']
  },
  {
    key: 'listing',
    title: 'Scanning & Inventory',
    markdown: `# The Scanner's Discipline

Listing commands reveal what exists, what's hidden, and what's valuable.

## Commands

\`ls\` - Basic scan. Shows visible contents.
\`ls -l\` - Long format with metadata.
\`ls -a\` - All files, including hidden.
\`ls -R\` - Recursive, mapping hierarchies.
\`ls -i\` - Show inode numbers.
\`ls -d\` - List directories themselves.

## Combination Power

Flags combine: \`ls -laR\` shows everything, everywhere, with full details.

The Scribes hoard their listings. The Circuit sells theirs. A true Keeper shares knowledge.`,
    related: ['paths', 'creation']
  },
  {
    key: 'creation',
    title: 'Digital Genesis',
    markdown: `# The Creator's Art

From nothing, something. Creation commands build the future.

## Commands

\`mkdir [name]\` - Create directories.
\`mkdir -p [path]\` - Create with parents.
\`touch [file]\` - Create empty files.

## Batch Creation

\`touch file1 file2 file3\` - Multiple files at once.
\`mkdir -p deep/nested/structure\` - Build entire hierarchies.

With creation comes responsibility. Build with purpose.`,
    related: ['paths', 'removal']
  },
  {
    key: 'copy-move',
    title: 'Migration & Duplication',
    markdown: `# The Archivist's Methods

Data must flow, replicate, and relocate. Copy and move commands ensure survival through redundancy.

## Commands

\`cp [source] [dest]\` - Copy files.
\`cp -r [source] [dest]\` - Copy directories.
\`mv [source] [dest]\` - Move or rename.

## Advanced Operations

\`cp -r /data/* /backup/\` - Copy all contents.
\`mv oldname newname\` - Rename in place.

The Circuit hoards through copying. The Scribes preserve through duplication. Balance both.`,
    related: ['expansion', 'paths']
  },
  {
    key: 'removal',
    title: 'Purge Protocols',
    markdown: `# The Cleaner's Creed

Sometimes destruction preserves. Removal commands eliminate corruption and reclaim space.

## Commands

\`rm [file]\` - Remove files.
\`rm -r [dir]\` - Remove recursively.
\`rm -f\` - Force removal.
\`rmdir [dir]\` - Remove empty directories.

## Danger Zone

\`rm -rf\` - The nuclear option. No confirmation, no recovery.

In the Vaults, precision matters. One wrong deletion can destroy irreplaceable archives.`,
    related: ['creation', 'links']
  },
  {
    key: 'links',
    title: 'Connection Protocols',
    markdown: `# The Linker's Wisdom

Links create connections without duplication. Two types exist: hard and symbolic.

## Commands

\`ln [source] [target]\` - Create hard link.
\`ln -s [source] [target]\` - Create symbolic link.

## Understanding Links

**Hard Links**: Multiple names for same data. Delete one, others remain.
**Symbolic Links**: Pointers to paths. Break if target moves.

\`ls -l\` shows links with arrows (->).
\`pwd -P\` reveals physical paths through symbolic mazes.

The Archive itself is a web of links. Master them to navigate its depths.`,
    related: ['paths', 'removal']
  },
  {
    key: 'expansion',
    title: 'Pattern Mastery',
    markdown: `# The Multiplier's Art

One command becomes many through expansion. Patterns and wildcards multiply your power.

## Wildcards

\`*\` - Matches any characters.
\`?\` - Matches single character.
\`[abc]\` - Matches any listed character.
\`[0-9]\` - Matches ranges.

## Brace Expansion

\`{1,2,3}\` - Expands to multiple values.
\`{1..10}\` - Expands ranges.
\`file{A,B,C}.txt\` - Creates fileA.txt, fileB.txt, fileC.txt.

## Power Combinations

\`cp *.log /backup/\` - Copy all logs.
\`rm temp{1..5}.txt\` - Remove temp1.txt through temp5.txt.
\`ls [A-Z]*\` - List files starting with capitals.

The Archipelago rewards efficiency. Master patterns to work at scale.`,
    related: ['copy-move', 'creation']
  }
];
