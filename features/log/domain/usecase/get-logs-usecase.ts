import { Observable } from 'rxjs';
import { LogRepository } from '@/features/log/domain/repository/log-repository';
import { Log } from '@/features/log/domain/model/log';
import { Result } from '@/utils/result';

export class GetLogsUseCase {
  constructor(private repository: LogRepository) {}

  execute(): Observable<Result<Log[]>> {
    return this.repository.getLogs();
  }

  observeSessionChange(): Observable<Result<boolean>> {
    return this.repository.isNewSession();
  }
}
