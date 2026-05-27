import { useDrawerScreenViewModel } from '@/features/drawer/presentation/drawer-screen-viewmodel';
import { drawerUseCases } from '@/features/drawer/di/module';
import { toast } from 'sonner';
import { GetDatesUseCase } from '@/features/drawer/domain/usecase/get-dates-usecase';
import { GetSessionsUseCase } from '@/features/drawer/domain/usecase/get-sessions-usecase';
import { UpdateSelectedScopeUseCase } from '@/features/log/domain/usecase/update-selected-scope-usecase';
import { DrawerRepository } from '@/features/drawer/domain/repository/drawer-repository';
import { LogRepository } from '@/features/log/domain/repository/log-repository';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('useDrawerScreenViewModel Store (Repository Integration)', () => {
  const mockDrawerRepository = {
    getAvailableDates: jest.fn(),
    getSessionsByDate: jest.fn(),
  };

  const mockLogRepository = {
    updateSelectedScope: jest.fn(),
    clearSelectedScope: jest.fn(),
  };

  beforeAll(() => {
    drawerUseCases.getDatesUseCase = new GetDatesUseCase(
      mockDrawerRepository as unknown as DrawerRepository,
    );
    drawerUseCases.getSessionsUseCase = new GetSessionsUseCase(
      mockDrawerRepository as unknown as DrawerRepository,
    );
    drawerUseCases.updatedSelectedScopeUseCase = new UpdateSelectedScopeUseCase(
      mockLogRepository as unknown as LogRepository,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();

    useDrawerScreenViewModel.setState({
      isDrawerOpen: true,
      dates: [],
      sessions: [],
      selectedDateId: null,
      selectedSessionId: null,
      isLoadingDates: false,
      isLoadingSessions: false,
    });
  });

  it('should toggle isDrawerOpen state back and forth cleanly', () => {
    expect(useDrawerScreenViewModel.getState().isDrawerOpen).toBe(true);

    useDrawerScreenViewModel.getState().toggleDrawer();
    expect(useDrawerScreenViewModel.getState().isDrawerOpen).toBe(false);

    useDrawerScreenViewModel.getState().toggleDrawer();
    expect(useDrawerScreenViewModel.getState().isDrawerOpen).toBe(true);
  });

  describe('Parameterized Error Handling Scenarios', () => {
    const errorScenarios = [
      {
        actionName: 'loadDates',
        errorToken: 'DISK_FULL',
        expectedToast: 'Your local workspace drive storage is completely full.',
        trigger: () => useDrawerScreenViewModel.getState().loadDates(),
        setupMock: (token: string) =>
          mockDrawerRepository.getAvailableDates.mockResolvedValue({
            type: 'failure',
            error: token,
          }),
      },
      {
        actionName: 'loadDates',
        errorToken: 'DATABASE_ERROR',
        expectedToast: 'Failed to communicate with internal database logs.',
        trigger: () => useDrawerScreenViewModel.getState().loadDates(),
        setupMock: (token: string) =>
          mockDrawerRepository.getAvailableDates.mockResolvedValue({
            type: 'failure',
            error: token,
          }),
      },
      {
        actionName: 'loadDates',
        // Use an unmapped token to explicitly force and test the ERROR_MESSAGES.UNKNOWN fallback
        errorToken: 'UNEXPECTED_CORE_REJECTION',
        expectedToast: 'An unexpected application error occurred.',
        trigger: () => useDrawerScreenViewModel.getState().loadDates(),
        setupMock: (token: string) =>
          mockDrawerRepository.getAvailableDates.mockResolvedValue({
            type: 'failure',
            error: token,
          }),
      },
      {
        actionName: 'selectDate',
        errorToken: 'DATABASE_ERROR',
        expectedToast: 'Failed to communicate with internal database logs.',
        trigger: () => useDrawerScreenViewModel.getState().selectDate(10),
        setupMock: (token: string) =>
          mockDrawerRepository.getSessionsByDate.mockResolvedValue({
            type: 'failure',
            error: token,
          }),
      },
      {
        actionName: 'selectDate',
        // Use an unmapped token here as well to force the ERROR_MESSAGES.UNKNOWN fallback for selectDate
        errorToken: 'NETWORK_TIMEOUT_ANOMALY',
        expectedToast: 'An unexpected application error occurred.',
        trigger: () => useDrawerScreenViewModel.getState().selectDate(10),
        setupMock: (token: string) =>
          mockDrawerRepository.getSessionsByDate.mockResolvedValue({
            type: 'failure',
            error: token,
          }),
      },
    ];

    test.each(errorScenarios)(
      'should handle $actionName error payload [$errorToken] and map toast message accurately',
      async ({ setupMock, errorToken, trigger, expectedToast, actionName }) => {
        setupMock(errorToken);

        await trigger();

        if (actionName === 'loadDates') {
          expect(useDrawerScreenViewModel.getState().isLoadingDates).toBe(false);
          expect(toast.error).toHaveBeenCalledWith('Failed to load dates', {
            description: expectedToast,
          });
        } else {
          expect(useDrawerScreenViewModel.getState().isLoadingSessions).toBe(false);
          expect(toast.error).toHaveBeenCalledWith('Failed to load sessions', {
            description: expectedToast,
          });
        }
      },
    );
  });

  it('should transition loading state and populate dates array on successful loadDates execution', async () => {
    const mockDatesArray = [
      { id: 1, formattedString: '2026-05-24' },
      { id: 2, formattedString: '2026-05-25' },
    ];
    mockDrawerRepository.getAvailableDates.mockResolvedValue({
      type: 'success',
      data: mockDatesArray,
    });

    const storePromise = useDrawerScreenViewModel.getState().loadDates();

    expect(useDrawerScreenViewModel.getState().isLoadingDates).toBe(true);

    await storePromise;

    expect(useDrawerScreenViewModel.getState().isLoadingDates).toBe(false);
    expect(useDrawerScreenViewModel.getState().dates).toEqual(mockDatesArray);
  });

  it('should fetch and update active sessions when a brand new date is selected', async () => {
    const mockSessionsArray = [{ id: 99, name: 'Core Server Launch' }];
    mockDrawerRepository.getSessionsByDate.mockResolvedValue({
      type: 'success',
      data: mockSessionsArray,
    });

    await useDrawerScreenViewModel.getState().selectDate(10);

    const state = useDrawerScreenViewModel.getState();
    expect(state.selectedDateId).toBe(10);
    expect(state.selectedSessionId).toBeNull();
    expect(state.sessions).toEqual(mockSessionsArray);
    expect(state.isLoadingSessions).toBe(false);
    expect(mockLogRepository.clearSelectedScope).toHaveBeenCalled();
  });

  it('should immediately guard and return without execution if the selected date matches current state', async () => {
    useDrawerScreenViewModel.setState({ selectedDateId: 5 });

    await useDrawerScreenViewModel.getState().selectDate(5);

    expect(mockDrawerRepository.getSessionsByDate).not.toHaveBeenCalled();
    expect(mockLogRepository.clearSelectedScope).not.toHaveBeenCalled();
  });

  it('should immediately guard and return without execution if sessions are currently loading', async () => {
    useDrawerScreenViewModel.setState({ isLoadingSessions: true });

    await useDrawerScreenViewModel.getState().selectDate(8);

    expect(mockDrawerRepository.getSessionsByDate).not.toHaveBeenCalled();
  });

  it('should safely rollback selectedDateId to original state when selection fetch fails', async () => {
    useDrawerScreenViewModel.setState({ selectedDateId: 4 });
    mockDrawerRepository.getSessionsByDate.mockResolvedValue({
      type: 'failure',
      error: 'DATABASE_ERROR',
    });

    await useDrawerScreenViewModel.getState().selectDate(9);

    const state = useDrawerScreenViewModel.getState();
    expect(state.selectedDateId).toBe(4);
    expect(state.sessions).toEqual([]);
    expect(state.isLoadingSessions).toBe(false);
  });

  it('should update selectedSessionId and fire domain triggers when valid date context exists', () => {
    useDrawerScreenViewModel.setState({ selectedDateId: 100, selectedSessionId: null });

    useDrawerScreenViewModel.getState().selectSession(200);

    expect(useDrawerScreenViewModel.getState().selectedSessionId).toBe(200);
    expect(mockLogRepository.updateSelectedScope).toHaveBeenCalledWith(100, 200);
  });

  it('should skip structural updates inside selectSession if targeted session matches selectedSessionId', () => {
    useDrawerScreenViewModel.setState({ selectedDateId: 100, selectedSessionId: 200 });

    useDrawerScreenViewModel.getState().selectSession(200);

    expect(mockLogRepository.updateSelectedScope).not.toHaveBeenCalled();
  });

  it('should skip execution inside selectSession if selectedDateId is completely null', () => {
    useDrawerScreenViewModel.setState({ selectedDateId: null, selectedSessionId: null });

    useDrawerScreenViewModel.getState().selectSession(200);

    expect(useDrawerScreenViewModel.getState().selectedSessionId).toBeNull();
    expect(mockLogRepository.updateSelectedScope).not.toHaveBeenCalled();
  });
});
