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
import {
  CalendarIcon,
  Search,
  Loader2,
  PlusIcon,
  ArrowLeft,
  Smile,
} from "lucide-react";
import { format, isAfter, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { GameAnswer } from "@/types/cs2dle/games/emoji-puzzle";
import { Skin } from "@/types/cs2dle/games/guess-skin";
import EmojiPicker from "emoji-picker-react";

const EmojiPuzzle = () => {
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
  const [isEditDatePickerOpen, setIsEditDatePickerOpen] = useState(false);
  const [editSearchQuery, setEditSearchQuery] = useState("");
  const [editSearchResults, setEditSearchResults] = useState<any[]>([]);
  const [isEditSearching, setIsEditSearching] = useState(false);
  const [selectedSkinForEdit, setSelectedSkinForEdit] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create answer modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCreateDatePickerOpen, setIsCreateDatePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSkinForCreate, setSelectedSkinForCreate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Emoji puzzle specific state
  const [editEmojis, setEditEmojis] = useState<string[]>(["", "", "", "", ""]);
  const [editHints, setEditHints] = useState<{
    english: string[];
    dutch: string[];
    chinese: string[];
    russian: string[];
  }>({
    english: ["", "", "", "", ""],
    dutch: ["", "", "", "", ""],
    chinese: ["", "", "", "", ""],
    russian: ["", "", "", "", ""]
  });
  const [createEmojis, setCreateEmojis] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [createHints, setCreateHints] = useState<{
    english: string[];
    dutch: string[];
    chinese: string[];
    russian: string[];
  }>({
    english: ["", "", "", "", ""],
    dutch: ["", "", "", "", ""],
    chinese: ["", "", "", "", ""],
    russian: ["", "", "", "", ""]
  });
  const [isGeneratingEmojis, setIsGeneratingEmojis] = useState(false);

  // Emoji picker state
  const [createEmojiPickerOpen, setCreateEmojiPickerOpen] = useState<number | null>(null);
  const [editEmojiPickerOpen, setEditEmojiPickerOpen] = useState<number | null>(null);

  const fetchAnswers = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('Fetching emoji puzzle answers...');
      const response = await fetch(
        "/api/cs2dle/games/answers?gameType=EmojiPuzzle"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch answers");
      }

      const data = await response.json();
      console.log('Fetched emoji puzzle answers:', data.answers);

      setAnswers(data.answers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
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
    return answers.some((answer) => answer.date === dateString);
  };

  const handleEdit = (answer: GameAnswer, skin: Skin) => {
    // Check if the date is editable (future dates only)
    if (!isDateEditable(answer.date)) {
      toast({
        title: "Cannot Edit",
        description:
          "Answers from today and earlier cannot be edited. Only future dates are editable.",
        variant: "destructive",
      });
      return;
    }

    const gameData =
      answer.answers["EmojiPuzzle"] || Object.values(answer.answers)[0];

    const gameType =
      Object.keys(answer.answers).find(
        (key) => answer.answers[key]?.skinId === skin.id
      ) || "EmojiPuzzle";

    setEditingSkin({
      answerId: answer._id!,
      skin,
      gameType,
      date: answer.date,
    });
    setEditForm(skin);
    setEditDate(new Date(answer.date));
    setSelectedSkinForEdit(skin);

    // Set emojis and hints for editing
    if (gameData?.emojis) {
      setEditEmojis([...gameData.emojis, "", "", "", "", ""].slice(0, 5));
    }
    if (gameData?.hints) {
      setEditHints({
        english: [...gameData.hints.english, "", "", "", "", ""].slice(0, 5),
        dutch: [...gameData.hints.dutch, "", "", "", "", ""].slice(0, 5),
        chinese: [...gameData.hints.chinese, "", "", "", "", ""].slice(0, 5),
        russian: [...gameData.hints.russian, "", "", "", "", ""].slice(0, 5)
      });
    }
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

    const validEmojis = editEmojis.filter((emoji) => emoji.trim() !== "");
    const validHints = editHints.english.filter((hint) => hint.trim() !== "");
    
    // Check if all languages have at least one hint
    const hasDutchHints = editHints.dutch.some(hint => hint.trim() !== "");
    const hasChineseHints = editHints.chinese.some(hint => hint.trim() !== "");
    const hasRussianHints = editHints.russian.some(hint => hint.trim() !== "");

    if (validEmojis.length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one emoji",
        variant: "destructive",
      });
      return;
    }

    if (validHints.length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one hint",
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
                emojis: validEmojis,
                hints: {
                  english: validHints,
                  dutch: editHints.dutch,
                  chinese: editHints.chinese,
                  russian: editHints.russian
                },
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
      await fetchAnswers(false);

      setEditingSkin(null);
      setEditForm({});
      setEditDate(undefined);
      setEditSearchQuery("");
      setEditSearchResults([]);
      setSelectedSkinForEdit(null);
      setEditEmojis(["", "", "", "", ""]);
      setEditHints({ english: ["", "", "", "", ""], dutch: ["", "", "", "", ""], chinese: ["", "", "", "", ""], russian: ["", "", "", "", ""] });

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

  const handleDelete = async (
    answerId: string,
    skinName: string,
    answerDate: string
  ) => {
    // Check if the date is deletable (future dates only)
    if (!isDateEditable(answerDate)) {
      toast({
        title: "Cannot Delete",
        description:
          "Answers from today and earlier cannot be deleted. Only future dates are deletable.",
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

      // Refresh the answers list
      await fetchAnswers(false);

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

  // Generate emojis and hints using OpenAI
  const generateEmojisAndHints = async (skin: any, isEditMode = false) => {
    try {
      setIsGeneratingEmojis(true);

      const response = await fetch(
        "/api/cs2dle/games/answers/generate-emojis/open-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skinName: skin.name,
            skinDescription: skin.description || "",
            weapon: skin.weapon?.name || skin.weapon || "",
            image: skin.image || "",
            rarity: skin.rarity?.name || "",
            team: skin.team?.name || skin.team || "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate emojis and hints");
      }

      const data = await response.json();

      if (isEditMode) {
        setEditEmojis([...data.emojis, "", "", "", "", ""].slice(0, 5));
        setEditHints({
          english: [...data.hints.english, "", "", "", "", ""].slice(0, 5),
          dutch: [...data.hints.dutch, "", "", "", "", ""].slice(0, 5),
          chinese: [...data.hints.chinese, "", "", "", "", ""].slice(0, 5),
          russian: [...data.hints.russian, "", "", "", "", ""].slice(0, 5)
        });
      } else {
        setCreateEmojis([...data.emojis, "", "", "", "", ""].slice(0, 5));
        setCreateHints({
          english: [...data.hints.english, "", "", "", "", ""].slice(0, 5),
          dutch: [...data.hints.dutch, "", "", "", "", ""].slice(0, 5),
          chinese: [...data.hints.chinese, "", "", "", "", ""].slice(0, 5),
          russian: [...data.hints.russian, "", "", "", "", ""].slice(0, 5)
        });
      }

      toast({
        title: "Success",
        description: "Emojis and hints generated successfully!",
      });
    } catch (error) {
      console.error("Error generating emojis and hints:", error);
      toast({
        title: "Error",
        description:
          "Failed to generate emojis and hints. Please enter them manually.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEmojis(false);
    }
  };

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

    const validEmojis = createEmojis.filter((emoji) => emoji.trim() !== "");
    const validHints = createHints.english.filter((hint) => hint.trim() !== "");
    
    // Check if all languages have at least one hint
    const hasDutchHints = createHints.dutch.some(hint => hint.trim() !== "");
    const hasChineseHints = createHints.chinese.some(hint => hint.trim() !== "");
    const hasRussianHints = createHints.russian.some(hint => hint.trim() !== "");

    if (validEmojis.length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one emoji",
        variant: "destructive",
      });
      return;
    }

    if (validHints.length === 0) {
      toast({
        title: "Error",
        description: "Please provide at least one English hint",
        variant: "destructive",
      });
      return;
    }

    if (!hasDutchHints || !hasChineseHints || !hasRussianHints) {
      toast({
        title: "Error",
        description: "Please provide at least one hint in all languages (Dutch, Chinese, Russian)",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected date is in the future
    const amsterdamTimeZone = "Europe/Amsterdam";
    const selectedDateInAmsterdam = toZonedTime(
      selectedDate,
      amsterdamTimeZone
    );
    const todayInAmsterdam = toZonedTime(new Date(), amsterdamTimeZone);
    const startOfToday = startOfDay(todayInAmsterdam);

    if (!isAfter(selectedDateInAmsterdam, startOfToday)) {
      toast({
        title: "Invalid Date",
        description:
          "You can only create answers for future dates. Today and earlier dates are not allowed.",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected date already has an answer
    if (isDateAlreadyTaken(selectedDate)) {
      toast({
        title: "Date Already Taken",
        description:
          "An answer already exists for this date. Please select a different date.",
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
            EmojiPuzzle: {
              skinId: selectedSkinForCreate.id,
              emojis: validEmojis,
              hints: {
                english: validHints,
                dutch: createHints.dutch,
                chinese: createHints.chinese,
                russian: createHints.russian
              },
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
      await fetchAnswers(false);

      // Reset form
      setSelectedDate(undefined);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedSkinForCreate(null);
      setIsCreateModalOpen(false);
      setCreateEmojis(["", "", "", "", ""]);
      setCreateHints({ english: ["", "", "", "", ""], dutch: ["", "", "", "", ""], chinese: ["", "", "", "", ""], russian: ["", "", "", "", ""] });

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
        <div className="flex items-center gap-4">
        <Link href="/dashboard/cs2dle/games">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>
      </div>

        {/* Logo skeleton */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Image
            src="/images/cs2dle/logo.png"
            alt="CS2DLE Logo"
            width={300}
            height={300}
          />
        </div>

        {/* Description skeleton */}
        <div className="mb-8">
          <div>
            Emoji Puzzle is a game where players guess the skin based on emojis
            and hints. You can see the answers below.
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
        Emoji Puzzle is a game where players guess the skin based on emojis and
        hints. You can see the answers below.
        <div className="my-4 flex items-center justify-between">
          <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <ModalTrigger asChild>
              <Button
                className="flex items-center justify-center"
                variant="outline"
              >
                <PlusIcon className="mr-2 h-4 w-4 " />
                Create Emoji Puzzle Answer
              </Button>
            </ModalTrigger>
            <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <ModalHeader>
                <ModalTitle className="text-2xl font-bold">
                  Create New Emoji Puzzle Answer
                </ModalTitle>
                <ModalDescription className="text-sm text-gray-600">
                  Select a date, skin, emojis, and hints for the new answer. You
                  can use AI to automatically generate emojis and hints.
                </ModalDescription>
              </ModalHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover
                    open={isCreateDatePickerOpen}
                    onOpenChange={setIsCreateDatePickerOpen}
                  >
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
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setIsCreateDatePickerOpen(false);
                        }}
                        initialFocus
                        disabled={(date) => {
                          const amsterdamTimeZone = "Europe/Amsterdam";
                          const dateInAmsterdam = toZonedTime(
                            date,
                            amsterdamTimeZone
                          );
                          const todayInAmsterdam = toZonedTime(
                            new Date(),
                            amsterdamTimeZone
                          );
                          const startOfToday = startOfDay(todayInAmsterdam);

                          // Disable past dates and dates that already have answers
                          return (
                            !isAfter(dateInAmsterdam, startOfToday) ||
                            isDateAlreadyTaken(date)
                          );
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
                          onClick={() => {
                            setSelectedSkinForCreate(skin);
                            setSearchResults([]);
                            setSearchQuery("");
                          }}
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

                {/* Emojis Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Emojis (up to 5)</Label>
                    {selectedSkinForCreate && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          generateEmojisAndHints(selectedSkinForCreate, false)
                        }
                        disabled={isGeneratingEmojis}
                        className="text-xs"
                      >
                        {isGeneratingEmojis ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate with AI"
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {createEmojis.map((emoji, index) => (
                      <div key={index} className="relative">
                        <Popover
                          open={createEmojiPickerOpen === index}
                          onOpenChange={(open) => 
                            setCreateEmojiPickerOpen(open ? index : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-10 text-center text-lg relative"
                              onClick={() => setCreateEmojiPickerOpen(index)}
                            >
                              {emoji || "😀"}
                              <Smile className="absolute right-2 h-4 w-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <EmojiPicker
                              onEmojiClick={(emojiObject) => {
                                const newEmojis = [...createEmojis];
                                newEmojis[index] = emojiObject.emoji;
                                setCreateEmojis(newEmojis);
                                setCreateEmojiPickerOpen(null);
                              }}
                              width={300}
                              height={400}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hints Input */}
                <div className="space-y-2">
                  <Label>Hints (up to 5) - English</Label>
                  <div className="space-y-2">
                    {createHints.english.map((hint, index) => (
                      <Input
                        key={index}
                        placeholder={`Hint ${index + 1}`}
                        value={hint}
                        onChange={(e) => {
                          const newHints = { ...createHints };
                          newHints.english[index] = e.target.value;
                          setCreateHints(newHints);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Dutch Hints */}
                {/* <div className="space-y-2">
                  <Label>Hints (up to 5) - Dutch</Label>
                  <div className="space-y-2">
                    {createHints.dutch.map((hint, index) => (
                      <Input
                        key={index}
                        placeholder={`Hint ${index + 1} (Dutch)`}
                        value={hint}
                        onChange={(e) => {
                          const newHints = { ...createHints };
                          newHints.dutch[index] = e.target.value;
                          setCreateHints(newHints);
                        }}
                      />
                    ))}
                  </div>
                </div> */}

                {/* Chinese Hints */}
                {/* <div className="space-y-2">
                  <Label>Hints (up to 5) - Chinese</Label>
                  <div className="space-y-2">
                    {createHints.chinese.map((hint, index) => (
                      <Input
                        key={index}
                        placeholder={`Hint ${index + 1} (Chinese)`}
                        value={hint}
                        onChange={(e) => {
                          const newHints = { ...createHints };
                          newHints.chinese[index] = e.target.value;
                          setCreateHints(newHints);
                        }}
                      />
                    ))}
                  </div>
                </div> */}

                {/* Russian Hints */}
                {/* <div className="space-y-2">
                  <Label>Hints (up to 5) - Russian</Label>
                  <div className="space-y-2">
                    {createHints.russian.map((hint, index) => (
                      <Input
                        key={index}
                        placeholder={`Hint ${index + 1} (Russian)`}
                        value={hint}
                        onChange={(e) => {
                          const newHints = { ...createHints };
                          newHints.russian[index] = e.target.value;
                          setCreateHints(newHints);
                        }}
                      />
                    ))}
                  </div>
                </div> */}

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
            No answers found for Emoji Puzzle game.
          </p>
        </div>
      ) : answers.filter((answer) => {
          const gameData =
            answer.answers["EmojiPuzzle"] || Object.values(answer.answers)[0];
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
              answer.answers["EmojiPuzzle"] || Object.values(answer.answers)[0];

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

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="space-y-1">
                          <div className="text-xs text-gray-600 font-medium">
                            {gameData.emojis[index] || ""} - {gameData.hints?.english?.[index] || ""}
                          </div>
                          {/* {gameData.hints?.dutch?.[index] && (
                            <div className="text-xs text-gray-500 ml-4">
                              🇳🇱 {gameData.hints.dutch[index]}
                            </div>
                          )}
                          {gameData.hints?.chinese?.[index] && (
                            <div className="text-xs text-gray-500 ml-4">
                              🇨🇳 {gameData.hints.chinese[index]}
                            </div>
                          )}
                          {gameData.hints?.russian?.[index] && (
                            <div className="text-xs text-gray-500 ml-4">
                              🇷🇺 {gameData.hints.russian[index]}
                            </div>
                          )} */}
                        </div>
                      ))}
                    </div>
                  </div>

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
                      className={`px-3 ${
                        !isDateEditable(answer.date)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleEdit(answer, skin)}
                      disabled={!isDateEditable(answer.date)}
                      title={
                        !isDateEditable(answer.date)
                          ? "Cannot edit answers from today or earlier"
                          : "Edit this answer"
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className={`px-3 ${
                        !isDateEditable(answer.date)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() =>
                        handleDelete(answer._id!, skin.name, answer.date)
                      }
                      disabled={isDeleting || !isDateEditable(answer.date)}
                      title={
                        !isDateEditable(answer.date)
                          ? "Cannot delete answers from today or earlier"
                          : "Delete this answer"
                      }
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
                Edit Emoji Puzzle Answer: {editingSkin.skin.name}
              </ModalTitle>
              <ModalDescription className="text-sm text-gray-600">
                Update the date, skin, emojis, and hints for this answer. You
                can use AI to automatically generate emojis and hints.
              </ModalDescription>
            </ModalHeader>

            <div className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover
                  open={isEditDatePickerOpen}
                  onOpenChange={setIsEditDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDate ? format(editDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={(date) => {
                        setEditDate(date);
                        setIsEditDatePickerOpen(false);
                      }}
                      initialFocus
                      disabled={(date) => {
                        const amsterdamTimeZone = "Europe/Amsterdam";
                        const dateInAmsterdam = toZonedTime(
                          date,
                          amsterdamTimeZone
                        );
                        const todayInAmsterdam = toZonedTime(
                          new Date(),
                          amsterdamTimeZone
                        );
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
                        onClick={() => {
                          setSelectedSkinForEdit(skin);
                          setEditSearchResults([]);
                          setEditSearchQuery("");
                        }}
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

              {/* Emojis Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Emojis (up to 5)</Label>
                  {selectedSkinForEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        generateEmojisAndHints(selectedSkinForEdit, true)
                      }
                      disabled={isGeneratingEmojis}
                      className="text-xs"
                    >
                      {isGeneratingEmojis ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate with AI"
                      )}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {editEmojis.map((emoji, index) => (
                    <div key={index} className="relative">
                      <Popover
                        open={editEmojiPickerOpen === index}
                        onOpenChange={(open) => 
                          setEditEmojiPickerOpen(open ? index : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-10 text-center text-lg relative"
                            onClick={() => setEditEmojiPickerOpen(index)}
                          >
                            {emoji || "😀"}
                            <Smile className="absolute right-2 h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                          <EmojiPicker
                            onEmojiClick={(emojiObject) => {
                              const newEmojis = [...editEmojis];
                              newEmojis[index] = emojiObject.emoji;
                              setEditEmojis(newEmojis);
                              setEditEmojiPickerOpen(null);
                            }}
                            width={300}
                            height={400}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints Input */}
              <div className="space-y-2">
                <Label>Hints (up to 5) - English</Label>
                <div className="space-y-2">
                  {editHints.english.map((hint, index) => (
                    <Input
                      key={index}
                      placeholder={`Hint ${index + 1}`}
                      value={hint}
                      onChange={(e) => {
                        const newHints = { ...editHints };
                        newHints.english[index] = e.target.value;
                        setEditHints(newHints);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Dutch Hints */}
              {/* <div className="space-y-2">
                <Label>Hints (up to 5) - Dutch</Label>
                <div className="space-y-2">
                  {editHints.dutch.map((hint, index) => (
                    <Input
                      key={index}
                      placeholder={`Hint ${index + 1} (Dutch)`}
                      value={hint}
                      onChange={(e) => {
                        const newHints = { ...editHints };
                        newHints.dutch[index] = e.target.value;
                        setEditHints(newHints);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Chinese Hints */}
              {/* <div className="space-y-2">
                <Label>Hints (up to 5) - Chinese</Label>
                <div className="space-y-2">
                  {editHints.chinese.map((hint, index) => (
                    <Input
                      key={index}
                      placeholder={`Hint ${index + 1} (Chinese)`}
                      value={hint}
                      onChange={(e) => {
                        const newHints = { ...editHints };
                        newHints.chinese[index] = e.target.value;
                        setEditHints(newHints);
                      }}
                    />
                  ))}
                </div>
              </div> */}

              {/* Russian Hints */}
              {/* <div className="space-y-2">
                <Label>Hints (up to 5) - Russian</Label>
                <div className="space-y-2">
                  {editHints.russian.map((hint, index) => (
                    <Input
                      key={index}
                      placeholder={`Hint ${index + 1} (Russian)`}
                      value={hint}
                      onChange={(e) => {
                        const newHints = { ...editHints };
                        newHints.russian[index] = e.target.value;
                        setEditHints(newHints);
                      }}
                    />
                  ))}
                </div>
              </div> */}

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

export default EmojiPuzzle;
