import { CardDeckEnum } from '../enums/card-deck.enum';

const CardDeckDictionary: Map<CardDeckEnum, string> = new Map<CardDeckEnum, string>();

const CardDeckList = Object.keys(CardDeckEnum).filter(key => !isNaN(Number(key)));

for (const key in CardDeckList) {
  if (CardDeckEnum.hasOwnProperty(key)) {
    CardDeckDictionary.set( +key, CardDeckEnum[key],);
  }
}

export { CardDeckDictionary };
