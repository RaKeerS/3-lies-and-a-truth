export enum PlaygroundGameEnum {
  JOIN = 0,
  CREATE = 1
}

export enum PlaygroundGameTossOutcome {
  PLAYER_1 = 1,
  PLAYER_2 = 2
}

export enum PlaygroundGameStage {
  CONNECTION = 0,
  RULES,
  TOSS,
  BET,
  SHUFFLE,
  DISTRIBUTE,
  PICK,
  CHOOSE,
  EVALUATE,
  OTHER
}

export enum PlaygroundGameStagePhase {
  TIMER,
  MIDSEGUEMESSAGES,
  INITIAL,
  INTERMEDIATE,
  COMPLETED
}
