import { LogRepository } from '@/features/log/domain/repository/log-repository';

export class UpdateSelectedScopeUseCase {
  constructor(private repository: LogRepository) {}

  execute(dateId: number, sessionId: number): void {
    this.repository.updateSelectedScope(dateId, sessionId);
  }

  clear(): void {
    this.repository.clearSelectedScope();
  }
}
