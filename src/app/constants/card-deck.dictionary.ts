import { CardDeckEnum } from '../enums/card-deck.enum';

const CardDeckDictionary: Map<string, CardDeckEnum> = new Map<string, CardDeckEnum>();

for (const key in CardDeckEnum) {
  if (CardDeckEnum.hasOwnProperty(key)) {
    CardDeckDictionary.set(key, +CardDeckEnum[key]);
  }
}

export { CardDeckDictionary };
