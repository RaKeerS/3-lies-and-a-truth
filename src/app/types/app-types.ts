import { BehaviorSubject } from 'rxjs';

export const APP_CONTAINER_FLEX_CLASS = 'class.app-container-flex';

export type PlayGroundMetadata = {
  player1Name: string;
  player1Exists: boolean;
  player2Name: string;
  player2Exists: boolean;
  playgroundId: number;
}

export type PlayerMetadata = {
  playerName: string;
  playgroundId: number;
  losses: boolean;
  sessionId: number;
  whoAmI: boolean;
  wins: string;
}

export type GameMetadata = {
  playgroundSubject: BehaviorSubject<PlayGroundMetadata>;
  playgroundMetadata: PlayGroundMetadata;
}
