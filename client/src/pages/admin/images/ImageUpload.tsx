import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSiteFilter, SITES } from "@/contexts/SiteFilterContext";
import type { ImageMetadata } from "@shared/admin-types";
import { Upload, Image as ImageIcon, AlertCircle, X } from "lucide-react";

const ENTITY_TYPES = [
  { value: "vehicle", label: "Vehicle" },
  { value: "service", label: "Service" },
  { value: "city", label: "City" },
  { value: "blog", label: "Blog" },
  { value: "general", label: "General" },
];

const SOURCE_TYPES = [
  { value: "owned", label: "Owned" },
  { value: "licensed", label: "Licensed (requires proof)" },
  { value: "ai", label: "AI Generated" },
];

interface UploadFormData {
  file: File | null;
  alt: string;
  entityType: ImageMetadata["entityType"] | "";
  entitySlug: string;
  siteSlug: string;
  source: ImageMetadata["source"] | "";
  proofUrl: string;
  tags: string[];
}

export default function ImageUpload() {
  const { selectedSite } = useSiteFilter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState<UploadFormData>({
    file: null,
    alt: "",
    entityType: "",
    entitySlug: "",
    siteSlug: selectedSite === "all" ? "airport" : selectedSite,
    source: "",
    proofUrl: "",
    tags: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        file: "Please select a valid image file",
      }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setFormData((prev) => ({ ...prev, file }));
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.file) {
      newErrors.file = "Image file is required";
    }

    if (!formData.alt || formData.alt.trim().length < 10) {
      newErrors.alt = "Alt text must be at least 10 characters";
    }

    if (!formData.entityType) {
      newErrors.entityType = "Entity type is required";
    }

    if (!formData.entitySlug || formData.entitySlug.trim().length === 0) {
      newErrors.entitySlug = "Entity slug is required";
    }

    if (!formData.source) {
      newErrors.source = "Source is required";
    }

    if (formData.source === "licensed" && !formData.proofUrl) {
      newErrors.proofUrl = "Proof URL is required for licensed images";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      // TODO: Implement actual upload logic
      console.log("Uploading image:", formData);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset form on success
      setFormData({
        file: null,
        alt: "",
        entityType: "",
        entitySlug: "",
        siteSlug: selectedSite === "all" ? "airport" : selectedSite,
        source: "",
        proofUrl: "",
        tags: [],
      });
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const fileSizeWarning = formData.file && formData.file.size > 300000;

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Upload Image</h1>
        <p className="text-gray-600 mt-1">Add a new image to the library</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Image Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                Image File <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col gap-4">
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={errors.file ? "border-red-500" : ""}
                />
                {errors.file && (
                  <p className="text-sm text-red-500">{errors.file}</p>
                )}
                {previewUrl && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-medium mb-2">Preview</p>
                    <div className="aspect-video relative bg-white rounded overflow-hidden max-w-md">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {formData.file && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>File name: {formData.file.name}</p>
                        <p>Size: {(formData.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Compression Warning */}
            {fileSizeWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Image size exceeds 300KB (
                  {(formData.file!.size / 1024).toFixed(1)} KB). Consider
                  compressing the image before uploading for better performance.
                </AlertDescription>
              </Alert>
            )}

            {/* Alt Text */}
            <div className="space-y-2">
              <Label htmlFor="alt">
                Alt Text <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="alt"
                placeholder="Describe the image (minimum 10 characters)"
                value={formData.alt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, alt: e.target.value }))
                }
                className={errors.alt ? "border-red-500" : ""}
                rows={3}
              />
              <div className="flex justify-between text-sm">
                {errors.alt && <p className="text-red-500">{errors.alt}</p>}
                <p className="text-gray-500 ml-auto">
                  {formData.alt.length} / 10 minimum
                </p>
              </div>
            </div>

            {/* Site Selection */}
            <div className="space-y-2">
              <Label htmlFor="siteSlug">
                Site <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.siteSlug}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, siteSlug: value }))
                }
              >
                <SelectTrigger id="siteSlug">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITES.filter((site) => site.value !== "all").map((site) => (
                    <SelectItem key={site.value} value={site.value}>
                      {site.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entityType">
                Entity Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.entityType}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, entityType: value }))
                }
              >
                <SelectTrigger
                  id="entityType"
                  className={errors.entityType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entityType && (
                <p className="text-sm text-red-500">{errors.entityType}</p>
              )}
            </div>

            {/* Entity Slug */}
            <div className="space-y-2">
              <Label htmlFor="entitySlug">
                Entity Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="entitySlug"
                placeholder="e.g., executive-suv or chicago-downtown"
                value={formData.entitySlug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    entitySlug: e.target.value,
                  }))
                }
                className={errors.entitySlug ? "border-red-500" : ""}
              />
              {errors.entitySlug && (
                <p className="text-sm text-red-500">{errors.entitySlug}</p>
              )}
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">
                Source <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, source: value }))
                }
              >
                <SelectTrigger
                  id="source"
                  className={errors.source ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select image source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-sm text-red-500">{errors.source}</p>
              )}
            </div>

            {/* Proof URL (conditional) */}
            {formData.source === "licensed" && (
              <div className="space-y-2">
                <Label htmlFor="proofUrl">
                  Proof URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="proofUrl"
                  type="url"
                  placeholder="https://example.com/license-proof"
                  value={formData.proofUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      proofUrl: e.target.value,
                    }))
                  }
                  className={errors.proofUrl ? "border-red-500" : ""}
                />
                {errors.proofUrl && (
                  <p className="text-sm text-red-500">{errors.proofUrl}</p>
                )}
                <p className="text-sm text-gray-500">
                  URL to license documentation or purchase receipt
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Enter tag and press Add"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="pl-2 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
