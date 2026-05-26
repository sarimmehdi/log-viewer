import { LogRepository } from '@/features/log/domain/repository/log-repository';
import { Result } from '@/utils/result';

export class UpdateSelectedScopeUseCase {
  constructor(private repository: LogRepository) {}

  execute(dateId: number, sessionId: number): Result<void> {
    return this.repository.updateSelectedScope(dateId, sessionId);
  }

  clear(): void {
    this.repository.clearSelectedScope();
  }
}
