import useLevelStore from '../../stores/levelStore';
import useSkillStore from '../../stores/skillStore';
import useProgressStore from '../../stores/progressStore';
import { defaultFileSystemState, type Level } from '../../types/level';

describe('Skill XP awards on completeLevel', () => {
  beforeEach(() => {
    // Reset skills
    useSkillStore.getState().reset();
    // Reset progress (optional)
    useProgressStore.setState({ codexUnlocked: new Set(), codexUnlockMap: {}, achievements: new Set() } as any);
    // Reset level store to known baseline
    useLevelStore.setState({
      currentLevel: 1,
      levels: [],
      completedLevels: new Set<number>(),
      currentFileSystem: { ...defaultFileSystemState },
    } as any);
  });

  afterEach(() => {
    useSkillStore.getState().reset();
    useLevelStore.setState({
      currentLevel: 1,
      levels: [],
      completedLevels: new Set<number>(),
      currentFileSystem: { ...defaultFileSystemState },
    } as any);
  });

  it('increments XP for each conceptKey upon level completion', () => {
    const level: Level = {
      id: 1,
      title: 'Basics',
      story: 'Learn basics',
      task: 'Print working directory',
      expectedCommand: 'pwd',
      successMessage: 'Nice!',
      initialState: { ...defaultFileSystemState },
      expectedState: { ...defaultFileSystemState },
      conceptKeys: ['paths', 'listing'],
    };

    useLevelStore.setState({ currentLevel: 1, levels: [level] } as any);

    // Act
    useLevelStore.getState().completeLevel();

    // Assert
    const skills = useSkillStore.getState().skills;
    expect(skills.paths.xp).toBe(5);
    // level is computed from XP; with 5 XP, level 1
    expect(skills.paths.level).toBeGreaterThanOrEqual(1);
    expect(skills.listing.xp).toBe(5);

    // Act again to ensure additivity
    useLevelStore.getState().completeLevel();
    const skills2 = useSkillStore.getState().skills;
    expect(skills2.paths.xp).toBe(10);
    expect(skills2.listing.xp).toBe(10);
  });

  it('no XP changes when conceptKeys is empty', () => {
    const level: Level = {
      id: 1,
      title: 'No Concepts',
      story: 'None',
      task: 'Do nothing',
      expectedCommand: 'pwd',
      successMessage: 'Done',
      initialState: { ...defaultFileSystemState },
      expectedState: { ...defaultFileSystemState },
      conceptKeys: [],
    };
    useLevelStore.setState({ currentLevel: 1, levels: [level] } as any);

    useLevelStore.getState().completeLevel();

    const skills = useSkillStore.getState().skills;
    expect(skills.paths).toBeUndefined();
    expect(skills.listing).toBeUndefined();
  });
});

import useLevelStore from '../../stores/levelStore';
import useSkillStore from '../../stores/skillStore';
import useProgressStore from '../../stores/progressStore';
import { defaultFileSystemState, Level } from '../../types/level';

describe('Skills XP on level completion', () => {
  beforeEach(() => {
    // Reset stores
    useSkillStore.getState().reset();
    useProgressStore.setState({ codexUnlocked: new Set(), codexUnlockMap: {}, achievements: new Set() } as any);
    useLevelStore.setState({
      currentLevel: 1,
      levels: [],
      completedLevels: new Set<number>(),
      currentFileSystem: { ...defaultFileSystemState },
    } as any);
  });

  afterEach(() => {
    useSkillStore.getState().reset();
    useLevelStore.setState({ levels: [], completedLevels: new Set<number>() } as any);
  });

  it('awards 5 XP to each concept when completeLevel is called', () => {
    const level: Level = {
      id: 1,
      title: 'Test Level',
      story: 'A test story',
      task: 'Run pwd',
      expectedCommand: 'pwd',
      successMessage: 'Done',
      initialState: { ...defaultFileSystemState },
      expectedState: { ...defaultFileSystemState },
      conceptKeys: ['paths', 'listing'],
    } as any;
    useLevelStore.setState({ currentLevel: 1, levels: [level] } as any);

    useLevelStore.getState().completeLevel();

    const skills = useSkillStore.getState().skills;
    expect(skills.paths.xp).toBe(5);
    expect(skills.paths.level).toBe(1); // 5 XP < 10 => level 1
    expect(skills.listing.xp).toBe(5);

    // Call again to verify additivity
    useLevelStore.getState().completeLevel();
    const skills2 = useSkillStore.getState().skills;
    expect(skills2.paths.xp).toBe(10);
    expect(skills2.paths.level).toBe(2); // 10 XP >= 10 => level 2
    expect(skills2.listing.xp).toBe(10);
  });

  it('does not crash and awards no XP when conceptKeys is empty', () => {
    const level: Level = {
      id: 1,
      title: 'No Concepts',
      story: 'A test story',
      task: 'Run pwd',
      expectedCommand: 'pwd',
      successMessage: 'Done',
      initialState: { ...defaultFileSystemState },
      expectedState: { ...defaultFileSystemState },
      conceptKeys: [],
    } as any;
    useLevelStore.setState({ currentLevel: 1, levels: [level] } as any);

    useLevelStore.getState().completeLevel();

    const skills = useSkillStore.getState().skills;
    expect(Object.keys(skills).length).toBe(0);
  });
});


