'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import AnalyticsSkeleton from "@/components/AnalyticsSkeleton";

interface AnalyticsData {
  summary: {
    totalGames: number;
    totalWins: number;
    winRate: number;
    totalVisitors: number;
    totalVisits: number;
    period: string;
  };
  gameTypeStats: Record<string, {
    count: number;
    wins: number;
    winRate: number;
  }>;
  dailyGameStats: Record<string, {
    games: number;
    wins: number;
    uniqueUserCount: number;
    winRate: number;
  }>;
  visitorStats: {
    totalVisitors: number;
    totalVisits: number;
    dailyVisitors: Array<{
      date: string;
      visitors: number;
      visits: number;
    }>;
  };
  hourlyStats: Array<{
    hour: number;
    games: number;
    winRate: number;
    isCompleted: boolean;
    isCurrentHour: boolean;
  }>;
  recentActivity: Array<{
    date: string;
    games: number;
    visitors: number;
    winRate: number;
  }>;
  period: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('7d');
  const [gameType, setGameType] = useState('all');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period });
      if (gameType && gameType !== 'all') params.append('gameType', gameType);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`/api/cs2dle/analytics?${params}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      
      let errorMessage = 'Failed to load analytics data';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, gameType]);

  // Clear error when filters change
  useEffect(() => {
    setError(null);
  }, [period, gameType]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatHour = (hour: number) => {
    // Format hour in 24-hour format with Amsterdam timezone indication
    return `${hour.toString().padStart(2, '0')}:00 (Amsterdam)`;
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Image src="/images/cs2dle/logo.png" alt="CS2DLE Logo" width={300} height={300} />
        </div>
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Analytics</div>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button 
              onClick={fetchAnalytics}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Image src="/images/cs2dle/logo.png" alt="CS2DLE Logo" width={300} height={300} />
        </div>
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-yellow-600 text-lg font-semibold mb-2">No Data Available</div>
            <p className="text-yellow-500 text-sm mb-4">
              No analytics data found for the selected period and filters.
            </p>
            <Button 
              onClick={fetchAnalytics}
              variant="outline"
              className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const gameTypeChartData = Object.entries(data.gameTypeStats).map(([type, stats]) => ({
    name: type,
    games: stats.count,
    winRate: Math.round(stats.winRate * 100) / 100
  }));

  const recentActivityChartData = data.recentActivity.map(item => ({
    date: formatDate(item.date),
    games: item.games,
    visitors: item.visitors,
    winRate: Math.round(item.winRate * 100) / 100
  }));

  const hourlyChartData = data.hourlyStats.map(item => ({
    hour: formatHour(item.hour),
    hourLabel: `${item.hour.toString().padStart(2, '0')}:00`,
    games: item.games,
    winRate: Math.round(item.winRate * 100) / 100,
    isCompleted: item.isCompleted,
    isCurrentHour: item.isCurrentHour
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-center gap-4 mb-8">
        <Image src="/images/cs2dle/logo.png" alt="CS2DLE Logo" width={300} height={300} />
      </div>
      
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              View comprehensive analytics for your CS2DLE platform
            </p>
          </div>
          
          <div className="flex gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
                         <Select value={gameType} onValueChange={setGameType}>
               <SelectTrigger className="w-40">
                 <SelectValue placeholder="All games" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All games</SelectItem>
                 <SelectItem value="EmojiPuzzle">Emoji Puzzle</SelectItem>
                 <SelectItem value="GuessSkin">Guess the Skin</SelectItem>
                 <SelectItem value="GuessPrice">Guess the Price</SelectItem>
                 <SelectItem value="HigherOrLower">Higher or Lower</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Badge variant="secondary">{data.period}</Badge>
          </CardHeader>
                     <CardContent>
             <div className="text-2xl font-bold">{data.summary.totalGames.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
               Win rate: {data.summary.winRate.toFixed(1)}%
             </p>
           </CardContent>
        </Card>

                 <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
             <Badge variant="secondary">{data.period}</Badge>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{data.summary.totalWins.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
               Across all games
             </p>
           </CardContent>
         </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Badge variant="secondary">{data.period}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.totalVisits.toLocaleString()} total visits
            </p>
          </CardContent>
        </Card>

                 <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
             <Badge variant="secondary">{data.period}</Badge>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{data.summary.winRate.toFixed(1)}%</div>
             <p className="text-xs text-muted-foreground">
               Success rate
             </p>
           </CardContent>
         </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="games">Game Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="visitors">Visitor Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
                <CardDescription>Games played and visitors over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recentActivityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="games" stroke="#8884d8" name="Games" />
                    <Line type="monotone" dataKey="visitors" stroke="#82ca9d" name="Visitors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity</CardTitle>
                <CardDescription>Games played by hour of day (Amsterdam timezone, showing all 24 hours)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hourLabel" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: any) => [value, name]}
                      labelFormatter={(label: any) => `${label} (Amsterdam time)`}
                    />
                    <Bar dataKey="games" fill="#8884d8">
                      {hourlyChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.isCurrentHour ? '#FF6B6B' : // Red for current hour
                            entry.isCompleted ? '#8884d8' : // Blue for completed hours
                            '#E0E0E000' // Gray for upcoming hours
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Type Performance</CardTitle>
                <CardDescription>Success rates and average scores by game type</CardDescription>
              </CardHeader>
              <CardContent>
                                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={gameTypeChartData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Bar dataKey="winRate" fill="#82ca9d" name="Win Rate (%)" />
                   </BarChart>
                 </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Distribution</CardTitle>
                <CardDescription>Games played by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gameTypeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="games"
                    >
                      {gameTypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Game Type Details</CardTitle>
              <CardDescription>Detailed statistics for each game type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(data.gameTypeStats).map(([type, stats]) => (
                                     <div key={type} className="p-4 border rounded-lg">
                     <h3 className="font-semibold mb-2">{type}</h3>
                     <div className="space-y-1 text-sm">
                       <p>Games: {stats.count}</p>
                       <p>Win Rate: {Math.round(stats.winRate * 100) / 100}%</p>
                       <p>Wins: {stats.wins}</p>
                     </div>
                   </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Trends</CardTitle>
              <CardDescription>Daily game activity and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                                 <LineChart data={recentActivityChartData}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="date" />
                   <YAxis yAxisId="left" />
                   <YAxis yAxisId="right" orientation="right" />
                   <Tooltip />
                   <Line yAxisId="left" type="monotone" dataKey="games" stroke="#8884d8" name="Games" />
                   <Line yAxisId="right" type="monotone" dataKey="winRate" stroke="#82ca9d" name="Win Rate (%)" />
                 </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Trends</CardTitle>
                <CardDescription>Daily visitor and visit counts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.visitorStats.dailyVisitors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#8884d8" name="Visitors" />
                    <Bar dataKey="visits" fill="#82ca9d" name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visitor Summary</CardTitle>
                <CardDescription>Overall visitor statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Visitors:</span>
                    <span className="font-semibold">{data.visitorStats.totalVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Visits:</span>
                    <span className="font-semibold">{data.visitorStats.totalVisits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Visits per Visitor:</span>
                    <span className="font-semibold">
                      {data.visitorStats.totalVisitors > 0 
                        ? (data.visitorStats.totalVisits / data.visitorStats.totalVisitors).toFixed(2)
                        : '0'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;