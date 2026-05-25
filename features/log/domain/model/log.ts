import { Level } from './level';

export interface Log {
  id: number;
  message: string;
  functionName: string;
  className: string;
  line: number;
  level: Level;
}
