import React, { useEffect } from 'react';
import Terminal from './components/Terminal';
import LevelDisplay from './components/LevelDisplay';
import useLevelStore from './stores/levelStore';

const App: React.FC = () => {
  const { initializeLevels } = useLevelStore();

  useEffect(() => {
    initializeLevels();
  }, [initializeLevels]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">Terminal Tribe</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <LevelDisplay />
        </div>
        <div>
          <Terminal />
        </div>
      </div>
    </div>
  );
};

export default App;
