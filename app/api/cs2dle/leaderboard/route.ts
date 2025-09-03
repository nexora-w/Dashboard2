import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';

// Define types for the data structures
interface WeeklyPrizeEntry {
  id: string;
  active: boolean;
  weekStartDate: string;
  weekEndDate: string;
  claimData?: string;
  receivedData?: string;
  isShow?: boolean;
}

interface WeeklyPrize {
  _id?: ObjectId;
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
  createdAt?: Date;
  updatedAt?: Date;
}

interface User {
  _id: ObjectId;
  name?: string;
  username?: string;
  image?: string;
  isGuest?: boolean;
  bestStreak?: number;
  gamesPlayed?: number;
  currentStreak?: number;
  weeklyPrize?: WeeklyPrizeEntry[];
  score?: number;
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

    // Fetch users from the database with ticket and gamesPlayed data
    const users = (await db
      .collection("users")
      .find({
        isGuest: { $ne: true }, // Exclude guest users
        role: { $ne: "admin" }, // Exclude admin users
        gamesPlayed: { $gt: 0 }, // Only include users who have played games
      })
      .project({
        _id: 1,
        name: 1,
        username: 1,
        image: 1,
        bestStreak: 1,
        gamesPlayed: 1,
        currentStreak: 1,
        weeklyPrize: 1,
        score: 1,
        ticket: 1,
      })
      .toArray()) as User[];

    // Calculate winRate for each user and sort by score and winRate
    const usersWithWinRate = users.map(user => {
      const tickets = user.ticket || 0;
      const gamesPlayed = user.gamesPlayed || 1; // Avoid division by zero
      const winRate = gamesPlayed > 0 ? tickets / gamesPlayed : 0;
      
      return {
        ...user,
        winRate,
        // Calculate a combined ranking score (you can adjust the weights)
        rankingScore: (user.score || 0) * 0.7 + winRate * 0.3
      };
    });

    // Sort by ranking score (descending), then by winRate (descending), then by score (descending)
    const sortedUsers = usersWithWinRate.sort((a, b) => {
      // Primary sort: ranking score
      if (b.rankingScore !== a.rankingScore) {
        return b.rankingScore - a.rankingScore;
      }
      // Secondary sort: winRate
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      // Tertiary sort: score
      if ((b.score || 0) !== (a.score || 0)) {
        return (b.score || 0) - (a.score || 0);
      }
      // Quaternary sort: bestStreak
      return (b.bestStreak || 0) - (a.bestStreak || 0);
    });

    // Apply pagination to sorted users
    const paginatedUsers = sortedUsers.slice(skip, skip + validLimit);

    // Get all unique weekly prize IDs from weeklyPrize arrays
    const weeklyPrizeIds = new Set<string>();
    paginatedUsers.forEach((user) => {
      if (user.weeklyPrize && Array.isArray(user.weeklyPrize)) {
        user.weeklyPrize.forEach((weeklyPrizeEntry: WeeklyPrizeEntry) => {
          if (weeklyPrizeEntry.id) {
            weeklyPrizeIds.add(weeklyPrizeEntry.id);
          }
        });
      }
    });

    // Fetch all weekly prizes that are referenced in weeklyPrize arrays
    const weeklyPrizes = (await db
      .collection("weeklyprizes")
      .find({
        _id: { $in: Array.from(weeklyPrizeIds).map((id) => new ObjectId(id)) },
      })
      .toArray()) as WeeklyPrize[];

    // Create a map for quick lookup
    const weeklyPrizeMap = new Map();
    weeklyPrizes.forEach((weeklyPrize) => {
      if (weeklyPrize._id) {
        weeklyPrizeMap.set(weeklyPrize._id.toString(), weeklyPrize);
      }
    });

    // Transform the data to match the expected format
    const leaderboardData = paginatedUsers.map((user, index) => {
      // Get weekly prize data for each weeklyPrize entry
      const prizes: Array<
        WeeklyPrizeEntry & { weeklyPrize: WeeklyPrize | null }
      > =
        user.weeklyPrize && Array.isArray(user.weeklyPrize)
          ? user.weeklyPrize.map((weeklyPrizeEntry: WeeklyPrizeEntry) => {
              const weeklyPrize = weeklyPrizeMap.get(weeklyPrizeEntry.id);
              return {
                id: weeklyPrizeEntry.id,
                active: weeklyPrizeEntry.active,
                weekStartDate: weeklyPrizeEntry.weekStartDate,
                weekEndDate: weeklyPrizeEntry.weekEndDate,
                claimData: weeklyPrizeEntry.claimData,
                receivedData: weeklyPrizeEntry.receivedData,
                isShow: weeklyPrizeEntry.isShow,
                weeklyPrize: weeklyPrize || null, // Include the full weekly prize data or null if not found
              };
            })
          : [];

      // Find the most expensive prize among user's prizes
      // Filter out prizes without price data and find the one with highest price
      const mostExpensivePrize = prizes
        .filter(
          (prize) =>
            prize.weeklyPrize && typeof prize.weeklyPrize.price === "number"
        )
        .reduce((maxPrize, currentPrize) => {
          const currentPrice = currentPrize.weeklyPrize?.price || 0;
          const maxPrice = maxPrize.weeklyPrize?.price || 0;
          return currentPrice > maxPrice ? currentPrize : maxPrize;
        }, prizes[0] || null);

      // Find a display prize - first try to find one marked as show, otherwise use the first available prize
      const displayPrize =
        prizes.find((prize) => prize.isShow === true) ||
        (prizes.length > 0 ? prizes[0] : null);

      // Extract only name and image from the display prize
      const defaultPrize =
        displayPrize && displayPrize.weeklyPrize
          ? {
              name: displayPrize.weeklyPrize.name || "Unknown Skin",
              image: displayPrize.weeklyPrize.image || "/placeholder.jpg",
              price: displayPrize.weeklyPrize.price || 0,
            }
          : null;

      // Calculate winRate for display
      const tickets = user.ticket || 0;
      const gamesPlayed = user.gamesPlayed || 0;
      const winRate = gamesPlayed > 0 ? tickets / gamesPlayed : 0;

      // Create allPrizes array for the dropdown
      const allPrizes = prizes
        .filter(prize => prize.weeklyPrize)
        .map(prize => ({
          id: prize.id,
          name: prize.weeklyPrize!.name || "Unknown Skin",
          image: prize.weeklyPrize!.image || "/placeholder.jpg",
          price: prize.weeklyPrize!.price || 0,
          rarity: prize.weeklyPrize!.rarity || { name: "Common", color: "#8B8B8B" },
          isShow: prize.isShow === true // Ensure boolean conversion
        }));

      return {
        position: skip + index + 1, // Calculate global position
        user: {
          _id: user._id.toString(),
          username: user.username || user.name || "Anonymous",
          avatar: user.image || "/avatars/default.png",
        },
        bestStreak: user.bestStreak || 0,
        currentStreak: user.currentStreak || 0,
        guesses: user.gamesPlayed || 0,
        score: user.score || 0,
        tickets: tickets,
        winRate: parseFloat(winRate.toFixed(2)), // Round to 2 decimal places
        prizes: defaultPrize ? [defaultPrize] : [mostExpensivePrize], // Return only the most expensive prize
        allPrizes: allPrizes, // Add all prizes for dropdown selection
      };
    });

    // Calculate pagination metadata
    const totalUsers = sortedUsers.length;
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
    console.error("Leaderboard API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboard data",
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
