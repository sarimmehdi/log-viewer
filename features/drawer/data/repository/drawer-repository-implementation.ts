import { LogDate } from '@/features/drawer/domain/model/log-date';
import { LogSession } from '@/features/drawer/domain/model/log-session';
import { DrawerRepository } from '@/features/drawer/domain/repository/drawer-repository';
import { Result, ResultFactory } from '@/utils/result';

export class MockDrawerRepository implements DrawerRepository {
  private mockDates: LogDate[] = [
    { id: 1, day: 24, month: 5, year: 2026, formattedString: '24-05-2026' },
    { id: 2, day: 23, month: 5, year: 2026, formattedString: '23-05-2026' },
    { id: 3, day: 22, month: 5, year: 2026, formattedString: '22-05-2026' },
  ];

  private mockSessions: Record<number, LogSession[]> = {
    1: [
      { id: 101, name: 'Production-Session-0940' },
      { id: 102, name: 'Auth-Debug-Session' },
    ],
    2: [
      { id: 201, name: 'Cron-Job-Nightly-Run' },
      { id: 202, name: 'Database-Migration-Logs' },
    ],
    3: [{ id: 301, name: 'Crashlytics-Dump-01' }],
  };

  async getAvailableDates(): Promise<Result<LogDate[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return ResultFactory.success([...this.mockDates]);
  }

  async getSessionsByDate(dateId: number): Promise<Result<LogSession[]>> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return this.mockSessions[dateId]
      ? ResultFactory.success([...this.mockSessions[dateId]])
      : ResultFactory.failure('DATABASE_ERROR');
  }
}
