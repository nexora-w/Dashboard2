"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, Loader2, CheckCircle, XCircle, Copy, User, Mail, Gamepad2, ExternalLink, Coins, Trophy, Calendar, Target } from "lucide-react";
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
  dailyCase?: DailyCase[];
  weeklyPrize?: WeeklyPrize[];
  // Game statistics
  gamesPlayed?: number;
  bestStreak?: number;
  currentStreak?: number;
  score?: number;
  ticket?: number;
  // Account info
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  isGuest?: boolean;
  // Calculated fields
  winRate?: number;
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

interface DailyCase {
  id: string;
  active: boolean;
  claimData?: string;
  receivedData?: string;
  precase?: {
    name: string;
    image?: string;
    weapon?: {
      name: string;
    };
    category?: {
      name: string;
    };
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
  const [showZeroPrizes, setShowZeroPrizes] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/cs2dle/rewards/daily-case/users");
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

  const handleToggleDailyCase = async (
    userId: string,
    caseId: string,
    newStatus: boolean
  ) => {
    try {
      setUpdatingUsers((prev) => new Set(prev).add(userId));

      const response = await fetch("/api/cs2dle/rewards/daily-case/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          prizeId: caseId,
          newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok && result.message) {
        toast({
          title: "Success",
          description: `Daily case ${
            newStatus ? "activated" : "deactivated"
          } successfully`,
        });

        // Refresh users data
        await fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update daily case status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update daily case status",
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

  const handleUserClick = async (userId: string) => {
    try {
      setLoadingUserDetails(true);
      const response = await fetch(`/api/cs2dle/users/${userId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedUser(result.data);
        setIsModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch user details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Filter users based on toggle state
  const filteredUsers = users.filter((user) => {
    if (!showZeroPrizes) {
      // When toggle is off, hide users with $0 prizes
      return !user.dailyCase?.some((dailyCase) => 
        dailyCase.precase?.price === 0 || dailyCase.precase?.price === undefined
      );
    }
    // When toggle is on, show all users
    return true;
  });

  // Calculate statistics for filtered users
  const totalUsers = filteredUsers.length;
  const totalDailyCases = filteredUsers.reduce(
    (sum, user) => sum + (user.dailyCase?.length || 0),
    0
  );
  const activeCases = filteredUsers.reduce(
    (sum, user) =>
      sum + (user.dailyCase?.filter((c) => c.active).length || 0),
    0
  );
  const totalValue = filteredUsers
    .reduce(
      (sum, user) =>
        sum +
        (user.dailyCase?.reduce(
          (caseSum, dailyCase) =>
            caseSum + (dailyCase.precase?.price || 0),
          0
        ) || 0),
      0
    )
    .toFixed(2);

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
      {/* Toggle Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-zero-prizes"
            checked={showZeroPrizes}
            onCheckedChange={setShowZeroPrizes}
          />
          <Label htmlFor="show-zero-prizes" className="text-sm font-medium">
            Show users with $0 prizes
          </Label>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {totalDailyCases}
          </div>
          <div className="text-sm text-muted-foreground">Total Daily Cases</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {activeCases}
          </div>
          <div className="text-sm text-muted-foreground">Active Cases</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">
            ${totalValue}
          </div>
          <div className="text-sm text-muted-foreground">Total Value</div>
        </Card>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
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
                  <CardTitle 
                    className="text-sm font-medium truncate cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleUserClick(user._id)}
                  >
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
                  {user.tradeLink && (
                    <p className="text-xs text-muted-foreground">
                      <a
                        href={user.tradeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Steam Trade Link
                      </a>
                    </p>
                  )}
                  {user.cryptoAddresses && (
                    <div className="text-xs text-muted-foreground">
                      {user.cryptoAddresses.bitcoin && (
                        <div className="flex items-center gap-1">
                          <span>BTC: {user.cryptoAddresses.bitcoin}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0"
                            onClick={() =>
                              copyToClipboard(user.cryptoAddresses!.bitcoin!)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {user.cryptoAddresses.ethereum && (
                        <div className="flex items-center gap-1">
                          <span>ETH: {user.cryptoAddresses.ethereum}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0"
                            onClick={() =>
                              copyToClipboard(user.cryptoAddresses!.ethereum!)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                {user.dailyCase && user.dailyCase.length > 0 ? (
                  user.dailyCase.map((dailyCase, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={dailyCase.active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {dailyCase.active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Case #{index + 1}
                          </span>
                        </div>

                        {/* Item Details */}
                        {dailyCase.precase ? (
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              {dailyCase.precase.image && (
                                <Image
                                  src={dailyCase.precase.image}
                                  alt={dailyCase.precase.name}
                                  width={96}
                                  height={96}
                                  className="w-24 h-24 object-contain rounded"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {dailyCase.precase.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {dailyCase.precase.weapon?.name} •{" "}
                                  {dailyCase.precase.category?.name}
                                </p>
                                {dailyCase.precase.rarity && (
                                  <Badge
                                    className="text-xs mt-1"
                                    style={{
                                      backgroundColor:
                                        dailyCase.precase.rarity.color ||
                                        "#b0c3d9",
                                      color:
                                        dailyCase.precase.rarity.color ===
                                        "#b0c3d9"
                                          ? "#000"
                                          : "#fff",
                                    }}
                                  >
                                    {dailyCase.precase.rarity.name}
                                  </Badge>
                                )}
                                {dailyCase.precase.price !== undefined && (
                                  <p className="text-xs text-green-600 font-medium mt-1">
                                    ${dailyCase.precase.price.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <p className="text-sm text-muted-foreground">
                              Item ID: {dailyCase.id}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          <div>Claimed: {formatDate(dailyCase.claimData)}</div>
                          {dailyCase.receivedData && (
                            <div>
                              Received: {formatDate(dailyCase.receivedData)}
                            </div>
                          )}
                        </div>
                      </div>
                      {!dailyCase.active && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleToggleDailyCase(
                              user._id,
                              dailyCase.id,
                              !dailyCase.active
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
                    <p className="text-sm">No daily cases assigned</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          
          {loadingUserDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading user details...</span>
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {selectedUser.image ? (
                  <Image
                    src={selectedUser.image}
                    alt={selectedUser.name || selectedUser.username || "User"}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-medium text-gray-600 dark:text-gray-300">
                      {(selectedUser.name || selectedUser.username || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedUser.name || selectedUser.username || "Unknown User"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedUser.email}</span>
                  </div>
                  {selectedUser.username && selectedUser.name && (
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">@{selectedUser.username}</span>
                    </div>
                  )}
                  {selectedUser.role && (
                    <Badge variant="outline" className="mt-2">
                      {selectedUser.role}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Game Statistics */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Game Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.gamesPlayed || 0}</div>
                    <div className="text-sm text-muted-foreground">Games Played</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedUser.ticket || 0}</div>
                    <div className="text-sm text-muted-foreground">Tickets Won</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedUser.bestStreak || 0}</div>
                    <div className="text-sm text-muted-foreground">Best Streak</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedUser.winRate || 0}%</div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                    <div className="text-2xl font-bold text-yellow-600">{selectedUser.currentStreak || 0}</div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedUser.score || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Score</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Steam Information */}
              {(selectedUser.steamId || selectedUser.tradeLink) && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Steam Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.steamId && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-sm font-medium">Steam ID</p>
                        <p className="text-sm text-muted-foreground">{selectedUser.steamId}</p>
                      </div>
                    )}
                    {selectedUser.tradeLink && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-sm font-medium">Trade Link</p>
                        <div className="flex items-center gap-2">
                          <a
                            href={selectedUser.tradeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Trade Link
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Crypto Addresses */}
              {selectedUser.cryptoAddresses && (selectedUser.cryptoAddresses.bitcoin || selectedUser.cryptoAddresses.ethereum) && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Crypto Addresses
                  </h4>
                  <div className="space-y-3">
                    {selectedUser.cryptoAddresses.bitcoin && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-sm font-medium mb-2">Bitcoin (BTC)</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground font-mono break-all">
                            {selectedUser.cryptoAddresses.bitcoin}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() => copyToClipboard(selectedUser.cryptoAddresses!.bitcoin!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {selectedUser.cryptoAddresses.ethereum && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-sm font-medium mb-2">Ethereum (ETH)</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground font-mono break-all">
                            {selectedUser.cryptoAddresses.ethereum}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() => copyToClipboard(selectedUser.cryptoAddresses!.ethereum!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Daily Cases */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Daily Cases</h4>
                {selectedUser.dailyCase && selectedUser.dailyCase.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.dailyCase.map((dailyCase, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={dailyCase.active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {dailyCase.active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm font-medium">
                              Case #{index + 1}
                            </span>
                          </div>
                          {!dailyCase.active && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                handleToggleDailyCase(
                                  selectedUser._id,
                                  dailyCase.id,
                                  !dailyCase.active
                                )
                              }
                              disabled={updatingUsers.has(selectedUser._id)}
                            >
                              {updatingUsers.has(selectedUser._id) ? (
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

                        {/* Item Details */}
                        {dailyCase.precase ? (
                          <div className="flex items-start gap-4">
                            {dailyCase.precase.image && (
                              <Image
                                src={dailyCase.precase.image}
                                alt={dailyCase.precase.name}
                                width={120}
                                height={120}
                                className="w-30 h-30 object-contain rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                {dailyCase.precase.name}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {dailyCase.precase.weapon?.name} • {dailyCase.precase.category?.name}
                              </p>
                              {dailyCase.precase.rarity && (
                                <Badge
                                  className="text-xs mt-2"
                                  style={{
                                    backgroundColor: dailyCase.precase.rarity.color || "#b0c3d9",
                                    color: dailyCase.precase.rarity.color === "#b0c3d9" ? "#000" : "#fff",
                                  }}
                                >
                                  {dailyCase.precase.rarity.name}
                                </Badge>
                              )}
                              {dailyCase.precase.price !== undefined && (
                                <p className="text-sm text-green-600 font-medium mt-2">
                                  ${dailyCase.precase.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Item ID: {dailyCase.id}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-muted-foreground">
                          <div>Claimed: {formatDate(dailyCase.claimData)}</div>
                          {dailyCase.receivedData && (
                            <div>Received: {formatDate(dailyCase.receivedData)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No daily cases assigned</p>
                  </div>
                )}
              </div>

              {/* Weekly Prizes */}
              {selectedUser.weeklyPrize && selectedUser.weeklyPrize.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Weekly Prizes</h4>
                  <div className="space-y-3">
                    {selectedUser.weeklyPrize.map((weeklyPrize, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={weeklyPrize.active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {weeklyPrize.active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm font-medium">
                              Prize #{index + 1}
                            </span>
                          </div>
                        </div>

                        {/* Prize Details */}
                        {weeklyPrize.weeklyPrize ? (
                          <div className="flex items-start gap-4">
                            {weeklyPrize.weeklyPrize.image && (
                              <Image
                                src={weeklyPrize.weeklyPrize.image}
                                alt={weeklyPrize.weeklyPrize.name}
                                width={120}
                                height={120}
                                className="w-30 h-30 object-contain rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                {weeklyPrize.weeklyPrize.name}
                              </h5>
                              {weeklyPrize.weeklyPrize.rarity && (
                                <Badge
                                  className="text-xs mt-2"
                                  style={{
                                    backgroundColor: weeklyPrize.weeklyPrize.rarity.color || "#b0c3d9",
                                    color: weeklyPrize.weeklyPrize.rarity.color === "#b0c3d9" ? "#000" : "#fff",
                                  }}
                                >
                                  {weeklyPrize.weeklyPrize.rarity.name}
                                </Badge>
                              )}
                              {weeklyPrize.weeklyPrize.price !== undefined && (
                                <p className="text-sm text-green-600 font-medium mt-2">
                                  ${weeklyPrize.weeklyPrize.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Prize ID: {weeklyPrize.id}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-muted-foreground">
                          <div>Week: {formatDate(weeklyPrize.weekStartDate)} - {formatDate(weeklyPrize.weekEndDate)}</div>
                          <div>Claimed: {formatDate(weeklyPrize.claimData)}</div>
                          {weeklyPrize.receivedData && (
                            <div>Received: {formatDate(weeklyPrize.receivedData)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUser.createdAt && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm font-medium">Created At</p>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  )}
                  {selectedUser.updatedAt && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedUser.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTab;
