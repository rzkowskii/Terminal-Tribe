import { validateLevels } from '../../utils/levelLoader';

describe('validateLevels', () => {
  it('sorts levels ascending and flags duplicates', () => {
    const levels = [
      { id: 2 } as any,
      { id: 1 } as any,
      { id: 2 } as any,
    ];
    const spyError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const sorted = validateLevels(levels as any);
    expect(sorted.map(l => l.id)).toEqual([1,2,2]);
    expect(spyError).toHaveBeenCalled();
    spyError.mockRestore();
  });
});


