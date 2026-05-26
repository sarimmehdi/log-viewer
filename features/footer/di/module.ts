import { FooterScreenUseCases } from '@/features/footer/presentation/footer-screen-usecases';
import { logRepository } from '@/features/log/di/module';
import { ChangePageUseCase } from '@/features/log/domain/usecase/change-page-usecase';
import { CurrentPageUseCase } from '@/features/log/domain/usecase/current-page-usecase';

export const footerUseCases: FooterScreenUseCases = {
  currentPageUseCase: new CurrentPageUseCase(logRepository),
  changePageUseCase: new ChangePageUseCase(logRepository),
};
