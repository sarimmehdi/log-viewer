import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMainScreenViewModel } from '@/features/main/presentation/main-screen-viewmodel';
import { LogListComponent } from '@/features/main/presentation/components/log-list-component';

// Mock the Zustand store hook module
jest.mock('@/features/main/presentation/main-screen-viewmodel');

// Mock child components to preserve focused component testing boundaries
jest.mock('@/features/main/presentation/components/log-row-component', () => ({
  LogRowComponent: ({ log }: { log: { id: number; message: string } }) => (
    <div data-testid="mock-log-row">Row: {log.message}</div>
  ),
}));

describe('LogListComponent Coverage Test Suite', () => {
  const mockGetLogs = jest.fn();
  const mockTeardown = jest.fn();

  // Baseline mock state template
  const baseMockState = {
    logs: [],
    isLoadingLogs: false,
    getLogs: mockGetLogs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLogs.mockReturnValue(mockTeardown);

    // Default selector hook mock implementation
    (useMainScreenViewModel as unknown as jest.Mock).mockImplementation(
      (selector: (state: typeof baseMockState) => unknown) => selector(baseMockState),
    );
  });

  // ─── LIFECYCLE SEEDING TESTS ───
  describe('Lifecycle Subscriptions', () => {
    it('should fire getLogs pipeline on initialization and clean up through teardown on unmount', () => {
      const { unmount } = render(<LogListComponent />);

      expect(mockGetLogs).toHaveBeenCalledTimes(1);

      unmount();
      expect(mockTeardown).toHaveBeenCalledTimes(1);
    });
  });

  // ─── CONDITIONAL LAYOUT STATE RENDER TESTS ───
  describe('Conditional Frame Projections', () => {
    it('should display the loader view when isLoadingLogs is true and active log store collection is empty', () => {
      const loadingState = {
        ...baseMockState,
        isLoadingLogs: true,
        logs: [],
      };
      (useMainScreenViewModel as unknown as jest.Mock).mockImplementation(
        (selector: (state: typeof loadingState) => unknown) => selector(loadingState),
      );

      render(<LogListComponent />);

      expect(screen.getByText('Streaming pipeline processing context...')).toBeInTheDocument();
      expect(
        screen.queryByText('No active trace records available. Select a session to initialize.'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Message Content')).not.toBeInTheDocument();
    });

    it('should present empty state trace placeholder frame if log collections are completely vacant', () => {
      const emptyState = {
        ...baseMockState,
        isLoadingLogs: false,
        logs: [],
      };
      (useMainScreenViewModel as unknown as jest.Mock).mockImplementation(
        (selector: (state: typeof emptyState) => unknown) => selector(emptyState),
      );

      render(<LogListComponent />);

      expect(
        screen.getByText('No active trace records available. Select a session to initialize.'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Streaming pipeline processing context...'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Message Content')).not.toBeInTheDocument();
    });

    it('should map out specification indexes and iterate rows accurately when log payload elements exist', () => {
      const filledState = {
        ...baseMockState,
        isLoadingLogs: false,
        logs: [
          { id: 10, message: 'Core runtime boot initialized' },
          { id: 20, message: 'Database query resolution failure' },
        ],
      };
      (useMainScreenViewModel as unknown as jest.Mock).mockImplementation(
        (selector: (state: typeof filledState) => unknown) => selector(filledState),
      );

      render(<LogListComponent />);

      // Verify layout header columns render successfully
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Message Content')).toBeInTheDocument();
      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Class Reference')).toBeInTheDocument();

      // Verify the list mapping correctly outputs all collection items
      const childRows = screen.getAllByTestId('mock-log-row');
      expect(childRows).toHaveLength(2);
      expect(childRows[0]).toHaveTextContent('Row: Core runtime boot initialized');
      expect(childRows[1]).toHaveTextContent('Row: Database query resolution failure');

      // Verify structural fallbacks aren't shown
      expect(
        screen.queryByText('Streaming pipeline processing context...'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('No active trace records available. Select a session to initialize.'),
      ).not.toBeInTheDocument();
    });

    it('should display the populated data table layout even if isLoadingLogs is true, as long as logs collection has items', () => {
      const backloggedLoadingState = {
        ...baseMockState,
        isLoadingLogs: true,
        logs: [{ id: 1, message: 'Background trace frame' }],
      };
      (useMainScreenViewModel as unknown as jest.Mock).mockImplementation(
        (selector: (state: typeof backloggedLoadingState) => unknown) =>
          selector(backloggedLoadingState),
      );

      render(<LogListComponent />);

      // Ensure data table renders out, bypassing the full-screen spinner state wrapper block
      expect(screen.getByText('Message Content')).toBeInTheDocument();
      expect(screen.getByTestId('mock-log-row')).toHaveTextContent('Row: Background trace frame');
      expect(
        screen.queryByText('Streaming pipeline processing context...'),
      ).not.toBeInTheDocument();
    });
  });
});
