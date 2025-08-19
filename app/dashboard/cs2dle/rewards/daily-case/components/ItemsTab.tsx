"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Star,
  Trophy,
  SortAsc,
  Edit,
  Ban,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { togglePreCaseStatus, getAllPreCases, type PreCase } from "../setting";
import { EditPreCaseModal } from "./EditPreCaseModal";
import { AddPreCaseModal } from "./AddPreCaseModal";

const ItemsTab = () => {
  const [data, setData] = useState<PreCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("rarity");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PreCase | null>(null);
  const [togglingItems, setTogglingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDailyCase = async () => {
      try {
        const result = await getAllPreCases();

        if (result.success && result.preCase) {
          setData(result.preCase);
        } else {
          setError("Failed to fetch daily case data");
        }
      } catch (err) {
        setError("Error loading daily case data");
        console.error("Error fetching daily case:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyCase();
  }, []);

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}`;
  };

  const formatProbability = (probability: number) => {
    if (probability >= 1) {
      return `${probability.toFixed(1)}%`;
    }
    return `${(probability * 100).toFixed(3)}%`;
  };

  const getRarityColor = (color: string) => {
    return color || "#b0c3d9";
  };

  const getRarityWeight = (rarityName: string) => {
    const weights = {
      "Consumer Grade": 1,
      "Industrial Grade": 2,
      "Mil-Spec Grade": 3,
      Restricted: 4,
      Classified: 5,
      Covert: 6,
    };
    return weights[rarityName as keyof typeof weights] || 0;
  };

  const sortData = (items: PreCase[]) => {
    switch (sortBy) {
      case "rarity":
        return [...items].sort(
          (a, b) =>
            getRarityWeight(b.rarity.name) - getRarityWeight(a.rarity.name)
        );
      case "price":
        return [...items].sort((a, b) => b.price - a.price);
      case "probability":
        return [...items].sort((a, b) => a.probability - b.probability);
      case "name":
        return [...items].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return items;
    }
  };

  const handleMouseEnter = (cardId: string) => {
    setHoveredCard(cardId);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  const handleEdit = (item: PreCase) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    // Refresh the data after successful edit
    try {
      const updatedResult = await getAllPreCases();
      if (updatedResult.success && updatedResult.preCase) {
        setData(updatedResult.preCase);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleAddSuccess = async () => {
    // Refresh the data after successful add
    try {
      const updatedResult = await getAllPreCases();
      if (updatedResult.success && updatedResult.preCase) {
        setData(updatedResult.preCase);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleToggleStatus = async (item: PreCase) => {
    try {
      // Add item to toggling set
      setTogglingItems(prev => new Set(prev).add(item._id));
      
      const newStatus = item.status === "active" ? "inactive" : "active";
      
      const result = await togglePreCaseStatus({
        _id: item._id,
        status: newStatus as "active" | "inactive"
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Item ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        });
        
        // Refresh the data
        const updatedResult = await getAllPreCases();
        if (updatedResult.success && updatedResult.preCase) {
          setData(updatedResult.preCase);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle item status",
        variant: "destructive",
      });
    } finally {
      // Remove item from toggling set
      setTogglingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item._id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Statistics Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="text-center p-4">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </Card>
          ))}
        </div>

        {/* Sort Controls Skeleton */}
        <div className="flex justify-end mb-4">
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Case Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-muted-foreground">Total Items</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {data.filter((item) => item.rarity.name === "Covert").length}
          </div>
          <div className="text-sm text-muted-foreground">Covert Items</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            ${data.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Total Value</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">
            {data.filter((item) => item.stattrak).length}
          </div>
          <div className="text-sm text-muted-foreground">StatTrak Items</div>
        </Card>
      </div>

      {/* Sort Controls and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
        
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rarity">Sort by Rarity</SelectItem>
              <SelectItem value="price">Sort by Price</SelectItem>
              <SelectItem value="probability">Sort by Probability</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortData(data).map((item) => {
          const isFlipped = hoveredCard === item._id;

          return (
            <div
              key={item._id}
              className="relative h-96 perspective-1000 mb-5"
              onMouseEnter={() => handleMouseEnter(item._id)}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front of Card */}
                <div className="absolute w-full h-full backface-hidden">
                  <Card
                    className={`h-full overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 rounded-none ${
                      item.rarity.name === "Covert"
                        ? "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20"
                        : item.rarity.name === "Classified"
                        ? "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20"
                        : item.rarity.name === "Restricted"
                        ? "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
                        : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium line-clamp-2 mb-1">
                            {item.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {item.weapon.name} • {item.category.name}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            className="text-xs"
                            style={{
                              backgroundColor: getRarityColor(
                                item.rarity.color
                              ),
                              color:
                                item.rarity.color === "#b0c3d9"
                                  ? "#000"
                                  : "#fff",
                            }}
                          >
                            {item.rarity.name}
                          </Badge>
                          {item.stattrak && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              StatTrak
                            </Badge>
                          )}
                          {item.souvenir && (
                            <Badge variant="outline" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              Souvenir
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="relative overflow-hidden flex items-center justify-center">
                        <Image
                          src={
                            item.name === "Decoy Grenade"
                              ? "/images/cs2dle/skins/decoy-grenade.png"
                              : item.image
                          }
                          alt={item.name}
                          width={200}
                          height={200}
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium text-green-600">
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Odds:</span>
                          <span className="font-medium text-blue-600">
                            {formatProbability(item.probability)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Back of Card */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-200 border-2 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium line-clamp-2 mb-1">
                            {item.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Detailed Information
                          </p>
                        </div>
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: getRarityColor(item.rarity.color),
                            color:
                              item.rarity.color === "#b0c3d9" ? "#000" : "#fff",
                          }}
                        >
                          {item.rarity.name}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Weapon:</span>
                          <span className="font-medium">
                            {item.weapon.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Category:
                          </span>
                          <span className="font-medium">
                            {item.category.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Pattern:
                          </span>
                          <span className="font-medium">
                            {item.pattern.name}
                          </span>
                        </div>

                        {item.min_float !== null && item.max_float !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Float Range:
                            </span>
                            <span className="font-medium">
                              {item.min_float.toFixed(3)} -{" "}
                              {item.max_float.toFixed(3)}
                            </span>
                          </div>
                        )}

                        {item.paint_index && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Paint Index:
                            </span>
                            <span className="font-medium">
                              {item.paint_index}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Probability:
                          </span>
                          <span className="font-medium text-blue-600">
                            {formatProbability(item.probability)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium text-green-600">
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium capitalize">
                            {item.status}
                          </span>
                        </div>

                        {item.stattrak && (
                          <div className="flex items-center justify-center pt-2">
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              StatTrak Enabled
                            </Badge>
                          </div>
                        )}

                        {item.souvenir && (
                          <div className="flex items-center justify-center">
                            <Badge variant="outline" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              Souvenir Edition
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-3">
                          <Button 
                            variant="outline" 
                            className="text-xs w-full"
                            onClick={() => handleEdit(item)}
                            disabled={togglingItems.has(item._id)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-xs w-full"
                            onClick={() => handleToggleStatus(item)}
                            disabled={togglingItems.has(item._id)}
                          >
                            {togglingItems.has(item._id) ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Ban className="h-3 w-3 mr-1" />
                            )}
                            {togglingItems.has(item._id) 
                              ? (item.status === "active" ? "Deactivating..." : "Activating...")
                              : (item.status === "active" ? "Deactivate" : "Activate")
                            }
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <EditPreCaseModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={selectedItem}
        onSuccess={handleEditSuccess}
      />

      {/* Add Modal */}
      <AddPreCaseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default ItemsTab;
