export interface DrawerScreenToViewModelEvents {
  toggleDrawer: () => void;
  loadDates: () => Promise<void>;
  selectDate: (dateId: number) => Promise<void>;
  selectSession: (sessionId: number) => void;
}