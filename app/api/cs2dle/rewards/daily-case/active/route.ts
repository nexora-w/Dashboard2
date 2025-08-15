import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { toZonedTime, format } from 'date-fns-tz';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

interface DailyCase {
  id: string;
  active: boolean;
  claimData?: string;
  receivedData?: string;
  precase?: {
    _id?: string;
    skinId: string;
    name: string;
    description?: string;
    image?: string;
    weapon?: {
      id: string;
      weapon_id: number;
      name: string;
    };
    category?: {
      id: string;
      name: string;
    };
    pattern?: {
      id: string;
      name: string;
    };
    min_float?: number;
    max_float?: number;
    rarity?: {
      id: string;
      name: string;
      color: string;
    };
    stattrak?: boolean;
    souvenir?: boolean;
    paint_index?: string;
    probability: number;
    price?: number;
    status: 'active' | 'inactive';
    createdBy?: string;
    lastModifiedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    isManual?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(); 

    const body = await request.json();
    const { prizeId, newStatus, userId } = body;

    // Validate required fields
    if (!prizeId || typeof newStatus !== 'boolean' || !userId) {
      return NextResponse.json(
        { message: 'Missing required fields: prizeId, newStatus, userId' },
        { status: 400 }
      );
    }

    // Check if user exists and find the specific daily case
    const existingUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Find the specific daily case in the array
    const dailyCaseIndex = existingUser.dailyCase?.findIndex((case_: DailyCase) => case_.id === prizeId);
    if (dailyCaseIndex === -1 || dailyCaseIndex === undefined) {
      return NextResponse.json(
        { message: 'Prize not found for this user' },
        { status: 404 }
      );
    }

    // Check if trying to deactivate an already inactive prize
    const currentCase = existingUser.dailyCase[dailyCaseIndex];
    if (!currentCase.active && !newStatus) {
      return NextResponse.json(
        { message: 'Prize is already inactive' },
        { status: 400 }
      );
    }

    const amsterdamDate = toZonedTime(new Date(), 'Europe/Amsterdam');
    const today = format(amsterdamDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone: 'Europe/Amsterdam' });

    // Update the specific daily case in the array
    const updatedUser = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: {
          [`dailyCase.${dailyCaseIndex}.active`]: newStatus,
          [`dailyCase.${dailyCaseIndex}.receivedData`]: today
        }
      },
    );

    return NextResponse.json({
      message: 'Status updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { message: 'Failed to update status' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Alias for POST method - allows both POST and PATCH
  return POST(request);
}
