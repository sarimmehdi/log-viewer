import { logRepository } from '@/features/log/di/module';
import { GetLogsUseCase } from '@/features/log/domain/usecase/get-logs-usecase';
import { MainScreenUseCases } from '@/features/main/presentation/main-screen-usecases';

export const mainUseCases: MainScreenUseCases = {
  getLogsUseCase: new GetLogsUseCase(logRepository),
};
