import { create } from 'zustand';
import { DrawerScreenState } from './drawer-screen-state';
import { DrawerScreenToViewModelEvents } from './drawer-screen-to-viewmodel-events';
import { drawerUseCases } from '@/features/drawer/di/module';
import { toast } from 'sonner';

export const useDrawerScreenViewModel = create<DrawerScreenState & DrawerScreenToViewModelEvents>(
  (set, get) => ({
    isDrawerOpen: true,
    dates: [],
    sessions: [],
    selectedDateId: null,
    selectedSessionId: null,
    isLoadingDates: false,
    isLoadingSessions: false,

    toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

    loadDates: async () => {
      set({ isLoadingDates: true });
      try {
        const dates = await drawerUseCases.getDatesUseCase.execute();
        set({ dates, isLoadingDates: false });
      } catch (error) {
        set({ isLoadingDates: false });
        const errorMessage = error instanceof Error ? error.message : 'Unknown database failure';
        toast.error('Failed to load dates', {
          description: `Reason: ${errorMessage}`,
        });
      }
    },

    selectDate: async (dateId: number) => {
      const currentSelected = get().selectedDateId;
      const currentlyLoading = get().isLoadingSessions;

      if (dateId === currentSelected || currentlyLoading) {
        return;
      }

      set({
        selectedDateId: dateId,
        selectedSessionId: null,
        sessions: [],
        isLoadingSessions: true,
      });

      drawerUseCases.updatedSelectedScopeUseCase.clear();

      try {
        const sessions = await drawerUseCases.getSessionsUseCase.execute(dateId, currentSelected);

        if (sessions === null) {
          set({
            selectedDateId: currentSelected,
            isLoadingSessions: false,
          });
          return;
        }

        set({
          sessions: sessions,
          isLoadingSessions: false,
        });
      } catch (error) {
        set({
          selectedDateId: currentSelected,
          sessions: [],
          isLoadingSessions: false,
        });

        const errorMessage = error instanceof Error ? error.message : 'Unknown database failure';
        toast.error('Failed to load sessions', {
          description: `Reason: ${errorMessage}`,
        });
      }
    },

    selectSession: async (sessionId: number) => {
      const currentSelectedSession = get().selectedSessionId;
      const currentSelectedDate = get().selectedDateId;

      if (sessionId === currentSelectedSession || currentSelectedDate === null) {
        return;
      }
      set({ selectedSessionId: sessionId });
      drawerUseCases.updatedSelectedScopeUseCase.execute(currentSelectedDate, sessionId);
    },
  }),
);
