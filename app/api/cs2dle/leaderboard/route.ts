import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Precase } from '@/types/precases';
import { getServerSession } from 'next-auth';

interface DailyCase {
  id: string;
  active: boolean;
  date: string;
}

interface User {
  _id: ObjectId;
  name?: string;
  image?: string;
  isGuest?: boolean;
  bestStreak?: number;
  gamesPlayed?: number;
  currentStreak?: number;
  dailyCase?: DailyCase[];
  ticket?: number;
}



export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit)); // Max 100 items per page
    const skip = (validPage - 1) * validLimit;

    const client = await clientPromise;
    const db = client.db();
    
    // Get total count for pagination
    const totalUsers = await db
      .collection('users')
      .countDocuments({ 
        isGuest: { $ne: true }, // Exclude guest users
        role: { $ne: 'admin' } // Exclude admin users
      });
    
    // Fetch users from the database with pagination
    const users = await db
      .collection('users')
      .find({ 
        isGuest: { $ne: true }, // Exclude guest users
        role: { $ne: 'admin' } // Exclude admin users
      })
      .sort({ 
        bestStreak: -1, 
        gamesPlayed: -1,
        currentStreak: -1 
      })
      .skip(skip)
      .limit(validLimit)
      .toArray() as User[];

    // Get all unique precase IDs from dailyCase arrays
    const precaseIds = new Set<string>();
    users.forEach(user => {
      if (user.dailyCase && Array.isArray(user.dailyCase)) {
        user.dailyCase.forEach((dailyCase: DailyCase) => {
          if (dailyCase.id) {
            precaseIds.add(dailyCase.id);
          }
        });
      }
    });

    // Fetch all precases that are referenced in dailyCase arrays
    const precases = await db
      .collection('precases')
      .find({ 
        _id: { $in: Array.from(precaseIds).map(id => new ObjectId(id)) }
      })
      .toArray() as Precase[];

    // Create a map for quick lookup
    const precaseMap = new Map();
    precases.forEach(precase => {
      if (precase._id) {
        precaseMap.set(precase._id.toString(), precase);
      }
    });

    // Transform the data to match the expected format
    const leaderboardData = users.map((user, index) => {
      // Get precase data for each dailyCase entry
      const prizes = user.dailyCase && Array.isArray(user.dailyCase) 
        ? user.dailyCase.map((dailyCase: DailyCase) => {
            const precase = precaseMap.get(dailyCase.id);
            return {
              id: dailyCase.id,
              active: dailyCase.active,
              date: dailyCase.date,
              precase: precase || null // Include the full precase data or null if not found
            };
          })
        : [];

      // Find the most expensive prize among user's prizes
      // Filter out prizes without price data and find the one with highest price
      const mostExpensivePrize = prizes
        .filter(prize => prize.precase && typeof prize.precase.price === 'number')
        .reduce((maxPrize, currentPrize) => {
          const currentPrice = currentPrize.precase?.price || 0;
          const maxPrice = maxPrize.precase?.price || 0;
          return currentPrice > maxPrice ? currentPrize : maxPrize;
        }, prizes[0] || null);

      // Extract only name and image from the most expensive prize
      const prizeData = mostExpensivePrize && mostExpensivePrize.precase ? {
        name: mostExpensivePrize.precase.name || 'Unknown Skin',
        image: mostExpensivePrize.precase.image || '/placeholder.jpg'
      } : null;

      return {
        position: skip + index + 1, // Calculate global position
        user: {
          _id: user._id.toString(),
          username: user.name || 'Anonymous',
          avatar: user.image || '/avatars/default.png'
        },
        bestStreak: user.bestStreak || 0,
        currentStreak: user.currentStreak || 0,
        guesses: user.gamesPlayed || 0,
        tickets: user.ticket || 0,
        prize: prizeData // Return only the name and image of the prize skin
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    return NextResponse.json({
      success: true,
      data: leaderboardData,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: totalUsers,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch leaderboard data' 
      },
      { status: 500 }
    );
  }
}
