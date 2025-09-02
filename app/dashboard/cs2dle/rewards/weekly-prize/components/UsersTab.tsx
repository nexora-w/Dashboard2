"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, Loader2, CheckCircle, XCircle, Copy, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

interface User {
  _id: string;
  email: string;
  name?: string;
  username?: string;
  image?: string;
  steamId?: string;
  tradeLink?: string;
  cryptoAddresses?: {
    bitcoin?: string;
    ethereum?: string;
  };
  weeklyPrize?: WeeklyPrize[];
}

interface WeeklyPrize {
  id: string;
  active: boolean;
  weekStartDate: string;
  weekEndDate: string;
  claimData?: string;
  receivedData?: string;
  weeklyPrize?: {
    name: string;
    image?: string;
    rarity?: {
      name: string;
      color: string;
    };
    price?: number;
  };
}

const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/cs2dle/rewards/weekly-prize/users");
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError("Error loading users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWeeklyPrize = async (
    userId: string,
    prizeId: string,
    newStatus: boolean
  ) => {
    try {
      setUpdatingUsers((prev) => new Set(prev).add(userId));

      const response = await fetch("/api/cs2dle/rewards/weekly-prize/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          weeklyPrizeId: prizeId,
          active: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: `Weekly prize ${
            newStatus ? "activated" : "deactivated"
          } successfully`,
        });

        // Refresh users data
        await fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update weekly prize status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update weekly prize status",
        variant: "destructive",
      });
    } finally {
      setUpdatingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      // Handle ISO date strings with timezone offsets
      const date = parseISO(dateString);
      return format(date, "MMM dd, yyyy HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  const formatWeekRange = (startDate: string, endDate: string) => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
    } catch {
      return "Invalid date range";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {users.reduce(
              (sum, user) => sum + (user.weeklyPrize?.length || 0),
              0
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Weekly Prizes</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {users.reduce(
              (sum, user) =>
                sum + (user.weeklyPrize?.filter((p) => p.active).length || 0),
              0
            )}
          </div>
          <div className="text-sm text-muted-foreground">Active Prizes</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">
            $
            {users
              .reduce(
                (sum, user) =>
                  sum +
                  (user.weeklyPrize?.reduce(
                    (prizeSum, weeklyPrize) =>
                      prizeSum + (weeklyPrize.weeklyPrize?.price || 0),
                    0
                  ) || 0),
                0
              )
              .toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Total Value</div>
        </Card>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user._id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || user.username || "User"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {(user.name || user.username || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {user.name || user.username || "Unknown User"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                  {user.steamId && (
                    <p className="text-xs text-muted-foreground">
                      Steam ID: {user.steamId}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                {user.weeklyPrize && user.weeklyPrize.length > 0 ? (
                  user.weeklyPrize.map((weeklyPrize, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={weeklyPrize.active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {weeklyPrize.active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Prize #{index + 1}
                          </span>
                        </div>

                        {/* Week Range */}
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatWeekRange(weeklyPrize.weekStartDate, weeklyPrize.weekEndDate)}
                          </span>
                        </div>

                        {/* Item Details */}
                        {weeklyPrize.weeklyPrize ? (
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              {weeklyPrize.weeklyPrize.image && (
                                <Image
                                  src={weeklyPrize.weeklyPrize.image}
                                  alt={weeklyPrize.weeklyPrize.name}
                                  width={96}
                                  height={96}
                                  className="w-24 h-24 object-contain rounded"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {weeklyPrize.weeklyPrize.name}
                                </p>
                                {weeklyPrize.weeklyPrize.rarity && (
                                  <Badge
                                    className="text-xs mt-1"
                                    style={{
                                      backgroundColor:
                                        weeklyPrize.weeklyPrize.rarity.color ||
                                        "#b0c3d9",
                                      color:
                                        weeklyPrize.weeklyPrize.rarity.color ===
                                        "#b0c3d9"
                                          ? "#000"
                                          : "#fff",
                                    }}
                                  >
                                    {weeklyPrize.weeklyPrize.rarity.name}
                                  </Badge>
                                )}
                                {weeklyPrize.weeklyPrize.price !== undefined && (
                                  <p className="text-xs text-green-600 font-medium mt-1">
                                    ${weeklyPrize.weeklyPrize.price.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <p className="text-sm text-muted-foreground">
                              Prize ID: {weeklyPrize.id}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          <div>Claimed: {formatDate(weeklyPrize.claimData)}</div>
                          {weeklyPrize.receivedData && (
                            <div>
                              Received: {formatDate(weeklyPrize.receivedData)}
                            </div>
                          )}
                        </div>
                      </div>
                      {!weeklyPrize.active && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleToggleWeeklyPrize(
                              user._id,
                              weeklyPrize.id,
                              !weeklyPrize.active
                            )
                          }
                          disabled={updatingUsers.has(user._id)}
                          className="ml-2"
                        >
                          {updatingUsers.has(user._id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sent
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No weekly prizes assigned</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users with weekly prizes</h3>
          <p className="text-gray-500">Users will appear here once they have been awarded weekly prizes.</p>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
