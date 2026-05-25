import { LogDate } from '../model/log-date';
import { LogSession } from '../model/log-session';

export interface DrawerRepository {
  getAvailableDates(): Promise<LogDate[]>;
  getSessionsByDate(dateId: number): Promise<LogSession[]>;
}
