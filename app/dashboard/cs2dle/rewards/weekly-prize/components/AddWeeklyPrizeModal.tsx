"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import type { WeeklyPrize } from "./WeeklyPrizeClient";

interface AddWeeklyPrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddWeeklyPrizeModal({ isOpen, onClose, onSuccess }: AddWeeklyPrizeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skinId: "",
    name: "",
    description: "",
    image: "",
    weapon: {
      name: "",
      weapon_id: undefined as number | undefined,
    },
    category: {
      name: "",
    },
    pattern: {
      name: "",
    },
    min_float: undefined as number | undefined,
    max_float: undefined as number | undefined,
    rarity: {
      name: "Consumer Grade",
      color: "#b0c3d9",
    },
    paint_index: "",
    price: 0,
    weekStartDate: "",
    weekEndDate: "",
    stattrak: false,
    souvenir: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.skinId || !formData.name || !formData.weekStartDate || !formData.weekEndDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
        skinId: "",
        name: "",
        description: "",
        image: "",
        weapon: { name: "", weapon_id: undefined },
        category: { name: "" },
        pattern: { name: "" },
        min_float: undefined,
        max_float: undefined,
        rarity: { name: "Consumer Grade", color: "#b0c3d9" },
        paint_index: "",
        price: 0,
        weekStartDate: "",
        weekEndDate: "",
        stattrak: false,
        souvenir: false,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Weekly Prize</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="skinId">Skin ID *</Label>
            <Input
              id="skinId"
              value={formData.skinId}
              onChange={(e) => handleInputChange("skinId", e.target.value)}
              placeholder="Unique skin identifier"
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Item description"
              rows={3}
            />
          </div>

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
              <Input
                id="weekStartDate"
                type="date"
                value={formData.weekStartDate}
                onChange={(e) => handleInputChange("weekStartDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekEndDate">Week End Date *</Label>
              <Input
                id="weekEndDate"
                type="date"
                value={formData.weekEndDate}
                onChange={(e) => handleInputChange("weekEndDate", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Weapon Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weapon_name">Weapon Name</Label>
              <Input
                id="weapon_name"
                value={formData.weapon.name}
                onChange={(e) => handleNestedChange("weapon", "name", e.target.value)}
                placeholder="Weapon name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon_id">Weapon ID</Label>
              <Input
                id="weapon_id"
                type="number"
                value={formData.weapon.weapon_id || ""}
                onChange={(e) => handleNestedChange("weapon", "weapon_id", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Weapon ID"
              />
            </div>
          </div>

          {/* Category and Pattern */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_name">Category</Label>
              <Input
                id="category_name"
                value={formData.category.name}
                onChange={(e) => handleNestedChange("category", "name", e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern_name">Pattern</Label>
              <Input
                id="pattern_name"
                value={formData.pattern.name}
                onChange={(e) => handleNestedChange("pattern", "name", e.target.value)}
                placeholder="Pattern name"
              />
            </div>
          </div>

          {/* Float Values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_float">Min Float</Label>
              <Input
                id="min_float"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.min_float || ""}
                onChange={(e) => handleInputChange("min_float", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_float">Max Float</Label>
              <Input
                id="max_float"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.max_float || ""}
                onChange={(e) => handleInputChange("max_float", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="1.00"
              />
            </div>
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

          {/* Paint Index */}
          <div className="space-y-2">
            <Label htmlFor="paint_index">Paint Index</Label>
            <Input
              id="paint_index"
              value={formData.paint_index}
              onChange={(e) => handleInputChange("paint_index", e.target.value)}
              placeholder="Paint index"
            />
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

          {/* Switches */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="stattrak"
                checked={formData.stattrak}
                onCheckedChange={(checked) => handleInputChange("stattrak", checked)}
              />
              <Label htmlFor="stattrak">StatTrak</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="souvenir"
                checked={formData.souvenir}
                onCheckedChange={(checked) => handleInputChange("souvenir", checked)}
              />
              <Label htmlFor="souvenir">Souvenir</Label>
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
