import { LogDate } from "../domain/model/log-date";
import { LogSession } from "../domain/model/log-session";

export interface DrawerScreenState {
  isDrawerOpen: boolean;
  dates: LogDate[];
  sessions: LogSession[];
  selectedDateId: number | null;
  selectedSessionId: number | null;
  isLoadingDates: boolean;
  isLoadingSessions: boolean;
}