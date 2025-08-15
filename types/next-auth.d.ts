import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      provider?: string;
      createdAt?: Date;
    } & DefaultSession['user']
  }
}

declare module 'next-auth/adapters' {
  interface AdapterUser {
    id: string;
    email: string;
    emailVerified?: Date | null;
    name?: string | null;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
  }
} 