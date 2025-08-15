import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";

const LeaderboardSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Logo */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Image 
          src="/images/cs2dle/logo.png" 
          alt="CS2DLE Logo" 
          width={300} 
          height={300} 
        />
      </div>
      
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header Skeleton */}
          <div className="border-b border-border pb-3 mb-4">
            <div className="grid grid-cols-7 gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 items-center py-3 border-b border-border/50 last:border-b-0">
                {/* Rank */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-8" />
                </div>
                
                {/* Player */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                
                {/* Best Streak */}
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-12" />
                </div>
                
                {/* Current Streak */}
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-12" />
                </div>
                
                {/* Games Played */}
                <div className="flex justify-center">
                  <Skeleton className="h-4 w-8" />
                </div>
                
                {/* Tickets */}
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-12" />
                </div>
                
                {/* Best Prize */}
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8" />
                ))}
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardSkeleton;
