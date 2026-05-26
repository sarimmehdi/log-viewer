import { create } from 'zustand';
import { DrawerScreenState } from './drawer-screen-state';
import { DrawerScreenToViewModelEvents } from './drawer-screen-to-viewmodel-events';
import { drawerUseCases } from '@/features/drawer/di/module';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/utils/ui-text';

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

      const result = await drawerUseCases.getDatesUseCase.execute();

      if (result.type === 'success') {
        set({ dates: result.data, isLoadingDates: false });
      } else {
        set({ isLoadingDates: false });
        const friendlyText = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.UNKNOWN;
        toast.error('Failed to load dates', { description: friendlyText });
      }
    },

    selectDate: async (dateId: number) => {
      const currentSelected = get().selectedDateId;
      const currentlyLoading = get().isLoadingSessions;

      if (dateId === currentSelected || currentlyLoading) return;

      set({
        selectedDateId: dateId,
        selectedSessionId: null,
        sessions: [],
        isLoadingSessions: true,
      });

      drawerUseCases.updatedSelectedScopeUseCase.clear();

      const result = await drawerUseCases.getSessionsUseCase.execute(dateId);

      if (result.type === 'success') {
        set({
          sessions: result.data,
          isLoadingSessions: false,
        });
      } else {
        set({
          selectedDateId: currentSelected,
          sessions: [],
          isLoadingSessions: false,
        });
        const friendlyText = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.UNKNOWN;
        toast.error('Failed to load sessions', { description: friendlyText });
      }
    },

    selectSession: async (sessionId: number) => {
      const currentSelectedSession = get().selectedSessionId;
      const currentSelectedDate = get().selectedDateId;

      if (sessionId === currentSelectedSession || currentSelectedDate === null) return;

      set({ selectedSessionId: sessionId });
      drawerUseCases.updatedSelectedScopeUseCase.execute(currentSelectedDate, sessionId);
    },
  }),
);
