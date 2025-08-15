import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db();

    // Get all active pre-cases with their probabilities
    const preCases = await db.collection('precases')
      .find({})
      .toArray();

    if (preCases.length === 0) {
      return NextResponse.json(
        { error: 'No pre-cases available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preCase: preCases
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching daily case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily case' },
      { status: 500 }
    );
  }
}
