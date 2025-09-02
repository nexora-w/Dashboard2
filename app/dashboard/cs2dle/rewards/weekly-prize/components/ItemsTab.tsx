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
  Users,
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
import SelectWinnersModal from "./SelectWinnersModal";

export interface WeeklyPrize {
  _id: string;
  name: string;
  image?: string;
  price?: number;
  weekStartDate?: string;
  weekEndDate?: string;
  rarity?: {
    name: string;
    color: string;
  };
  status: "active" | "inactive";
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ItemsTab = () => {
  const [data, setData] = useState<WeeklyPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("weekStartDate");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectWinnersModalOpen, setSelectWinnersModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WeeklyPrize | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWeeklyPrizes();
  }, []);

  const fetchWeeklyPrizes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cs2dle/rewards/weekly-prize");

      if (!response.ok) {
        throw new Error("Failed to fetch weekly prizes");
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  // Get today's date in Amsterdam timezone
  const getTodayInAmsterdam = () => {
    const now = new Date();
    const amsterdamDate = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" })
    );
    return amsterdamDate;
  };

  // Check if today's date falls within the weekly prize date range
  const isTodayInPrizeWeek = (item: WeeklyPrize) => {
    if (!item.weekStartDate || !item.weekEndDate) return false;

    const today = getTodayInAmsterdam();
    const startDate = new Date(item.weekStartDate);
    const endDate = new Date(item.weekEndDate);

    // Set time to beginning of day for start date and end of day for end date
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);

    return today >= startDate && today <= endDate;
  };

  const sortData = (items: WeeklyPrize[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "weekStartDate":
          return (
            new Date(b.weekStartDate || "").getTime() -
            new Date(a.weekStartDate || "").getTime()
          );
        case "price":
          return (b.price || 0) - (a.price || 0);
        case "rarity":
          const aWeight = getRarityWeight(a.rarity?.name || "");
          const bWeight = getRarityWeight(b.rarity?.name || "");
          return bWeight - aWeight;
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  };

  const handleStatusToggle = async (item: WeeklyPrize) => {
    if (updatingItems.has(item._id)) return;

    setUpdatingItems((prev) => new Set(prev).add(item._id));

    try {
      const newStatus = item.status === "active" ? "inactive" : "active";

      const response = await fetch("/api/cs2dle/rewards/weekly-prize", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: item._id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setData((prev) =>
        prev.map((d) => (d._id === item._id ? { ...d, status: newStatus } : d))
      );

      toast({
        title: "Status Updated",
        description: `Weekly prize status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item._id);
        return newSet;
      });
    }
  };

  const handleEdit = (item: WeeklyPrize) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = (item: WeeklyPrize) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleSelectWinners = (item: WeeklyPrize) => {
    setSelectedItem(item);
    setSelectWinnersModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchWeeklyPrizes();
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectWinnersModalOpen(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const sortedData = sortData(data);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekStartDate">Week Start Date</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Weekly Prize
        </Button>
      </div>

      {/* Weekly Prizes Grid */}
      {sortedData.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No weekly prizes
          </h3>
          <p className="text-gray-500">
            Create your first weekly prize to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedData.map((item) => (
            <Card
              key={item._id}
              className={`overflow-hidden transition-all duration-200 ${
                hoveredCard === item._id ? "ring-2 ring-blue-500 shadow-lg" : ""
              }`}
              onMouseEnter={() => setHoveredCard(item._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold truncate">
                    {item.name}
                  </CardTitle>
                  <Badge
                    variant={item.status === "active" ? "default" : "secondary"}
                    className={item.status === "active" ? "bg-green-500" : ""}
                  >
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Image */}
                {item.image && (
                  <div className="relative h-32 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2">
                  {item.rarity && (
                    <div className="flex items-center gap-2">
                      <Star
                        className="h-4 w-4"
                        style={{ color: getRarityColor(item.rarity.color) }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: getRarityColor(item.rarity.color) }}
                      >
                        {item.rarity.name}
                      </span>
                    </div>
                  )}

                  {item.price !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  )}

                  {item.weekStartDate && item.weekEndDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatDate(item.weekStartDate)} -{" "}
                        {formatDate(item.weekEndDate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => handleSelectWinners(item)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    size="sm"
                  >
                    <Users className="h-3 w-3 mr-2" />
                    Select Winner
                  </Button>

                  {/* Regular Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={
                        item.status === "active" ? "secondary" : "default"
                      }
                      size="sm"
                      onClick={() => handleStatusToggle(item)}
                      disabled={updatingItems.has(item._id)}
                      className="flex-1"
                    >
                      {updatingItems.has(item._id) ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : null}
                      {item.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddWeeklyPrizeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EditWeeklyPrizeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={selectedItem}
        onSuccess={handleModalSuccess}
      />

      <DeleteWeeklyPrizeModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        item={selectedItem}
        onSuccess={handleModalSuccess}
      />

      <SelectWinnersModal
        isOpen={selectWinnersModalOpen}
        onClose={() => setSelectWinnersModalOpen(false)}
        weeklyPrize={selectedItem}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ItemsTab;
