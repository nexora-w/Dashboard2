import { ObjectId } from 'mongodb';

export interface PrecaseWeapon {
  id: string;
  weapon_id: number;
  name: string;
}

export interface PrecaseCategory {
  id: string;
  name: string;
}

export interface PrecasePattern {
  id: string;
  name: string;
}

export interface PrecaseRarity {
  id: string;
  name: string;
  color: string;
}

export interface Precase {
  _id?: ObjectId;
  skinId: string;
  name: string;
  description: string;
  image: string;
  weapon: PrecaseWeapon;
  category: PrecaseCategory;
  pattern: PrecasePattern;
  min_float: number;
  max_float: number;
  rarity: PrecaseRarity;
  stattrak: boolean;
  souvenir: boolean;
  paint_index: string;
  status: string;
  createdBy: string;
  lastModifiedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  probability?: number;
  price?: number;
}

export interface PrecaseResponse {
  precases: Precase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
} 