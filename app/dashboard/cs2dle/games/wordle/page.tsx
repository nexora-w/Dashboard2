"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusIcon, Loader2, Search, ChevronDown, X, CalendarIcon, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
// Removed static import - now fetching from database
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, ModalTrigger } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useWordleData } from "@/components/WordleDataProvider";

interface WordleAnswer {
  _id: string;
  date: string;
  status: string;
  answers: {
    Wordle: {
      word: string;
    };
  };
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WordleWord {
  _id: string;
  word: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

const WordlePage = () => {
  const { answers, words, loading, refreshAnswers, refreshWords } = useWordleData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWord, setSelectedWord] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Searchable dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredWords, setFilteredWords] = useState<string[]>([]);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<WordleAnswer | null>(null);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editWord, setEditWord] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Edit modal searchable dropdown state
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const [editSearchQuery, setEditSearchQuery] = useState("");
  const [editFilteredWords, setEditFilteredWords] = useState<string[]>([]);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAnswer, setDeletingAnswer] = useState<WordleAnswer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View all words modal state
  const [isViewAllWordsModalOpen, setIsViewAllWordsModalOpen] = useState(false);
  const [allWordsSearchQuery, setAllWordsSearchQuery] = useState("");
  const [allWordsFiltered, setAllWordsFiltered] = useState<WordleWord[]>([]);

  // Add word modal state
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [isAddingWord, setIsAddingWord] = useState(false);

  // Delete word modal state
  const [isDeleteWordModalOpen, setIsDeleteWordModalOpen] = useState(false);
  const [deletingWord, setDeletingWord] = useState<WordleWord | null>(null);
  const [isDeletingWord, setIsDeletingWord] = useState(false);



  // Filter words based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWords(words.slice(0, 50).map(w => w.word)); // Show first 50 words when no search
    } else {
      const filtered = words.filter(word =>
        word.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWords(filtered.slice(0, 100).map(w => w.word)); // Limit to 100 results for performance
    }
  }, [searchQuery, words]);

  // Filter words for edit modal based on search query
  useEffect(() => {
    if (editSearchQuery.trim() === "") {
      setEditFilteredWords(words.slice(0, 50).map(w => w.word)); // Show first 50 words when no search
    } else {
      const filtered = words.filter(word =>
        word.word.toLowerCase().includes(editSearchQuery.toLowerCase())
      );
      setEditFilteredWords(filtered.slice(0, 100).map(w => w.word)); // Limit to 100 results for performance
    }
  }, [editSearchQuery, words]);

  // Filter all words based on search query
  useEffect(() => {
    if (allWordsSearchQuery.trim() === "") {
      setAllWordsFiltered(words);
    } else {
      const filtered = words.filter(word =>
        word.word.toLowerCase().includes(allWordsSearchQuery.toLowerCase())
      );
      setAllWordsFiltered(filtered);
    }
  }, [allWordsSearchQuery, words]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCreateAnswer = async () => {
    if (!selectedDate || !selectedWord) {
      toast({
        title: "Error",
        description: "Please select both a date and a word",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      const response = await fetch("/api/cs2dle/games/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate.toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
          status: "active",
          answers: {
            Wordle: {
              word: selectedWord,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create answer");
      }

      toast({
        title: "Success",
        description: "Wordle answer created successfully",
      });

      // Refresh the answers list
      await refreshAnswers();

      // Reset form
      setIsCreateModalOpen(false);
      setSelectedDate(undefined);
      setSelectedWord("");
      setSearchQuery("");
      setIsDropdownOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create Wordle answer",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    setSearchQuery(word);
    setIsDropdownOpen(false);
  };

  const clearSelection = () => {
    setSelectedWord("");
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleEditWordSelect = (word: string) => {
    setEditWord(word);
    setEditSearchQuery(word);
    setIsEditDropdownOpen(false);
  };

  const clearEditSelection = () => {
    setEditWord("");
    setEditSearchQuery("");
    setIsEditDropdownOpen(false);
  };

  const handleEdit = (answer: WordleAnswer) => {
    const gameData = answer.answers?.Wordle || {};
    setEditingAnswer(answer);
    setEditDate(new Date(answer.date));
    setEditWord(gameData.word || "");
    setEditSearchQuery(gameData.word || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAnswer || !editDate || !editWord) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEditing(true);

      const response = await fetch(`/api/cs2dle/games/answers/${editingAnswer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: editDate.toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
          answers: {
            Wordle: {
              word: editWord,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update answer");
      }

      toast({
        title: "Success",
        description: "Wordle answer updated successfully",
      });

      // Refresh the answers list
      await refreshAnswers();

      // Reset edit form
      setIsEditModalOpen(false);
      setEditingAnswer(null);
      setEditDate(undefined);
      setEditWord("");
      setEditSearchQuery("");
      setIsEditDropdownOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update Wordle answer";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = (answer: WordleAnswer) => {
    setDeletingAnswer(answer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingAnswer) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/cs2dle/games/answers/${deletingAnswer._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete answer");
      }

      toast({
        title: "Success",
        description: "Wordle answer deleted successfully",
      });

      // Refresh the answers list
      await refreshAnswers();

      // Reset delete form
      setIsDeleteModalOpen(false);
      setDeletingAnswer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete Wordle answer",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      toast({
        title: "Error",
        description: "Please enter a word",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingWord(true);

      const response = await fetch("/api/cs2dle/games/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: newWord.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add word");
      }

      toast({
        title: "Success",
        description: "Word added successfully",
      });

      // Refresh the words list
      await refreshWords();

      // Reset form
      setIsAddWordModalOpen(false);
      setNewWord("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add word";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingWord(false);
    }
  };

  const handleDeleteWord = (word: WordleWord) => {
    setDeletingWord(word);
    setIsDeleteWordModalOpen(true);
  };

  const confirmDeleteWord = async () => {
    if (!deletingWord) return;

    try {
      setIsDeletingWord(true);

      const response = await fetch(`/api/cs2dle/games/words/${deletingWord._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete word");
      }

      toast({
        title: "Success",
        description: "Word deleted successfully",
      });

      // Refresh the words list
      await refreshWords();

      // Reset delete form
      setIsDeleteWordModalOpen(false);
      setDeletingWord(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete word";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeletingWord(false);
    }
  };

  if (loading) {
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
        <div className="text-center">
          <p>Loading...</p>
      </div>
    </div>
    );
  }

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

      <div className="text-center">
        <h1 className="text-3xl font-bold">Wordle</h1>
        <p className="text-muted-foreground">
          Manage daily Wordle game answers
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Daily Answers</h2>
        <div className="flex gap-2">
          <Modal open={isAddWordModalOpen} onOpenChange={setIsAddWordModalOpen}>
            <ModalTrigger asChild>
              <Button variant="outline">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Word
              </Button>
            </ModalTrigger>
          </Modal>
          
          <Modal open={isViewAllWordsModalOpen} onOpenChange={setIsViewAllWordsModalOpen}>
            <ModalTrigger asChild>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                View All Words ({words.length})
              </Button>
            </ModalTrigger>
            <ModalContent className="max-w-4xl max-h-[80vh]">
              <ModalHeader>
                <ModalTitle>All Available Words</ModalTitle>
                <ModalDescription>
                  Browse and search through all {words.length} available words for Wordle.
                </ModalDescription>
              </ModalHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search words..."
                    value={allWordsSearchQuery}
                    onChange={(e) => setAllWordsSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="border rounded-md">
                  <div className="p-3 border-b bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {allWordsFiltered.length} word{allWordsFiltered.length !== 1 ? 's' : ''} found
                      </span>
                      {allWordsSearchQuery && (
                        <span className="text-sm text-muted-foreground">
                          Showing results for "{allWordsSearchQuery}"
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-auto p-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {allWordsFiltered.map((word, index) => (
                        <div
                          key={word._id}
                          className="p-2 text-sm border rounded hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-center group relative"
                          onClick={() => {
                            setAllWordsSearchQuery(word.word);
                          }}
                        >
                          {word.word}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWord(word);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => setIsViewAllWordsModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </ModalContent>
          </Modal>
          
          <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <ModalTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Answer
            </Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Create Wordle Answer</ModalTitle>
              <ModalDescription>
                Create a new Wordle answer for a specific date.
              </ModalDescription>
            </ModalHeader>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
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
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date && date >= new Date()) {
                          setSelectedDate(date);
                          setIsDropdownOpen(false);
                        } else {
                          toast({
                            title: "Error",
                            description: "You cannot select a past date.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Word</Label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      placeholder="Search for a word..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!isDropdownOpen) setIsDropdownOpen(true);
                      }}
                      onClick={() => {
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => {
                        if (searchQuery.trim() !== "" || isDropdownOpen) {
                          setIsDropdownOpen(true);
                        }
                      }}
                      className="pr-10"
                      autoComplete="off"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      {selectedWord ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                          className="h-6 w-6 p-0 hover:bg-transparent"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 border-b border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Search className="h-4 w-4" />
                          <span>Type to search through {words.length} words</span>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-auto">
                        {filteredWords.length === 0 ? (
                          <div className="p-3 text-center text-muted-foreground">
                            No words found matching "{searchQuery}"
                          </div>
                        ) : (
                          filteredWords.map((word, index) => (
                            <button
                              key={index}
                              onClick={() => handleWordSelect(word)}
                              className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors ${
                                selectedWord === word ? "bg-primary/10 text-primary" : ""
                              }`}
                            >
                              {word}
                            </button>
                          ))
                        )}
                      </div>
                      {searchQuery.trim() === "" && (
                        <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
                          Showing first 50 words. Type to search all {words.length} words.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedWord && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p className="text-sm font-medium">Selected: <span className="text-blue-600">{selectedWord}</span></p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateAnswer} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Answer
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Wordle Answer</ModalTitle>
            <ModalDescription>
              Edit the Wordle answer for {editingAnswer ? formatDate(editingAnswer.date) : ""}.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
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
                    {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(date) => {
                      if (date && date >= new Date()) {
                        setEditDate(date);
                      } else {
                        toast({
                          title: "Error",
                          description: "You cannot select a past date.",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Word</Label>
              <div className="relative">
                <div className="relative">
                  <Input
                    placeholder="Search for a word..."
                    value={editSearchQuery}
                    onChange={(e) => {
                      setEditSearchQuery(e.target.value);
                      if (!isEditDropdownOpen) setIsEditDropdownOpen(true);
                    }}
                    onClick={() => {
                      setIsEditDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (editSearchQuery.trim() !== "" || isEditDropdownOpen) {
                        setIsEditDropdownOpen(true);
                      }
                    }}
                    className="pr-10"
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {editWord ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearEditSelection}
                        className="h-6 w-6 p-0 hover:bg-transparent"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {isEditDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Search className="h-4 w-4" />
                        <span>Type to search through {words.length} words</span>
                      </div>
                    </div>
                    <div className="max-h-48 overflow-auto">
                      {editFilteredWords.length === 0 ? (
                        <div className="p-3 text-center text-muted-foreground">
                          No words found matching "{editSearchQuery}"
                        </div>
                      ) : (
                        editFilteredWords.map((word, index) => (
                          <button
                            key={index}
                            onClick={() => handleEditWordSelect(word)}
                            className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors ${
                              editWord === word ? "bg-primary/10 text-primary" : ""
                            }`}
                          >
                            {word}
                          </button>
                        ))
                      )}
                    </div>
                    {editSearchQuery.trim() === "" && (
                      <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
                        Showing first 50 words. Type to search all {words.length} words.
                      </div>
                    )}
                  </div>
                )}
              </div>
              {editWord && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <p className="text-sm font-medium">Selected: <span className="text-blue-600">{editWord}</span></p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isEditing}>
                {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Wordle Answer</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete the Wordle answer for {deletingAnswer ? formatDate(deletingAnswer.date) : ""}?
              This action cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Answer
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* Add Word Modal */}
      <Modal open={isAddWordModalOpen} onOpenChange={setIsAddWordModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add New Word</ModalTitle>
            <ModalDescription>
              Add a new 5-letter word to the Wordle word list.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newWord">Word</Label>
              <Input
                id="newWord"
                placeholder="Enter 5-letter word (e.g., HELLO)"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                maxLength={5}
                className="uppercase"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Word must be exactly 5 letters long.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddWordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddWord} disabled={isAddingWord || newWord.length !== 5}>
                {isAddingWord && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Word
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Delete Word Confirmation Modal */}
      <Modal open={isDeleteWordModalOpen} onOpenChange={setIsDeleteWordModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Word</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete the word "{deletingWord?.word}"?
              This action cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteWordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteWord} 
              disabled={isDeletingWord}
            >
              {isDeletingWord && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Word
            </Button>
          </div>
        </ModalContent>
      </Modal>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {answers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No answers found.</p>
            </CardContent>
          </Card>
        ) : (
          answers.map((answer) => {
            const gameData = answer.answers?.Wordle || {};
            const word = gameData.word || "N/A";
            
            return (
              <Card key={answer._id} className="">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {formatDate(answer.date)}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Word: {word}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={answer.status === "active" ? "default" : "secondary"}>
                        {answer.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(answer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(answer)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WordlePage;
