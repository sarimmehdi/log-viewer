export interface MainScreenToViewModelEvents {
  initViewModel(): () => void;
  selectLog(id: number): void;
  unselectLog(id: number): void;
}
