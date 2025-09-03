"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Medal,
  Award,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import LeaderboardSkeleton from "@/components/LeaderboardSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaderboardUser {
  _id: string;
  username: string;
  avatar: string;
}

interface Prize {
  name: string;
  image: string;
}

interface AvailablePrize {
  id: string;
  name: string;
  image: string;
  price: number;
  rarity: {
    name: string;
    color: string;
  };
  isShow: boolean;
}

interface LeaderboardEntry {
  position: number;
  user: LeaderboardUser;
  bestStreak: number;
  currentStreak: number;
  guesses: number;
  score: number;
  tickets: number;
  winRate: number;
  prizes: Prize[];
  allPrizes?: AvailablePrize[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  pagination: PaginationInfo;
}

const LeaderboardPage = () => {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrizes, setSelectedPrizes] = useState<Record<string, string>>(
    {}
  );

  const fetchLeaderboard = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/cs2dle/leaderboard?page=${page}&limit=10`
      );
      const result: LeaderboardResponse = await response.json();
      console.log(result);
      if (result.success) {
        setData(result);
      } else {
        setError("Failed to fetch leaderboard data");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(currentPage);
  }, [currentPage]);

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1)
      return <Badge className="bg-yellow-500 text-white">1st</Badge>;
    if (position === 2)
      return <Badge className="bg-gray-400 text-white">2nd</Badge>;
    if (position === 3)
      return <Badge className="bg-amber-600 text-white">3rd</Badge>;
    return <Badge variant="secondary">#{position}</Badge>;
  };

  const handlePrizeChange = async (userId: string, prizeIndex: string) => {
    try {
      // Update local state immediately for better UX
      setSelectedPrizes((prev) => ({
        ...prev,
        [userId]: prizeIndex,
      }));

      // Update the isShow status on the server
      if (prizeIndex) {
        const response = await fetch("/api/cs2dle/leaderboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            prizeIndex,
          }),
        });

        if (response.ok) {
          // Refresh the leaderboard data to get updated isShow statuses
          await fetchLeaderboard(currentPage);
        } else {
          throw new Error('Failed to update prize show status');
        }
      }
    } catch (error) {
      console.error("Failed to update prize show status:", error);
      // Revert local state if server update fails
      setSelectedPrizes((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const getDisplayPrize = (entry: LeaderboardEntry): Prize | null => {
    // First try to find a prize marked as show
    const showPrize = entry.allPrizes?.find((prize) => prize.isShow === true);
    if (showPrize) {
      return {
        name: showPrize.name,
        image: showPrize.image,
      };
    }

    // If no prize has isShow: true, fall back to the first available prize
    const firstPrize = entry.allPrizes?.[0];
    if (firstPrize) {
      return {
        name: firstPrize.name,
        image: firstPrize.image,
      };
    }

    // If no prizes exist at all, return null
    return null;
  };

  if (loading && !data) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchLeaderboard(currentPage)}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-center gap-4 mb-8">
        <Image
          src="/images/cs2dle/logo.png"
          alt="CS2DLE Logo"
          width={300}
          height={300}
        />
      </div>
      <Card>
        <CardContent className="!p-0">
          {data && (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center">Best Streak</TableHead>
                    <TableHead className="text-center">
                      Current Streak
                    </TableHead>
                    <TableHead className="text-center">Games Played</TableHead>
                    <TableHead className="text-center">Correct guesses</TableHead>
                    <TableHead className="text-center">Win Rate</TableHead>
                    <TableHead className="text-center">Total points</TableHead>
                    <TableHead className="text-center">
                      Prize (Click to change)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((entry) => (
                    <TableRow key={entry.user._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getPositionIcon(entry.position)}
                          {getPositionBadge(entry.position)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={entry.user.avatar}
                              alt={entry.user.username}
                            />
                            <AvatarFallback>
                              {entry.user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {entry.user.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {entry.bestStreak}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {entry.currentStreak}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono">{entry.guesses}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono">{entry.tickets}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="font-mono bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                        >
                          {(entry.winRate * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="font-mono bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                        >
                          {entry.score.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.allPrizes && entry.allPrizes.length > 0 ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-col items-center gap-1">
                              {entry.allPrizes && entry.allPrizes.length > 1 && (
                                <div className="flex items-center gap-1">
                                  <Select
                                    value={selectedPrizes[entry.user._id] || ""}
                                    onValueChange={(value) =>
                                      handlePrizeChange(entry.user._id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full py-3 text-xs">
                                      <div className="flex items-center gap-2">
                                        {getDisplayPrize(entry) ? (
                                          <>
                                            <Image
                                              src={getDisplayPrize(entry)?.image || "/placeholder.jpg"}
                                              alt={getDisplayPrize(entry)?.name || "Unknown"}
                                              width={50}
                                              height={50}
                                              className="rounded-none object-cover"
                                              onError={(e) => {
                                                const target =
                                                  e.target as HTMLImageElement;
                                                target.src = "/placeholder.jpg";
                                              }}
                                            />
                                            <div className="flex flex-col items-start gap-1">
                                              <span className="text-sm text-muted-foreground truncate max-w-32 text-center">
                                                {getDisplayPrize(entry)?.name || "Unknown"}
                                                {entry.allPrizes && entry.allPrizes.length > 1 && (
                                                  <span className="ml-1 text-xs text-blue-500">
                                                    ({entry.allPrizes.length})
                                                  </span>
                                                )}
                                              </span>
                                            </div>
                                          </>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <div className="w-[50px] h-[50px] bg-muted rounded-none flex items-center justify-center">
                                              <span className="text-xs text-muted-foreground">No Prize</span>
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                              <span className="text-sm text-muted-foreground truncate max-w-32 text-center">
                                                Select a prize to display
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {entry.allPrizes?.map((prize, index) => (
                                        <SelectItem
                                          key={index}
                                          value={index.toString()}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Image
                                              src={prize.image}
                                              alt={prize.name}
                                              width={50}
                                              height={50}
                                              className="rounded-none object-cover"
                                              onError={(e) => {
                                                const target =
                                                  e.target as HTMLImageElement;
                                                target.src = "/placeholder.jpg";
                                              }}
                                            />
                                            <span className="truncate">
                                              {prize.name}
                                            </span>
                                            <div className="flex items-center gap-1 ml-auto">
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                                style={{
                                                  borderColor:
                                                    prize.rarity.color,
                                                  color: prize.rarity.color,
                                                }}
                                              >
                                                {prize.rarity.name}
                                              </Badge>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!data.pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = data.pagination.totalPages;
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        // Adjust start page if we're near the end
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        
                        const pages = [];
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={i === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(i)}
                              className="w-8 h-8 p-0"
                            >
                              {i}
                            </Button>
                          );
                        }
                        return pages;
                      })()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!data.pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
