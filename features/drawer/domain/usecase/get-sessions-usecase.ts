import { LogSession } from '../model/log-session';
import { DrawerRepository } from '../repository/drawer-repository';

export class GetSessionsUseCase {
  constructor(private repository: DrawerRepository) {}

  async execute(
    dateId: number,
    currentSelectedDateId: number | null,
  ): Promise<LogSession[] | null> {
    if (dateId === currentSelectedDateId) {
      return null;
    }
    return await this.repository.getSessionsByDate(dateId);
  }
}
