import { Observable } from 'rxjs';
import { Log } from '../model/log';

export interface LogRepository {
  getLogs(): Observable<Log[]>;
  nextPage(): void;
  prevPage(): void;
  goToPage(page: number): void;
}
