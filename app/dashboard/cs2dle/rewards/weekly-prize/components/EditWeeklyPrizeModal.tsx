"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/components/ui/use-toast";
import type { WeeklyPrize } from "./ItemsTab";

interface EditWeeklyPrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WeeklyPrize | null;
  onSuccess: () => void;
}

export function EditWeeklyPrizeModal({ isOpen, onClose, item, onSuccess }: EditWeeklyPrizeModalProps) {
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        image: item.image || "",
        price: item.price || 0,
        weekStartDate: item.weekStartDate || "",
        weekEndDate: item.weekEndDate || "",
        rarity: {
          name: item.rarity?.name || "Consumer Grade",
          color: item.rarity?.color || "#b0c3d9",
        },
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;

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
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: item._id,
          ...formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update weekly prize');
      }

      toast({
        title: "Success",
        description: "Weekly prize updated successfully",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update weekly prize",
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

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Weekly Prize</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? "Updating..." : "Update Weekly Prize"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
