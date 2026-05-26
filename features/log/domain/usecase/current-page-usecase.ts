import { Observable } from 'rxjs';
import { LogRepository } from '@/features/log/domain/repository/log-repository';
import { PaginationState } from '@/features/log/data/paging/pagination-state';

export class CurrentPageUseCase {
  constructor(private repository: LogRepository) {}

  execute(): Observable<PaginationState> {
    return this.repository.getPaginationState();
  }
}
