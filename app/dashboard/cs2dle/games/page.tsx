import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

const games = [
  {
    id: "guess-the-skin",
    title: "Guess the Skin",
    description: "Identify CS2 weapon skins from images",
    image: "/images/cs2dle/games/guess-the-skin.png",
    href: "/dashboard/cs2dle/games/guess-the-skin",
    status: "active",
    gradient: {
      primary: "#0062FF",
      secondary: "#4A90E2",
      accent: "#1E3A8A",
      overlay: "rgba(0, 98, 255, 0.15)",
    },
  },
  {
    id: "emoji-puzzle",
    title: "Emoji Puzzle",
    description: "Solve CS2-related emoji puzzles",
    image: "/images/cs2dle/games/emoji-puzzle.png",
    href: "/dashboard/cs2dle/games/emoji-puzzle",
    status: "active",
    gradient: {
      primary: "#FF9900",
      secondary: "#FFB84D",
      accent: "#E67E00",
      overlay: "rgba(255, 153, 0, 0.15)",
    },
  },
  {
    id: "Wordle",
    title: "Wordle",
    description: "Guess the word of the day",
    image: "/images/cs2dle/games/wordle.png",
    href: "/dashboard/cs2dle/games/wordle",
    status: "active",
    gradient: {
      primary: "#E70000",
      secondary: "#FF0000",
      accent: "#FF0000",
      overlay: "rgba(255, 0, 0, 0.15)",
    },
  },
  {
    id: "guess-the-price",
    title: "Guess the Price",
    description: "Predict the market price of CS2 items",
    image: "/images/cs2dle/games/guess-the-price.png",
    href: "/dashboard/cs2dle/games/guess-the-price",
    status: "coming-soon",
    gradient: {
      primary: "#C800FF",
      secondary: "#D633FF",
      accent: "#A500CC",
      overlay: "rgba(200, 0, 255, 0.15)",
    },
  },
  {
    id: "higher-or-lower",
    title: "Higher or Lower",
    description: "Guess if the next item is higher or lower in value",
    image: "/images/cs2dle/games/higher-or-lower.png",
    href: "/dashboard/cs2dle/games/higher-or-lower",
    status: "coming-soon",
    gradient: {
      primary: "#1BE700",
      secondary: "#4CEB2E",
      accent: "#16B800",
      overlay: "rgba(27, 231, 0, 0.15)",
    },
  },
];

const rewards = [
  {
    id: "daily-case",
    title: "Daily Case",
    description: "Set up daily cases for your users",
    image: "/images/cs2dle/rewards/case.webp",
    href: "/dashboard/cs2dle/rewards/daily-case",
    status: "active",
    gradient: {
      primary: "#FF6B35",
      secondary: "#FF8A5C",
      accent: "#E55A2B",
      overlay: "rgba(255, 107, 53, 0.15)",
    },
  },
  {
    id: "weekly-prizes",
    title: "Weekly Prizes",
    description: "Set up weekly prizes for your users",
    image: "/images/cs2dle/rewards/weekly.webp",
    href: "/dashboard/cs2dle/rewards/weekly-prize",
    status: "active",
    gradient: {
      primary: "#9C27B0",
      secondary: "#BA68C8",
      accent: "#7B1FA2",
      overlay: "rgba(156, 39, 176, 0.15)",
    },
  },
];

export default function GamesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center gap-4 mb-8">
        <Image
          src="/images/cs2dle/logo.png"
          alt="CS2DLE Logo"
          width={300}
          height={300}
          className=""
        />
      </div>
      <div className="flex flex-col gap-10">
        <div className="w-full">
          <div className="w-full mb-5">
            <h1 className="text-3xl font-bold tracking-tight w-full mb-2">
              Games
            </h1>
            <p className="text-muted-foreground w-full">
              Configure the correct answers for each puzzle game
            </p>
          </div>

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

                  {game.status === "active" ? (
                    <Link
                      href={game.href}
                      className="inline-flex text-white items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                      style={{
                        backgroundColor: game.gradient.primary,
                        borderColor: game.gradient.primary,
                      }}
                    >
                      Setting
                    </Link>
                  ) : (
                    <div
                      className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full cursor-not-allowed opacity-50"
                      style={{
                        backgroundColor: game.gradient.secondary,
                        borderColor: game.gradient.secondary,
                        color: "white",
                      }}
                    >
                      Coming Soon
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="w-full">
          <div className="w-full mb-5">
            <h1 className="text-3xl font-bold tracking-tight w-full mb-2">
              Daily Case & Weekly Prizes
            </h1>
            <p className="text-muted-foreground w-full">
              Set up daily cases and weekly prizes for your users
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewards.map((reward) => (
              <Card
                key={reward.id}
                className="group hover:shadow-xl transition-all
            rounded-none duration-300 border gray-200 dark:border-slate-800/70 backdrop-blur-sm overflow-hidden
            dark:shadow-[0_0_0_5px_rgba(0,0,0,0.3)] shadow-[0_0_0_5px_rgb(30, 41, 59,0.8)]
            hover:border-opacity-50"
                style={{
                  borderColor: `${reward.gradient.primary}40`,
                }}
              >
                <CardHeader className="mb-4 !p-0">
                  <div className="h-[120px] overflow-hidden flex items-center justify-center relative group">
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={reward.image}
                        alt={reward.title}
                        width={256}
                        height={107}
                        className="w-full h-full object-cover z-10 blur-[8px] scale-110"
                        quality={100}
                        priority={false}
                      />
                      <div
                        className="absolute inset-0 z-10"
                        style={{
                          background: `
                              radial-gradient(circle at 30% 30%, ${reward.gradient.primary}40 0%, transparent 50%),
                              radial-gradient(circle at 70% 70%, ${reward.gradient.secondary}30 0%, transparent 50%),
                              linear-gradient(135deg, ${reward.gradient.overlay} 0%, transparent 100%)
                            `,
                        }}
                      />
                      <div
                        className="absolute inset-0 z-15 opacity-20"
                        style={{
                          background: `linear-gradient(45deg, ${reward.gradient.accent}20 0%, transparent 50%)`,
                        }}
                      />
                    </div>
                    <Image
                      src={reward.image}
                      alt={reward.title}
                      width={240}
                      height={112}
                      className="w-full h-full object-contain relative z-20 transition-all duration-300 group-hover:scale-101 group-hover:drop-shadow-lg"
                      style={{
                        filter: `drop-shadow(0 4px 8px ${reward.gradient.primary}30)`,
                      }}
                      quality={95}
                      priority={false}
                    />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-center py-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {reward.title}
                    </h3>
                  </div>

                  {reward.status === "active" ? (
                    <Link
                      href={reward.href}
                      className="text-white inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                      style={{
                        backgroundColor: reward.gradient.primary,
                        borderColor: reward.gradient.primary,
                      }}
                    >
                      Setting
                    </Link>
                  ) : (
                    <div
                      className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full cursor-not-allowed opacity-50"
                      style={{
                        backgroundColor: reward.gradient.secondary,
                        borderColor: reward.gradient.secondary,
                        color: "white",
                      }}
                    >
                      Coming Soon
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
