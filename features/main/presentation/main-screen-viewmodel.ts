import { create } from 'zustand';
import { Subscription } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { MainScreenState } from './main-screen-state';
import { MainScreenToViewModelEvents } from './main-screen-to-viewmodel-events';
import { toast } from 'sonner';
import { mainUseCases } from '@/features/main/di/module';

export const useMainScreenViewModel = create<MainScreenState & MainScreenToViewModelEvents>(
  (set, get) => {
    let logsSubscription: Subscription | null = null;

    return {
      logs: [],
      selectedLogIds: [],
      isLoadingLogs: false,

      getLogs: () => {
        set({
          isLoadingLogs: true,
        });

        logsSubscription = mainUseCases.getLogsUseCase
          .execute()
          .pipe(withLatestFrom(mainUseCases.getLogsUseCase.observeSessionChange()))
          .subscribe({
            next: ([newLogs, isNewSession]) => {
              set({
                logs: newLogs,
                isLoadingLogs: false,
                selectedLogIds: isNewSession ? [] : get().selectedLogIds,
              });
            },
            error: (error) => {
              set({ isLoadingLogs: false });
              const errorMessage = error instanceof Error ? error.message : 'Stream failure';
              toast.error('Failed to stream logs', {
                description: `Reason: ${errorMessage}`,
              });
            },
          });

        return () => {
          if (logsSubscription) {
            logsSubscription.unsubscribe();
            logsSubscription = null;
          }
        };
      },

      selectLog: (id: number) => {
        const currentSelected = get().selectedLogIds;
        if (!currentSelected.includes(id)) {
          set({ selectedLogIds: [...currentSelected, id] });
        }
      },

      unselectLog: (id: number) => {
        set({
          selectedLogIds: get().selectedLogIds.filter((logId) => logId !== id),
        });
      },
    };
  },
);
