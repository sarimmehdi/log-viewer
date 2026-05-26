import { create } from 'zustand';
import { Subscription } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { MainScreenState } from './main-screen-state';
import { MainScreenToViewModelEvents } from './main-screen-to-viewmodel-events';
import { toast } from 'sonner';
import { mainUseCases } from '@/features/main/di/module';
import { ERROR_MESSAGES } from '@/utils/ui-text';

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
            next: ([logsResult, sessionChangeResult]) => {
              if (logsResult.type === 'success' && sessionChangeResult.type === 'success') {
                const newLogs = logsResult.data;
                const isNewSession = sessionChangeResult.data;

                set({
                  logs: newLogs,
                  isLoadingLogs: false,
                  selectedLogIds: isNewSession ? [] : get().selectedLogIds,
                });
                return;
              }

              set({ isLoadingLogs: false });

              const failureCode =
                logsResult.type === 'failure'
                  ? logsResult.error
                  : sessionChangeResult.type === 'failure'
                    ? sessionChangeResult.error
                    : 'UNKNOWN';

              const friendlyText = ERROR_MESSAGES[failureCode] ?? ERROR_MESSAGES.UNKNOWN;
              toast.error('Failed to update log workspace', {
                description: `Reason: ${friendlyText}`,
              });
            },
            error: (error) => {
              set({ isLoadingLogs: false });
              const errorMessage =
                error instanceof Error ? error.message : 'Stream structural failure';
              toast.error('Fatal data stream disconnection', {
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
