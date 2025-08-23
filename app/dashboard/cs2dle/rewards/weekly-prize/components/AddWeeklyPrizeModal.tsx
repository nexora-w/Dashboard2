"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Search, Loader2 } from "lucide-react";

interface Skin {
  _id: string;
  name: string;
  image?: string;
  weapon?: {
    id: string;
    weapon_id: string;
    name: string;
  } | string;
  category?: string;
  rarity?: {
    id: string;
    name: string;
    color: string;
  } | string;
  collections?: string[];
}

interface AddWeeklyPrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddWeeklyPrizeModal({ isOpen, onClose, onSuccess }: AddWeeklyPrizeModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Skin[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    price: 0,
    weekStartDate: "",
    weekEndDate: "",
    rarity: {
      name: "Consumer Grade",
      color: "#b0c3d9",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.weekStartDate || !formData.weekEndDate) {
      toast({
        title: "Error",
        description: "Please fill in the name, week start date, and week end date fields",
        variant: "destructive",
      });
      return;
    }

    // Validate that end date is after start date
    if (new Date(formData.weekEndDate) <= new Date(formData.weekStartDate)) {
      toast({
        title: "Error",
        description: "Week end date must be after week start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cs2dle/rewards/weekly-prize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create weekly prize');
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Weekly prize created successfully",
      });
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        image: "",
        price: 0,
        weekStartDate: "",
        weekEndDate: "",
        rarity: { name: "Consumer Grade", color: "#b0c3d9" },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create weekly prize",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof typeof prev] as any || {}),
        [childField]: value
      }
    }));
  };

  // Search for skins with debouncing
  const searchSkins = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/cs2dle/games/skins/search?q=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to search skins');
      }
      const data = await response.json();
      setSearchResults(data.skins || []);
    } catch (error) {
      console.error('Error searching skins:', error);
      toast({
        title: "Error",
        description: "Failed to search skins",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchMode) {
        searchSkins(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMode, searchSkins]);

  // Map rarity name to color
  const getRarityColor = (rarityName: string): string => {
    const rarityColors: Record<string, string> = {
      "Consumer Grade": "#b0c3d9",
      "Industrial Grade": "#5e98d9", 
      "Mil-Spec Grade": "#4b69ff",
      "Restricted": "#8847ff",
      "Classified": "#d32ce6",
      "Covert": "#eb4b4b",
    };
    return rarityColors[rarityName] || "#b0c3d9";
  };

  // Helper function to safely get weapon name
  const getWeaponName = (weapon: Skin['weapon']): string => {
    if (!weapon) return '';
    if (typeof weapon === 'string') return weapon;
    return weapon.name || '';
  };

  // Helper function to safely get rarity name
  const getRarityName = (rarity: Skin['rarity']): string => {
    if (!rarity) return '';
    if (typeof rarity === 'string') return rarity;
    return rarity.name || '';
  };

  // Helper function to safely get rarity color
  const getRarityColorFromSkin = (rarity: Skin['rarity']): string => {
    if (!rarity) return '#b0c3d9';
    if (typeof rarity === 'string') return getRarityColor(rarity);
    return rarity.color || getRarityColor(rarity.name || '');
  };

  // Auto-populate form when skin is selected
  const selectSkin = (skin: Skin) => {
    setSelectedSkin(skin);
    const rarityName = getRarityName(skin.rarity) || "Consumer Grade";
    setFormData(prev => ({
      ...prev,
      name: skin.name,
      image: skin.image || "",
      rarity: {
        name: rarityName,
        color: getRarityColorFromSkin(skin.rarity),
      }
    }));
    setSearchQuery(skin.name);
    setSearchResults([]);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        image: "",
        price: 0,
        weekStartDate: "",
        weekEndDate: "",
        rarity: { name: "Consumer Grade", color: "#b0c3d9" },
      });
      setSearchQuery("");
      setSearchResults([]);
      setSelectedSkin(null);
      setSearchMode(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Weekly Prize</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="search-mode">Auto-select from Database</Label>
            <Switch
              id="search-mode"
              checked={searchMode}
              onCheckedChange={setSearchMode}
            />
          </div>

          {/* Search Interface */}
          {searchMode && (
            <div className="space-y-2">
              <Label htmlFor="search">Search Skins</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a skin..."
                  className="pl-10"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-md p-2">
                  {searchResults.map((skin) => (
                    <Card 
                      key={skin._id} 
                      className="cursor-pointer transition-colors"
                      onClick={() => selectSkin(skin)}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-center space-x-2">
                          {skin.image && (
                            <img 
                              src={skin.image} 
                              alt={skin.name}
                              className="w-8 h-8 object-contain"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{skin.name}</p>
                            <div className="flex items-center space-x-1">
                              {getWeaponName(skin.weapon) && (
                                <Badge variant="outline" className="text-xs">{getWeaponName(skin.weapon)}</Badge>
                              )}
                              {getRarityName(skin.rarity) && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ borderColor: getRarityColorFromSkin(skin.rarity) }}
                                >
                                  {getRarityName(skin.rarity)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Selected Skin Display */}
              {selectedSkin && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    {selectedSkin.image && (
                      <img 
                        src={selectedSkin.image} 
                        alt={selectedSkin.name}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-green-800">{selectedSkin.name}</p>
                      <p className="text-xs text-green-600">Selected - You can still edit the details below</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Item name"
              required
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleInputChange("image", e.target.value)}
              placeholder="Image URL"
            />
          </div>

          {/* Week Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekStartDate">Week Start Date *</Label>
              <DatePicker
                value={formData.weekStartDate}
                onChange={(date) => handleInputChange("weekStartDate", date)}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekEndDate">Week End Date *</Label>
              <DatePicker
                value={formData.weekEndDate}
                onChange={(date) => handleInputChange("weekEndDate", date)}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          {/* Rarity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rarity_name">Rarity</Label>
              <Select
                value={formData.rarity.name}
                onValueChange={(value) => {
                  const colors = {
                    "Consumer Grade": "#b0c3d9",
                    "Industrial Grade": "#5e98d9",
                    "Mil-Spec Grade": "#4b69ff",
                    "Restricted": "#8847ff",
                    "Classified": "#d32ce6",
                    "Covert": "#eb4b4b",
                  };
                  handleNestedChange("rarity", "name", value);
                  handleNestedChange("rarity", "color", colors[value as keyof typeof colors] || "#b0c3d9");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consumer Grade">Consumer Grade</SelectItem>
                  <SelectItem value="Industrial Grade">Industrial Grade</SelectItem>
                  <SelectItem value="Mil-Spec Grade">Mil-Spec Grade</SelectItem>
                  <SelectItem value="Restricted">Restricted</SelectItem>
                  <SelectItem value="Classified">Classified</SelectItem>
                  <SelectItem value="Covert">Covert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rarity_color">Rarity Color</Label>
              <Input
                id="rarity_color"
                type="color"
                value={formData.rarity.color || "#b0c3d9"}
                onChange={(e) => handleNestedChange("rarity", "color", e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Weekly Prize"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
