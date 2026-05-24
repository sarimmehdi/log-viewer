import { create } from 'zustand';
import { DrawerScreenState } from './drawer-screen-state';
import { DrawerScreenToViewModelEvents } from './drawer-screen-to-viewmodel-events';
import { drawerUseCases } from '../di/module';

export const useDrawerScreenViewModel = create<DrawerScreenState & DrawerScreenToViewModelEvents>((set, get) => ({
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
    }
  },

  selectDate: async (dateId: number) => {
    const currentSelected = get().selectedDateId;
    set({ isLoadingSessions: dateId !== currentSelected });
    try {
      const sessions = await drawerUseCases.getSessionsUseCase.execute(dateId, currentSelected);
      if (sessions === null) {
        return;
      }
      set({ 
        selectedDateId: dateId, 
        selectedSessionId: null, 
        sessions: sessions, 
        isLoadingSessions: false 
      });
    } catch (error) {
      set({ isLoadingSessions: false });
    }
  },

  selectSession: (sessionId: number) => {
    set({ selectedSessionId: sessionId });
  },
}));