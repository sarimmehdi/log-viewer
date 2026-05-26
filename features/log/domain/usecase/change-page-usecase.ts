import { LogRepository } from '@/features/log/domain/repository/log-repository';
import { Result } from '@/utils/result';

export class ChangePageUseCase {
  constructor(private repository: LogRepository) {}

  nextPage(): Result<void> {
    return this.repository.nextPage();
  }

  firstPage(): Result<void> {
    return this.repository.firstPage();
  }

  lastPage(): Result<void> {
    return this.repository.lastPage();
  }

  prevPage(): Result<void> {
    return this.repository.prevPage();
  }

  goToPage(page: number): Result<void> {
    return this.repository.goToPage(page);
  }
}
