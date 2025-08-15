import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { NextRequest } from 'next/server';

interface QueryFilter {
  'category.name'?: { 
    $regex: string;
    $options: string;
  };
  name?: { 
    $regex: string;
    $options: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();
    const query: QueryFilter = {};
    
    if (category && category !== 'all') {
      query['category.name'] = { $regex: category, $options: 'i' };
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    
    const totalCount = await db.collection('csgoskins').countDocuments(query);
    
    const skins = await db.collection('csgoskins')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();


    return NextResponse.json({
      skins,
      totalCount,
      hasMore: skip + skins.length < totalCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching skins:', error);
    return NextResponse.json(
      { message: 'Failed to fetch skins' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json');
    const skins = await response.json();

    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('csgoskins').deleteMany({});
    
    await db.collection('csgoskins').insertMany(skins);

    return NextResponse.json(
      { message: 'Skins updated successfully', count: skins.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating skins:', error);
    return NextResponse.json(
      { message: 'Failed to update skins' },
      { status: 500 }
    );
  }
} 