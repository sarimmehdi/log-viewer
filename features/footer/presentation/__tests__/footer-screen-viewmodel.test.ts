import { useFooterScreenViewModel } from '@/features/footer/presentation/footer-screen-viewmodel';
import { footerUseCases } from '@/features/footer/di/module';
import { toast } from 'sonner';
import { Subject } from 'rxjs';
import { CurrentPageUseCase } from '@/features/log/domain/usecase/current-page-usecase';
import { ChangePageUseCase } from '@/features/log/domain/usecase/change-page-usecase';
import { LogRepository } from '@/features/log/domain/repository/log-repository';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('useFooterScreenViewModel Store (Repository Integration)', () => {
  let mockPaginationStream$: Subject<unknown>;

  const mockLogRepository = {
    getPaginationState: jest.fn(),
    firstPage: jest.fn(),
    lastPage: jest.fn(),
    nextPage: jest.fn(),
    prevPage: jest.fn(),
    goToPage: jest.fn(),
  };

  beforeAll(() => {
    footerUseCases.currentPageUseCase = new CurrentPageUseCase(
      mockLogRepository as unknown as LogRepository,
    );
    footerUseCases.changePageUseCase = new ChangePageUseCase(
      mockLogRepository as unknown as LogRepository,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPaginationStream$ = new Subject();
    mockLogRepository.getPaginationState.mockReturnValue(mockPaginationStream$);

    useFooterScreenViewModel.setState({
      currentPage: 1,
      isFirstPage: true,
      isLastPage: true,
    });
  });

  describe('initViewModel Pipeline Operations', () => {
    it('should update state variables cleanly when cold stream emits success states', () => {
      const cleanup = useFooterScreenViewModel.getState().initViewModel();

      mockPaginationStream$.next({
        type: 'success',
        data: { currentPage: 3, isFirstPage: false, isLastPage: false },
      });

      const state = useFooterScreenViewModel.getState();
      expect(state.currentPage).toBe(3);
      expect(state.isFirstPage).toBe(false);
      expect(state.isLastPage).toBe(false);

      cleanup();
    });

    it('should intercept native pipeline failures inside next block without fracturing the stream', () => {
      const cleanup = useFooterScreenViewModel.getState().initViewModel();

      mockPaginationStream$.next({
        type: 'failure',
        error: 'DATABASE_ERROR',
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to sync pagination stream', {
        description: 'Reason: Failed to communicate with internal database logs.',
      });

      cleanup();
    });

    it('should trigger fatal error message if the RxJS observable channel experiences structural error crashes', () => {
      const cleanup = useFooterScreenViewModel.getState().initViewModel();

      mockPaginationStream$.error(new Error('Stream dropped internally'));

      expect(toast.error).toHaveBeenCalledWith('Fatal data stream disconnection', {
        description: 'Reason: Stream dropped internally',
      });

      cleanup();
    });

    it('should trigger custom error message if the RxJS observable channel experiences structural error crashes with a real Error object', () => {
      const cleanup = useFooterScreenViewModel.getState().initViewModel();

      mockPaginationStream$.error(new Error('Stream dropped internally'));

      expect(toast.error).toHaveBeenCalledWith('Fatal data stream disconnection', {
        description: 'Reason: Stream dropped internally',
      });

      cleanup();
    });

    it('should fall back to default string when the stream error channel rejects with an unmapped non-Error object type', () => {
      const cleanup = useFooterScreenViewModel.getState().initViewModel();

      mockPaginationStream$.error('CRITICAL_REJECTION_STRING');

      expect(toast.error).toHaveBeenCalledWith('Fatal data stream disconnection', {
        description: 'Reason: Fatal stream failure',
      });

      cleanup();
    });
  });

  describe('Parameterized Action Rejection Scenarios', () => {
    let activeCleanup: (() => void) | null = null;

    afterEach(() => {
      if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
      }
    });

    const errorScenarios = [
      {
        actionName: 'initViewModel (Stream Next Block)',
        errorToken: 'UNEXPECTED_STREAM_CRASH',
        expectedToast: 'An unexpected application error occurred.',
        trigger: (token: string) => mockPaginationStream$.next({ type: 'failure', error: token }),
        setupMock: () => {
          activeCleanup = useFooterScreenViewModel.getState().initViewModel();
        },
      },
      {
        actionName: 'firstPage',
        errorToken: 'FIRST_PAGE_FALLBACK_ANOMALY',
        expectedToast: 'An unexpected application error occurred.',
        trigger: () => useFooterScreenViewModel.getState().firstPage(),
        setupMock: (token: string) => {
          useFooterScreenViewModel.setState({ isFirstPage: false, currentPage: 4 });
          mockLogRepository.firstPage.mockReturnValue({ type: 'failure', error: token });
        },
      },
      {
        actionName: 'lastPage',
        errorToken: 'LAST_PAGE_FALLBACK_ANOMALY',
        expectedToast: 'An unexpected application error occurred.',
        trigger: () => useFooterScreenViewModel.getState().lastPage(),
        setupMock: (token: string) => {
          useFooterScreenViewModel.setState({ isLastPage: false, currentPage: 2 });
          mockLogRepository.lastPage.mockReturnValue({ type: 'failure', error: token });
        },
      },
      {
        actionName: 'nextPage',
        errorToken: 'NEXT_PAGE_FALLBACK_ANOMALY',
        expectedToast: 'An unexpected application error occurred.',
        trigger: () => useFooterScreenViewModel.getState().nextPage(),
        setupMock: (token: string) => {
          useFooterScreenViewModel.setState({ isLastPage: false, currentPage: 2 });
          mockLogRepository.nextPage.mockReturnValue({ type: 'failure', error: token });
        },
      },
      {
        actionName: 'previousPage',
        errorToken: 'PREV_PAGE_FALLBACK_ANOMALY',
        expectedToast: 'An unexpected application error occurred.',
        trigger: () => useFooterScreenViewModel.getState().previousPage(),
        setupMock: (token: string) => {
          useFooterScreenViewModel.setState({ isFirstPage: false, currentPage: 3 });
          mockLogRepository.prevPage.mockReturnValue({ type: 'failure', error: token });
        },
      },
      {
        actionName: 'goToPage',
        errorToken: 'GO_TO_PAGE_FALLBACK_ANOMALY',
        expectedToast: 'An unexpected application error occurred.',
        trigger: () => useFooterScreenViewModel.getState().goToPage(5),
        setupMock: (token: string) => {
          useFooterScreenViewModel.setState({ currentPage: 2 });
          mockLogRepository.goToPage.mockReturnValue({ type: 'failure', error: token });
        },
      },
    ];

    test.each(errorScenarios)(
      'should accurately capture $actionName failure token [$errorToken] and map fallback strings correctly',
      ({ setupMock, errorToken, trigger, expectedToast }) => {
        setupMock(errorToken);

        trigger(errorToken);

        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/Failed|Navigation|Could not/),
          { description: `Reason: ${expectedToast}` },
        );
      },
    );
  });

  describe('Imperative Pagination Logic & Guard Rails', () => {
    it('should apply optimistic updates and call repository inside firstPage', () => {
      useFooterScreenViewModel.setState({ isFirstPage: false, currentPage: 5 });
      mockLogRepository.firstPage.mockReturnValue({ type: 'success', data: undefined });

      useFooterScreenViewModel.getState().firstPage();

      const state = useFooterScreenViewModel.getState();
      expect(state.currentPage).toBe(1);
      expect(state.isFirstPage).toBe(true);
      expect(mockLogRepository.firstPage).toHaveBeenCalled();
    });

    it('should instantly exit firstPage execution if user is already on the first page', () => {
      useFooterScreenViewModel.setState({ isFirstPage: true });

      useFooterScreenViewModel.getState().firstPage();

      expect(mockLogRepository.firstPage).not.toHaveBeenCalled();
    });

    it('should apply optimistic updates and call repository inside lastPage', () => {
      useFooterScreenViewModel.setState({ isLastPage: false, currentPage: 2 });
      mockLogRepository.lastPage.mockReturnValue({ type: 'success', data: undefined });

      useFooterScreenViewModel.getState().lastPage();

      const state = useFooterScreenViewModel.getState();
      expect(state.isLastPage).toBe(true);
      expect(mockLogRepository.lastPage).toHaveBeenCalled();
    });

    it('should instantly exit lastPage execution if user is already on the last page', () => {
      useFooterScreenViewModel.setState({ isLastPage: true });

      useFooterScreenViewModel.getState().lastPage();

      expect(mockLogRepository.lastPage).not.toHaveBeenCalled();
    });

    it('should increment state page indices cleanly when calling nextPage', () => {
      useFooterScreenViewModel.setState({ isLastPage: false, currentPage: 2 });
      mockLogRepository.nextPage.mockReturnValue({ type: 'success', data: undefined });

      useFooterScreenViewModel.getState().nextPage();

      expect(useFooterScreenViewModel.getState().currentPage).toBe(3);
      expect(mockLogRepository.nextPage).toHaveBeenCalled();
    });

    it('should skip structural modifications in nextPage if user resides on last active index', () => {
      useFooterScreenViewModel.setState({ isLastPage: true });

      useFooterScreenViewModel.getState().nextPage();

      expect(mockLogRepository.nextPage).not.toHaveBeenCalled();
    });

    it('should decrement state page indices cleanly when calling previousPage', () => {
      useFooterScreenViewModel.setState({ isFirstPage: false, currentPage: 4 });
      mockLogRepository.prevPage.mockReturnValue({ type: 'success', data: undefined });

      useFooterScreenViewModel.getState().previousPage();

      expect(useFooterScreenViewModel.getState().currentPage).toBe(3);
      expect(mockLogRepository.prevPage).toHaveBeenCalled();
    });

    it('should skip structural modifications in previousPage if user resides on baseline index', () => {
      useFooterScreenViewModel.setState({ isFirstPage: true });

      useFooterScreenViewModel.getState().previousPage();

      expect(mockLogRepository.prevPage).not.toHaveBeenCalled();
    });

    it('should transition to target indices directly when invoking goToPage', () => {
      useFooterScreenViewModel.setState({ currentPage: 2 });
      mockLogRepository.goToPage.mockReturnValue({ type: 'success', data: undefined });

      useFooterScreenViewModel.getState().goToPage(4);

      expect(useFooterScreenViewModel.getState().currentPage).toBe(4);
      expect(mockLogRepository.goToPage).toHaveBeenCalledWith(4);
    });

    it('should instantly exit goToPage execution if target matches active location or sits out of boundary limits', () => {
      useFooterScreenViewModel.setState({ currentPage: 3 });

      useFooterScreenViewModel.getState().goToPage(3);
      useFooterScreenViewModel.getState().goToPage(0);

      expect(mockLogRepository.goToPage).not.toHaveBeenCalled();
    });
  });
});
