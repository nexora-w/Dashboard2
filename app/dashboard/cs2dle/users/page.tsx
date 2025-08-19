"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  Mail,
  Calendar,
  Globe,
  Gamepad2,
} from "lucide-react";
import { User } from "@/types/user";
import { formatDistanceToNow, format } from "date-fns";
import { ProviderIcon } from "@/components/ProviderIcon";
import Image from "next/image";
import ExportButton from "./content/ExportButton";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: PaginationInfo;
}

const UsersPage = () => {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/cs2dle/users/all?page=${page}&limit=10`
      );
      const result: UsersResponse = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError("Failed to fetch users data");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
      console.error("Users fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border animate-pulse"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchUsers(currentPage)}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
      <ExportButton />
      <Card className="rounded-none bg-transparent">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.data.map((user) => {
              const userId = user._id?.toString() || user.email;
              const isExpanded = expandedUsers.has(userId);

              return (
                <Collapsible
                  key={userId}
                  open={isExpanded}
                  onOpenChange={() => toggleUserExpansion(userId)}
                >
                  <div className="border hover:bg-muted/50 transition-colors">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>
                              {getInitials(
                                user.name || user.username || "User"
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-lg">
                                {user.name || user.username || "Anonymous"}
                              </div>
                              {user.username &&
                                user.name &&
                                user.username !== user.name && (
                                  <Badge variant="outline" className="text-xs">
                                    @{user.username}
                                  </Badge>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              {user.email}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {user.createdAt && (
                                <span>
                                  Joined{" "}
                                  {formatDistanceToNow(
                                    new Date(user.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              )}
                              {user.updatedAt && (
                                <span>
                                  • Last seen{" "}
                                  {formatDistanceToNow(
                                    new Date(user.updatedAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            {user.provider && (
                              <Badge
                                variant="secondary"
                                className="capitalize flex items-center gap-1"
                              >
                                <ProviderIcon
                                  provider={user.provider}
                                  size={14}
                                />
                                {user.provider}
                              </Badge>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t bg-muted/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                          {/* Basic Information */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Basic Information
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Name:</span>
                                <span>{user.name || "Not provided"}</span>
                              </div>
                              {user.username && (
                                <div className="flex items-center gap-2 text-sm">
                                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Username:</span>
                                  <span>@{user.username}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Email:</span>
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </div>

                          {/* Authentication & Provider Info */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Authentication & Provider
                            </h4>
                            <div className="space-y-2">
                              {user.provider && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Provider:</span>
                                  <Badge
                                    variant="secondary"
                                    className="capitalize flex items-center gap-1"
                                  >
                                    <ProviderIcon
                                      provider={user.provider}
                                      size={14}
                                    />
                                    {user.provider}
                                  </Badge>
                                </div>
                              )}
                              {user.providerId && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">
                                    Provider ID:
                                  </span>
                                  <span className="text-xs text-muted-foreground break-all">
                                    {user.providerId}
                                  </span>
                                </div>
                              )}
                              {user.steamId && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Steam ID:</span>
                                  <span>{user.steamId}</span>
                                </div>
                              )}
                              {user.password && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">Password:</span>
                                  <span className="text-xs text-muted-foreground">
                                    ••••••••
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status & Timestamps */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Status & Timestamps
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">
                                  Online Status:
                                </span>
                                {user.isOnline ? (
                                  <Badge
                                    variant="default"
                                    className="bg-green-500 text-white"
                                  >
                                    Online
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Offline</Badge>
                                )}
                              </div>
                              {user.createdAt && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Created:</span>
                                  <span>
                                    {format(new Date(user.createdAt), "PPP")}
                                  </span>
                                </div>
                              )}
                              {user.updatedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    Last seen:
                                  </span>
                                  <span>
                                    {format(new Date(user.updatedAt), "PPP")}
                                  </span>
                                </div>
                              )}
                              {user._id && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">User ID:</span>
                                  <span className="text-xs text-muted-foreground break-all">
                                    {user._id.toString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Game Statistics */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Player Statistics
                            </h4>
                            <div className="space-y-2">
                              <p>Best Streak: {user.bestStreak || 0}</p>
                              <p>Current Streak: {user.currentStreak || 0}</p>
                              <p>Games Played: {user.gamesPlayed || 0}</p>
                              <p>Tickets: {user.ticket || 0}</p>
                            </div>
                          </div>

                          {/* Trade & Crypto Information */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Trade & Crypto
                            </h4>
                            <div className="space-y-2">
                              {user.tradeLink && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">Trade Link:</span>
                                  <a
                                    href={user.tradeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline break-all"
                                  >
                                    {user.tradeLink}
                                  </a>
                                </div>
                              )}
                              {user.cryptoAddresses && (
                                <>
                                  {user.cryptoAddresses.bitcoin && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">Bitcoin:</span>
                                      <span className="text-xs text-muted-foreground break-all font-mono">
                                        {user.cryptoAddresses.bitcoin}
                                      </span>
                                    </div>
                                  )}
                                  {user.cryptoAddresses.ethereum && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">Ethereum:</span>
                                      <span className="text-xs text-muted-foreground break-all font-mono">
                                        {user.cryptoAddresses.ethereum}
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>

          {/* Pagination */}
          {data?.pagination.totalPages && data.pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (data.pagination.hasPrevPage) {
                          setCurrentPage(data.pagination.page - 1);
                        }
                      }}
                      className={
                        !data.pagination.hasPrevPage
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: Math.min(5, data.pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                            }}
                            isActive={pageNum === data.pagination.page}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  {data.pagination.totalPages > 5 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (data.pagination.hasNextPage) {
                          setCurrentPage(data.pagination.page + 1);
                        }
                      }}
                      className={
                        !data.pagination.hasNextPage
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
