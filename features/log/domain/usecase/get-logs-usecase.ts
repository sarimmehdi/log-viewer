import { Observable } from 'rxjs';
import { LogRepository } from '@/features/log/domain/repository/log-repository';
import { Log } from '@/features/log/domain/model/log';

export class GetLogsUseCase {
  constructor(private repository: LogRepository) {}

  execute(): Observable<Log[]> {
    return this.repository.getLogs();
  }

  observeSessionChange(): Observable<boolean> {
    return this.repository.isNewSession();
  }
}
