import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const gameType = searchParams.get('gameType');

    const client = await clientPromise;
    const db = client.db();

    const now = toZonedTime(new Date(), 'Europe/Amsterdam');
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
    }

    // Build query based on period
    const query: any = {};
    
    if (period !== 'all') {
      const startDateUTC = new Date(startDate.toISOString());
      const endDateUTC = new Date(now.toISOString());
      
      query.createdAt = {
        $gte: startDateUTC,
        $lte: endDateUTC
      };
    }

    if (gameType) {
      query.gameType = gameType;
    }

    // Fetch game history data
    const gameHistory = await db.collection('gameHistory').find(query).toArray();

    // Fetch daily stats data
    let dailyStatsQuery: any = {};
    
    if (period !== 'all') {
      dailyStatsQuery = {
        date: {
          $gte: format(startDate, 'yyyy-MM-dd'),
          $lte: format(now, 'yyyy-MM-dd')
        }
      };
    }
    
    const dailyStats = await db.collection('DailyStats').find(dailyStatsQuery).toArray();

    // Process analytics data
    const analytics = processAnalyticsData(gameHistory, dailyStats, period);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function processAnalyticsData(gameHistory: any[], dailyStats: any[], period: string) {
  // Game performance metrics
  const totalGames = gameHistory.length;
  const totalWins = gameHistory.reduce((sum, game) => sum + (game.correctGuess ? 1 : 0), 0);
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
  
  // Game type distribution
  const gameTypeStats = gameHistory.reduce((acc, game) => {
    const type = game.gameType;
    if (!acc[type]) {
      acc[type] = { count: 0, wins: 0 };
    }
    acc[type].count++;
    if (game.correctGuess) {
      acc[type].wins++;
    }
    return acc;
  }, {} as Record<string, { count: number; wins: number }>);

  // Calculate win rates for each game type
  Object.keys(gameTypeStats).forEach(type => {
    const stats = gameTypeStats[type];
    stats.winRate = stats.count > 0 ? (stats.wins / stats.count) * 100 : 0;
  });

  // Daily trends
  const dailyGameStats = gameHistory.reduce((acc, game) => {
    const date = game.date;
    if (!acc[date]) {
      acc[date] = { games: 0, wins: 0, uniqueUsers: new Set() };
    }
    acc[date].games++;
    if (game.correctGuess) {
      acc[date].wins++;
    }
    acc[date].uniqueUsers.add(game.userId);
    return acc;
  }, {} as Record<string, { games: number; wins: number; uniqueUsers: Set<string> }>);

  // Convert Sets to counts and calculate win rates
  Object.keys(dailyGameStats).forEach(date => {
    const stats = dailyGameStats[date];
    stats.uniqueUserCount = stats.uniqueUsers.size;
    stats.winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0;
    delete stats.uniqueUsers; // Remove Set for JSON serialization
  });

  // Visitor analytics from daily stats
  const visitorStats = dailyStats.reduce((acc, stat) => {
    acc.totalVisitors += stat.visitorCount;
    acc.totalVisits += stat.visitTimes.length;
    acc.dailyVisitors.push({
      date: stat.date,
      visitors: stat.visitorCount,
      visits: stat.visitTimes.length
    });
    return acc;
  }, { totalVisitors: 0, totalVisits: 0, dailyVisitors: [] as any[] });

  // Time-based analytics (hourly distribution)
  const hourlyStats = gameHistory.reduce((acc, game) => {
    let gameDate: Date;
    
    // Handle different date formats
    if (game.createdAt?.$date) {
      gameDate = parseISO(game.createdAt.$date);
    } else if (game.createdAt) {
      gameDate = new Date(game.createdAt);
    } else {
      // Skip games without creation date
      return acc;
    }
    
    const amsterdamTime = toZonedTime(gameDate, 'Europe/Amsterdam');
    const hour = amsterdamTime.getHours();
    
    if (!acc[hour]) {
      acc[hour] = { games: 0, wins: 0 };
    }
    acc[hour].games++;
    if (game.correctGuess) {
      acc[hour].wins++;
    }
    return acc;
  }, {} as Record<number, { games: number; wins: number }>);

  // Convert to array format for easier charting
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    games: hourlyStats[hour]?.games || 0,
    winRate: hourlyStats[hour]?.games > 0 ? (hourlyStats[hour].wins / hourlyStats[hour].games) * 100 : 0
  }));

  // Recent activity (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  const recentActivity = last7Days.map(date => ({
    date,
    games: dailyGameStats[date]?.games || 0,
    visitors: dailyStats.find(stat => stat.date === date)?.visitorCount || 0,
    winRate: dailyGameStats[date]?.winRate || 0
  }));

  return {
    summary: {
      totalGames,
      totalWins,
      winRate: Math.round(winRate * 100) / 100,
      totalVisitors: visitorStats.totalVisitors,
      totalVisits: visitorStats.totalVisits,
      period
    },
    gameTypeStats,
    dailyGameStats,
    visitorStats: {
      totalVisitors: visitorStats.totalVisitors,
      totalVisits: visitorStats.totalVisits,
      dailyVisitors: visitorStats.dailyVisitors
    },
    hourlyStats: hourlyData,
    recentActivity,
    period
  };
}
