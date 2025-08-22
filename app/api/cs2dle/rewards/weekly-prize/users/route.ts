import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

interface UserWithWeeklyPrize {
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
  weeklyPrize: WeeklyPrize[];
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get all users with weeklyPrize field
    const users = await db.collection('users')
      .find({ 
        weeklyPrize: { $exists: true, $ne: [] }
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Populate weeklyPrize data with prize details
    const populatedUsers = await Promise.all(
      users.map(async (user) => {
        const populatedWeeklyPrize = await Promise.all(
          user.weeklyPrize.map(async (weeklyPrize: any) => {
            if (weeklyPrize.id) {
              // Find the weekly prize item details
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

        return {
          ...user,
          weeklyPrize: populatedWeeklyPrize
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: populatedUsers
    });

  } catch (error) {
    console.error('Error fetching users with weekly prize items:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch users with weekly prize items' 
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

    const data = await request.json();
    const { userId, weeklyPrizeId, weekStartDate, weekEndDate } = data;

    if (!userId || !weeklyPrizeId || !weekStartDate || !weekEndDate) {
      return NextResponse.json(
        { error: 'userId, weeklyPrizeId, weekStartDate, and weekEndDate are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify the weekly prize exists
    const weeklyPrize = await db.collection('weeklyprizes').findOne({ 
      _id: new ObjectId(weeklyPrizeId) 
    });

    if (!weeklyPrize) {
      return NextResponse.json(
        { error: 'Weekly prize not found' },
        { status: 404 }
      );
    }

    // Check if user already has this weekly prize
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(userId),
      'weeklyPrize.id': weeklyPrizeId
    });

    if (user) {
      return NextResponse.json(
        { error: 'User already has this weekly prize' },
        { status: 400 }
      );
    }

    // Add weekly prize to user
    const newWeeklyPrize = {
      id: weeklyPrizeId,
      active: false,
      weekStartDate,
      weekEndDate,
      claimData: new Date().toISOString()
    };

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $push: { weeklyPrize: newWeeklyPrize },
        $set: { updatedAt: new Date() }
      } as any
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly prize awarded successfully',
      weeklyPrize: newWeeklyPrize
    });

  } catch (error) {
    console.error('Error awarding weekly prize:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to award weekly prize' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { userId, weeklyPrizeId, active } = data;

    if (!userId || !weeklyPrizeId || active === undefined) {
      return NextResponse.json(
        { error: 'userId, weeklyPrizeId, and active status are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Update the specific weekly prize in user's array
    const result = await db.collection('users').updateOne(
      { 
        _id: new ObjectId(userId),
        'weeklyPrize.id': weeklyPrizeId 
      },
      { 
        $set: { 
          'weeklyPrize.$.active': active,
          'weeklyPrize.$.receivedData': new Date().toISOString(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User or weekly prize not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly prize status updated successfully'
    });

  } catch (error) {
    console.error('Error updating weekly prize status:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update weekly prize status' 
      },
      { status: 500 }
    );
  }
}
