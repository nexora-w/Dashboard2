import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type WeeklyPrizeData = {
  name: string;
  image?: string;
  price?: number;
  weekStartDate: string;
  weekEndDate: string;
  rarity?: {
    name: string;
    color: string;
  };
  status: 'active' | 'inactive';
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const weeklyPrizes = await db.collection('weeklyprizes')
      .find({})
      .sort({ weekStartDate: -1 })
      .toArray();

    return NextResponse.json({ weeklyPrizes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching weekly prizes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly prizes' },
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
    
    // Validate required fields
    if (!data.name || !data.weekStartDate || !data.weekEndDate) {
      return NextResponse.json(
        { error: 'name, weekStartDate, and weekEndDate are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if there's already a prize for this week or overlapping period
    const existingPrize = await db.collection('weeklyprizes').findOne({
      $or: [
        {
          weekStartDate: { $lte: data.weekEndDate },
          weekEndDate: { $gte: data.weekStartDate }
        }
      ]
    });

    if (existingPrize) {
      return NextResponse.json(
        { error: 'A prize already exists for this week or overlapping period' },
        { status: 400 }
      );
    }

    // Create new weekly prize
    const weeklyPrize = {
      name: data.name,
      image: data.image || '',
      price: data.price || 0,
      weekStartDate: data.weekStartDate,
      weekEndDate: data.weekEndDate,
      rarity: data.rarity || { name: 'Consumer Grade', color: '#b0c3d9' },
      status: 'active' as const,
      createdBy: session.user.email || undefined,
      lastModifiedBy: session.user.email || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('weeklyprizes').insertOne(weeklyPrize);

    return NextResponse.json({
      message: 'Weekly prize created successfully',
      weeklyPrize: { ...weeklyPrize, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly prize:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly prize' },
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
    
    if (!data._id) {
      return NextResponse.json(
        { error: '_id is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const updateData: Partial<WeeklyPrizeData> = {
      lastModifiedBy: session.user.email || undefined,
      updatedAt: new Date().toISOString()
    };

    // Only update fields that are provided
    if (data.status !== undefined) updateData.status = data.status;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.rarity !== undefined) updateData.rarity = data.rarity;
    if (data.weekStartDate !== undefined) updateData.weekStartDate = data.weekStartDate;
    if (data.weekEndDate !== undefined) updateData.weekEndDate = data.weekEndDate;

    // If updating dates, check for conflicts
    if (data.weekStartDate || data.weekEndDate) {
      const currentPrize = await db.collection('weeklyprizes').findOne({ _id: new ObjectId(data._id) });
      if (!currentPrize) {
        return NextResponse.json(
          { error: 'Weekly prize not found' },
          { status: 404 }
        );
      }

      const newStartDate = data.weekStartDate || currentPrize.weekStartDate || '';
      const newEndDate = data.weekEndDate || currentPrize.weekEndDate || '';

      const conflictingPrize = await db.collection('weeklyprizes').findOne({
        _id: { $ne: new ObjectId(data._id) },
        $or: [
          {
            weekStartDate: { $lte: newEndDate },
            weekEndDate: { $gte: newStartDate }
          }
        ]
      });

      if (conflictingPrize) {
        return NextResponse.json(
          { error: 'A prize already exists for this week or overlapping period' },
          { status: 400 }
        );
      }
    }

    const result = await db.collection('weeklyprizes').updateOne(
      { _id: new ObjectId(data._id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Weekly prize not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Weekly prize updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating weekly prize:', error);
    return NextResponse.json(
      { error: 'Failed to update weekly prize' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json(
        { error: '_id is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('weeklyprizes').deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Weekly prize not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Weekly prize deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting weekly prize:', error);
    return NextResponse.json(
      { error: 'Failed to delete weekly prize' },
      { status: 500 }
    );
  }
} 