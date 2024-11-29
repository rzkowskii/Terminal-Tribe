import { LevelFile } from './level';

declare module '*.json' {
  const value: LevelFile;
  export default value;
}
