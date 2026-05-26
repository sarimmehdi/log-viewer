import { LogDate } from '@/features/drawer/domain/model/log-date';
import { LogSession } from '@/features/drawer/domain/model/log-session';
import { Result } from '@/utils/result';

export interface DrawerRepository {
  getAvailableDates(): Promise<Result<LogDate[]>>;
  getSessionsByDate(dateId: number): Promise<Result<LogSession[]>>;
}
