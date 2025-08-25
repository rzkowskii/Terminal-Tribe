import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'src/levels');
const files = ['levels1-20.json', 'levels21-40.json', 'levels41-60.json'];

for (const fname of files) {
  const fpath = path.join(root, fname);
  const json = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
  if (!Array.isArray(json.levels)) {
    console.error(`Skipping ${fname}: no levels array`);
    continue;
  }
  json.levels.sort((a, b) => (a.id || 0) - (b.id || 0));
  fs.writeFileSync(fpath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
  console.log(`Reordered ${fname}`);
}


