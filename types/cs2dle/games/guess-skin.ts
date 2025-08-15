export interface Skin {
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
}

export interface GameAnswer {
  _id?: string;
  answers: {
    [key: string]: {
      skinId: string;
      emojis?: string[];
      hints?: string[];
      skin?: Skin;
    };
  };
  date: string;
  status: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SelectedSkinData {
  skin: Skin;
  gameData: any;
  date: string;
}

export interface EditingSkinData {
  answerId: string;
  skin: Skin;
  gameType: string;
  date: string;
}