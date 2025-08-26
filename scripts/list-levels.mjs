#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd());

function readJson(rel) {
  const p = path.join(root, rel);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

const l1 = readJson('src/levels/levels1-20.json').levels.map(l => ({ id: l.id, title: l.title }));
const l2 = readJson('src/levels/levels21-40.json').levels.map(l => ({ id: l.id, title: l.title }));
const l3 = readJson('src/levels/levels41-60.json').levels.map(l => ({ id: l.id, title: l.title }));

const base = [...l1, ...l2, ...l3];

const curated = new Map([
  [61, 'Set File Permissions'],
  [62, 'Change Ownership'],
  [63, 'Adjust umask'],
  [64, 'Find Errors'],
  [65, 'Count Lines'],
  [66, 'Select Columns'],
  [67, 'Sort Numbers'],
  [91, 'Enable Service'],
  [92, 'Start Service'],
  [93, 'Log a Message'],
  [94, 'Read Logs'],
  [96, 'Service Status'],
  [101, 'Mount Data Volume'],
  [102, 'Check Space'],
  [103, 'List Blocks'],
  [104, 'Unmount Volume'],
  [121, 'Install Nano'],
  [122, 'List Packages'],
  [123, 'Install curl (RPM)'],
  [124, 'Query RPM'],
  [125, 'Search Packages'],
  [131, 'Assign Address'],
  [132, 'Link Up'],
  [133, 'Default Route'],
  [134, 'Ping Host'],
  [135, 'Show Addresses'],
  [136, 'Add Route'],
]);

function rotatedTitle(id) {
  const t = id % 5;
  if (t === 0) return 'Deep Structure';
  if (t === 1) return 'Log Seeds';
  if (t === 2) return 'Replicate Tree';
  if (t === 3) return 'Rename Briefing';
  return 'Link the Data';
}

for (let id = 61; id <= 150; id++) {
  const title = curated.get(id) || rotatedTitle(id);
  base.push({ id, title });
}

base.sort((a, b) => a.id - b.id);
for (const { id, title } of base) {
  console.log(`${id}\t${title}`);
}


