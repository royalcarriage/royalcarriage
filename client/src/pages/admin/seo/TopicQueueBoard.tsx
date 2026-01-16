import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSiteFilter, SITES } from "@/contexts/SiteFilterContext";
import type { SEOTopic } from "@shared/admin-types";
import { Edit, Trash2 } from "lucide-react";

type ColumnStatus = "proposed" | "draft" | "ready" | "published" | "blocked";

const COLUMNS: { status: ColumnStatus; label: string; color: string }[] = [
  { status: "proposed", label: "Proposed", color: "bg-gray-100" },
  { status: "draft", label: "Draft", color: "bg-blue-100" },
  { status: "ready", label: "Ready", color: "bg-green-100" },
  { status: "published", label: "Published", color: "bg-purple-100" },
  { status: "blocked", label: "Blocked", color: "bg-red-100" },
];

const PAGE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "city", label: "City" },
  { value: "service", label: "Service" },
  { value: "fleet", label: "Fleet" },
  { value: "blog", label: "Blog" },
];

// Mock data for demonstration
const MOCK_TOPICS: SEOTopic[] = [
  {
    id: "1",
    title: "Chicago Airport Transportation to O'Hare",
    slug: "chicago-airport-transportation-ohare",
    pageType: "city",
    siteSlug: "airport",
    status: "proposed",
    primaryKeyword: "chicago airport transportation",
    secondaryKeywords: ["ohare airport", "airport car service"],
    targetUrl: "/city/chicago-airport-ohare",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Luxury Party Bus Rental Chicago",
    slug: "luxury-party-bus-chicago",
    pageType: "service",
    siteSlug: "partybus",
    status: "draft",
    primaryKeyword: "party bus rental",
    secondaryKeywords: ["luxury party bus", "chicago party bus"],
    targetUrl: "/service/luxury-party-bus",
    createdAt: "2024-01-14T09:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
  },
  {
    id: "3",
    title: "Executive SUV Fleet Options",
    slug: "executive-suv-fleet",
    pageType: "fleet",
    siteSlug: "corporate",
    status: "ready",
    primaryKeyword: "executive suv",
    secondaryKeywords: ["corporate suv", "business transportation"],
    targetUrl: "/fleet/executive-suv",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-17T11:00:00Z",
  },
];

export default function TopicQueueBoard() {
  const { selectedSite } = useSiteFilter();
  const [pageTypeFilter, setPageTypeFilter] = useState<string>("all");
  const [draggedTopic, setDraggedTopic] = useState<SEOTopic | null>(null);
  const [topics, setTopics] = useState<SEOTopic[]>(MOCK_TOPICS);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<SEOTopic | null>(null);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const siteMatch =
        selectedSite === "all" || topic.siteSlug === selectedSite;
      const typeMatch =
        pageTypeFilter === "all" || topic.pageType === pageTypeFilter;
      return siteMatch && typeMatch;
    });
  }, [topics, selectedSite, pageTypeFilter]);

  const getTopicsForColumn = (status: ColumnStatus) => {
    return filteredTopics.filter((topic) => topic.status === status);
  };

  const handleDragStart = (e: React.DragEvent, topic: SEOTopic) => {
    setDraggedTopic(topic);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ColumnStatus) => {
    e.preventDefault();

    if (!draggedTopic) return;

    // Update topic status
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === draggedTopic.id
          ? {
              ...topic,
              status: targetStatus,
              updatedAt: new Date().toISOString(),
            }
          : topic,
      ),
    );

    setDraggedTopic(null);

    // TODO: Firebase update
    console.log(`Moving topic ${draggedTopic.id} to ${targetStatus}`);
  };

  const handleEdit = (topic: SEOTopic) => {
    // TODO: Open edit modal or navigate to edit page
    console.log("Edit topic:", topic);
  };

  const handleDelete = (topic: SEOTopic) => {
    setTopicToDelete(topic);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!topicToDelete) return;

    setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id));
    setDeleteDialogOpen(false);
    setTopicToDelete(null);

    // TODO: Firebase delete
    console.log("Deleted topic:", topicToDelete.id);
  };

  const getStatusBadgeVariant = (
    status: ColumnStatus,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "published":
        return "default";
      case "ready":
        return "secondary";
      case "blocked":
        return "destructive";
      case "proposed":
        return "outline";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">SEO Topic Queue</h1>
        <div className="flex gap-4">
          <Select value={pageTypeFilter} onValueChange={setPageTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {COLUMNS.map((column) => {
          const columnTopics = getTopicsForColumn(column.status);

          return (
            <div
              key={column.status}
              className="space-y-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <Card className={column.color}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex justify-between items-center">
                    {column.label}
                    <Badge variant="outline">{columnTopics.length}</Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <div className="space-y-3">
                {columnTopics.map((topic) => (
                  <Card
                    key={topic.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, topic)}
                    className="cursor-move hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {topic.title}
                        </CardTitle>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEdit(topic)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDelete(topic)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {topic.pageType}
                        </Badge>
                        <Badge
                          variant={getStatusBadgeVariant(topic.status)}
                          className="text-xs"
                        >
                          {topic.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium">
                          {topic.primaryKeyword}
                        </div>
                        {topic.secondaryKeywords.length > 0 && (
                          <div className="text-xs mt-1">
                            +{topic.secondaryKeywords.length} keywords
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {SITES.find((s) => s.value === topic.siteSlug)?.label ||
                          topic.siteSlug}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{topicToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
