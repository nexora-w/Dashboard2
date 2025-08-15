import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types/user';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const users = await db
      .collection<User>('users')
      .find({}, { projection: { name: 1, email: 1, _id: 0 } })
      .sort({ createdAt: -1, _id: -1 })
      .toArray(); 

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
} 