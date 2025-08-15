import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

interface EditPreCaseRequest {
  _id: string;
  skinId?: string;
  name?: string;
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
  min_float?: number | null;
  max_float?: number | null;
  rarity?: {
    id: string;
    name: string;
    color: string;
  };
  stattrak?: boolean;
  souvenir?: boolean;
  paint_index?: string | null;
  probability?: number;
  price?: number;
  status?: 'active' | 'inactive';
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const body: EditPreCaseRequest = await request.json();
    const { _id, ...updateData } = body;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { message: 'Missing required field: _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json(
        { message: 'Invalid _id format' },
        { status: 400 }
      );
    }

    // Check if the precase exists
    const existingPreCase = await db.collection('precases').findOne({ _id: new ObjectId(_id) });
    if (!existingPreCase) {
      return NextResponse.json(
        { message: 'Precase not found' },
        { status: 404 }
      );
    }

    // Add lastModifiedBy and updatedAt
    const updatePayload = {
      ...updateData,
      lastModifiedBy: session.user.email,
      updatedAt: new Date()
    };

    // Update the precase
    const result = await db.collection('precases').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updatePayload }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Precase not found' },
        { status: 404 }
      );
    }

    // Fetch the updated precase
    const updatedPreCase = await db.collection('precases').findOne({ _id: new ObjectId(_id) });

    return NextResponse.json({
      success: true,
      message: 'Precase updated successfully',
      precase: updatedPreCase
    });

  } catch (error) {
    console.error('Error updating precase:', error);
    return NextResponse.json(
      { message: 'Failed to update precase' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Alias for PUT method - allows both PUT and PATCH
  return PUT(request);
}
