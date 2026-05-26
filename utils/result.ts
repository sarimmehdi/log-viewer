export type DataError =
  | 'SERVICE_UNAVAILABLE'
  | 'CLIENT_ERROR'
  | 'SERVER_ERROR'
  | 'NO_INTERNET'
  | 'DISK_FULL'
  | 'DATABASE_ERROR'
  | 'UNKNOWN';

export type Result<T, E = DataError> = Success<T> | Failure<E>;

class Success<T> {
  readonly type = 'success' as const;
  constructor(readonly data: T) {}
}

class Failure<E> {
  readonly type = 'failure' as const;
  constructor(readonly error: E) {}
}

export const ResultFactory = {
  success: <T>(data: T): Result<T, never> => new Success(data),
  failure: <E>(error: E): Result<never, E> => new Failure(error),
};
