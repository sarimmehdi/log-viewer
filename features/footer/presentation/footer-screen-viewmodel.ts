import { create } from 'zustand';
import { Subscription } from 'rxjs';
import { FooterScreenState } from './footer-screen-state';
import { FooterScreenToViewModelEvents } from './footer-screen-to-viewmodel-events';
import { toast } from 'sonner';
import { footerUseCases } from '@/features/footer/di/module';
import { ERROR_MESSAGES } from '@/utils/ui-text';

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
        next: (result) => {
          if (result.type === 'success') {
            set({
              currentPage: result.data.currentPage,
              isFirstPage: result.data.isFirstPage,
              isLastPage: result.data.isLastPage,
            });
          } else {
            const friendlyText = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.UNKNOWN;
            toast.error('Failed to sync pagination stream', {
              description: `Reason: ${friendlyText}`,
            });
          }
        },
        error: (error) => {
          const errorMessage = error instanceof Error ? error.message : 'Fatal stream failure';
          toast.error('Fatal data stream disconnection', {
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

      const result = footerUseCases.changePageUseCase.firstPage();

      if (result.type === 'failure') {
        set({ currentPage: previousPage, isFirstPage: false });
        const friendlyText = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.UNKNOWN;
        toast.error('Failed to navigate to first page', {
          description: `Reason: ${friendlyText}`,
        });
      }
    },

    lastPage: () => {
      const { isLastPage, currentPage } = get();
      if (isLastPage) return;

      const previousPage = currentPage;

      set({ isFirstPage: false, isLastPage: true });

      const result = footerUseCases.changePageUseCase.lastPage();

      if (result.type === 'failure') {
        set({ currentPage: previousPage, isLastPage: false, isFirstPage: previousPage === 1 });
        const friendlyText = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.UNKNOWN;
        toast.error('Failed to navigate to last page', {
          description: `Reason: ${friendlyText}`,
        });
      }
    },

    nextPage: () => {
      const { isLastPage, currentPage } = get();
      if (isLastPage) return;

      const previousPage = currentPage;

      set({ currentPage: previousPage + 1, isFirstPage: false });

      const result = footerUseCases.changePageUseCase.nextPage();

      if (result.type === 'failure') {
        set({ currentPage: previousPage, isFirstPage: previousPage === 1 });
        const friendlyText = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.UNKNOWN;
        toast.error('Navigation step failed', {
          description: `Reason: ${friendlyText}`,
        });
      }
    },

    previousPage: () => {
      const { isFirstPage, currentPage } = get();
      if (isFirstPage) return;

      const previousPage = currentPage;

      set({ currentPage: previousPage - 1, isLastPage: false });

      const result = footerUseCases.changePageUseCase.prevPage();

      if (result.type === 'failure') {
        set({ currentPage: previousPage, isLastPage: get().isLastPage });
        const friendlyText = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.UNKNOWN;
        toast.error('Navigation step failed', {
          description: `Reason: ${friendlyText}`,
        });
      }
    },

    goToPage: (page: number) => {
      const { currentPage } = get();
      if (page === currentPage || page < 1) return;

      const previousPage = currentPage;

      set({ currentPage: page });

      const result = footerUseCases.changePageUseCase.goToPage(page);

      if (result.type === 'failure') {
        set({ currentPage: previousPage });
        const friendlyText = ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.UNKNOWN;
        toast.error(`Could not navigate to page ${page}`, {
          description: `Reason: ${friendlyText}`,
        });
      }
    },
  };
});
