"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrphanedImage {
  publicId: string;
  url: string;
  createdAt: string;
  bytes: number;
}

export function ImageCleanupManager() {
  const [selectedFolder, setSelectedFolder] = useState<string>(
    "bebras/questions"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [orphanedImages, setOrphanedImages] = useState<OrphanedImage[]>([]);

  async function handlePreview() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/cleanup/images?folder=${selectedFolder}`
      );
      const data = await response.json();

      if (data.success) {
        setOrphanedImages(data.orphanedImages);
        toast.info(
          `Found ${data.orphanedImages.length} orphaned image(s) in ${selectedFolder}`
        );
      } else {
        toast.error(data.error || "Failed to fetch orphaned images");
      }
    } catch {
      toast.error("Failed to preview orphaned images");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCleanup() {
    if (orphanedImages.length === 0) {
      toast.error("No orphaned images to delete. Run preview first.");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${orphanedImages.length} orphaned image(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/cleanup/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: selectedFolder }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Deleted ${data.deletedCount} orphaned image(s)`);
        setOrphanedImages([]);
      } else {
        toast.error(data.errors?.[0] || "Failed to cleanup images");
      }
    } catch {
      toast.error("Failed to cleanup images");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCleanupAll() {
    const confirmed = confirm(
      "Are you sure you want to cleanup ALL folders (questions & answers)? This cannot be undone."
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/cleanup/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // No folder = cleanup all
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Deleted ${data.deletedCount} orphaned image(s) total`);
        setOrphanedImages([]);
      } else {
        toast.error(data.errors?.[0] || "Failed to cleanup all images");
      }
    } catch {
      toast.error("Failed to cleanup all images");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Cleanup Manager</CardTitle>
        <CardDescription>
          Remove orphaned images from Cloudinary that are not in the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Folder Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Folder</label>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger>
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bebras/questions">
                Questions (bebras/questions)
              </SelectItem>
              <SelectItem value="bebras/answers">
                Answers (bebras/answers)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isLoading}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview Orphaned Images
          </Button>
          <Button
            variant="destructive"
            onClick={handleCleanup}
            disabled={isLoading || orphanedImages.length === 0}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Orphaned ({orphanedImages.length})
          </Button>
        </div>

        {/* Cleanup All Button */}
        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            onClick={handleCleanupAll}
            disabled={isLoading}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Cleanup All Folders
          </Button>
        </div>

        {/* Results */}
        {orphanedImages.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="font-medium text-sm">
              Orphaned Images ({orphanedImages.length})
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {orphanedImages.map((img, idx) => (
                <div
                  key={idx}
                  className="text-xs text-muted-foreground p-2 bg-muted rounded font-mono truncate"
                >
                  {img.publicId}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
