import { BehaviorSubject } from 'rxjs';

import { PlaygroundGameStage } from '../enums/playground.enum';

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

export type GameMidSegwayMetadata = {
  gameStage: PlaygroundGameStage;
  messageFrom: 'peer' | 'subject';
  message: string;
}
