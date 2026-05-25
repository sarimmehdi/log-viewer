import { BehaviorSubject, Observable } from 'rxjs';
import { LogRepository } from '@/features/log/domain/repository/log-repository';
import { Log } from '@/features/log/domain/model/log';
import { Level } from '@/features/log/domain/model/level';

export class MockLogRepository implements LogRepository {
  private currentPage = 1;
  private readonly ITEMS_PER_PAGE = 10;

  private totalLogsPool: Log[] = [];
  private logs$ = new BehaviorSubject<Log[]>([]);

  getLogs(): Observable<Log[]> {
    return this.logs$.asObservable();
  }

  updateSelectedScope(dateId: number, sessionId: number): void {
    this.currentPage = 1;
    this.generateMockLogsPool(dateId, sessionId);
    this.emitCurrentPage();
  }

  clearSelectedScope(): void {
    this.currentPage = 1;
    this.totalLogsPool = [];
    this.logs$.next([]);
  }

  nextPage(): void {
    const maxPages = Math.ceil(this.totalLogsPool.length / this.ITEMS_PER_PAGE);
    if (this.currentPage < maxPages) {
      this.currentPage++;
      this.emitCurrentPage();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.emitCurrentPage();
    }
  }

  goToPage(page: number): void {
    const maxPages = Math.ceil(this.totalLogsPool.length / this.ITEMS_PER_PAGE);
    if (page >= 1 && page <= maxPages) {
      this.currentPage = page;
      this.emitCurrentPage();
    }
  }

  private emitCurrentPage(): void {
    if (this.totalLogsPool.length === 0) {
      this.logs$.next([]);
      return;
    }

    const startIndex = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
    const endIndex = startIndex + this.ITEMS_PER_PAGE;
    const pageChunk = this.totalLogsPool.slice(startIndex, endIndex);

    this.logs$.next(pageChunk);
  }

  private generateMockLogsPool(dateId: number, sessionId: number): void {
    const levels = [Level.INFO, Level.DEBUG, Level.WARN, Level.ERROR];
    const functions = [
      'authenticateUser()',
      'fetchRecords()',
      'processPayment()',
      'validateSession()',
    ];
    const classes = ['AuthService', 'DatabaseEngine', 'BillingGateway', 'SessionManager'];

    this.totalLogsPool = Array.from({ length: 100 }, (_, index) => {
      const id = index + 1;
      const level = levels[index % levels.length];

      return {
        id: id,
        message: `[Date:${dateId}][Session:${sessionId}] Operational event milestone entry sequence #${id}`,
        functionName: functions[index % functions.length],
        className: classes[index % classes.length],
        line: 12 + index * 4,
        level: level,
      };
    });
  }
}
