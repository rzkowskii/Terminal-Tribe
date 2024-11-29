import { useEffect } from 'react';
import Terminal from './components/Terminal';
import LevelDisplay from './components/LevelDisplay';
import useLevelStore from './stores/levelStore';
import { loadLevels } from './utils/levelLoader';
import { Level } from './types/level';
import levels1to20 from './levels/levels1-20.json';
import levels21to40 from './levels/levels21-40.json';

function App() {
  const initializeLevels = useLevelStore(state => state.initializeLevels);

  useEffect(() => {
    // Load and validate each set of levels separately
    const validatedLevels1 = loadLevels(levels1to20);
    const validatedLevels2 = loadLevels(levels21to40);

    // Combine validated levels
    const allLevels = [...validatedLevels1, ...validatedLevels2];
    
    if (allLevels.length > 0) {
      console.log('Validated levels:', allLevels);
      initializeLevels(allLevels);
    } else {
      console.error('No valid levels found in JSON files');
    }
  }, [initializeLevels]);

  return (
    <div className="min-h-screen bg-gray-900 text-blue-300 p-4">
      <h1 className="text-4xl mb-2">Terminal Tribe</h1>
      <h2 className="text-gray-400 mb-8">Master Linux administration through interactive challenges</h2>
      <div className="flex flex-col gap-8">
        <LevelDisplay />
        <Terminal />
      </div>
    </div>
  );
}

export default App;
