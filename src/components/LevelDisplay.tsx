import useLevelStore from '../stores/levelStore';

export default function LevelDisplay() {
  const levels = useLevelStore(state => state.levels);
  const currentLevelIndex = useLevelStore(state => state.currentLevel);
  const completedLevels = useLevelStore(state => state.completedLevels);
  const resetLevel = useLevelStore(state => state.resetLevel);

  // Get current level safely
  const currentLevel = levels[currentLevelIndex];
  const totalLevels = levels.length;

  // If no levels are loaded yet, show loading state
  if (!currentLevel) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-gray-400">Loading levels...</div>
      </div>
    );
  }

  const { id, title, story, task } = currentLevel;
  const completed = completedLevels.includes(id - 1);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">
          Level {id}: {title}
        </h2>
        <div className="text-gray-400">
          Completed: {completed ? id : id - 1} / {totalLevels}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-gray-400 mb-2">Story</h3>
        <p className="italic text-gray-300">{story}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-gray-400 mb-2">Current Task</h3>
        <p className="text-green-300">{task}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={resetLevel}
          className="bg-gray-700 text-gray-300 px-4 py-2 rounded hover:bg-gray-600"
        >
          Reset Level
        </button>
      </div>
    </div>
  );
}
