import { create } from 'zustand';
import { Subscription } from 'rxjs';
import { FooterScreenState } from './footer-screen-state';
import { FooterScreenToViewModelEvents } from './footer-screen-to-viewmodel-events';
import { toast } from 'sonner';
import { footerUseCases } from '@/features/footer/di/module';

interface FooterViewModelProps {
  initViewModel: () => () => void;
}

export const useFooterScreenViewModel = create<
  FooterScreenState & FooterScreenToViewModelEvents & FooterViewModelProps
>((set, get) => {
  let paginationSubscription: Subscription | null = null;

  return {
    currentPage: 1,
    isFirstPage: true,
    isLastPage: true,

    initViewModel: () => {
      paginationSubscription = footerUseCases.currentPageUseCase.execute().subscribe({
        next: (state) => {
          set({
            currentPage: state.currentPage,
            isFirstPage: state.isFirstPage,
            isLastPage: state.isLastPage,
          });
        },
        error: (error) => {
          const errorMessage = error instanceof Error ? error.message : 'Pagination pipe failure';
          toast.error('Failed to sync pagination stream', {
            description: `Reason: ${errorMessage}`,
          });
        },
      });

      return () => {
        if (paginationSubscription) {
          paginationSubscription.unsubscribe();
          paginationSubscription = null;
        }
      };
    },

    firstPage: () => {
      const { isFirstPage, currentPage } = get();
      if (isFirstPage) return;

      const previousPage = currentPage;
      set({ currentPage: 1, isFirstPage: true, isLastPage: false });

      try {
        footerUseCases.changePageUseCase.firstPage();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown rejection';
        set({ currentPage: previousPage, isFirstPage: false });
        toast.error('Failed to navigate to first page', {
          description: `Reason: ${msg}`,
        });
      }
    },

    lastPage: () => {
      const { isLastPage, currentPage } = get();
      if (isLastPage) return;

      const previousPage = currentPage;
      set({ isFirstPage: false, isLastPage: true });

      try {
        footerUseCases.changePageUseCase.lastPage();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown rejection';
        set({ currentPage: previousPage, isLastPage: false, isFirstPage: previousPage === 1 });
        toast.error('Failed to navigate to last page', {
          description: `Reason: ${msg}`,
        });
      }
    },

    nextPage: () => {
      const { isLastPage, currentPage } = get();
      if (isLastPage) return;

      const previousPage = currentPage;
      set({ currentPage: previousPage + 1, isFirstPage: false });

      try {
        footerUseCases.changePageUseCase.nextPage();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown rejection';
        set({ currentPage: previousPage, isFirstPage: previousPage === 1 });
        toast.error('Navigation step failed', {
          description: `Reason: ${msg}`,
        });
      }
    },

    previousPage: () => {
      const { isFirstPage, currentPage } = get();
      if (isFirstPage) return;

      const previousPage = currentPage;
      set({ currentPage: previousPage - 1, isLastPage: false });

      try {
        footerUseCases.changePageUseCase.prevPage();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown rejection';
        set({ currentPage: previousPage, isLastPage: get().isLastPage });
        toast.error('Navigation step failed', {
          description: `Reason: ${msg}`,
        });
      }
    },

    goToPage: (page: number) => {
      const { currentPage } = get();
      if (page === currentPage || page < 1) return;

      const previousPage = currentPage;
      set({ currentPage: page });

      try {
        footerUseCases.changePageUseCase.goToPage(page);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown rejection';
        set({ currentPage: previousPage });
        toast.error(`Could not navigate to page ${page}`, {
          description: `Reason: ${msg}`,
        });
      }
    },
  };
});
