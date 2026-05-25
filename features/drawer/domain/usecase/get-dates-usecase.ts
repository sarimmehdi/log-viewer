import { LogDate } from '../model/log-date';
import { DrawerRepository } from '../repository/drawer-repository';

export class GetDatesUseCase {
  constructor(private repository: DrawerRepository) {}

  async execute(): Promise<LogDate[]> {
    return await this.repository.getAvailableDates();
  }
}
