export enum PlaygroundGameEnum {
  JOIN = 0,
  CREATE = 1
}

export enum PlaygroundPlayersEnum {
  PLAYER_1 = 1,
  PLAYER_2 = 2
}


export enum PlaygroundGameTossOutcomeEnum {
  PLAYER_1 = 1,
  PLAYER_2 = 2
}

export enum PlaygroundGameStageWinnerEnum {
  PLAYER_1 = 1,
  PLAYER_2 = 2
}

export enum PlaygroundGameStageEnum {
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

export enum PlaygroundGameStagePhaseEnum {
  OPPONENTNAME,
  TIMER,
  MIDSEGUEMESSAGES,
  REDISTRIBUTECARDS,
  UPDATEINSPECTVOIDEDCARDSCOUNTER,
  INITIAL,
  INTERMEDIATE,
  COMPLETED
}
