export enum PlaygroundGameEnum {
  JOIN = 0,
  CREATE = 1
}

export enum PlaygroundGameTossOutcome {
  PLAYER_1 = 1,
  PLAYER_2 = 2
}

export enum PlaygroundGameStage {
  RULES = 0,
  TOSS = 1,
  BET = 2,
  SHUFFLE = 3,
  DISTRIBUTE = 4,
  CHOOSE = 5,
  EVALUATE = 6
}

export enum PlaygroundGameStagePhase {
  INITIAL,
  INTERMEDIATE,
  COMPLETED
}
