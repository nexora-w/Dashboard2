import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DailyCaseClient from "./components/DailyCaseClient";

const DailyCase = () => { 
  return (
    <div className="mx-auto px-12">
      {/* Back button */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/cs2dle/games">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>
      </div>

      {/* Header with Logo and Case Image */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <Image
          src="/images/cs2dle/logo.png"
          alt="CS2DLE Logo"
          width={300}
          height={300}
        />
      </div>

      <DailyCaseClient />
    </div>
  );
};

export default DailyCase;
