import { ChangePageUseCase } from '@/features/log/domain/usecase/change-page-usecase';
import { CurrentPageUseCase } from '@/features/log/domain/usecase/current-page-usecase';

export interface FooterScreenUseCases {
  currentPageUseCase: CurrentPageUseCase;
  changePageUseCase: ChangePageUseCase;
}
