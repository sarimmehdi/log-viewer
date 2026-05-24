import { render, screen, fireEvent } from '@testing-library/react';
import { DatesListComponent } from '../../components/dates-list-component';
import { useDrawerScreenViewModel } from '../../drawer-screen-viewmodel';

jest.mock('../../drawer-screen-viewmodel', () => ({
  useDrawerScreenViewModel: jest.fn(),
}));

describe('DatesListComponent UI Component', () => {
  const mockSelectDate = jest.fn();

  const mockDates = [
    { id: 10, formattedString: '2026-05-24' },
    { id: 20, formattedString: '2026-05-25' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display an animated loading state message when isLoadingDates is true', () => {
    (useDrawerScreenViewModel as unknown as jest.Mock).mockReturnValue({
      dates: [],
      selectedDateId: null,
      selectDate: mockSelectDate,
      isLoadingDates: true,
    });

    render(<DatesListComponent />);

    const loadingElement = screen.getByText('Loading operational log dates...');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveClass('animate-pulse');
  });

  it('should render the list of dates properly and highlight the active selection', () => {
    (useDrawerScreenViewModel as unknown as jest.Mock).mockReturnValue({
      dates: mockDates,
      selectedDateId: 10,
      selectDate: mockSelectDate,
      isLoadingDates: false,
    });

    render(<DatesListComponent />);

    expect(screen.getByText('Log History (Dates)')).toBeInTheDocument();

    const firstDateButton = screen.getByText('2026-05-24').closest('button');
    const secondDateButton = screen.getByText('2026-05-25').closest('button');

    expect(firstDateButton).toBeInTheDocument();
    expect(secondDateButton).toBeInTheDocument();

    expect(firstDateButton).toHaveClass('bg-zinc-800', 'text-zinc-50');
    expect(secondDateButton).toHaveClass('text-zinc-400');
  });

  it('should invoke selectDate with the correct ID when a date layout button is clicked', () => {
    (useDrawerScreenViewModel as unknown as jest.Mock).mockReturnValue({
      dates: mockDates,
      selectedDateId: null,
      selectDate: mockSelectDate,
      isLoadingDates: false,
    });

    render(<DatesListComponent />);

    const secondDateButton = screen.getByText('2026-05-25');

    fireEvent.click(secondDateButton);

    expect(mockSelectDate).toHaveBeenCalledTimes(1);
    expect(mockSelectDate).toHaveBeenCalledWith(20);
  });
});
