import { useDrawerScreenViewModel } from '@/features/drawer/presentation/drawer-screen-viewmodel';
import { drawerUseCases } from '@/features/drawer/di/module';
import { toast } from 'sonner';

jest.mock('../../di/module', () => ({
  drawerUseCases: {
    getDatesUseCase: { execute: jest.fn() },
    getSessionsUseCase: { execute: jest.fn() },
  },
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('useDrawerScreenViewModel Store', () => {
  const mockGetDates = drawerUseCases.getDatesUseCase.execute as jest.Mock;
  const mockGetSessions = drawerUseCases.getSessionsUseCase.execute as jest.Mock;

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

  it('should update selectedSessionId inline when selectSession is invoked', () => {
    useDrawerScreenViewModel.getState().selectSession(42);
    expect(useDrawerScreenViewModel.getState().selectedSessionId).toBe(42);
  });

  it('should transition loading state and populate dates array on successful loadDates execution', async () => {
    const mockDatesArray = [
      { id: 1, formattedString: '2026-05-24' },
      { id: 2, formattedString: '2026-05-25' },
    ];
    mockGetDates.mockResolvedValue(mockDatesArray);

    const storePromise = useDrawerScreenViewModel.getState().loadDates();

    expect(useDrawerScreenViewModel.getState().isLoadingDates).toBe(true);

    await storePromise;

    expect(useDrawerScreenViewModel.getState().isLoadingDates).toBe(false);
    expect(useDrawerScreenViewModel.getState().dates).toEqual(mockDatesArray);
  });

  it('should stop loading and broadcast error event through sonner toast when loadDates throws', async () => {
    const apiError = new Error('Database disconnected');
    mockGetDates.mockRejectedValue(apiError);

    await useDrawerScreenViewModel.getState().loadDates();

    expect(useDrawerScreenViewModel.getState().isLoadingDates).toBe(false);
    expect(useDrawerScreenViewModel.getState().dates).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Failed to load dates', {
      description: 'Reason: Database disconnected',
    });
  });

  it('should fetch and update active record sessions when a brand new date is selected', async () => {
    const mockSessionsArray = [{ id: 99, name: 'Core Server Launch' }];
    mockGetSessions.mockResolvedValue(mockSessionsArray);

    await useDrawerScreenViewModel.getState().selectDate(10);

    const state = useDrawerScreenViewModel.getState();
    expect(state.selectedDateId).toBe(10);
    expect(state.selectedSessionId).toBeNull();
    expect(state.sessions).toEqual(mockSessionsArray);
    expect(state.isLoadingSessions).toBe(false);
  });

  it('should skip structural updates and preserve status intact if the usecase layer aborts with null', async () => {
    useDrawerScreenViewModel.setState({
      selectedDateId: 5,
      sessions: [{ id: 1, name: 'Keep Me' }],
    });

    mockGetSessions.mockResolvedValue(null);

    await useDrawerScreenViewModel.getState().selectDate(5);

    const state = useDrawerScreenViewModel.getState();
    expect(state.selectedDateId).toBe(5);
    expect(state.sessions).toEqual([{ id: 1, name: 'Keep Me' }]);
  });

  it('should display error toast notification card if selectDate throws a dependency failure', async () => {
    mockGetSessions.mockRejectedValue(new Error('Network loss'));

    await useDrawerScreenViewModel.getState().selectDate(12);

    expect(useDrawerScreenViewModel.getState().isLoadingSessions).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to load sessions', {
      description: 'Reason: Network loss',
    });
  });

  it('should fallback to default message when loadDates throws a non-Error object', async () => {
    mockGetDates.mockRejectedValue('Fatal Database Crash String');

    await useDrawerScreenViewModel.getState().loadDates();

    expect(useDrawerScreenViewModel.getState().isLoadingDates).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to load dates', {
      description: 'Reason: Unknown database failure',
    });
  });

  it('should fallback to default message when selectDate throws a non-Error object', async () => {
    mockGetSessions.mockRejectedValue({ unexpected: 'anomaly' });

    await useDrawerScreenViewModel.getState().selectDate(15);

    expect(useDrawerScreenViewModel.getState().isLoadingSessions).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to load sessions', {
      description: 'Reason: Unknown database failure',
    });
  });
});
