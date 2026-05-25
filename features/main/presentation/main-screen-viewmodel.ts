import { create } from 'zustand';
import { Subscription } from 'rxjs';
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

      initViewModel: () => {
        set({
          isLoadingLogs: true,
        });

        logsSubscription = mainUseCases.getLogsUseCase.execute().subscribe({
          next: (newLogs) => {
            set({
              logs: newLogs,
              isLoadingLogs: false,
              selectedLogIds: [],
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
