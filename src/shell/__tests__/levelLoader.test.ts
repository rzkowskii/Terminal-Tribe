import { validateLevels } from '../../utils/levelLoader';
import { Level } from '../../types/level';

describe('validateLevels', () => {
  it('sorts by id and reports duplicates and missing', () => {
    const levels: Level[] = [
      { id: 2 } as any,
      { id: 1 } as any,
      { id: 2 } as any,
      { id: 4 } as any,
    ];
    const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const spyErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    const out = validateLevels(levels);
    expect(out[0].id).toBe(1);
    expect(out[1].id).toBe(2);
    expect(spyErr).toHaveBeenCalled();
    expect(spyWarn).toHaveBeenCalled();
    spyWarn.mockRestore();
    spyErr.mockRestore();
  });
});


