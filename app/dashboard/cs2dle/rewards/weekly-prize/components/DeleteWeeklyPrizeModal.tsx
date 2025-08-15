"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { WeeklyPrize } from "./WeeklyPrizeClient";

interface DeleteWeeklyPrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WeeklyPrize | null;
  onSuccess: () => void;
}

export function DeleteWeeklyPrizeModal({ isOpen, onClose, item, onSuccess }: DeleteWeeklyPrizeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!item) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cs2dle/rewards/weekly-prize?skinId=${item.skinId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete weekly prize');
      }

      toast({
        title: "Success",
        description: "Weekly prize deleted successfully",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete weekly prize",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Weekly Prize</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the weekly prize "{item.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
