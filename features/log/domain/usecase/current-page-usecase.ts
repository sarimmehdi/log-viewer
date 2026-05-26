import { Observable } from 'rxjs';
import { LogRepository } from '@/features/log/domain/repository/log-repository';
import { PaginationState } from '@/features/log/data/paging/pagination-state';
import { Result } from '@/utils/result';

export class CurrentPageUseCase {
  constructor(private repository: LogRepository) {}

  execute(): Observable<Result<PaginationState>> {
    return this.repository.getPaginationState();
  }
}
