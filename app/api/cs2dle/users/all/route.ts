import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types/user';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: PaginationInfo;
}

export async function GET(request: Request) {
  try {
    console.log('Fetching users');
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
    const totalUsers = await db.collection<User>('users').countDocuments();

    // Fetch users with pagination
    const users = await db
      .collection<User>('users')
      .find()
      .sort({ createdAt: -1, _id: -1 }) // Sort by creation date, newest first, then by _id
      .skip(skip)
      .limit(validLimit)
      .toArray();

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    const response: UsersResponse = {
      success: true,
      data: users,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: totalUsers,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };

    return NextResponse.json(response, { status: 200 });
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