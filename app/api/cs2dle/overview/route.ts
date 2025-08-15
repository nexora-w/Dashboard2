import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get current Amsterdam time
    const now = toZonedTime(new Date(), 'Europe/Amsterdam');
    const today = format(now, 'yyyy-MM-dd');
    const yesterday = format(new Date(now.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    // Today's stats
    const todayGames = await db.collection('gameHistory').countDocuments({
      date: today
    });

    const todayVisitors = await db.collection('DailyStats').findOne(
      { date: today },
      { projection: { visitorCount: 1 } }
    );

    // Yesterday's stats for comparison
    const yesterdayGames = await db.collection('gameHistory').countDocuments({
      date: yesterday
    });

    const yesterdayVisitors = await db.collection('DailyStats').findOne(
      { date: yesterday },
      { projection: { visitorCount: 1 } }
    );

    // Total stats
    const totalGames = await db.collection('gameHistory').countDocuments();
    const totalVisitors = await db.collection('DailyStats').aggregate([
      { $group: { _id: null, total: { $sum: '$visitorCount' } } }
    ]).toArray();

    // Game type distribution
    const gameTypeStats = await db.collection('gameHistory').aggregate([
      { $group: { _id: '$gameType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Recent activity (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    const recentActivity = await Promise.all(
      last7Days.map(async (date) => {
        const games = await db.collection('gameHistory').countDocuments({ date });
        const visitors = await db.collection('DailyStats').findOne(
          { date },
          { projection: { visitorCount: 1 } }
        );
        return {
          date,
          games,
          visitors: visitors?.visitorCount || 0
        };
      })
    );

    return NextResponse.json({
      today: {
        games: todayGames,
        visitors: todayVisitors?.visitorCount || 0,
        gamesChange: yesterdayGames > 0 ? ((todayGames - yesterdayGames) / yesterdayGames * 100).toFixed(1) : 0,
        visitorsChange: (yesterdayVisitors?.visitorCount || 0) > 0 ? 
          (((todayVisitors?.visitorCount || 0) - (yesterdayVisitors?.visitorCount || 0)) / (yesterdayVisitors?.visitorCount || 1) * 100).toFixed(1) : 0
      },
      total: {
        games: totalGames,
        visitors: totalVisitors[0]?.total || 0
      },
      gameTypes: gameTypeStats.map(stat => ({
        type: stat._id,
        count: stat.count
      })),
      recentActivity
    });
  } catch (error) {
    console.error('Overview API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
