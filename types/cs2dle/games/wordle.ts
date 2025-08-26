export interface Wordle {
  id: string;
  word: string;
  hints?: string[];
  explanations?: string[];
}

export interface GameAnswer {
  _id?: string;
  answers: {
    [key: string]: {
      word: string;
      hints?: string[];
      explanations?: string[];
    };
  };
  date: string;
  status: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SelectedWordleData {
  wordle: Wordle;
  gameData: any;
  date: string;
}

export interface EditingWordleData {
  answerId: string;
  wordle: Wordle;
  gameType: string;
  date: string;
}
