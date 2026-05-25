import { LogDate } from '@/features/drawer/domain/model/log-date';
import { DrawerRepository } from '@/features/drawer/domain/repository/drawer-repository';

export class GetDatesUseCase {
  constructor(private repository: DrawerRepository) {}

  async execute(): Promise<LogDate[]> {
    return await this.repository.getAvailableDates();
  }
}
