import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

interface ToggleStatusRequest {
  _id: string;
  status: 'active' | 'inactive';
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

    const body: ToggleStatusRequest = await request.json();
    const { _id, status } = body;

    // Validate required fields
    if (!_id || !status) {
      return NextResponse.json(
        { message: 'Missing required fields: _id, status' },
        { status: 400 }
      );
    }

    // Validate status value
    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { message: 'Status must be either "active" or "inactive"' },
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

    // Check if the status is already the requested status
    if (existingPreCase.status === status) {
      return NextResponse.json(
        { 
          message: `Precase is already ${status}`,
          currentStatus: existingPreCase.status
        },
        { status: 400 }
      );
    }

    // Update the status
    const result = await db.collection('precases').updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: {
          status: status,
          lastModifiedBy: session.user.email,
          updatedAt: new Date()
        }
      }
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
      message: `Precase status updated to ${status}`,
      precase: updatedPreCase
    });

  } catch (error) {
    console.error('Error toggling precase status:', error);
    return NextResponse.json(
      { message: 'Failed to toggle precase status' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Alias for POST method - allows both POST and PATCH
  return POST(request);
}
