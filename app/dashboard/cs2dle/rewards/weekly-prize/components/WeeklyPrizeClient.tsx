"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Star,
  Trophy,
  SortAsc,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddWeeklyPrizeModal } from "./AddWeeklyPrizeModal";
import { EditWeeklyPrizeModal } from "./EditWeeklyPrizeModal";
import { DeleteWeeklyPrizeModal } from "./DeleteWeeklyPrizeModal";

export interface WeeklyPrize {
  _id: string;
  skinId: string;
  name: string;
  description?: string;
  image?: string;
  weapon?: {
    id: string;
    weapon_id: number;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  pattern?: {
    id: string;
    name: string;
  };
  min_float?: number;
  max_float?: number;
  rarity?: {
    id: string;
    name: string;
    color: string;
  };
  stattrak?: boolean;
  souvenir?: boolean;
  paint_index?: string;
  price?: number;
  weekStartDate: string;
  weekEndDate: string;
  status: 'active' | 'inactive';
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const WeeklyPrizeClient = () => {
  const [data, setData] = useState<WeeklyPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("weekStartDate");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WeeklyPrize | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWeeklyPrizes();
  }, []);

  const fetchWeeklyPrizes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cs2dle/rewards/weekly-prize');
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly prizes');
      }
      
      const result = await response.json();
      setData(result.weeklyPrizes || []);
    } catch (err) {
      setError("Error loading weekly prize data");
      console.error("Error fetching weekly prizes:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const sortData = (items: WeeklyPrize[]) => {
    switch (sortBy) {
      case "weekStartDate":
        return [...items].sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
      case "price":
        return [...items].sort((a, b) => (b.price || 0) - (a.price || 0));
      case "rarity":
        return [...items].sort((a, b) => getRarityWeight(b.rarity?.name || "") - getRarityWeight(a.rarity?.name || ""));
      case "name":
        return [...items].sort((a, b) => a.name.localeCompare(b.name));
      case "status":
        return [...items].sort((a, b) => a.status.localeCompare(b.status));
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

  const handleEdit = (item: WeeklyPrize) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = (item: WeeklyPrize) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleEditSuccess = async () => {
    await fetchWeeklyPrizes();
  };

  const handleAddSuccess = async () => {
    await fetchWeeklyPrizes();
  };

  const handleDeleteSuccess = async () => {
    await fetchWeeklyPrizes();
  };

  const handleToggleStatus = async (item: WeeklyPrize) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(item._id));
      
      const newStatus = item.status === "active" ? "inactive" : "active";
      
      const response = await fetch('/api/cs2dle/rewards/weekly-prize', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skinId: item.skinId,
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast({
        title: "Success",
        description: `Weekly prize ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      });
      
      await fetchWeeklyPrizes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle status",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item._id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="text-center p-4">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
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
      {/* Weekly Prize Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-muted-foreground">Total Prizes</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {data.filter((item) => item.status === "active").length}
          </div>
          <div className="text-sm text-muted-foreground">Active Prizes</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {data.filter((item) => item.rarity?.name === "Covert").length}
          </div>
          <div className="text-sm text-muted-foreground">Covert Items</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">
            ${data.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Total Value</div>
        </Card>
      </div>

      {/* Sort Controls and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Weekly Prize
        </Button>
        
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekStartDate">Sort by Week Start</SelectItem>
              <SelectItem value="price">Sort by Price</SelectItem>
              <SelectItem value="rarity">Sort by Rarity</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortData(data).map((item) => (
          <Card key={item._id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium line-clamp-2 mb-1">
                    {item.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {item.weapon?.name} • {item.category?.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {item.rarity && (
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: getRarityColor(item.rarity.color),
                        color: item.rarity.color === "#b0c3d9" ? "#000" : "#fff",
                      }}
                    >
                      {item.rarity.name}
                    </Badge>
                  )}
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
              <div className="relative overflow-hidden flex items-center justify-center mb-3">
                <Image
                  src={
                    item.name === "Decoy Grenade"
                      ? "/images/cs2dle/skins/decoy-grenade.png"
                      : item.image || "/placeholder.jpg"
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
                    {formatPrice(item.price || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Week:</span>
                  <span className="font-medium text-blue-600">
                    {formatDate(item.weekStartDate)}
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <Badge 
                    variant={item.status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleEdit(item)}
                    disabled={updatingItems.has(item._id)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleToggleStatus(item)}
                    disabled={updatingItems.has(item._id)}
                  >
                    {updatingItems.has(item._id) ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Calendar className="h-3 w-3 mr-1" />
                    )}
                    {updatingItems.has(item._id) 
                      ? (item.status === "active" ? "Deactivating..." : "Activating...")
                      : (item.status === "active" ? "Deactivate" : "Activate")
                    }
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item)}
                    disabled={updatingItems.has(item._id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <EditWeeklyPrizeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={selectedItem}
        onSuccess={handleEditSuccess}
      />

      <AddWeeklyPrizeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <DeleteWeeklyPrizeModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        item={selectedItem}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default WeeklyPrizeClient;
