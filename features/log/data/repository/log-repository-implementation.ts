import { BehaviorSubject, Observable } from 'rxjs';
import { LogRepository } from '@/features/log/domain/repository/log-repository';
import { Log } from '@/features/log/domain/model/log';
import { Level } from '@/features/log/domain/model/level';
import { PaginationState } from '@/features/log/data/paging/pagination-state';
import { Result, ResultFactory } from '@/utils/result';

export class MockLogRepository implements LogRepository {
  private currentPage = 1;
  private readonly ITEMS_PER_PAGE = 10;

  private totalLogsPool: Log[] = [];
  private logs$ = new BehaviorSubject<Result<Log[]>>(ResultFactory.success([]));
  private pagination$ = new BehaviorSubject<Result<PaginationState>>(
    ResultFactory.success({
      currentPage: 1,
      isFirstPage: true,
      isLastPage: true,
    }),
  );
  private isNewSession$ = new BehaviorSubject<Result<boolean>>(ResultFactory.success(true));

  getLogs(): Observable<Result<Log[]>> {
    return this.logs$.asObservable();
  }

  getPaginationState(): Observable<Result<PaginationState>> {
    return this.pagination$.asObservable();
  }

  isNewSession(): Observable<Result<boolean>> {
    return this.isNewSession$.asObservable();
  }

  updateSelectedScope(dateId: number, sessionId: number): Result<void> {
    try {
      this.currentPage = 1;
      this.generateMockLogsPool(dateId, sessionId);
      this.isNewSession$.next(ResultFactory.success(true));
      this.emitCurrentPageAndState();
      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure('DATABASE_ERROR');
    }
  }

  clearSelectedScope(): void {
    this.currentPage = 1;
    this.totalLogsPool = [];
    this.logs$.next(ResultFactory.success([]));
    this.pagination$.next(
      ResultFactory.success({ currentPage: 1, isFirstPage: true, isLastPage: true }),
    );
    this.isNewSession$.next(ResultFactory.success(false));
  }

  nextPage(): Result<void> {
    try {
      const maxPages = this.getMaxPages();
      if (this.currentPage < maxPages) {
        this.currentPage++;
        this.isNewSession$.next(ResultFactory.success(false));
        this.emitCurrentPageAndState();
      }
      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure('DATABASE_ERROR');
    }
  }

  lastPage(): Result<void> {
    try {
      const maxPages = this.getMaxPages();
      if (this.currentPage !== maxPages && maxPages > 0) {
        this.currentPage = maxPages;
        this.isNewSession$.next(ResultFactory.success(false));
        this.emitCurrentPageAndState();
      }
      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure('DATABASE_ERROR');
    }
  }

  prevPage(): Result<void> {
    try {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.isNewSession$.next(ResultFactory.success(false));
        this.emitCurrentPageAndState();
      }
      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure('DATABASE_ERROR');
    }
  }

  firstPage(): Result<void> {
    try {
      if (this.currentPage !== 1) {
        this.currentPage = 1;
        this.isNewSession$.next(ResultFactory.success(false));
        this.emitCurrentPageAndState();
      }
      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure('DATABASE_ERROR');
    }
  }

  goToPage(page: number): Result<void> {
    try {
      const maxPages = this.getMaxPages();
      if (page >= 1 && page <= maxPages && page !== this.currentPage) {
        this.currentPage = page;
        this.isNewSession$.next(ResultFactory.success(false));
        this.emitCurrentPageAndState();
      }
      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure('DATABASE_ERROR');
    }
  }

  private getMaxPages(): number {
    return Math.ceil(this.totalLogsPool.length / this.ITEMS_PER_PAGE);
  }

  private emitCurrentPageAndState(): void {
    const maxPages = this.getMaxPages();

    if (this.totalLogsPool.length === 0) {
      this.logs$.next(ResultFactory.success([]));
      this.pagination$.next(
        ResultFactory.success({ currentPage: 1, isFirstPage: true, isLastPage: true }),
      );
      return;
    }

    const startIndex = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
    const endIndex = startIndex + this.ITEMS_PER_PAGE;
    this.logs$.next(ResultFactory.success(this.totalLogsPool.slice(startIndex, endIndex)));

    this.pagination$.next(
      ResultFactory.success({
        currentPage: this.currentPage,
        isFirstPage: this.currentPage === 1,
        isLastPage: this.currentPage === maxPages || maxPages === 0,
      }),
    );
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
      return {
        id: id,
        message: `[Date:${dateId}][Session:${sessionId}] Operational event milestone entry sequence #${id}`,
        functionName: functions[index % functions.length],
        className: classes[index % classes.length],
        line: 12 + index * 4,
        level: levels[index % levels.length],
      };
    });
  }
}
