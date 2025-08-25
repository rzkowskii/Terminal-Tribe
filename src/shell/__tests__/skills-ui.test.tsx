import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import SkillsModal from '../../components/SkillsModal';
import useUiStore from '../../stores/uiStore';
import useSkillStore from '../../stores/skillStore';

describe('Skills UI', () => {
  it('renders skills when enabled', () => {
    act(() => {
      useUiStore.setState({ showSkills: true });
      useSkillStore.setState({ skills: { paths: { xp: 15, level: 2 } } as any });
    });
    render(<SkillsModal />);
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('paths')).toBeInTheDocument();
    act(() => {
      useUiStore.setState({ showSkills: false });
    });
  });
});

import React from 'react';
import { render, act } from '@testing-library/react';
import SkillsModal from '../../components/SkillsModal';
import useUiStore from '../../stores/uiStore';
import useSkillStore from '../../stores/skillStore';

describe('Skills UI', () => {
  it('renders skills when enabled', () => {
    act(() => {
      useUiStore.setState({ showSkills: true });
      useSkillStore.getState().addXp('paths', 10);
    });
    const { getByText } = render(<SkillsModal />);
    expect(getByText('Skills')).toBeTruthy();
    expect(getByText('paths')).toBeTruthy();
  });
});


