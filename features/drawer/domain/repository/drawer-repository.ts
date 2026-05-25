import { LogDate } from '@/features/drawer/domain/model/log-date';
import { LogSession } from '@/features/drawer/domain/model/log-session';

export interface DrawerRepository {
  getAvailableDates(): Promise<LogDate[]>;
  getSessionsByDate(dateId: number): Promise<LogSession[]>;
}
