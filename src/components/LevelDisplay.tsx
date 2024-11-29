import React from 'react';
import useLevelStore from '../stores/levelStore';

const LevelDisplay: React.FC = () => {
  const { currentLevel, levels, completedLevels, resetLevel } = useLevelStore();
  const currentLevelData = levels.find(l => l.id === currentLevel);

  if (!currentLevelData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Level {currentLevel}: {currentLevelData.title}
        </h2>
        <span className="text-sm text-gray-400">
          Completed: {completedLevels.size} / {levels.length}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-300">Story</h3>
        <p className="italic text-gray-400">{currentLevelData.story}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-300">Current Task</h3>
        <p className="text-green-400">{currentLevelData.task}</p>
      </div>

      <button
        onClick={() => resetLevel()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Reset Level
      </button>
    </div>
  );
};

export default LevelDisplay;
