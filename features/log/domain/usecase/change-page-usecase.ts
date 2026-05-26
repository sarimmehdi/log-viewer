import { LogRepository } from '@/features/log/domain/repository/log-repository';

export class ChangePageUseCase {
  constructor(private repository: LogRepository) {}

  nextPage(): void {
    this.repository.nextPage();
  }

  firstPage(): void {
    this.repository.firstPage();
  }

  lastPage(): void {
    this.repository.lastPage();
  }

  prevPage(): void {
    this.repository.prevPage();
  }

  goToPage(page: number): void {
    this.repository.goToPage(page);
  }
}
