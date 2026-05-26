import { Observable } from 'rxjs';
import { Log } from '@/features/log/domain/model/log';
import { PaginationState } from '@/features/log/data/paging/pagination-state';
import { Result } from '@/utils/result';

export interface LogRepository {
  updateSelectedScope(dateId: number, sessionId: number): Result<void>;
  clearSelectedScope(): void;
  getLogs(): Observable<Result<Log[]>>;
  isNewSession(): Observable<Result<boolean>>;
  getPaginationState(): Observable<Result<PaginationState>>;
  nextPage(): Result<void>;
  prevPage(): Result<void>;
  goToPage(page: number): Result<void>;
  lastPage(): Result<void>;
  firstPage(): Result<void>;
}
