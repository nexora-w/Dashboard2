"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { editPreCase, type PreCase, type EditPreCaseRequest } from "../setting";

interface EditPreCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PreCase | null;
  onSuccess: () => void;
}

export function EditPreCaseModal({ isOpen, onClose, item, onSuccess }: EditPreCaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<EditPreCaseRequest>>({});

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        image: item.image,
        weapon: item.weapon,
        category: item.category,
        pattern: item.pattern,
        min_float: item.min_float,
        max_float: item.max_float,
        rarity: item.rarity,
        paint_index: item.paint_index,
        probability: item.probability,
        price: item.price,
        status: item.status as 'active' | 'inactive',
        stattrak: item.stattrak,
        souvenir: item.souvenir,
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;

    setLoading(true);
    try {
      const result = await editPreCase({
        _id: item._id,
        ...formData
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {item.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Item name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Item description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image || ""}
              onChange={(e) => handleInputChange("image", e.target.value)}
              placeholder="Image URL"
            />
          </div>

          {/* Weapon Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weapon_name">Weapon Name</Label>
              <Input
                id="weapon_name"
                value={formData.weapon?.name || ""}
                onChange={(e) => handleNestedChange("weapon", "name", e.target.value)}
                placeholder="Weapon name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon_id">Weapon ID</Label>
              <Input
                id="weapon_id"
                type="number"
                value={formData.weapon?.weapon_id || 0}
                onChange={(e) => handleNestedChange("weapon", "weapon_id", parseInt(e.target.value))}
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
                value={formData.category?.name || ""}
                onChange={(e) => handleNestedChange("category", "name", e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern_name">Pattern</Label>
              <Input
                id="pattern_name"
                value={formData.pattern?.name || ""}
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
                onChange={(e) => handleInputChange("min_float", e.target.value ? parseFloat(e.target.value) : null)}
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
                onChange={(e) => handleInputChange("max_float", e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="1.00"
              />
            </div>
          </div>

          {/* Rarity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rarity_name">Rarity Name</Label>
              <Input
                id="rarity_name"
                value={formData.rarity?.name || ""}
                onChange={(e) => handleNestedChange("rarity", "name", e.target.value)}
                placeholder="Rarity name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rarity_color">Rarity Color</Label>
              <Input
                id="rarity_color"
                type="color"
                value={formData.rarity?.color || "#000000"}
                onChange={(e) => handleNestedChange("rarity", "color", e.target.value)}
              />
            </div>
          </div>

          {/* Paint Index */}
          <div className="space-y-2">
            <Label htmlFor="paint_index">Paint Index</Label>
            <Input
              id="paint_index"
              value={formData.paint_index || ""}
              onChange={(e) => handleInputChange("paint_index", e.target.value)}
              placeholder="Paint index"
            />
          </div>

          {/* Probability and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                step="0.001"
                min="0"
                max="100"
                value={formData.probability || 0}
                onChange={(e) => handleInputChange("probability", parseFloat(e.target.value))}
                placeholder="0.001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || 0}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || "active"}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Switches */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="stattrak"
                checked={formData.stattrak || false}
                onCheckedChange={(checked) => handleInputChange("stattrak", checked)}
              />
              <Label htmlFor="stattrak">StatTrak</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="souvenir"
                checked={formData.souvenir || false}
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
