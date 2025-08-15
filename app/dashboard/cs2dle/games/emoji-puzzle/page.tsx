"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, Loader2, PlusIcon, ArrowLeft } from "lucide-react";
import { format, isAfter, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GameAnswer, Skin } from "@/types/cs2dle/games/guess-skin";


const GuessTheSkin = () => {
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<{
    skin: Skin;
    gameData: any;
    date: string;
  } | null>(null);
  const [editingSkin, setEditingSkin] = useState<{
    answerId: string;
    skin: Skin;
    gameType: string;
    date: string;
  } | null>(null);
  const [editForm, setEditForm] = useState<Partial<Skin>>({});
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editSearchQuery, setEditSearchQuery] = useState("");
  const [editSearchResults, setEditSearchResults] = useState<any[]>([]);
  const [isEditSearching, setIsEditSearching] = useState(false);
  const [selectedSkinForEdit, setSelectedSkinForEdit] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create answer modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSkinForCreate, setSelectedSkinForCreate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "/api/cs2dle/games/answers?gameType=GuessSkin"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch answers");
        }

        const data = await response.json();
        setAnswers(data.answers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to check if a date is editable (future dates only)
  const isDateEditable = (dateString: string) => {
    const amsterdamTimeZone = "Europe/Amsterdam";
    const answerDate = toZonedTime(new Date(dateString), amsterdamTimeZone);
    const todayInAmsterdam = toZonedTime(new Date(), amsterdamTimeZone);
    const startOfToday = startOfDay(todayInAmsterdam);
    
    return isAfter(answerDate, startOfToday);
  };

  // Helper function to check if a date already has an answer
  const isDateAlreadyTaken = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return answers.some(answer => answer.date === dateString);
  };

  const handleEdit = (answer: GameAnswer, skin: Skin) => {
    // Check if the date is editable (future dates only)
    if (!isDateEditable(answer.date)) {
      toast({
        title: "Cannot Edit",
        description: "Answers from today and earlier cannot be edited. Only future dates are editable.",
        variant: "destructive",
      });
      return;
    }

    const gameData =
      answer.answers["GuessSkin"] || Object.values(answer.answers)[0];

    const gameType =
      Object.keys(answer.answers).find(
        (key) => answer.answers[key]?.skinId === skin.id
      ) || "GuessSkin";

    setEditingSkin({
      answerId: answer._id!,
      skin,
      gameType,
      date: answer.date,
    });
    setEditForm(skin);
    setEditDate(new Date(answer.date));
    setSelectedSkinForEdit(skin);
  };

  const handleSaveEdit = async () => {
    if (!editingSkin || !editDate || !selectedSkinForEdit) {
      toast({
        title: "Error",
        description: "Please select both a date and a skin",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEditing(true);

      const formattedDate = format(editDate, "yyyy-MM-dd");

      const response = await fetch(
        `/api/cs2dle/games/answers/${editingSkin.answerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: formattedDate,
            answers: {
              [editingSkin.gameType]: {
                skinId: selectedSkinForEdit.id,
                skin: {
                  id: selectedSkinForEdit.id,
                  name: selectedSkinForEdit.name,
                  description: selectedSkinForEdit.description || "",
                  image: selectedSkinForEdit.image || "",
                  weapon:
                    selectedSkinForEdit.weapon?.name ||
                    selectedSkinForEdit.weapon ||
                    "",
                  category:
                    selectedSkinForEdit.category?.name ||
                    selectedSkinForEdit.category ||
                    "",
                  pattern:
                    selectedSkinForEdit.pattern?.name ||
                    selectedSkinForEdit.pattern ||
                    "",
                  rarity: selectedSkinForEdit.rarity || {
                    id: "unknown",
                    name: "Unknown",
                    color: "#b0c3d9",
                  },
                  team:
                    selectedSkinForEdit.team?.name ||
                    selectedSkinForEdit.team ||
                    "",
                  stattrak: selectedSkinForEdit.stattrak || false,
                  souvenir: selectedSkinForEdit.souvenir || false,
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update skin");
      }

      // Refresh the answers list
      const refreshResponse = await fetch(
        "/api/cs2dle/games/answers?gameType=GuessSkin"
      );
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAnswers(data.answers || []);
      }

      setEditingSkin(null);
      setEditForm({});
      setEditDate(undefined);
      setEditSearchQuery("");
      setEditSearchResults([]);
      setSelectedSkinForEdit(null);

      toast({
        title: "Success",
        description: "Skin updated successfully",
      });
    } catch (error) {
      console.error("Error updating skin:", error);
      toast({
        title: "Error",
        description: "Failed to update skin",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (answerId: string, skinName: string, answerDate: string) => {
    // Check if the date is deletable (future dates only)
    if (!isDateEditable(answerDate)) {
      toast({
        title: "Cannot Delete",
        description: "Answers from today and earlier cannot be deleted. Only future dates are deletable.",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the skin "${skinName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/cs2dle/games/answers/${answerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete answer");
      }

      // Remove the answer from the local state
      setAnswers((prev) => prev.filter((answer) => answer._id !== answerId));

      toast({
        title: "Success",
        description: "Skin deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting skin:", error);
      toast({
        title: "Error",
        description: "Failed to delete skin",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Skin search function
  const searchSkins = async (query: string, isEditSearch = false) => {
    if (!query.trim()) {
      if (isEditSearch) {
        setEditSearchResults([]);
      } else {
        setSearchResults([]);
      }
      return;
    }

    try {
      if (isEditSearch) {
        setIsEditSearching(true);
      } else {
        setIsSearching(true);
      }
      
      const response = await fetch(
        `/api/cs2dle/games/skins/search?q=${encodeURIComponent(query)}&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to search skins");
      }

      const data = await response.json();
      if (isEditSearch) {
        setEditSearchResults(data.skins || []);
      } else {
        setSearchResults(data.skins || []);
      }
    } catch (error) {
      console.error("Error searching skins:", error);
      toast({
        title: "Error",
        description: "Failed to search skins",
        variant: "destructive",
      });
    } finally {
      if (isEditSearch) {
        setIsEditSearching(false);
      } else {
        setIsSearching(false);
      }
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchSkins(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Debounced edit search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (editSearchQuery.trim()) {
        searchSkins(editSearchQuery, true);
      } else {
        setEditSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [editSearchQuery]);

  // Create answer function
  const handleCreateAnswer = async () => {
    if (!selectedDate || !selectedSkinForCreate) {
      toast({
        title: "Error",
        description: "Please select both a date and a skin",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected date is in the future
    const amsterdamTimeZone = "Europe/Amsterdam";
    const selectedDateInAmsterdam = toZonedTime(selectedDate, amsterdamTimeZone);
    const todayInAmsterdam = toZonedTime(new Date(), amsterdamTimeZone);
    const startOfToday = startOfDay(todayInAmsterdam);

    if (!isAfter(selectedDateInAmsterdam, startOfToday)) {
      toast({
        title: "Invalid Date",
        description: "You can only create answers for future dates. Today and earlier dates are not allowed.",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected date already has an answer
    if (isDateAlreadyTaken(selectedDate)) {
      toast({
        title: "Date Already Taken",
        description: "An answer already exists for this date. Please select a different date.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      const response = await fetch("/api/cs2dle/games/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formattedDate,
          status: "active",
          answers: {
            GuessSkin: {
              skinId: selectedSkinForCreate.id,
              skin: {
                id: selectedSkinForCreate.id,
                name: selectedSkinForCreate.name,
                description: selectedSkinForCreate.description || "",
                image: selectedSkinForCreate.image || "",
                weapon:
                  selectedSkinForCreate.weapon?.name ||
                  selectedSkinForCreate.weapon ||
                  "",
                category:
                  selectedSkinForCreate.category?.name ||
                  selectedSkinForCreate.category ||
                  "",
                pattern:
                  selectedSkinForCreate.pattern?.name ||
                  selectedSkinForCreate.pattern ||
                  "",
                rarity: selectedSkinForCreate.rarity || {
                  id: "unknown",
                  name: "Unknown",
                  color: "#b0c3d9",
                },
                team:
                  selectedSkinForCreate.team?.name ||
                  selectedSkinForCreate.team ||
                  "",
                stattrak: selectedSkinForCreate.stattrak || false,
                souvenir: selectedSkinForCreate.souvenir || false,
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create answer");
      }

      // Refresh the answers list
      const refreshResponse = await fetch(
        "/api/cs2dle/games/answers?gameType=GuessSkin"
      );
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAnswers(data.answers || []);
      }

      // Reset form
      setSelectedDate(undefined);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedSkinForCreate(null);
      setIsCreateModalOpen(false);

      toast({
        title: "Success",
        description: "Answer created successfully",
      });
    } catch (error) {
      console.error("Error creating answer:", error);
      toast({
        title: "Error",
        description: "Failed to create answer",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  console.log("Answers:", answers);
  console.log("First answer structure:", answers[0]);
  if (loading) {
    return (
      <div className="mx-auto px-12">
        {/* Back button skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/cs2dle/games" className="text-xl text-gray-600 hover:text-gray-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Link>
        </div>
        
        {/* Logo skeleton */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Image src="/images/cs2dle/logo.png" alt="CS2DLE Logo" width={300} height={300} />
        </div>

        {/* Description skeleton */}
        <div className="mb-8">
          <div>
            Guess the skin game is a game where you have to guess the skin of the image. You can see the answers below.
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-none">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Skin image skeleton */}
                <div className="relative aspect-[4/3] overflow-hidden flex items-center justify-center border">
                  <Skeleton className="w-full h-full" />
                </div>
                
                {/* Action buttons skeleton */}
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Guess The Skin - Answers</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-12">
      
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cs2dle/games">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-center gap-4 mb-8">
        <Image
          src="/images/cs2dle/logo.png"
          alt="CS2DLE Logo"
          width={300}
          height={300}
        />
      </div>

      <div>
        Guess the skin game is a game where you have to guess the skin of the
        image. You can see the answers below.
        <div className="my-4 flex items-center justify-between">
          <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <ModalTrigger asChild>
              <Button className="flex items-center justify-center" variant="outline">
                <PlusIcon className="mr-2 h-4 w-4 " />
                Create a answer
              </Button>
            </ModalTrigger>
            <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <ModalHeader>
                <ModalTitle className="text-2xl font-bold">
                  Create New Answer
                </ModalTitle>
                <ModalDescription className="text-sm text-gray-600">
                  Select a date and skin for the new answer
                </ModalDescription>
              </ModalHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                                         <PopoverContent className="w-auto p-0">
                                               <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => {
                            const amsterdamTimeZone = "Europe/Amsterdam";
                            const dateInAmsterdam = toZonedTime(date, amsterdamTimeZone);
                            const todayInAmsterdam = toZonedTime(new Date(), amsterdamTimeZone);
                            const startOfToday = startOfDay(todayInAmsterdam);
                            
                            // Disable past dates and dates that already have answers
                            return !isAfter(dateInAmsterdam, startOfToday) || isDateAlreadyTaken(date);
                          }}
                        />
                     </PopoverContent>
                  </Popover>
                </div>

                {/* Skin Search */}
                <div className="space-y-2">
                  <Label>Search for a skin *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter skin name (e.g., AK-47 Redline)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 focus:outline-none focus:ring-0 focus-visible:ring-0"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Search Results</Label>
                    <div className="max-h-60 overflow-y-auto space-y-2 border p-2">
                      {searchResults.map((skin) => (
                        <div
                          key={skin.id}
                          className={`p-3 border cursor-pointer transition-colors ${
                            selectedSkinForCreate?.id === skin.id
                              ? "border-blue-500 bg-white/10"
                              : "border-gray-100/30 hover:border-gray-100/50"
                          }`}
                          onClick={() => setSelectedSkinForCreate(skin)}
                        >
                          <div className="flex items-center gap-3">
                            {skin.image && (
                              <div className="w-20 h-16 relative flex-shrink-0">
                                <Image
                                  src={skin.image}
                                  alt={skin.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {skin.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {skin.weapon?.name || skin.weapon} •{" "}
                                {skin.category?.name || skin.category}
                              </p>
                            </div>
                            {skin.rarity && (
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: skin.rarity.color,
                                  color: "white",
                                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                }}
                              >
                                {skin.rarity.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Skin Preview */}
                {selectedSkinForCreate && (
                  <div className="space-y-2">
                    <Label>Selected Skin</Label>
                    <div className="p-4 border">
                      <div className="flex items-center gap-3">
                        {selectedSkinForCreate.image && (
                          <div className="w-20 h-16 relative flex-shrink-0">
                            <Image
                              src={selectedSkinForCreate.image}
                              alt={selectedSkinForCreate.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">
                            {selectedSkinForCreate.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedSkinForCreate.weapon?.name ||
                              selectedSkinForCreate.weapon}{" "}
                            •{" "}
                            {selectedSkinForCreate.category?.name ||
                              selectedSkinForCreate.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setSelectedDate(undefined);
                      setSearchQuery("");
                      setSearchResults([]);
                      setSelectedSkinForCreate(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAnswer}
                    disabled={
                      !selectedDate || !selectedSkinForCreate || isCreating
                    }
                  >
                    {isCreating ? "Creating..." : "Create Answer"}
                  </Button>
                </div>
              </div>
            </ModalContent>
          </Modal>
        </div>
      </div>

      {answers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No answers found for Guess The Skin game.
          </p>
        </div>
      ) : answers.filter((answer) => {
          const gameData =
            answer.answers["GuessSkin"] ||
            answer.answers["guess-the-skin"] ||
            answer.answers["guessTheSkin"] ||
            Object.values(answer.answers)[0];
          return gameData?.skin;
        }).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Found {answers.length} answers but no skin data available.
          </p>
          <details className="mt-4 text-left max-w-2xl mx-auto">
            <summary className="cursor-pointer text-sm text-blue-600">
              Debug: Show raw data structure
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(answers[0], null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {answers.map((answer) => {
            // Try different possible key names
            const gameData =
              answer.answers["GuessSkin"] ||
              answer.answers["guess-the-skin"] ||
              answer.answers["guessTheSkin"] ||
              Object.values(answer.answers)[0];

            if (!gameData?.skin) {
              console.log("No skin data found for answer:", answer);
              return null;
            }

            const { skin } = gameData;

            return (
              <Card
                key={answer._id}
                className="overflow-hidden rounded-none hover:shadow-lg transition-shadow duration-200"
              >
                                 <CardHeader className="pb-3 border-b">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                         <CardTitle className="text-lg font-bold text-white line-clamp-2">
                           {skin.name}
                         </CardTitle>
                         {!isDateEditable(answer.date) && (
                           <Badge variant="secondary" className="text-xs">
                             Locked
                           </Badge>
                         )}
                       </div>
                       <CardDescription className="text-sm font-medium text-gray-600">
                         {formatDate(answer.date)}
                       </CardDescription>
                     </div>
                   </div>
                 </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Skin Image */}
                  <div className="relative aspect-[4/3] overflow-hidden flex items-center justify-center border">
                    {skin.image ? (
                      <Image
                        src={skin.image}
                        alt={skin.name}
                        className="w-full h-full object-contain p-4"
                        width={400}
                        height={300}
                        onError={(e: any) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🔫</div>
                          <p className="text-sm">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Modal>
                      <ModalTrigger asChild>
                        <Button
                          className="flex-1"
                          onClick={() =>
                            setSelectedSkin({
                              skin,
                              gameData,
                              date: answer.date,
                            })
                          }
                        >
                          View Details
                        </Button>
                      </ModalTrigger>
                      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <ModalHeader>
                          <ModalTitle className="text-2xl font-bold">
                            {skin.name}
                          </ModalTitle>
                          <ModalDescription className="text-sm text-gray-600">
                            {formatDate(answer.date)}
                          </ModalDescription>
                        </ModalHeader>

                        <div className="space-y-6">
                          {/* Skin Image */}
                          <div className="relative aspect-[4/3] overflow-hidden flex items-center justify-center border rounded-lg">
                            {skin.image ? (
                              <Image
                                src={skin.image}
                                alt={skin.name}
                                className="w-full h-full object-contain p-4"
                                width={400}
                                height={300}
                                onError={(e: any) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                  <div className="text-4xl mb-2">🔫</div>
                                  <p className="text-sm">No image available</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Primary Stats Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border border-blue-100 rounded-lg">
                              <h4 className="font-semibold text-sm text-blue-800 mb-1">
                                Weapon
                              </h4>
                              <p className="text-sm font-medium text-blue-900">
                                {skin.weapon}
                              </p>
                            </div>

                            <div className="p-3 border border-green-100 rounded-lg">
                              <h4 className="font-semibold text-sm text-green-800 mb-1">
                                Category
                              </h4>
                              <p className="text-sm font-medium text-green-900">
                                {skin.category}
                              </p>
                            </div>

                            <div className="p-3 border border-purple-100 rounded-lg">
                              <h4 className="font-semibold text-sm text-purple-800 mb-1">
                                Pattern
                              </h4>
                              <p className="text-sm font-medium text-purple-900">
                                {skin.pattern}
                              </p>
                            </div>

                            <div className="p-3 border border-orange-100 rounded-lg">
                              <h4 className="font-semibold text-sm text-orange-800 mb-1">
                                Team
                              </h4>
                              <p className="text-sm font-medium text-orange-900">
                                {skin.team}
                              </p>
                            </div>
                          </div>

                          {/* Rarity and Special Properties */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm text-gray-700">
                                Rarity
                              </h4>
                              <Badge
                                className="px-3 py-1 text-xs font-semibold"
                                style={{
                                  backgroundColor: skin.rarity.color,
                                  color: "white",
                                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                }}
                              >
                                {skin.rarity.name}
                              </Badge>
                            </div>

                            {(skin.stattrak || skin.souvenir) && (
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-gray-700">
                                  Special:
                                </h4>
                                <div className="flex gap-2">
                                  {skin.stattrak && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-semibold"
                                    >
                                      StatTrak™
                                    </Badge>
                                  )}
                                  {skin.souvenir && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-semibold border-yellow-300 text-yellow-700"
                                    >
                                      Souvenir
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {skin.description && (
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                Description
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {skin.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </ModalContent>
                    </Modal>

                                         <Button
                       variant="outline"
                       size="sm"
                       className={`px-3 ${!isDateEditable(answer.date) ? 'opacity-50 cursor-not-allowed' : ''}`}
                       onClick={() => handleEdit(answer, skin)}
                       disabled={!isDateEditable(answer.date)}
                       title={!isDateEditable(answer.date) ? "Cannot edit answers from today or earlier" : "Edit this answer"}
                     >
                       Edit
                     </Button>

                     <Button
                       variant="destructive"
                       size="sm"
                       className={`px-3 ${!isDateEditable(answer.date) ? 'opacity-50 cursor-not-allowed' : ''}`}
                       onClick={() => handleDelete(answer._id!, skin.name, answer.date)}
                       disabled={isDeleting || !isDateEditable(answer.date)}
                       title={!isDateEditable(answer.date) ? "Cannot delete answers from today or earlier" : "Delete this answer"}
                     >
                       {isDeleting ? "Deleting..." : "Delete"}
                     </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingSkin && (
        <Modal open={!!editingSkin} onOpenChange={() => setEditingSkin(null)}>
          <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <ModalHeader>
              <ModalTitle className="text-2xl font-bold">
                Edit Answer: {editingSkin.skin.name}
              </ModalTitle>
              <ModalDescription className="text-sm text-gray-600">
                Update the date and skin for this answer
              </ModalDescription>
            </ModalHeader>

            <div className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDate
                        ? format(editDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                                     <PopoverContent className="w-auto p-0">
                     <Calendar
                       mode="single"
                       selected={editDate}
                       onSelect={setEditDate}
                       initialFocus
                       disabled={(date) => {
                         const amsterdamTimeZone = "Europe/Amsterdam";
                         const dateInAmsterdam = toZonedTime(date, amsterdamTimeZone);
                         const todayInAmsterdam = toZonedTime(new Date(), amsterdamTimeZone);
                         const startOfToday = startOfDay(todayInAmsterdam);
                         return !isAfter(dateInAmsterdam, startOfToday);
                       }}
                     />
                   </PopoverContent>
                </Popover>
              </div>

              {/* Skin Search */}
              <div className="space-y-2">
                <Label>Search for a skin *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter skin name (e.g., AK-47 Redline)"
                    value={editSearchQuery}
                    onChange={(e) => setEditSearchQuery(e.target.value)}
                    className="pl-10 focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                  {isEditSearching && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Search Results */}
              {editSearchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Search Results</Label>
                  <div className="max-h-60 overflow-y-auto space-y-2 border p-2">
                    {editSearchResults.map((skin) => (
                      <div
                        key={skin.id}
                        className={`p-3 border cursor-pointer transition-colors ${
                          selectedSkinForEdit?.id === skin.id
                            ? "border-blue-500 bg-white/10"
                            : "border-gray-100/30 hover:border-gray-100/50"
                        }`}
                        onClick={() => setSelectedSkinForEdit(skin)}
                      >
                        <div className="flex items-center gap-3">
                          {skin.image && (
                            <div className="w-20 h-16 relative flex-shrink-0">
                              <Image
                                src={skin.image}
                                alt={skin.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {skin.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {skin.weapon?.name || skin.weapon} •{" "}
                              {skin.category?.name || skin.category}
                            </p>
                          </div>
                          {skin.rarity && (
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: skin.rarity.color,
                                color: "white",
                                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                              }}
                            >
                              {skin.rarity.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Skin Preview */}
              {selectedSkinForEdit && (
                <div className="space-y-2">
                  <Label>Selected Skin</Label>
                  <div className="p-4 border">
                    <div className="flex items-center gap-3">
                      {selectedSkinForEdit.image && (
                        <div className="w-20 h-16 relative flex-shrink-0">
                          <Image
                            src={selectedSkinForEdit.image}
                            alt={selectedSkinForEdit.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">
                          {selectedSkinForEdit.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedSkinForEdit.weapon?.name ||
                            selectedSkinForEdit.weapon}{" "}
                          •{" "}
                          {selectedSkinForEdit.category?.name ||
                            selectedSkinForEdit.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingSkin(null);
                    setEditForm({});
                    setEditDate(undefined);
                    setEditSearchQuery("");
                    setEditSearchResults([]);
                    setSelectedSkinForEdit(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isEditing}>
                  {isEditing ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default GuessTheSkin;
