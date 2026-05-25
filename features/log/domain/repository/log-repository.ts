import { Observable } from 'rxjs';
import { Log } from '@/features/log/domain/model/log';

export interface LogRepository {
  updateSelectedScope(dateId: number, sessionId: number): void;
  clearSelectedScope(): void;
  getLogs(): Observable<Log[]>;
  nextPage(): void;
  prevPage(): void;
  goToPage(page: number): void;
}
