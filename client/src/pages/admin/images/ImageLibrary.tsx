import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSiteFilter } from "@/contexts/SiteFilterContext";
import type { ImageMetadata } from "@shared/admin-types";
import { Upload, Trash2, Edit, Image as ImageIcon } from "lucide-react";

const ENTITY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "vehicle", label: "Vehicle" },
  { value: "service", label: "Service" },
  { value: "city", label: "City" },
  { value: "blog", label: "Blog" },
  { value: "general", label: "General" },
];

const SOURCE_TYPES = [
  { value: "all", label: "All Sources" },
  { value: "owned", label: "Owned" },
  { value: "licensed", label: "Licensed" },
  { value: "ai", label: "AI Generated" },
];

// Mock data for demonstration
const MOCK_IMAGES: ImageMetadata[] = [
  {
    id: "1",
    path: "/images/vehicles/suv-1.jpg",
    url: "https://example.com/images/vehicles/suv-1.jpg",
    alt: "Luxury black SUV exterior view",
    entityType: "vehicle",
    entitySlug: "executive-suv",
    siteSlug: "corporate",
    source: "owned",
    width: 1920,
    height: 1080,
    size: 245000,
    format: "jpeg",
    uploadedBy: "admin@example.com",
    uploadedAt: "2024-01-15T10:00:00Z",
    tags: ["suv", "executive", "luxury"],
  },
];

export default function ImageLibrary() {
  const { selectedSite } = useSiteFilter();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [images, setImages] = useState<ImageMetadata[]>(MOCK_IMAGES);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(
    null,
  );
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      const siteMatch =
        selectedSite === "all" || image.siteSlug === selectedSite;
      const entityMatch =
        entityTypeFilter === "all" || image.entityType === entityTypeFilter;
      const sourceMatch =
        sourceFilter === "all" || image.source === sourceFilter;
      return siteMatch && entityMatch && sourceMatch;
    });
  }, [images, selectedSite, entityTypeFilter, sourceFilter]);

  const handleImageClick = (image: ImageMetadata) => {
    setSelectedImage(image);
    setDetailsModalOpen(true);
  };

  const handleUpload = () => {
    // TODO: Navigate to upload page or open upload modal
    console.log("Navigate to upload");
  };

  const handleDelete = (imageId: string) => {
    // TODO: Implement delete with confirmation
    console.log("Delete image:", imageId);
  };

  const handleEdit = (imageId: string) => {
    // TODO: Navigate to edit page or open edit modal
    console.log("Edit image:", imageId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Image Library</h1>
          <p className="text-gray-600 mt-1">Manage images for all entities</p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Entity Type
              </label>
              <Select
                value={entityTypeFilter}
                onValueChange={setEntityTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredImages.length}{" "}
            {filteredImages.length === 1 ? "Image" : "Images"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                  {/* TODO: Replace with actual image */}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{image.alt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {image.entityType}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {image.source}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {image.width}x{image.height} • {formatFileSize(image.size)}
                  </p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(image.id);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No images found matching the filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
                <ImageIcon className="h-24 w-24 text-gray-400" />
                {/* TODO: Replace with actual image */}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Alt Text
                  </label>
                  <p className="mt-1">{selectedImage.alt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Entity
                  </label>
                  <p className="mt-1">
                    {selectedImage.entityType} / {selectedImage.entitySlug}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Source
                  </label>
                  <p className="mt-1 capitalize">{selectedImage.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dimensions
                  </label>
                  <p className="mt-1">
                    {selectedImage.width}x{selectedImage.height}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Size
                  </label>
                  <p className="mt-1">{formatFileSize(selectedImage.size)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Format
                  </label>
                  <p className="mt-1 uppercase">{selectedImage.format}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Uploaded By
                  </label>
                  <p className="mt-1">{selectedImage.uploadedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Uploaded At
                  </label>
                  <p className="mt-1">
                    {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedImage.proofUrl && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Proof URL
                    </label>
                    <p className="mt-1">
                      <a
                        href={selectedImage.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedImage.proofUrl}
                      </a>
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedImage.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
