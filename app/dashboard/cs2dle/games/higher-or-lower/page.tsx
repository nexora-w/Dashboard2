import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HigherOrLowerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cs2dle/games">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative w-64 h-64">
          <Image
            src="/images/cs2dle/games/higher-or-lower.png"
            alt="Higher or Lower"
            fill
            className="object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Coming Soon
            </Badge>
          </div>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Higher or Lower</CardTitle>
            <CardDescription>
              Guess if the next item is higher or lower in value
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This game is currently under development. Check back soon!
            </p>
            <Link href="/dashboard/cs2dle/games">
              <Button>
                Back to Games
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
