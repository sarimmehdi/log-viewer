import { GetSessionsUseCase } from '../usecase/get-sessions-usecase';
import { DrawerRepository } from '../repository/drawer-repository';
import { LogSession } from '../model/log-session';

describe('GetSessionsUseCase', () => {
  let mockRepository: jest.Mocked<DrawerRepository>;
  let useCase: GetSessionsUseCase;

  const mockSessions: LogSession[] = [
    { id: 101, name: 'Session Alpha' },
    { id: 102, name: 'Session Beta' },
  ];

  beforeEach(() => {
    mockRepository = {
      getSessionsByDate: jest.fn(),
      getDates: jest.fn(),
    } as unknown as jest.Mocked<DrawerRepository>;

    useCase = new GetSessionsUseCase(mockRepository);
  });

  it('should return null immediately and skip repository fetch if the dateId matches currentSelectedDateId', async () => {
    const dateId = 5;
    const currentSelectedDateId = 5;

    const result = await useCase.execute(dateId, currentSelectedDateId);

    expect(result).toBeNull();
    expect(mockRepository.getSessionsByDate).not.toHaveBeenCalled();
  });

  it('should fetch and return sessions from the repository when a new dateId is provided', async () => {
    const dateId = 5;
    const currentSelectedDateId = 3;

    mockRepository.getSessionsByDate.mockResolvedValue(mockSessions);

    const result = await useCase.execute(dateId, currentSelectedDateId);

    expect(result).toEqual(mockSessions);
    expect(mockRepository.getSessionsByDate).toHaveBeenCalledTimes(1);
    expect(mockRepository.getSessionsByDate).toHaveBeenCalledWith(dateId);
  });

  it('should fetch sessions successfully when currentSelectedDateId is null', async () => {
    const dateId = 5;
    const currentSelectedDateId = null;

    mockRepository.getSessionsByDate.mockResolvedValue(mockSessions);

    const result = await useCase.execute(dateId, currentSelectedDateId);

    expect(result).toEqual(mockSessions);
    expect(mockRepository.getSessionsByDate).toHaveBeenCalledWith(dateId);
  });
});
