import React from 'react';
import { render, screen } from '@testing-library/react';
import WorldMap from '../../components/Map/WorldMap';
import useUiStore from '../../stores/uiStore';
import useLevelStore from '../../stores/levelStore';

describe('WorldMap a11y', () => {
  it('has aria-labels on level buttons', () => {
    useLevelStore.setState({ levels: [{ id: 1, title: 'T', story: '', task: 'do', expectedCommand: 'pwd', successMessage: 'ok', initialState: { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any, expectedState: { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any, biome: 'outpost', difficulty: 'easy', estTimeMin: 1 } as any], completedLevels: new Set<number>(), currentLevel: 1 });
    useUiStore.setState({ showMap: true });
    const { getAllByRole } = render(<WorldMap />);
    const buttons = getAllByRole('button');
    expect(buttons.some(b => (b.getAttribute('aria-label') || '').includes('Level'))).toBe(true);
  });

  it('renders difficulty, est. time, and concept chips for level tiles', () => {
    useLevelStore.setState({
      levels: [{ id: 1, title: 'Basics', story: '', task: 'Print PWD', expectedCommand: 'pwd', successMessage: 'ok', initialState: { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any, expectedState: { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any, biome: 'outpost', difficulty: 'easy', estTimeMin: 3, conceptKeys: ['paths', 'listing', 'creation'] } as any],
      completedLevels: new Set<number>(),
      currentLevel: 1,
    });
    useUiStore.setState({ showMap: true });
    render(<WorldMap />);
    // Difficulty badge
    expect(screen.getByText(/easy/i)).toBeInTheDocument();
    // Est. time badge
    expect(screen.getByText(/~3m/i)).toBeInTheDocument();
    // Concept chips (subset)
    expect(screen.getByText('paths')).toBeInTheDocument();
    // Level button aria-label includes difficulty and time
    const levelBtn = screen.getByRole('button', { name: /Level 1:/i });
    const aria = levelBtn.getAttribute('aria-label') || '';
    expect(aria).toMatch(/easy/i);
    expect(aria).toMatch(/approximately/i);
  });
});


