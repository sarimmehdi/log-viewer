import { MockDrawerRepository } from '@/features/drawer/data/repository/drawer-repository-implementation';
import { GetDatesUseCase } from '@/features/drawer/domain/usecase/get-dates-usecase';
import { GetSessionsUseCase } from '@/features/drawer/domain/usecase/get-sessions-usecase';
import { DrawerScreenUseCases } from '@/features/drawer/presentation/drawer-screen-usecases';
import { logRepository } from '@/features/log/di/module';
import { UpdateSelectedScopeUseCase } from '@/features/log/domain/usecase/update-selected-scope-usecase';

const drawerRepository = new MockDrawerRepository();

export const drawerUseCases: DrawerScreenUseCases = {
  getDatesUseCase: new GetDatesUseCase(drawerRepository),
  getSessionsUseCase: new GetSessionsUseCase(drawerRepository),
  updatedSelectedScopeUseCase: new UpdateSelectedScopeUseCase(logRepository),
};
