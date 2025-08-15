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
import { ChevronLeft, ChevronRight, Trophy, Medal, Award } from "lucide-react";
import Image from "next/image";
import LeaderboardSkeleton from "@/components/LeaderboardSkeleton";

interface LeaderboardUser {
  _id: string;
  username: string;
  avatar: string;
}

interface Prize {
  name: string;
  image: string;
}

interface LeaderboardEntry {
  position: number;
  user: LeaderboardUser;
  bestStreak: number;
  currentStreak: number;
  guesses: number;
  tickets: number;
  prize: Prize | null;
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

  const fetchLeaderboard = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/cs2dle/leaderboard?page=${page}&limit=10`
      );
      const result: LeaderboardResponse = await response.json();

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

  if (loading && !data) {
    return (
      <LeaderboardSkeleton />
    );
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
        <CardContent>
          {data && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center">Best Streak</TableHead>
                    <TableHead className="text-center">
                      Current Streak
                    </TableHead>
                    <TableHead className="text-center">Games Played</TableHead>
                    <TableHead className="text-center">Tickets</TableHead>
                    <TableHead className="text-center">Best Prize</TableHead>
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
                        <Badge
                          variant="outline"
                          className="font-mono bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                        >
                          {entry.tickets}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.prize ? (
                          <div className="flex items-center justify-center gap-2">
                            <Image
                              src={entry.prize.image}
                              alt={entry.prize.name}
                              width={40}
                              height={40}
                              className="rounded-none object-cover"
                            />
                            <span className="text-sm text-muted-foreground truncate max-w-24">
                              {entry.prize.name}
                            </span>
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
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
                    {Math.min(
                      data.pagination.page * data.pagination.limit,
                      data.pagination.total
                    )}{" "}
                    of {data.pagination.total} results
                  </div>
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
                      {Array.from(
                        { length: Math.min(5, data.pagination.totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pageNum === currentPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
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
