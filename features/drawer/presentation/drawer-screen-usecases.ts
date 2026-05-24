import { GetDatesUseCase } from "../domain/usecase/get-dates-usecase";
import { GetSessionsUseCase } from "../domain/usecase/get-sessions-usecase";

export interface DrawerScreenUseCases {
  getDatesUseCase: GetDatesUseCase;
  getSessionsUseCase: GetSessionsUseCase;
}