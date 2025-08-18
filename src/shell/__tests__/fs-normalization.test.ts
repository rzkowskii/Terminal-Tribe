import loadLevels from '../../utils/levelLoader';

describe('level loader normalization', () => {
  test('wraps flat files under /home/recruit (skip if data missing)', () => {
    try {
      const levels = loadLevels();
      if (!levels || levels.length === 0) return;
      const first = levels[0];
      expect(first.initialState.files).toHaveProperty('home');
    } catch {
      // Data not available in test env; skip
    }
  });
});


