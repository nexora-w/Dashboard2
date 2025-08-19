import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  password?: string
  username?: string
  name?: string
  image?: string
  provider?: string
  providerId?: string
  steamId?: string
  isOnline?: boolean
  createdAt: Date
  updatedAt: Date
  // Game-related fields
  ticket?: number
  bestStreak?: number
  currentStreak?: number
  gamesPlayed?: number
  dailyCase?: DailyCase[]
  // Additional fields
  tradeLink?: string
  cryptoAddresses?: {
    bitcoin?: string
    ethereum?: string
  }
}

export interface DailyCase {
  id: string
  active: boolean
  date: string
}

export interface SafeUser {
  _id?: ObjectId
  email: string
  name?: string
  image?: string
  provider?: string
  steamId?: string
  isOnline?: boolean
  createdAt: Date
  updatedAt: Date
  // Game-related fields
  ticket?: number
  bestStreak?: number
  currentStreak?: number
  gamesPlayed?: number
} 