# CS2DLE Dashboard

A modern dashboard application with email-based authentication using NextAuth.js.

## Features

- **Email-based Authentication**: Users can sign up and sign in using email verification codes
- **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Theme Support**: Dark and light mode with system preference detection
- **Protected Routes**: Dashboard routes are protected with authentication middleware
- **MongoDB Integration**: User data and verification codes stored in MongoDB
- **Toast Notifications**: Beautiful toast notifications for user feedback

## Authentication Flow

### Sign Up Process
1. User enters email and username on the sign-up tab
2. System sends a 6-digit verification code to the user's email
3. User enters the verification code
4. Account is created with 'Active' status
5. User can now sign in

### Sign In Process
1. User enters email on the sign-in tab
2. System sends a 6-digit verification code to the user's email
3. User enters the verification code
4. NextAuth validates the code and creates a session
5. User is redirected to the dashboard

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# SMTP (for sending verification codes)
SMTP_USER=your_smtp_email
SMTP_PASS=your_smtp_password
```

## API Routes

- `POST /api/auth/send-code` - Send verification code to email
- `POST /api/auth/verify-code` - Verify code and create user (signup) or validate (signin)
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication endpoints

## Pages

- `/` - Redirects to `/signin` if not authenticated, `/dashboard` if authenticated
- `/signin` - Authentication page with sign-in and sign-up tabs
- `/dashboard` - Protected dashboard page (requires authentication)
- `/test-toast` - Test page for toast notifications

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Set up environment variables in `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Collections

The application uses the following MongoDB collections:

- `admins` - User accounts with fields: name, email, status, role
- `verificationCodes` - Temporary verification codes with fields: email, code, type, expiresAt, createdAt

## Security Features

- Verification codes expire after 10 minutes
- Codes are deleted after successful use
- Protected routes with NextAuth middleware
- Server-side session validation
- Input validation with Zod schemas
