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

interface UserWithDailyCase {
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
  dailyCase: DailyCase[];
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

         // Find users who have daily case items
     const users = await db
       .collection('users')
       .find({
         dailyCase: { $exists: true, $ne: [] }
       })
       .project({
         _id: 1,
         email: 1,
         name: 1,
         username: 1,
         image: 1,
         steamId: 1,
         tradeLink: 1,
         cryptoAddresses: 1,
         dailyCase: 1
       })
       .sort({ createdAt: -1 })
       .toArray();

    // For each user, populate the precase details for their daily case items
    const populatedUsers = await Promise.all(
      users.map(async (user) => {
        const populatedDailyCase = await Promise.all(
          user.dailyCase.map(async (dailyCase: any) => {
            if (dailyCase.id) {
              // Find the precase item details
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

        return {
          ...user,
          dailyCase: populatedDailyCase
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: populatedUsers
    });

  } catch (error) {
    console.error('Error fetching users with daily case items:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch users with daily case items' 
      },
      { status: 500 }
    );
  }
}
