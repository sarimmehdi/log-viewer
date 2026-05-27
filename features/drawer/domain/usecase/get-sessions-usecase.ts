import { LogSession } from '@/features/drawer/domain/model/log-session';
import { DrawerRepository } from '@/features/drawer/domain/repository/drawer-repository';
import { Result } from '@/utils/result';

export class GetSessionsUseCase {
  constructor(private repository: DrawerRepository) {}

  async execute(dateId: number): Promise<Result<LogSession[]>> {
    return await this.repository.getSessionsByDate(dateId);
  }
}
