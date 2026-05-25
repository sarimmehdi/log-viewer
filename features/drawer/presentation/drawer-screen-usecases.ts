import { UpdateSelectedScopeUseCase } from '@/features/log/domain/usecase/update-selected-scope-usecase';
import { GetDatesUseCase } from '@/features/drawer/domain/usecase/get-dates-usecase';
import { GetSessionsUseCase } from '@/features/drawer/domain/usecase/get-sessions-usecase';

export interface DrawerScreenUseCases {
  getDatesUseCase: GetDatesUseCase;
  getSessionsUseCase: GetSessionsUseCase;
  updatedSelectedScopeUseCase: UpdateSelectedScopeUseCase;
}
