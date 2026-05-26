import { LogDate } from '@/features/drawer/domain/model/log-date';
import { DrawerRepository } from '@/features/drawer/domain/repository/drawer-repository';
import { Result } from '@/utils/result';

export class GetDatesUseCase {
  constructor(private repository: DrawerRepository) {}

  async execute(): Promise<Result<LogDate[]>> {
    return await this.repository.getAvailableDates();
  }
}
