import { BehaviorSubject } from 'rxjs';

import {
  PlaygroundGameStageEnum,
  PlaygroundGameStagePhaseEnum,
  PlaygroundGameTossOutcomeEnum,
} from '../enums/playground.enum';

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

export type GameMidSegueMetadata = {
  gameStage: PlaygroundGameStageEnum;
  messageFrom: 'peer' | 'subject';
  message: any;
  betAmount?: number,
  tossMessage?: PlaygroundGameTossOutcomeEnum;
  beginShuffle?: boolean;
  gameStagePhase?: PlaygroundGameStagePhaseEnum;
}
