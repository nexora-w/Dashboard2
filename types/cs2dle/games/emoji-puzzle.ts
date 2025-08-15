export interface EmojiPuzzle {
  id: string;
  skinName: string;
  weapon: string;
  description?: string;
  image?: string;
  rarity?: string;
  team?: string;
  emojis: string[];
  hints: string[];
  explanations?: string[];
}

export interface GameAnswer {
  _id?: string;
  answers: {
    [key: string]: {
      skinId: string;
      emojis: string[];
      hints: string[];
      explanations?: string[];
      skin?: {
        id: string;
        name: string;
        description: string;
        image: string;
        weapon: string;
        category: string;
        pattern: string;
        rarity: {
          id: string;
          name: string;
          color: string;
        };
        team: string;
        stattrak: boolean;
        souvenir: boolean;
      };
    };
  };
  date: string;
  status: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SelectedEmojiPuzzleData {
  puzzle: EmojiPuzzle;
  gameData: any;
  date: string;
}

export interface EditingEmojiPuzzleData {
  answerId: string;
  puzzle: EmojiPuzzle;
  gameType: string;
  date: string;
}
