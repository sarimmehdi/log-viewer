import { render, screen, fireEvent } from '@testing-library/react';
import { SessionsListComponent } from '../../components/sessions-list-component';
import { useDrawerScreenViewModel } from '../../drawer-screen-viewmodel';

jest.mock('../../drawer-screen-viewmodel', () => ({
  useDrawerScreenViewModel: jest.fn(),
}));

describe('SessionsListComponent UI Component', () => {
  const mockSelectSession = jest.fn();

  const mockSessions = [
    { id: 101, name: 'auth-service-error.log' },
    { id: 102, name: 'payment-gateway-timeout.log' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render absolutely nothing (return null) if no selectedDateId exists in state', () => {
    (useDrawerScreenViewModel as unknown as jest.Mock).mockReturnValue({
      sessions: [],
      selectedSessionId: null,
      selectSession: mockSelectSession,
      selectedDateId: null,
      isLoadingSessions: false,
    });

    const { container } = render(<SessionsListComponent />);

    expect(container.firstChild).toBeNull();
  });

  it('should display an operational pulse loader when isLoadingSessions is true', () => {
    (useDrawerScreenViewModel as unknown as jest.Mock).mockReturnValue({
      sessions: [],
      selectedSessionId: null,
      selectSession: mockSelectSession,
      selectedDateId: 1,
      isLoadingSessions: true,
    });

    render(<SessionsListComponent />);

    const loader = screen.getByText('Fetching log index...');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass('animate-pulse');
  });

  it('should render an italicized warning string if a date is active but the session list is empty', () => {
    (useDrawerScreenViewModel as unknown as jest.Mock).mockReturnValue({
      sessions: [],
      selectedSessionId: null,
      selectSession: mockSelectSession,
      selectedDateId: 1,
      isLoadingSessions: false,
    });

    render(<SessionsListComponent />);

    expect(screen.getByText('No logs found for this date.')).toBeInTheDocument();
    expect(screen.getByText('No logs found for this date.')).toHaveClass('italic');
  });

  it('should map the collection array onto interactive buttons and bind the selection click callback', () => {
    (useDrawerScreenViewModel as unknown as jest.Mock).mockReturnValue({
      sessions: mockSessions,
      selectedSessionId: 101,
      selectSession: mockSelectSession,
      selectedDateId: 1,
      isLoadingSessions: false,
    });

    render(<SessionsListComponent />);

    expect(screen.getByText('Active Recording Sessions')).toBeInTheDocument();

    const firstSessionBtn = screen.getByText('auth-service-error.log');
    const secondSessionBtn = screen.getByText('payment-gateway-timeout.log');

    expect(firstSessionBtn).toBeInTheDocument();
    expect(secondSessionBtn).toBeInTheDocument();

    expect(firstSessionBtn).toHaveClass('text-emerald-400', 'border-l-2', 'border-emerald-500');
    expect(secondSessionBtn).toHaveClass('text-zinc-400');

    fireEvent.click(secondSessionBtn);

    expect(mockSelectSession).toHaveBeenCalledTimes(1);
    expect(mockSelectSession).toHaveBeenCalledWith(102);
  });
});
