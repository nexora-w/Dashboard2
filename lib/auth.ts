import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import clientPromise from './mongodb'
import { JWT } from 'next-auth/jwt'

interface ExtendedUser {
  id: string
  email: string
  name: string
}

interface ExtendedToken extends JWT {
  id: string
  email: string
  name: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          throw new Error('Please enter your email and verification code')
        }

        const client = await clientPromise
        const db = client.db()
        
        const user = await db.collection('admins').findOne({ 
          email: credentials.email 
        })

        if (!user) {
          throw new Error('No user found with this email')
        }

        if (user.status !== 'Active') {
          throw new Error('Your account is not yet activated. Please contact an administrator.')
        }

        // Check if verification code exists and is valid
        const verificationCode = await db.collection('verificationCodes').findOne({
          email: credentials.email,
          code: credentials.code,
          type: 'signin'
        })

        if (!verificationCode) {
          throw new Error('Invalid verification code')
        }

        // Check if code has expired
        if (new Date() > new Date(verificationCode.expiresAt)) {
          throw new Error('Verification code has expired')
        }

        // Delete the verification code after successful use
        await db.collection('verificationCodes').deleteOne({
          email: credentials.email,
          code: credentials.code
        })

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  pages: {
    signIn: '/signin',
    error: '/signin?error=1'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedToken> {
      if (user) {
        const extendedUser = user as ExtendedUser
        token.id = extendedUser.id
        token.email = extendedUser.email
        token.name = extendedUser.name
      }
      return token as ExtendedToken
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken
      session.user.id = extendedToken.id
      session.user.email = extendedToken.email
      session.user.name = extendedToken.name
      return session
    }
  }
} 