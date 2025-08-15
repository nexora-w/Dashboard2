"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gamepad2,
  Palette,
  Puzzle,
  DollarSign,
  TrendingUp,
  Trophy,
  Users,
  Clock,
} from "lucide-react";

interface OverviewData {
  today: {
    games: number;
    visitors: number;
    gamesChange: string;
    visitorsChange: string;
  };
  total: {
    games: number;
    visitors: number;
  };
  gameTypes: Array<{
    type: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    games: number;
    visitors: number;
  }>;
}

// Skeleton component that matches the exact structure
const OverviewSkeleton = () => {
  const games = [
    {
      id: "GuessSkin",
      title: "Guess the Skin",
      icon: Palette,
      gameType: "GuessSkin",
      image: "/images/cs2dle/games/guess-the-skin.png",
      gradient: {
        primary: "#0062FF",
        secondary: "#4A90E2",
        accent: "#1E3A8A",
        overlay: "rgba(0, 98, 255, 0.15)",
      },
    },
    {
      id: "EmojiPuzzle",
      title: "Emoji Puzzle",
      icon: Puzzle,
      gameType: "EmojiPuzzle",
      image: "/images/cs2dle/games/emoji-puzzle.png",
      gradient: {
        primary: "#FF9900",
        secondary: "#FFB84D",
        accent: "#E67E00",
        overlay: "rgba(255, 153, 0, 0.15)",
      },
    },
    {
      id: "GuessPrice",
      title: "Guess the Price",
      icon: DollarSign,
      gameType: "GuessPrice",
      image: "/images/cs2dle/games/guess-the-price.png",
      gradient: {
        primary: "#C800FF",
        secondary: "#D633FF",
        accent: "#A500CC",
        overlay: "rgba(200, 0, 255, 0.15)",
      },
    },
    {
      id: "HigherLower",
      title: "Higher or Lower",
      icon: TrendingUp,
      gameType: "HigherLower",
      image: "/images/cs2dle/games/higher-or-lower.png",
      gradient: {
        primary: "#1BE700",
        secondary: "#4CEB2E",
        accent: "#16B800",
        overlay: "rgba(27, 231, 0, 0.15)",
      },
    },
  ];

  const stats = [
    { label: "Total Visitors", icon: Users },
    { label: "Games Played", icon: Gamepad2 },
    { label: "Today's Games", icon: Trophy },
    { label: "Today's Visitors", icon: Clock },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Image
            src="/images/cs2dle/logo.png"
            alt="CS2DLE Logo"
            width={200}
            height={200}
            className=""
          />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border shadow-sm border-gray-200 rounded-none dark:border-slate-800/50 backdrop-blur-sm"
            >
              <CardContent className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <Skeleton className="h-8 w-20 mt-1" />
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-700">
                    <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Games Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white/75 mb-6">
            Available Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="group hover:shadow-xl transition-all
                rounded-none duration-300 border gray-200 dark:border-slate-800/70 backdrop-blur-sm overflow-hidden
                dark:shadow-[0_0_0_5px_rgba(0,0,0,0.3)] shadow-[0_0_0_5px_rgb(30, 41, 59,0.8)]
                hover:border-opacity-50"
                style={{
                  borderColor: `${game.gradient.primary}40`,
                }}
              >
                <CardHeader className="mb-4 !p-0">
                  <div className="h-[120px] overflow-hidden flex items-center justify-center relative group">
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={game.image}
                        alt={game.title}
                        width={256}
                        height={107}
                        className="w-full h-full object-cover z-10 blur-[8px] scale-110"
                        quality={100}
                        priority={false}
                      />
                      {/* Enhanced gradient overlay with perfect color matching */}
                      <div
                        className="absolute inset-0 z-10"
                        style={{
                          background: `
                            radial-gradient(circle at 30% 30%, ${game.gradient.primary}40 0%, transparent 50%),
                            radial-gradient(circle at 70% 70%, ${game.gradient.secondary}30 0%, transparent 50%),
                            linear-gradient(135deg, ${game.gradient.overlay} 0%, transparent 100%)
                          `,
                        }}
                      />
                      {/* Additional color accent */}
                      <div
                        className="absolute inset-0 z-15 opacity-20"
                        style={{
                          background: `linear-gradient(45deg, ${game.gradient.accent}20 0%, transparent 50%)`,
                        }}
                      />
                    </div>
                    <Image
                      src={game.image}
                      alt={game.title}
                      width={240}
                      height={112}
                      className="w-full h-full object-contain relative z-20 transition-all duration-300 group-hover:scale-101 group-hover:drop-shadow-lg"
                      style={{
                        filter: `drop-shadow(0 4px 8px ${game.gradient.primary}30)`,
                      }}
                      quality={95}
                      priority={false}
                    />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-center py-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {game.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="text-center p-3 transition-colors duration-200"
                      style={{
                        backgroundColor: `${game.gradient.primary}08`,
                        border: `1px solid ${game.gradient.primary}20`,
                      }}
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Games
                      </p>
                      <Skeleton className="h-5 w-12 mx-auto mt-1" />
                    </div>
                    <div
                      className="text-center p-3 transition-colors duration-200"
                      style={{
                        backgroundColor: `${game.gradient.secondary}08`,
                        border: `1px solid ${game.gradient.secondary}20`,
                      }}
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Percentage
                      </p>
                      <Skeleton className="h-5 w-12 mx-auto mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const OverviewPage = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cs2dle/overview');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const games = [
    {
      id: "GuessSkin",
      title: "Guess the Skin",
      icon: Palette,
      gameType: "GuessSkin",
      image: "/images/cs2dle/games/guess-the-skin.png",
      gradient: {
        primary: "#0062FF",
        secondary: "#4A90E2",
        accent: "#1E3A8A",
        overlay: "rgba(0, 98, 255, 0.15)",
      },
    },
    {
      id: "EmojiPuzzle",
      title: "Emoji Puzzle",
      icon: Puzzle,
      gameType: "EmojiPuzzle",
      image: "/images/cs2dle/games/emoji-puzzle.png",
      gradient: {
        primary: "#FF9900",
        secondary: "#FFB84D",
        accent: "#E67E00",
        overlay: "rgba(255, 153, 0, 0.15)",
      },
    },
    {
      id: "GuessPrice",
      title: "Guess the Price",
      icon: DollarSign,
      gameType: "GuessPrice",
      image: "/images/cs2dle/games/guess-the-price.png",
      gradient: {
        primary: "#C800FF",
        secondary: "#D633FF",
        accent: "#A500CC",
        overlay: "rgba(200, 0, 255, 0.15)",
      },
    },
    {
      id: "HigherLower",
      title: "Higher or Lower",
      icon: TrendingUp,
      gameType: "HigherLower",
      image: "/images/cs2dle/games/higher-or-lower.png",
      gradient: {
        primary: "#1BE700",
        secondary: "#4CEB2E",
        accent: "#16B800",
        overlay: "rgba(27, 231, 0, 0.15)",
      },
    },
  ];

  const getGameData = (gameType: string) => {
    if (!data) return { games: "0", percentage: "0%" };
    
    const gameData = data.gameTypes?.find(g => g.type === gameType);
    const totalGames = data.total?.games || 0;
    
    return {
      games: gameData ? gameData.count.toLocaleString() : "0",
      percentage: gameData && totalGames > 0 ? `${((gameData.count / totalGames) * 100).toFixed(1)}%` : "0%"
    };
  };

  const stats = [
    { 
      label: "Total Visitors", 
      value: data?.total?.visitors ? data.total.visitors.toLocaleString() : "0", 
      icon: Users 
    },
    { 
      label: "Games Played", 
      value: data?.total?.games ? data.total.games.toLocaleString() : "0", 
      icon: Gamepad2 
    },
    { 
      label: "Today's Games", 
      value: data?.today?.games ? data.today.games.toLocaleString() : "0", 
      icon: Trophy 
    },
    { 
      label: "Today's Visitors", 
      value: data?.today?.visitors ? data.today.visitors.toLocaleString() : "0", 
      icon: Clock 
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  // Show skeleton while loading
  if (loading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Image
            src="/images/cs2dle/logo.png"
            alt="CS2DLE Logo"
            width={200}
            height={200}
            className=""
          />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border shadow-sm border-gray-200 rounded-none dark:border-slate-800/50 backdrop-blur-sm"
            >
              <CardContent className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-700">
                    <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Games Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white/75 mb-6">
            Available Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => {
              const gameData = getGameData(game.gameType);
              return (
                <Card
                  key={game.id}
                  className="group hover:shadow-xl transition-all
                  rounded-none duration-300 border gray-200 dark:border-slate-800/70 backdrop-blur-sm overflow-hidden
                  dark:shadow-[0_0_0_5px_rgba(0,0,0,0.3)] shadow-[0_0_0_5px_rgb(30, 41, 59,0.8)]
                  hover:border-opacity-50"
                  style={{
                    borderColor: `${game.gradient.primary}40`,
                  }}
                >
                  <CardHeader className="mb-4 !p-0">
                    <div className="h-[120px] overflow-hidden flex items-center justify-center relative group">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={game.image}
                          alt={game.title}
                          width={256}
                          height={107}
                          className="w-full h-full object-cover z-10 blur-[8px] scale-110"
                          quality={100}
                          priority={false}
                        />
                        {/* Enhanced gradient overlay with perfect color matching */}
                        <div
                          className="absolute inset-0 z-10"
                          style={{
                            background: `
                              radial-gradient(circle at 30% 30%, ${game.gradient.primary}40 0%, transparent 50%),
                              radial-gradient(circle at 70% 70%, ${game.gradient.secondary}30 0%, transparent 50%),
                              linear-gradient(135deg, ${game.gradient.overlay} 0%, transparent 100%)
                            `,
                          }}
                        />
                        {/* Additional color accent */}
                        <div
                          className="absolute inset-0 z-15 opacity-20"
                          style={{
                            background: `linear-gradient(45deg, ${game.gradient.accent}20 0%, transparent 50%)`,
                          }}
                        />
                      </div>
                      <Image
                        src={game.image}
                        alt={game.title}
                        width={240}
                        height={112}
                        className="w-full h-full object-contain relative z-20 transition-all duration-300 group-hover:scale-101 group-hover:drop-shadow-lg"
                        style={{
                          filter: `drop-shadow(0 4px 8px ${game.gradient.primary}30)`,
                        }}
                        quality={95}
                        priority={false}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-center py-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {game.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="text-center p-3 transition-colors duration-200"
                        style={{
                          backgroundColor: `${game.gradient.primary}08`,
                          border: `1px solid ${game.gradient.primary}20`,
                        }}
                      >
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Games
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {gameData.games}
                        </p>
                      </div>
                      <div
                        className="text-center p-3 transition-colors duration-200"
                        style={{
                          backgroundColor: `${game.gradient.secondary}08`,
                          border: `1px solid ${game.gradient.secondary}20`,
                        }}
                      >
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Percentage
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {gameData.percentage}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
