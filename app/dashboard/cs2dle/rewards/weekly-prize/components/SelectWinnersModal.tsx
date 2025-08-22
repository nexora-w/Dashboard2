"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Users,
  Trophy,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { WeeklyPrize } from "./ItemsTab";

interface User {
  _id: string;
  email: string;
  name?: string;
  username?: string;
  image?: string;
  steamId?: string;
  ticket?: number;
  bestStreak?: number;
  currentStreak?: number;
  gamesPlayed?: number;
}

interface SelectWinnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyPrize: WeeklyPrize | null;
  onSuccess?: () => void;
}

const SelectWinnersModal = ({
  isOpen,
  onClose,
  weeklyPrize,
  onSuccess,
}: SelectWinnersModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTopUsers();
      setSelectedUser("");
    }
  }, [isOpen]);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch top 10 users sorted by best streak and games played
      const response = await fetch('/api/cs2dle/users/all?limit=10');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Sort users by best streak (desc) and games played (desc)
        const sortedUsers = (result.data || []).sort((a: User, b: User) => {
          const aStreak = a.bestStreak || 0;
          const bStreak = b.bestStreak || 0;
          const aGames = a.gamesPlayed || 0;
          const bGames = b.gamesPlayed || 0;
          
          if (bStreak !== aStreak) {
            return bStreak - aStreak;
          }
          return bGames - aGames;
        });
        
        setUsers(sortedUsers.slice(0, 10)); // Ensure only top 10
      } else {
        throw new Error(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError("Error loading users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleAwardPrize = async () => {
    if (!weeklyPrize || !selectedUser) return;

    setAwarding(true);

    try {
      const response = await fetch('/api/cs2dle/rewards/weekly-prize/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          weeklyPrizeId: weeklyPrize._id,
          weekStartDate: weeklyPrize.weekStartDate,
          weekEndDate: weeklyPrize.weekEndDate,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const selectedUserData = users.find(user => user._id === selectedUser);
        const userName = formatUserDisplayName(selectedUserData!);
        
        toast({
          title: "Prize Awarded!",
          description: `Successfully awarded prize to ${userName}`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to award prize. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error awarding prize:', error);
      toast({
        title: "Error",
        description: "An error occurred while awarding the prize.",
        variant: "destructive",
      });
    } finally {
      setAwarding(false);
    }
  };

  const formatUserDisplayName = (user: User) => {
    return user.name || user.username || user.email.split('@')[0] || 'Unknown User';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Select Winner - {weeklyPrize?.name}
          </DialogTitle>
          <DialogDescription>
            Choose one user from the top 10 performers to award the weekly prize. 
            Users are ranked by best streak and games played.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Top 10 Users {selectedUser && `(${users.find(u => u._id === selectedUser)?.name || users.find(u => u._id === selectedUser)?.username || 'User'} selected)`}
                </span>
              </div>

              <RadioGroup value={selectedUser} onValueChange={handleUserSelect}>
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div
                      key={user._id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                        selectedUser === user._id 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <RadioGroupItem
                        value={user._id}
                        id={user._id}
                      />

                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      {index < 3 && (
                        <Trophy 
                          className={`h-4 w-4 ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 
                            'text-orange-600'
                          }`} 
                        />
                      )}
                    </div>

                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={formatUserDisplayName(user)}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {formatUserDisplayName(user)[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {formatUserDisplayName(user)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      {user.steamId && (
                        <p className="text-xs text-gray-400">
                          Steam ID: {user.steamId}
                        </p>
                      )}
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Streak: {user.bestStreak || 0}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Games: {user.gamesPlayed || 0}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </RadioGroup>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500">No users available to select.</p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={awarding}>
            Cancel
          </Button>
          <Button
            onClick={handleAwardPrize}
            disabled={!selectedUser || awarding || !weeklyPrize}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {awarding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Awarding...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Award Prize
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectWinnersModal;
