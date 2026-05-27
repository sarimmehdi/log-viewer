import { useMainScreenViewModel } from '@/features/main/presentation/main-screen-viewmodel';
import { mainUseCases } from '@/features/main/di/module';
import { toast } from 'sonner';
import { Subject } from 'rxjs';
import { GetLogsUseCase } from '@/features/log/domain/usecase/get-logs-usecase';
import { LogRepository } from '@/features/log/domain/repository/log-repository';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('useMainScreenViewModel Store (Repository Integration)', () => {
  let mockLogsStream$: Subject<unknown>;
  let mockSessionChangeStream$: Subject<unknown>;

  const mockLogRepository = {
    getLogs: jest.fn(),
    isNewSession: jest.fn(),
  };

  beforeAll(() => {
    mainUseCases.getLogsUseCase = new GetLogsUseCase(mockLogRepository as unknown as LogRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogsStream$ = new Subject();
    mockSessionChangeStream$ = new Subject();

    mockLogRepository.getLogs.mockReturnValue(mockLogsStream$);
    mockLogRepository.isNewSession.mockReturnValue(mockSessionChangeStream$);

    useMainScreenViewModel.setState({
      logs: [],
      selectedLogIds: [],
      isLoadingLogs: false,
    });
  });

  describe('getLogs Pipeline Operations', () => {
    it('should set isLoadingLogs to true immediately when getLogs is called', () => {
      const teardown = useMainScreenViewModel.getState().getLogs();
      expect(useMainScreenViewModel.getState().isLoadingLogs).toBe(true);
      teardown();
    });

    it('should cleanly update logs and clear selectedLogIds when a new session is detected', () => {
      useMainScreenViewModel.setState({ selectedLogIds: [101, 102] });
      const teardown = useMainScreenViewModel.getState().getLogs();

      const mockLogsArray = [{ id: 1, message: 'System boot success' }];

      mockSessionChangeStream$.next({ type: 'success', data: true });

      mockLogsStream$.next({ type: 'success', data: mockLogsArray });

      const state = useMainScreenViewModel.getState();
      expect(state.logs).toEqual(mockLogsArray);
      expect(state.isLoadingLogs).toBe(false);
      expect(state.selectedLogIds).toEqual([]);

      teardown();
    });

    it('should preserve existing selectedLogIds when logs emit but it is not a new session', () => {
      useMainScreenViewModel.setState({ selectedLogIds: [101, 102] });
      const teardown = useMainScreenViewModel.getState().getLogs();

      const mockLogsArray = [{ id: 1, message: 'System telemetry heartbeat' }];

      mockSessionChangeStream$.next({ type: 'success', data: false });

      mockLogsStream$.next({ type: 'success', data: mockLogsArray });

      const state = useMainScreenViewModel.getState();
      expect(state.logs).toEqual(mockLogsArray);
      expect(state.isLoadingLogs).toBe(false);
      expect(state.selectedLogIds).toEqual([101, 102]);

      teardown();
    });

    it('should handle native pipeline crashes using a standard Error object within the stream error block', () => {
      const teardown = useMainScreenViewModel.getState().getLogs();

      mockLogsStream$.error(new Error('Broker channel disconnected'));

      expect(useMainScreenViewModel.getState().isLoadingLogs).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Fatal data stream disconnection', {
        description: 'Reason: Broker channel disconnected',
      });

      teardown();
    });

    it('should fall back to default string when stream error block rejects with a primitive non-Error object type', () => {
      const teardown = useMainScreenViewModel.getState().getLogs();

      mockLogsStream$.error('CRITICAL_REJECTION_STRING');

      expect(useMainScreenViewModel.getState().isLoadingLogs).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Fatal data stream disconnection', {
        description: 'Reason: Stream structural failure',
      });

      teardown();
    });
  });

  describe('Parameterized Workspace Error Scenarios', () => {
    let activeTeardown: (() => void) | null = null;

    afterEach(() => {
      if (activeTeardown) {
        activeTeardown();
        activeTeardown = null;
      }
    });

    const errorScenarios = [
      {
        scenarioDescription: 'logsResult fails with mapped error token',
        logsPayload: { type: 'failure', error: 'DISK_FULL' },
        sessionPayload: { type: 'success', data: false },
        expectedToast: 'Your local workspace drive storage is completely full.',
      },
      {
        scenarioDescription: 'sessionChangeResult fails with mapped error token',
        logsPayload: { type: 'success', data: [] },
        sessionPayload: { type: 'failure', error: 'DATABASE_ERROR' },
        expectedToast: 'Failed to communicate with internal database logs.',
      },
      {
        scenarioDescription:
          'logsResult fails with an unmapped error token forcing UNKNOWN fallback',
        logsPayload: { type: 'failure', error: 'UNMAPPED_WORKSPACE_CRASH' },
        sessionPayload: { type: 'success', data: false },
        expectedToast: 'An unexpected application error occurred.',
      },
      {
        scenarioDescription:
          'sessionChangeResult fails with an unmapped error token forcing UNKNOWN fallback',
        logsPayload: { type: 'success', data: [] },
        sessionPayload: { type: 'failure', error: 'UNMAPPED_SESSION_CRASH' },
        expectedToast: 'An unexpected application error occurred.',
      },
      {
        scenarioDescription:
          'both results are simultaneously unexpected failure types forcing UNKNOWN fallback',
        logsPayload: { type: 'unexpected_type' },
        sessionPayload: { type: 'unexpected_type' },
        expectedToast: 'An unexpected application error occurred.',
      },
    ];

    test.each(errorScenarios)(
      'should handle case where $scenarioDescription',
      ({ logsPayload, sessionPayload, expectedToast }) => {
        activeTeardown = useMainScreenViewModel.getState().getLogs();

        mockSessionChangeStream$.next(sessionPayload);

        mockLogsStream$.next(logsPayload);

        expect(useMainScreenViewModel.getState().isLoadingLogs).toBe(false);
        expect(toast.error).toHaveBeenCalledWith('Failed to update log workspace', {
          description: `Reason: ${expectedToast}`,
        });
      },
    );
  });

  describe('Log Selection Engine Utility Methods', () => {
    it('should append log ids when selectLog is triggered with a completely new unselected id', () => {
      useMainScreenViewModel.setState({ selectedLogIds: [5, 12] });

      useMainScreenViewModel.getState().selectLog(42);

      expect(useMainScreenViewModel.getState().selectedLogIds).toEqual([5, 12, 42]);
    });

    it('should skip structural duplicate additions if targeted id already exists inside selectedLogIds', () => {
      useMainScreenViewModel.setState({ selectedLogIds: [5, 12, 42] });

      useMainScreenViewModel.getState().selectLog(12);

      expect(useMainScreenViewModel.getState().selectedLogIds).toEqual([5, 12, 42]);
    });

    it('should filter and exclude log ids smoothly when unselectLog is triggered', () => {
      useMainScreenViewModel.setState({ selectedLogIds: [10, 20, 30] });

      useMainScreenViewModel.getState().unselectLog(20);

      expect(useMainScreenViewModel.getState().selectedLogIds).toEqual([10, 30]);
    });

    it('should gracefully maintain the identical reference structure intact if unselectLog hits an unselected id', () => {
      useMainScreenViewModel.setState({ selectedLogIds: [10, 30] });

      useMainScreenViewModel.getState().unselectLog(99);

      expect(useMainScreenViewModel.getState().selectedLogIds).toEqual([10, 30]);
    });
  });
});
