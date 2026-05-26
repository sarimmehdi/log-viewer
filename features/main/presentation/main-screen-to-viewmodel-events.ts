export interface MainScreenToViewModelEvents {
  getLogs(): () => void;
  selectLog(id: number): void;
  unselectLog(id: number): void;
}
