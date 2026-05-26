export interface FooterScreenToViewModelEvents {
  nextPage: () => void;
  previousPage: () => void;
  lastPage: () => void;
  firstPage: () => void;
  goToPage: (page: number) => void;
}
