import { Observable } from 'rxjs';
import { Log } from '@/features/log/domain/model/log';
import { PaginationState } from '@/features/log/data/paging/pagination-state';

export interface LogRepository {
  updateSelectedScope(dateId: number, sessionId: number): void;
  clearSelectedScope(): void;
  getLogs(): Observable<Log[]>;
  isNewSession(): Observable<boolean>;
  nextPage(): void;
  prevPage(): void;
  goToPage(page: number): void;
  lastPage(): void;
  firstPage(): void;
  getPaginationState(): Observable<PaginationState>;
}
