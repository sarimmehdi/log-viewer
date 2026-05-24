import { MockDrawerRepository } from '../data/repository/drawer-repository-implementation';
import { GetDatesUseCase } from '../domain/usecase/get-dates-usecase';
import { GetSessionsUseCase } from '../domain/usecase/get-sessions-usecase';
import { DrawerScreenUseCases } from '../presentation/drawer-screen-usecases';

const drawerRepository = new MockDrawerRepository();

export const drawerUseCases: DrawerScreenUseCases = {
  getDatesUseCase: new GetDatesUseCase(drawerRepository),
  getSessionsUseCase: new GetSessionsUseCase(drawerRepository),
};