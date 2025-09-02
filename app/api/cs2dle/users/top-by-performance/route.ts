import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types/user';

// Extended user interface to include score field
interface UserWithScore extends User {
  score?: number;
}

interface TopUser {
  _id: string;
  email: string;
  name?: string;
  username?: string;
  image?: string;
  steamId?: string;
  ticket?: number;
  bestStreak?: number;
  currentStreak?: number;
  gamesPlayed?: number;
  score?: number;
  winRate?: number;
}

interface TopUsersResponse {
  success: boolean;
  data: TopUser[];
  message?: string;
}

export async function GET(request: Request) {
  try {
    console.log('Fetching top users by performance');
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validate limit parameter
    const validLimit = Math.min(50, Math.max(1, limit)); // Max 50 items

    const client = await clientPromise;
    const db = client.db();

    // Fetch all users to calculate win rate and sort by performance
    const users = await db
      .collection<UserWithScore>('users')
      .find({ isGuest: { $ne: true } }) // Exclude guest users
      .toArray();

    // Calculate win rate and create top users array
    const usersWithPerformance = users.map(user => {
      const gamesPlayed = user.gamesPlayed || 0;
      const tickets = user.ticket || 0;
      const winRate = gamesPlayed > 0 ? tickets / gamesPlayed : 0;
      const score = user.score || 0;

      return {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image,
        steamId: user.steamId,
        ticket: user.ticket,
        bestStreak: user.bestStreak,
        currentStreak: user.currentStreak,
        gamesPlayed: user.gamesPlayed,
        score: user.score,
        winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
      };
    });

    // Sort by score (desc) first, then by win rate (desc), then by games played (desc)
    const sortedUsers = usersWithPerformance.sort((a, b) => {
      const aScore = a.score || 0;
      const bScore = b.score || 0;
      const aWinRate = a.winRate || 0;
      const bWinRate = b.winRate || 0;
      const aGames = a.gamesPlayed || 0;
      const bGames = b.gamesPlayed || 0;
      
      // Primary sort: by score (descending)
      if (bScore !== aScore) {
        return bScore - aScore;
      }
      
      // Secondary sort: by win rate (descending)
      if (bWinRate !== aWinRate) {
        return bWinRate - aWinRate;
      }
      
      // Tertiary sort: by games played (descending)
      return bGames - aGames;
    });

    // Take only the top N users
    const topUsers = sortedUsers.slice(0, validLimit);

    const response: TopUsersResponse = {
      success: true,
      data: topUsers,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching top users by performance:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch top users by performance' 
      },
      { status: 500 }
    );
  }
}
