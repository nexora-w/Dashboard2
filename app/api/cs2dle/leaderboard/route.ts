import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';

interface WeeklyPrizeRef {
  id: string;
  active: boolean;
  weekStartDate: string;
  weekEndDate: string;
  claimData: string;
  receivedData?: string;
  isShow?: boolean;
}

interface WeeklyPrizeDocument {
  _id: ObjectId;
  name: string;
  image: string;
  price: number;
  weekStartDate: string;
  weekEndDate: string;
  rarity: {
    name: string;
    color: string;
  };
  status: string;
  createdBy: string;
  lastModifiedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: ObjectId;
  name?: string;
  image?: string;
  isGuest?: boolean;
  bestStreak?: number;
  gamesPlayed?: number;
  currentStreak?: number;
  weeklyPrize?: WeeklyPrizeRef[];
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

    // Get all unique weekly prize IDs from weeklyPrize arrays
    const weeklyPrizeIds = new Set<string>();
    users.forEach(user => {
      if (user.weeklyPrize && Array.isArray(user.weeklyPrize)) {
        user.weeklyPrize.forEach((weeklyPrize: WeeklyPrizeRef) => {
          if (weeklyPrize.id) {
            weeklyPrizeIds.add(weeklyPrize.id);
          }
        });
      }
    });

    // Fetch all weekly prizes that are referenced in weeklyPrize arrays
    const weeklyPrizes = await db
      .collection('weeklyprizes')
      .find({ 
        _id: { $in: Array.from(weeklyPrizeIds).map(id => new ObjectId(id)) }
      })
      .toArray() as WeeklyPrizeDocument[];

    // Create a map for quick lookup
    const weeklyPrizeMap = new Map();
    weeklyPrizes.forEach(weeklyPrize => {
      if (weeklyPrize._id) {
        weeklyPrizeMap.set(weeklyPrize._id.toString(), weeklyPrize);
      }
    });

    // Transform the data to match the expected format
    const leaderboardData = users.map((user, index) => {
      // Get weekly prize data for each weeklyPrize entry
      const prizes = user.weeklyPrize && Array.isArray(user.weeklyPrize) 
        ? user.weeklyPrize.map((weeklyPrize: WeeklyPrizeRef) => {
            const weeklyPrizeDoc = weeklyPrizeMap.get(weeklyPrize.id);
            return {
              id: weeklyPrize.id,
              active: weeklyPrize.active,
              weekStartDate: weeklyPrize.weekStartDate,
              weekEndDate: weeklyPrize.weekEndDate,
              claimData: weeklyPrize.claimData,
              receivedData: weeklyPrize.receivedData,
              isShow: weeklyPrize.isShow || false,
              weeklyPrize: weeklyPrizeDoc || null // Include the full weekly prize data or null if not found
            };
          })
        : [];

      // Find the prize that should be displayed (isShow: true first, then last prize)
      const displayPrize = prizes.find(prize => prize.isShow === true) || prizes[prizes.length - 1];
      
      // Extract only name and image from the display prize
      const defaultPrize = displayPrize && displayPrize.weeklyPrize ? {
        name: displayPrize.weeklyPrize.name || 'Unknown Skin',
        image: displayPrize.weeklyPrize.image || '/placeholder.jpg'
      } : null;

      // Create a list of all available prizes for the dropdown
      // Sort by isShow first (true values first), then by price descending
      const availablePrizes = prizes
        .filter(prize => prize.weeklyPrize)
        .map(prize => ({
          id: prize.id,
          name: prize.weeklyPrize?.name || 'Unknown Skin',
          image: prize.weeklyPrize?.image || '/placeholder.jpg',
          price: prize.weeklyPrize?.price || 0,
          rarity: prize.weeklyPrize?.rarity || { name: 'Unknown', color: '#666' },
          isShow: prize.isShow || false
        }))
        .sort((a, b) => {
          // First sort by isShow (true values first)
          if (a.isShow && !b.isShow) return -1;
          if (!a.isShow && b.isShow) return 1;
          // Then sort by price descending
          return b.price - a.price;
        });

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
        prize: defaultPrize, // Return the default prize (most expensive) for backward compatibility
        allPrizes: availablePrizes // Return all available prizes for the dropdown
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, prizeIndex } = await request.json();

    if (!userId || !prizeIndex) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // First, set all prizes for this user to isShow: false
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'weeklyPrize.$[].isShow': false
        }
      }
    );

    // Then, set the selected prize to isShow: true
    const result = await db.collection('users').updateOne(
      { 
        _id: new ObjectId(userId)
      },
      {
        $set: {
          [`weeklyPrize.${prizeIndex}.isShow`]: true
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'User or prize not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prize show status updated successfully'
    });

  } catch (error) {
    console.error('Update prize show status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update prize show status' 
      },
      { status: 500 }
    );
  }
}
