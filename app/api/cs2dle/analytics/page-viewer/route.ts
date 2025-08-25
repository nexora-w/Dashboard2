import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { toZonedTime, format } from 'date-fns-tz';

interface PageVisit {
  pageName: string;
  date: string;
  visitCount: number;
  lastVisit?: string;
}

function getStartOfDay(date = new Date()): string {
  const amsterdamDate = toZonedTime(date, 'Europe/Amsterdam');
  return format(amsterdamDate, 'yyyy-MM-dd', { timeZone: 'Europe/Amsterdam' });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getStartOfDay();

    const client = await clientPromise;
    const db = client.db();

    // Get all page visits for the specified date
    const pageVisits = await db.collection<PageVisit>('PageVisits')
      .find({ date })
      .sort({ visitCount: -1 })
      .toArray();

    // Get total visits across all pages
    const totalVisits = pageVisits.reduce((sum, page) => sum + page.visitCount, 0);

    return NextResponse.json({ 
      message: 'Page visit statistics retrieved successfully',
      date,
      totalVisits,
      pageVisits
    });
  } catch (error) {
    console.error('Error retrieving page visit statistics:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve page visit statistics' },
      { status: 500 }
    );
  }
}
