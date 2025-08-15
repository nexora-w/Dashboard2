import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { CategoriesResponse, ErrorResponse } from '@/app/types/skins';

export async function GET(): Promise<NextResponse<CategoriesResponse | ErrorResponse>> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get unique categories from the skins collection
    const categories = await db.collection('csgoskins')
      .distinct('category.name', { 'category.name': { $exists: true } });
    
    // Filter out null/undefined values and sort categories
    const sortedCategories = ['all', ...categories.filter(Boolean).sort()];

    // Prepare response
    const response: CategoriesResponse = {
      categories: sortedCategories
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);

    // Handle MongoDB connection errors
    if (error instanceof Error && error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { message: 'Database connection error' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 