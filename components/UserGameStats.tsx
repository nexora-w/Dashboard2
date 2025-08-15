import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Ticket, Target, Gamepad2, TrendingUp } from 'lucide-react';
import { User } from '@/types/user';

interface UserGameStatsProps {
  user: User;
}

export const UserGameStats = ({ user }: UserGameStatsProps) => {
  const tickets = user.ticket || 0;
  const bestStreak = user.bestStreak || 0;
  const currentStreak = user.currentStreak || 0;
  const gamesPlayed = user.gamesPlayed || 0;
  
  // Calculate screens (daily cases completed)
  const screens = user.dailyCase?.filter(case_ => case_.active === false).length || 0;
  
  // Calculate top screens (daily cases with high value prizes - we'll use bestStreak as a proxy for now)
  const topScreens = Math.floor(bestStreak / 3); // Assuming top screens are related to high streaks

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        Game Statistics
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Tickets */}
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Tickets</p>
                <p className="font-semibold text-lg">{tickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Screens */}
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Screens</p>
                <p className="font-semibold text-lg">{screens}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Screens */}
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Top Screens</p>
                <p className="font-semibold text-lg">{topScreens}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games Played */}
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Games</p>
                <p className="font-semibold text-lg">{gamesPlayed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streaks */}
      <div className="flex gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Best: {bestStreak}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Current: {currentStreak}
        </Badge>
      </div>
    </div>
  );
};
