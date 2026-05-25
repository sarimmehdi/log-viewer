import { LogRepository } from '@/features/log/domain/repository/log-repository';

export class ChangePageUseCase {
  constructor(private repository: LogRepository) {}

  nextPage(): void {
    this.repository.nextPage();
  }

  prevPage(): void {
    this.repository.prevPage();
  }

  goToPage(page: number): void {
    this.repository.goToPage(page);
  }
}
