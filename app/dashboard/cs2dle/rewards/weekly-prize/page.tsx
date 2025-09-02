import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemsTab from "./components/ItemsTab";
import UsersTab from "./components/UsersTab";

const WeeklyPrize = () => { 
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

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 md:w-1/2 mx-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        
        <TabsContent value="items">
          <ItemsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeeklyPrize;
