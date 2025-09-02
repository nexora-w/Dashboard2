import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface DailyCase {
  id: string;
  active: boolean;
  claimData?: string;
  receivedData?: string;
  precase?: {
    name: string;
    image?: string;
    weapon?: {
      name: string;
    };
    category?: {
      name: string;
    };
    rarity?: {
      name: string;
      color: string;
    };
    price?: number;
  };
}

interface WeeklyPrize {
  id: string;
  active: boolean;
  weekStartDate: string;
  weekEndDate: string;
  claimData?: string;
  receivedData?: string;
  weeklyPrize?: {
    name: string;
    image?: string;
    rarity?: {
      name: string;
      color: string;
    };
    price?: number;
  };
}

interface UserDetails {
  _id: string;
  email: string;
  name?: string;
  username?: string;
  image?: string;
  steamId?: string;
  tradeLink?: string;
  cryptoAddresses?: {
    bitcoin?: string;
    ethereum?: string;
  };
  dailyCase?: DailyCase[];
  weeklyPrize?: WeeklyPrize[];
  // Game statistics
  gamesPlayed?: number;
  bestStreak?: number;
  currentStreak?: number;
  score?: number;
  ticket?: number;
  // Account info
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  isGuest?: boolean;
  // Calculated fields
  winRate?: number;
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const includeGuests = searchParams.get('includeGuests') === 'true';
    
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit)); // Max 100 items per page
    const skip = (validPage - 1) * validLimit;

    const client = await clientPromise;
    const db = client.db();

    // Build query filter
    const filter: any = {};
    if (!includeGuests) {
      filter.isGuest = { $ne: true };
    }

    // Get total count for pagination
    const totalUsers = await db.collection('users').countDocuments(filter);

    // Fetch users with pagination
    const users = await db
      .collection('users')
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(validLimit)
      .toArray();

    // Populate detailed information for each user
    const populatedUsers = await Promise.all(
      users.map(async (user) => {
        // Populate daily case details if they exist
        let populatedDailyCase: DailyCase[] = [];
        if (user.dailyCase && user.dailyCase.length > 0) {
          populatedDailyCase = await Promise.all(
            user.dailyCase.map(async (dailyCase: any) => {
              if (dailyCase.id) {
                const precase = await db
                  .collection('precases')
                  .findOne({ _id: new ObjectId(dailyCase.id) });
                
                if (precase) {
                  return {
                    ...dailyCase,
                    precase: {
                      name: precase.name,
                      image: precase.image,
                      weapon: precase.weapon ? { name: precase.weapon.name } : undefined,
                      category: precase.category ? { name: precase.category.name } : undefined,
                      rarity: precase.rarity ? { 
                        name: precase.rarity.name, 
                        color: precase.rarity.color 
                      } : undefined,
                      price: precase.price
                    }
                  };
                }
              }
              return dailyCase;
            })
          );
        }

        // Populate weekly prize details if they exist
        let populatedWeeklyPrize: WeeklyPrize[] = [];
        if (user.weeklyPrize && user.weeklyPrize.length > 0) {
          populatedWeeklyPrize = await Promise.all(
            user.weeklyPrize.map(async (weeklyPrize: any) => {
              if (weeklyPrize.id) {
                const prize = await db
                  .collection('weeklyprizes')
                  .findOne({ _id: new ObjectId(weeklyPrize.id) });
                
                if (prize) {
                  return {
                    ...weeklyPrize,
                    weeklyPrize: {
                      name: prize.name,
                      image: prize.image,
                      rarity: prize.rarity ? { 
                        name: prize.rarity.name, 
                        color: prize.rarity.color 
                      } : undefined,
                      price: prize.price
                    }
                  };
                }
              }
              return weeklyPrize;
            })
          );
        }

        // Calculate win rate
        const gamesPlayed = user.gamesPlayed || 0;
        const tickets = user.ticket || 0;
        const winRate = gamesPlayed > 0 ? tickets / gamesPlayed : 0;

        // Build comprehensive user details
        const userDetails: UserDetails = {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
          steamId: user.steamId,
          tradeLink: user.tradeLink,
          cryptoAddresses: user.cryptoAddresses,
          dailyCase: populatedDailyCase,
          weeklyPrize: populatedWeeklyPrize,
          gamesPlayed: user.gamesPlayed,
          bestStreak: user.bestStreak,
          currentStreak: user.currentStreak,
          score: user.score,
          ticket: user.ticket,
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
          updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : undefined,
          role: user.role,
          isGuest: user.isGuest,
          winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
        };

        return userDetails;
      })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    return NextResponse.json({
      success: true,
      data: populatedUsers,
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
    console.error('Error fetching users with details:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch users with details' 
      },
      { status: 500 }
    );
  }
}
