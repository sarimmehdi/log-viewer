import { Log } from '@/features/log/domain/model/log';

export interface MainScreenState {
  logs: Log[];
  selectedLogIds: number[];
  isLoadingLogs: boolean;
}
