import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ChangelogEntry } from "@shared/admin-types";
import { Calendar, FileText, Image, Tag, User, Filter } from "lucide-react";

// Mock changelog data
const generateMockChangelog = (): ChangelogEntry[] => {
  return [
    {
      id: "1",
      date: "2024-01-17",
      type: "publish",
      pages: [
        "/city/chicago-ohare-airport",
        "/city/downtown-chicago-limo",
        "/service/wedding-transportation",
      ],
      keywords: ["chicago airport", "downtown limo", "wedding limo"],
      images: ["chicago-skyline.jpg", "wedding-limo-white.jpg"],
      author: "SEO Bot",
      authorEmail: "seobot@royalcarriage.com",
      description:
        "Published 3 new city and service pages targeting Chicago market. Added seasonal winter imagery.",
    },
    {
      id: "2",
      date: "2024-01-15",
      type: "update",
      pages: ["/fleet/cadillac-escalade", "/fleet/mercedes-sprinter"],
      keywords: ["luxury suv", "group transportation"],
      images: ["escalade-interior.jpg", "sprinter-exterior.jpg"],
      author: "John Admin",
      authorEmail: "john@royalcarriage.com",
      description:
        "Updated fleet pages with new interior photos and updated pricing information.",
    },
    {
      id: "3",
      date: "2024-01-14",
      type: "import",
      pages: [],
      keywords: [],
      images: [],
      author: "System",
      authorEmail: "system@royalcarriage.com",
      description:
        "Imported 1,247 bookings from Moovs. Detected 12 duplicates, imported 1,235 new records.",
    },
    {
      id: "4",
      date: "2024-01-12",
      type: "publish",
      pages: [
        "/blog/airport-travel-tips",
        "/blog/choosing-wedding-limo",
        "/blog/corporate-transportation-guide",
      ],
      keywords: ["airport tips", "wedding planning", "corporate travel"],
      images: ["airport-tips-hero.jpg", "wedding-checklist.jpg"],
      author: "SEO Bot",
      authorEmail: "seobot@royalcarriage.com",
      description:
        "Published 3 new blog posts with comprehensive guides for different service types.",
    },
    {
      id: "5",
      date: "2024-01-10",
      type: "update",
      pages: ["/pricing", "/about", "/contact"],
      keywords: [],
      images: ["team-photo-2024.jpg"],
      author: "Sarah Admin",
      authorEmail: "sarah@royalcarriage.com",
      description:
        "Updated pricing page with 2024 rates. Added new team photo to about page.",
    },
    {
      id: "6",
      date: "2024-01-08",
      type: "delete",
      pages: ["/old-service-page", "/outdated-fleet-vehicle"],
      keywords: [],
      images: [],
      author: "John Admin",
      authorEmail: "john@royalcarriage.com",
      description:
        "Removed 2 outdated pages that were no longer relevant. Redirects configured.",
    },
    {
      id: "7",
      date: "2024-01-05",
      type: "import",
      pages: [],
      keywords: [],
      images: [],
      author: "System",
      authorEmail: "system@royalcarriage.com",
      description:
        "Imported ads performance data for December 2023. Total spend: $24,567, ROAS: 4.2x.",
    },
    {
      id: "8",
      date: "2024-01-03",
      type: "publish",
      pages: [
        "/city/naperville-car-service",
        "/city/schaumburg-limo",
        "/city/evanston-transportation",
      ],
      keywords: [
        "naperville limo",
        "schaumburg car service",
        "evanston transportation",
      ],
      images: [],
      author: "SEO Bot",
      authorEmail: "seobot@royalcarriage.com",
      description:
        "Published 3 new suburb city pages targeting Chicago metro area.",
    },
  ];
};

export function ChangelogViewer() {
  const [entries] = useState<ChangelogEntry[]>(generateMockChangelog());
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [authorFilter, setAuthorFilter] = useState<string>("all");

  const filteredEntries = entries.filter((entry) => {
    const matchesType = typeFilter === "all" || entry.type === typeFilter;
    const matchesSearch =
      searchTerm === "" ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.pages.some((p) =>
        p.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      entry.keywords.some((k) =>
        k.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesAuthor =
      authorFilter === "all" || entry.author === authorFilter;

    return matchesType && matchesSearch && matchesAuthor;
  });

  const uniqueAuthors = Array.from(new Set(entries.map((e) => e.author)));

  const getTypeBadgeVariant = (
    type: ChangelogEntry["type"],
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "publish":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      case "import":
        return "outline";
    }
  };

  const getTypeIcon = (type: ChangelogEntry["type"]) => {
    switch (type) {
      case "publish":
        return <FileText className="w-4 h-4" />;
      case "update":
        return <Calendar className="w-4 h-4" />;
      case "delete":
        return <FileText className="w-4 h-4" />;
      case "import":
        return <FileText className="w-4 h-4" />;
    }
  };

  const stats = {
    total: entries.length,
    publishes: entries.filter((e) => e.type === "publish").length,
    updates: entries.filter((e) => e.type === "update").length,
    deletes: entries.filter((e) => e.type === "delete").length,
    imports: entries.filter((e) => e.type === "import").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Changelog</h1>
        <p className="text-gray-600 mt-1">
          View all content changes, publishes, and imports
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Publishes</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.publishes}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Updates</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.updates}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Deletes</p>
              <p className="text-2xl font-bold text-red-600">{stats.deletes}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Imports</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.imports}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search descriptions, pages, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Author</label>
              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {uniqueAuthors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchTerm || typeFilter !== "all" || authorFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {filteredEntries.length} of {entries.length} entries
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setAuthorFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Changelog Entries */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(entry.type)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{entry.date}</CardTitle>
                      <Badge variant={getTypeBadgeVariant(entry.type)}>
                        {entry.type}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {entry.author} ({entry.authorEmail})
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{entry.description}</p>

              {entry.pages.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold">
                      Pages ({entry.pages.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.pages.map((page, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        {page}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {entry.keywords.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold">
                      Keywords ({entry.keywords.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {entry.images.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold">
                      Images ({entry.images.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.images.map((image, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {image}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredEntries.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>No changelog entries match your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* TODO: Firebase Integration */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
        <strong>TODO:</strong> Connect to Firestore collection:
        changelog_entries
        <ul className="list-disc list-inside mt-2 ml-4">
          <li>Auto-create entries on SEO publishes</li>
          <li>Track imports with file hashes</li>
          <li>Log manual content updates</li>
          <li>Add pagination for large changelogs</li>
          <li>Export changelog as CSV or PDF report</li>
        </ul>
      </div>
    </div>
  );
}
