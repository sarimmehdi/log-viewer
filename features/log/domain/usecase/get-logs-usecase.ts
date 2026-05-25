import { Observable } from 'rxjs';
import { LogRepository } from '../repository/log-repository';
import { Log } from '../model/log';

export class GetLogsUseCase {
  constructor(private repository: LogRepository) {}

  execute(): Observable<Log[]> {
    return this.repository.getLogs();
  }
}
